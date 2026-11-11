/**
 * Purpose: ai Booking Controller HTTP controller. Main declarations: completeBooking.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter } from "../tenancy/context.js";
// Load ../services/aiBookingCompleteService.js so this module can use its exported dependencies.
import { completeAIBooking } from "../services/aiBookingCompleteService.js";


// Declare completeBooking for use by the surrounding module or function.
export const completeBooking = async (
  req,
  res,
  next
) => {

  // Run this operation with a dedicated error-handling path for failures.
  try {

    // Declare booking for use by the surrounding module or function.
    const booking =
      await completeAIBooking({

        ...req.body,

        user:
          req.user || null

      });


    // Perform the side effect or state update expressed on the following line.
    res.status(201).json({

      success:true,

      message:
        "AI booking created successfully",

      data:
        booking

    });


  } catch(error){

    // Perform the side effect or state update expressed on the following line.
    next(error);

  }

};
