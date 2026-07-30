import Booking
from "../models/Booking.js";


import {
sendEmail
}
from "./emailService.js";



export const recoverBookings =
async()=>{


const bookings =
await Booking.find({

paymentStatus:"pending",

abandoned:false

});



for(
const booking of bookings
){


await sendEmail({

to:
booking.contact.email,


subject:

"Complete Your Hussein Mboya Tours Booking",



html:

`

<h2>
Your adventure is waiting 🌍
</h2>


<p>
Complete your payment to confirm your trip.
</p>

`

});



booking.lastReminderSent =
new Date();


await booking.save();


}


};
