import path from "path";

import {
sendEmail
}
from "./emailService.js";


import {
bookingConfirmationEmail
}
from "../utils/emailTemplates.js";


import {
createInvoice
}
from "../utils/createInvoice.js";



export const sendBookingConfirmation =
async(booking)=>{


const invoicePath =
path.join(
"uploads",
`${booking.bookingNumber}.pdf`
);



await createInvoice({

booking,

filePath:
invoicePath

});



await sendEmail({

to:
booking.contactEmail,


subject:
"Your Hussein Mboya Tours Booking Confirmation",


html:
bookingConfirmationEmail({

customerName:
booking.contactName,


bookingNumber:
booking.bookingNumber,


tourName:
booking.tour.title,


amount:
booking.totalAmount

}),


attachments:[

{

filename:
"invoice.pdf",

path:
invoicePath

}

]

});


};