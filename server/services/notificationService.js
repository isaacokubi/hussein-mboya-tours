import Notification from "../models/Notification.js";

import {
sendEmail
}
from "./emailService.js";



export const createNotification =
async({

user,

title,

message,

type="system"

})=>{


const notification =
await Notification.create({

user,

title,

message,

type

});



return notification;

};





export const sendBookingConfirmation =
async(user,booking)=>{


await sendEmail({

to:user.email,


subject:
"Booking Confirmed - Hussein Mboya Tours",


html:

`

<h2>
Your trip is confirmed 🎉
</h2>


<p>
Booking Reference:
<strong>
${booking._id}
</strong>
</p>


<p>
Thank you for choosing Hussein Mboya Tours.
</p>

`

});


await createNotification({

user:user._id,


title:
"Booking Confirmed",


message:
"Your travel booking has been confirmed.",


type:
"booking"

});


};