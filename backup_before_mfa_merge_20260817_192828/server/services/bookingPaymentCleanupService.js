import Booking from "../models/Booking.js";


export const cancelExpiredPendingBookings = async () => {

  const cutoff =
    new Date(
      Date.now() - 30 * 60 * 1000
    );


  const result =
    await Booking.updateMany(

      {
        status:"pending",
        paymentStatus:"pending",
        createdAt:{
          $lt:cutoff
        }
      },

      {
        $set:{
          status:"cancelled",
          paymentStatus:"cancelled",
          cancellationReason:
          "Automatically cancelled after payment timeout."
        }
      }

    );


  if(result.modifiedCount > 0){

    console.log(
      `[PAYMENT CLEANUP] Cancelled ${result.modifiedCount} expired bookings`
    );

  }

};
