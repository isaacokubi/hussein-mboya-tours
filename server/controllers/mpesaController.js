import axios from "axios";

import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import Commission from "../models/Commission.js";
import User from "../models/User.js";

import mpesaConfig from "../config/mpesa.js";

import {
  generateAccessToken,
  generateTimestamp,
  generatePassword,
} from "../services/mpesaService.js";

import {
  sendBookingConfirmation,
} from "../services/bookingNotificationService.js";

import {
  addPoints,
} from "../services/loyaltyService.js";


const config = mpesaConfig();



/*
|--------------------------------------------------------------------------
| GET MPESA TOKEN
|--------------------------------------------------------------------------
*/

export const getMpesaToken = async (
  req,
  res,
  next
)=>{

try{

const token =
await generateAccessToken();


res.json({

success:true,

token,

});


}
catch(error){

next(error);

}

};






/*
|--------------------------------------------------------------------------
| FORMAT PHONE NUMBER
|--------------------------------------------------------------------------
*/

const formatPhoneNumber = (phone)=>{


let formatted =
phone.toString().trim();



if(formatted.startsWith("0")){

formatted =
"254" +
formatted.substring(1);

}



if(formatted.startsWith("+254")){

formatted =
formatted.substring(1);

}



return formatted;

};






/*
|--------------------------------------------------------------------------
| STK PUSH
|--------------------------------------------------------------------------
*/

export const stkPush = async(
req,
res,
next
)=>{


try{


const {

phone,

bookingId

}=req.body;




const booking =
await Booking.findById(
bookingId
);



if(!booking){


return res.status(404).json({

message:
"Booking not found",

});

}




if(
booking.paymentStatus === "paid"
){


return res.status(400).json({

message:
"Booking already paid",

});

}




/*
|--------------------------------------------------------------------------
| PREVENT MULTIPLE PAYMENT REQUESTS
|--------------------------------------------------------------------------
*/


const pendingPayment =
await Payment.findOne({

booking:
booking._id,

status:
"pending",

});



if(pendingPayment){


return res.json({

success:true,

message:
"Payment already initiated",

checkoutRequestID:
pendingPayment.checkoutRequestID,

});

}





const formattedPhone =
formatPhoneNumber(phone);



console.log(
"MPESA PHONE:",
formattedPhone
);



console.log(
"MPESA PAYMENT AMOUNT:",
booking.amount
);





const token =
await generateAccessToken();



const timestamp =
generateTimestamp();



const password =
generatePassword(timestamp);






const stkPayload = {


BusinessShortCode:
config.shortcode,


Password:
password,


Timestamp:
timestamp,


TransactionType:
"CustomerPayBillOnline",


Amount:
Math.round(
booking.amount
),


PartyA:
formattedPhone,


PartyB:
config.shortcode,


PhoneNumber:
formattedPhone,


CallBackURL:
config.callbackURL,


AccountReference:
booking.bookingNumber ||
booking._id.toString(),


TransactionDesc:
"Tour Booking Payment"


};





console.log(
"MPESA REQUEST:",
stkPayload
);







const response =
await axios.post(

`${config.baseURL}/mpesa/stkpush/v1/processrequest`,

stkPayload,

{

headers:{

Authorization:
`Bearer ${token}`

}

}

);







/*
|--------------------------------------------------------------------------
| PREVENT DUPLICATE PAYMENT RECORD
|--------------------------------------------------------------------------
*/


const existingPayment =
await Payment.findOne({

checkoutRequestID:
response.data.CheckoutRequestID

});




if(existingPayment){


return res.json({

success:true,

message:
"Payment already initiated",

data:
response.data

});

}







/*
|--------------------------------------------------------------------------
| CREATE PAYMENT RECORD
|--------------------------------------------------------------------------
*/


await Payment.create({

user:
booking.user,


booking:
booking._id,


provider:
"MPESA",


amount:
booking.amount,


merchantRequestID:
response.data.MerchantRequestID || null,


checkoutRequestID:
response.data.CheckoutRequestID || null,


status:
"pending",

});






return res.json({

success:true,


message:
"STK Push sent successfully",


data:
response.data,

});





}
catch(error){


console.error(

"STK PUSH ERROR:",

error.response?.data ||
error.message

);



return res.status(500).json({

success:false,

message:
"MPESA payment failed",

error:
error.response?.data ||
error.message

});


}


};

/*
|--------------------------------------------------------------------------
| MPESA CALLBACK
|--------------------------------------------------------------------------
*/

export const mpesaCallback = async (
req,
res
)=>{


try{


const callback =
req.body?.Body?.stkCallback;




/*
|--------------------------------------------------------------------------
| ALWAYS ACCEPT CALLBACK
|--------------------------------------------------------------------------
*/

if(!callback){


return res.status(200).json({

ResultCode:0,

ResultDesc:
"Accepted"

});

}




const {

CheckoutRequestID,

ResultCode

}=callback;





const payment =
await Payment.findOne({

checkoutRequestID:
CheckoutRequestID

});






/*
|--------------------------------------------------------------------------
| PAYMENT NOT FOUND
|--------------------------------------------------------------------------
*/

if(!payment){


console.log(
"MPESA PAYMENT NOT FOUND:",
CheckoutRequestID
);



return res.status(200).json({

ResultCode:0,

ResultDesc:
"Accepted"

});

}






/*
|--------------------------------------------------------------------------
| PREVENT DUPLICATE CALLBACK PROCESSING
|--------------------------------------------------------------------------
*/


if(
payment.status === "completed"
){


return res.status(200).json({

ResultCode:0,

ResultDesc:
"Already processed"

});

}







/*
|--------------------------------------------------------------------------
| FAILED PAYMENT
|--------------------------------------------------------------------------
*/


if(ResultCode !== 0){


payment.status =
"failed";


payment.failureReason =
callback.ResultDesc;



await payment.save();





const booking =
await Booking.findById(
payment.booking
);




if(booking){


booking.paymentStatus =
"failed";


await booking.save();

}


return res.status(200).json({

ResultCode:0,

ResultDesc:
"Accepted"

});


}








/*
|--------------------------------------------------------------------------
| EXTRACT CALLBACK DATA
|--------------------------------------------------------------------------
*/


const items =
callback.CallbackMetadata?.Item || [];



const getValue =
(name)=>{


const item =
items.find(
(i)=>i.Name === name
);


return item?.Value || null;

};





const amount =
getValue(
"Amount"
);



const receipt =
getValue(
"MpesaReceiptNumber"
);



const phone =
getValue(
"PhoneNumber"
);



const transactionDate =
getValue(
"TransactionDate"
);







/*
|--------------------------------------------------------------------------
| UPDATE PAYMENT
|--------------------------------------------------------------------------
*/


payment.status =
"completed";


payment.amount =
amount || payment.amount;


payment.mpesaReceiptNumber =
receipt;


payment.transactionReference =
receipt;


payment.phoneNumber =
phone;


payment.transactionDate =
transactionDate;



await payment.save();









/*
|--------------------------------------------------------------------------
| UPDATE BOOKING
|--------------------------------------------------------------------------
*/


const booking =
await Booking.findById(
payment.booking
);





if(booking){


booking.paymentStatus =
"paid";


booking.bookingStatus =
"confirmed";


booking.transactionId =
receipt;


booking.mpesaReceiptNumber =
receipt;



await booking.save();






/*
|--------------------------------------------------------------------------
| LOYALTY POINTS
|--------------------------------------------------------------------------
*/


try{


const points =
Math.floor(
booking.amount / 100
);



if(points > 0){


await addPoints(

booking.user,

points

);


console.log(

`${points} loyalty points added`

);


}



}
catch(error){


console.error(

"LOYALTY ERROR:",
error.message

);


}







/*
|--------------------------------------------------------------------------
| AGENT COMMISSION
|--------------------------------------------------------------------------
*/


if(booking.agent){


const agent =
await User.findById(
booking.agent
);



if(
agent &&
agent.agentProfile
){


const rate =
agent.agentProfile.commissionRate || 0;



const commissionAmount =
booking.amount *
(rate / 100);




const commissionExists =
await Commission.findOne({

booking:
booking._id

});




if(!commissionExists){


await Commission.create({

agent:
booking.agent,


booking:
booking._id,


amount:
commissionAmount,


status:
"pending",

});




agent.agentProfile.walletBalance =

(
agent.agentProfile.walletBalance || 0
)
+
commissionAmount;



await agent.save();


}


}


}







/*
|--------------------------------------------------------------------------
| SEND CONFIRMATION
|--------------------------------------------------------------------------
*/


try{


await sendBookingConfirmation(
booking
);


}
catch(error){


console.error(

"CONFIRMATION ERROR:",
error.message

);


}



}







return res.status(200).json({

ResultCode:0,

ResultDesc:
"Accepted"

});





}
catch(error){


console.error(

"MPESA CALLBACK ERROR:",
error

);



return res.status(200).json({

ResultCode:0,

ResultDesc:
"Accepted"

});


}



};









/*
|--------------------------------------------------------------------------
| CHECK PAYMENT STATUS
|--------------------------------------------------------------------------
*/


export const checkTransactionStatus =
async(
req,
res,
next
)=>{


try{


const payment =
await Payment.findById(
req.params.id
);



if(!payment){


return res.status(404).json({

message:
"Payment not found"

});


}



res.json(payment);



}
catch(error){

next(error);

}


};








/*
|--------------------------------------------------------------------------
| GET PAYMENTS BY BOOKING
|--------------------------------------------------------------------------
*/


export const getBookingPayments =
async(
req,
res,
next
)=>{


try{


const payments =
await Payment.find({

booking:
req.params.bookingId

})
.sort({

createdAt:-1

});




res.json(payments);



}
catch(error){


next(error);

}


};