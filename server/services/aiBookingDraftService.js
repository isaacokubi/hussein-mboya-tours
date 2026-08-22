import { mergeTenantFilter } from "../tenancy/context.js";
import Booking from "../models/Booking.js";
import { findTourForBooking } from "./aiBookingService.js";


const generateBookingNumber = () => {

  return (
    "AI-" +
    Date.now()
  );

};


export const createAIBookingDraft = async (
  message,
  user = null
) => {


  const tour =
    await findTourForBooking(message);


  if (!tour) {

    return null;

  }


  const futureDate =
    new Date();

  futureDate.setDate(
    futureDate.getDate() + 30
  );


  const booking =
    await Booking.create({

      bookingNumber:
        generateBookingNumber(),


      user:
        user?._id || null,


      tour:
        tour._id,


      travelDate:
        futureDate,


      numberOfGuests:
        1,


      bookingSource:
        "api",


      status:
        "pending",


      paymentStatus:
        "pending",


      subtotal:
        tour.price || 0,


      totalAmount:
        tour.price || 0,


      balanceAmount:
        tour.price || 0,


      contact:{
        name:
          user?.name || "",

        email:
          user?.email || "",

        phone:
          user?.phone || ""
      }

    });


  return {
    booking,
    tour
  };

};
