import axios from "axios";

import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import Commission from "../models/Commission.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";


import {
    mpesaConfig,
    mpesaUrls
} from "../config/mpesa.js";


import {
    generateAccessToken,
    generateTimestamp,
    generatePassword
} from "../services/mpesaService.js";


import {
    sendBookingConfirmation
} from "../services/bookingNotificationService.js";


import {
    sendBookingEmail
} from "../services/emailService.js";


import {
    addPoints
} from "../services/loyaltyService.js";





/*
|--------------------------------------------------------------------------
| FORMAT PHONE NUMBER
|--------------------------------------------------------------------------
*/

const formatPhoneNumber = (phone)=>{


let formatted =
phone
.toString()
.trim();



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
| GET MPESA TOKEN
|--------------------------------------------------------------------------
*/

export const getMpesaToken = async(
req,
res,
next
)=>{


try{


const token =
await generateAccessToken();



res.json({

success:true,

token

});



}

catch(error){


next(error);


}


};









/*
|--------------------------------------------------------------------------
| INITIATE STK PUSH
|--------------------------------------------------------------------------
*/

export const stkPush = async(
req,
res
)=>{


try{


const {

phone,

bookingId

}

=
req.body;





const booking =
await Booking.findById(
bookingId
);






if(!booking){


return res.status(404).json({

success:false,

message:
"Booking not found"

});


}







if(
booking.paymentStatus === "paid"
){


return res.status(400).json({

success:false,

message:
"Booking already paid"

});


}








const existingPayment =
await Payment.findOne({

booking:
booking._id,

status:
"pending"

});






if(existingPayment){


return res.json({

success:true,

message:
"Payment already initiated",

checkoutRequestID:
existingPayment.checkoutRequestID

});


}








const formattedPhone =
formatPhoneNumber(phone);






const token =
await generateAccessToken();






const timestamp =
generateTimestamp();






const password =
generatePassword(
timestamp
);







const amount =
Math.round(

booking.totalAmount ||

booking.amount

);







const payload = {


BusinessShortCode:
mpesaConfig.shortcode,


Password:
password,


Timestamp:
timestamp,


TransactionType:
"CustomerPayBillOnline",


Amount:
amount,


PartyA:
formattedPhone,


PartyB:
mpesaConfig.shortcode,


PhoneNumber:
formattedPhone,


CallBackURL:
mpesaConfig.callbackURL,


AccountReference:
`BOOKING-${booking._id}`,


TransactionDesc:
"Hussein Mboya Tour Booking"

};







console.log(
"MPESA PAYLOAD:",
payload
);







const response =
await axios.post(

mpesaUrls.stk,

payload,

{

headers:{

Authorization:
`Bearer ${token}`

}

}

);







await Payment.create({

user:
booking.user,


customer:
booking.customer,


booking:
booking._id,


provider:
"MPESA",


method:
"mpesa",


amount,


phoneNumber:
formattedPhone,


merchantRequestID:
response.data.MerchantRequestID,


checkoutRequestID:
response.data.CheckoutRequestID,


status:
"pending"


});







booking.paymentStatus =
"pending";



await booking.save();







return res.json({

success:true,

message:
"STK Push sent successfully",

data:
response.data

});





}

catch(error){


console.error(

"MPESA STK ERROR",

error.response?.data ||

error.message

);



res.status(500).json({

success:false,

message:
"Payment initiation failed"

});


}


}; /*
|--------------------------------------------------------------------------
| MPESA CALLBACK
|--------------------------------------------------------------------------
*/

export const mpesaCallback = async(
req,
res
)=>{


try{


console.log(

"MPESA CALLBACK",

JSON.stringify(

req.body,

null,

2

)

);





const stkCallback =
req.body?.Body?.stkCallback;






if(!stkCallback){


return res.json({

ResultCode:0,

ResultDesc:"Accepted"

});


}






const checkoutId =
stkCallback.CheckoutRequestID;








/*
|--------------------------------------------------------------------------
| FIND PAYMENT RECORD
|--------------------------------------------------------------------------
*/


const payment =
await Payment.findOne({

checkoutRequestID:
checkoutId

});





console.log(

"FOUND PAYMENT:",

payment

);








if(!payment){


console.log(

"PAYMENT NOT FOUND:",

checkoutId

);



return res.json({

ResultCode:0,

ResultDesc:"Accepted"

});


}







/*
|--------------------------------------------------------------------------
| PREVENT DUPLICATE CALLBACK
|--------------------------------------------------------------------------
*/


if(

payment.status === "completed"

){


return res.json({

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


if(

stkCallback.ResultCode !== 0

){



payment.status =
"failed";


payment.failureReason =
stkCallback.ResultDesc;



await payment.save();







await Booking.findByIdAndUpdate(

payment.booking,

{

paymentStatus:
"failed"

}

);







return res.json({

ResultCode:0,

ResultDesc:"Accepted"

});


}









/*
|--------------------------------------------------------------------------
| EXTRACT SUCCESS DATA
|--------------------------------------------------------------------------
*/


const callbackItems =

stkCallback

.CallbackMetadata

?.Item || [];







const getValue = (name)=>{


const item =

callbackItems.find(

item =>
item.Name === name

);



return item?.Value || null;


};







const mpesaReceiptNumber =

getValue(

"MpesaReceiptNumber"

);






const paidAmount =

getValue(

"Amount"

);






const phoneNumber =

getValue(

"PhoneNumber"

);









/*
|--------------------------------------------------------------------------
| UPDATE PAYMENT
|--------------------------------------------------------------------------
*/


payment.status =
"completed";


payment.mpesaReceiptNumber =
mpesaReceiptNumber;


payment.phoneNumber =
phoneNumber;


payment.amount =
paidAmount;


payment.paidAt =
new Date();





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





if(
booking.bookingStatus !== undefined
){


booking.bookingStatus =
"confirmed";


}






if(
booking.status !== undefined
){


booking.status =
"confirmed";


}







booking.transactionId =
mpesaReceiptNumber;



booking.mpesaReceipt =
mpesaReceiptNumber;



booking.paidAt =
new Date();






await booking.save();







console.log(

"BOOKING CONFIRMED:",

booking._id

);








/*
|--------------------------------------------------------------------------
| ADMIN / TOUR MANAGER NOTIFICATION
|--------------------------------------------------------------------------
*/


try{


const managers =

await User.find({

role:{

$in:[

"admin",

"tour_manager"

]

}

});






for(
const manager of managers
){


await Notification.create({

user:
manager._id,


title:
"New Paid Booking",


message:

`Payment confirmed for booking ${booking._id}. Assign tour resources.`,


type:
"booking"


});


}



}

catch(error){


console.log(

"NOTIFICATION ERROR:",

error.message

);


}









/*
|--------------------------------------------------------------------------
| SEND EMAIL
|--------------------------------------------------------------------------
*/


try{


await sendBookingEmail(

booking.email,

booking

);


}

catch(error){


console.log(

"EMAIL ERROR:",

error.message

);


}









/*
|--------------------------------------------------------------------------
| BOOKING CONFIRMATION SERVICE
|--------------------------------------------------------------------------
*/


try{


await sendBookingConfirmation(

booking

);


}

catch(error){


console.log(

"BOOKING CONFIRMATION ERROR:",

error.message

);


}









/*
|--------------------------------------------------------------------------
| LOYALTY POINTS
|--------------------------------------------------------------------------
*/


try{


const points =

Math.floor(

(

booking.totalAmount ||

booking.amount

)

/

100

);






if(points > 0){


await addPoints(

booking.user,

points

);


}



}

catch(error){


console.log(

"LOYALTY ERROR:",

error.message

);


}









/*
|--------------------------------------------------------------------------
| AGENT COMMISSION
|--------------------------------------------------------------------------
*/


if(
booking.agent
){


try{


const agent =

await User.findById(

booking.agent

);






if(
agent?.agentProfile
){



const rate =

agent.agentProfile.commissionRate || 0;






const commissionAmount =

(

booking.totalAmount ||

booking.amount

)

*

(

rate / 100

);






const exists =

await Commission.findOne({

booking:

booking._id

});






if(!exists){



await Commission.create({

agent:

booking.agent,


booking:

booking._id,


amount:

commissionAmount,


status:

"pending"

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

catch(error){


console.log(

"COMMISSION ERROR:",

error.message

);


}



}



}








return res.json({

ResultCode:0,

ResultDesc:"Accepted"

});




}

catch(error){


console.error(

"MPESA CALLBACK ERROR",

error

);




return res.json({

ResultCode:0,

ResultDesc:"Accepted"

});


}


};









/*
|--------------------------------------------------------------------------
| CHECK PAYMENT STATUS
|--------------------------------------------------------------------------
*/

export const checkTransactionStatus = async(

req,

res,

next

)=>{


try{


const payment =

await Payment.findById(

req.params.id

)

.populate(

"booking"

)

.populate(

"user",

"name email phone"

)

.populate(

"customer",

"name email phone"

);







if(!payment){


return res.status(404).json({

success:false,

message:
"Payment not found"

});


}







res.json({

success:true,

payment

});



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


export const getBookingPayments = async(

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

createdAt:

-1

})

.populate(

"user",

"name email phone"

)

.populate(

"customer",

"name email phone"

)

.populate(

"booking"

);







res.json({

success:true,

count:

payments.length,

payments

});



}

catch(error){


next(error);


}


};