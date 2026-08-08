

import Booking from "../models/Booking.js";

import Notification from "../models/Notification.js";


import {
  sendSMS
} from "../services/smsService.js";

import {
  sendWhatsApp
} from "../services/whatsappService.js";

import {
  sendEmail
} from "../services/emailService.js";



export const sendBookingNotification =
async(req,res,next)=>{


try{


const booking =
await Booking.findById(
req.params.id
)
.populate(
"customer"
);



if(!booking){

return res.status(404).json({

success:false,

message:
"Booking not found"

});

}



const {
type,
channel
}=req.body;



let message="";



if(type==="confirmation"){

message=
`Your booking ${booking.bookingNumber} has been confirmed.`;

}



if(type==="payment_reminder"){

message=
`Payment reminder for booking ${booking.bookingNumber}.`;

}



if(type==="trip_reminder"){

message=
`Your trip departure reminder for ${booking.travelDate}.`;

}




const notification =
await Notification.create({

booking:booking._id,

customer:
booking.customer?._id,

type,

channel,

message

});




if(channel==="sms"){

await sendSMS(
booking.customer?.phone,
message
);

}



if(channel==="whatsapp"){

await sendWhatsApp(
booking.customer?.phone,
message
);

}



if(channel==="email"){

await sendEmail(
booking.customer?.email,
message
);

}



notification.status="sent";

notification.sentAt=new Date();


await notification.save();



res.json({

success:true,

notification

});


}catch(error){

next(error)

}


};


