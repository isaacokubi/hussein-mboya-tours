/**
 * Purpose: ai Booking Draft Service business-logic service. Main declarations: generateBookingNumber, createAIBookingDraft.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ./aiBookingService.js so this module can use its exported dependencies.
import { findTourForBooking } from "./aiBookingService.js";


// Declare generateBookingNumber for use by the surrounding module or function.
const generateBookingNumber = () => {

  // Return the expression shown below to the caller.
  return (
    "AI-" +
    Date.now()
  );

};


// Declare createAIBookingDraft for use by the surrounding module or function.
export const createAIBookingDraft = async (
  message,
  user = null
) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();


  // Declare tour for use by the surrounding module or function.
  const tour =
    await findTourForBooking(message);


  // Check the condition (!tour) and run the matching branch.
  if (!tour) {

    // Return the expression shown below to the caller.
    return null;

  }


  // Declare futureDate for use by the surrounding module or function.
  const futureDate =
    new Date();

  // Perform the side effect or state update expressed on the following line.
  futureDate.setDate(
    futureDate.getDate() + 30
  );


  // Declare booking for use by the surrounding module or function.
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


  // Return the object assembled below to the caller.
  return {
    booking,
    tour
  };

};
