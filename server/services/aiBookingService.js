/**
 * Purpose: ai Booking Service business-logic service. Main declarations: findTourForBooking.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
// Load ../models/Tour.js so this module can use its exported dependencies.
import Tour from "../models/Tour.js";


// Declare findTourForBooking for use by the surrounding module or function.
export const findTourForBooking = async (message = "") => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();

  // Declare text for use by the surrounding module or function.
  const text =
    message.toLowerCase();


  // Declare tour for use by the surrounding module or function.
  const tour =
    await Tour.findOne({

      $or:[

        {
          title:{
            $regex:text
              .split(" ")
              .filter(word=>word.length > 3)
              .join("|"),
            $options:"i"
          }
        },

        {
          country:{
            $regex:text,
            $options:"i"
          }
        }

      ],

      status:{
        $ne:"inactive"
      }

    })
    .populate(
      "destination",
      "name country"
    )
    .lean();


  // Return the value of tour to the caller.
  return tour;

};
