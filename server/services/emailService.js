import nodemailer from "nodemailer";



const transporter =
nodemailer.createTransport({

  host:
  process.env.EMAIL_HOST,


  port:
  process.env.EMAIL_PORT,


  secure:
  process.env.EMAIL_SECURE === "true",


  auth:{

    user:
    process.env.EMAIL_USER,


    pass:
    process.env.EMAIL_PASSWORD

  }

});





/*
|--------------------------------------------------------------------------
| GENERIC EMAIL SENDER
|--------------------------------------------------------------------------
*/

export const sendEmail =
async({

  to,

  subject,

  html

})=>{


try{


await transporter.sendMail({

  from:

  `"Hussein Mboya Tours" <${process.env.EMAIL_USER}>`,


  to,


  subject,


  html


});


}

catch(error){

throw error;

}


};









/*
|--------------------------------------------------------------------------
| BOOKING CONFIRMATION EMAIL
|--------------------------------------------------------------------------
*/

export const sendBookingEmail =
async(
  email,
  booking
)=>{


try{


await sendEmail({

  to: email,


  subject:
  "Booking Confirmation - Hussein Mboya Tours",


  html:

  `

  <div>

    <h2>
      Your booking is confirmed
    </h2>


    <p>
      Thank you for choosing Hussein Mboya Tours.
    </p>


    <p>
      Booking Number:
      ${booking.bookingNumber || "Pending"}
    </p>


    <p>
      Tour:
      ${
        booking.tour?.name ||
        booking.tour
      }
    </p>


    <p>
      Travel Date:
      ${booking.travelDate}
    </p>


    <p>
      We look forward to welcoming you.
    </p>


  </div>

  `

});


}

catch(error){

throw error;

}


};