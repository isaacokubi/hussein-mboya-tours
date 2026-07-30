// services/notificationService.js


import Notification from "../models/Notification.js";


import {
  sendEmail
} from "./emailService.js";


import {
  io
} from "../server.js";


import {
  getSocketId
} from "../socket/socketManager.js";




// ============================================================
// CREATE NOTIFICATION
// ============================================================


export const createNotification = async ({

  user,

  recipient,

  title,

  message,

  type = "system",

  metadata = {}

}) => {


  const receiver =
    recipient || user;



  const notification =

  await Notification.create({

    recipient: receiver,

    user: receiver,

    title,

    message,

    type,

    metadata

  });





  // ==========================================================
  // REALTIME SOCKET NOTIFICATION
  // ==========================================================


  const socketId = getSocketId(

    receiver.toString()

  );



  if(socketId){


    io.to(socketId).emit(

      "notification",

      notification

    );


  }



  return notification;


};









// ============================================================
// GENERIC SEND NOTIFICATION
// ============================================================


export const sendNotification = async ({

  recipient,

  title,

  message,

  type = "system",

  metadata = {}

}) => {


  return await createNotification({

    recipient,

    title,

    message,

    type,

    metadata

  });


};









// ============================================================
// BOOKING CONFIRMATION CUSTOMER
// ============================================================


export const sendBookingConfirmation = async (

  user,

  booking

)=>{


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

    "booking",


    metadata:{

      bookingId:booking._id

    }


  });


};









// ============================================================
// ADMIN NEW BOOKING NOTIFICATION
// ============================================================


export const sendBookingNotification = async ({

  adminUserId,

  customer,

  booking

})=>{


  return await sendNotification({

    recipient:adminUserId,


    title:

    "New Booking",


    message:

    `${customer.name} created a booking`,


    type:

    "booking",


    metadata:{


      bookingId:booking._id


    }


  });


};









// ============================================================
// PAYMENT SUCCESS NOTIFICATION
// ============================================================


export const sendPaymentNotification = async ({

  adminUserId,

  booking

})=>{


  return await sendNotification({

    recipient:adminUserId,


    title:

    "Payment Received",


    message:

    `Booking ${booking.bookingNumber} has been paid`,


    type:

    "payment",


    metadata:{


      bookingId:booking._id


    }


  });


};









// ============================================================
// GUIDE TOUR ASSIGNMENT NOTIFICATION
// ============================================================


export const sendTourAssignmentNotification = async ({

  guideUserId,

  tour

})=>{


  return await sendNotification({

    recipient:guideUserId,


    title:

    "New Tour Assignment",


    message:

    `${tour.title} assigned to you`,


    type:

    "tour_assignment",


    metadata:{


      tourId:tour._id


    }


  });


};









// ============================================================
// GENERIC PAYMENT NOTIFICATION FOR USER
// ============================================================


export const notifyPaymentSuccess = async (

  user,

  payment

)=>{


  return await sendNotification({

    recipient:user._id,


    title:

    "Payment Successful",


    message:

    "Your payment has been received successfully.",


    type:

    "payment",


    metadata:{


      paymentId:payment._id


    }


  });


};