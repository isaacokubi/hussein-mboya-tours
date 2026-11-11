/**
 * Purpose: admin AIBooking Risk Controller HTTP controller. Main declarations: getBookingRiskAnalysis.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter } from "../tenancy/context.js";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ../models/Payment.js so this module can use its exported dependencies.
import Payment from "../models/Payment.js";


// Declare getBookingRiskAnalysis for use by the surrounding module or function.
export const getBookingRiskAnalysis = async (
  req,
  res,
  next
)=>{

  // Run this operation with a dedicated error-handling path for failures.
  try {


    // Declare [ pendingBookings, cancelledBookings, unpaidBookings, oldPendingBookings ] for use by the surrounding module or function.
    const [
      pendingBookings,
      cancelledBookings,
      unpaidBookings,
      oldPendingBookings
    ] = await Promise.all([


      Booking.countDocuments({
        status:"pending"
      }),


      Booking.countDocuments({
        status:"cancelled"
      }),


      Payment.countDocuments({
        status:{
          $in:[
            "pending",
            "failed"
          ]
        }
      }),



      Booking.countDocuments({

        status:"pending",

        createdAt:{
          $lt:
          new Date(
            Date.now() -
            3 * 24 * 60 * 60 * 1000
          )
        }

      })


    ]);



    // Declare risks for use by the surrounding module or function.
    const risks=[];



    // Check the condition (oldPendingBookings > 0) and run the matching branch.
    if(oldPendingBookings > 0){

      // Perform the side effect or state update expressed on the following line.
      risks.push({

        level:"high",

        title:"Old pending bookings",

        message:
        `${oldPendingBookings} booking(s) have been pending for more than 3 days. Contact customers.`

      });

    }



    // Check the condition (unpaidBookings > 0) and run the matching branch.
    if(unpaidBookings > 0){

      // Perform the side effect or state update expressed on the following line.
      risks.push({

        level:"medium",

        title:"Payment risks",

        message:
        `${unpaidBookings} payment record(s) need attention.`

      });

    }



    // Check the condition (cancelledBookings > pendingBookings) and run the matching branch.
    if(cancelledBookings > pendingBookings){

      // Perform the side effect or state update expressed on the following line.
      risks.push({

        level:"medium",

        title:"Cancellation trend",

        message:
        "Cancelled bookings are higher than pending bookings. Review customer experience."

      });

    }



    // Check the condition (!risks.length) and run the matching branch.
    if(!risks.length){

      // Perform the side effect or state update expressed on the following line.
      risks.push({

        level:"low",

        title:"Booking health",

        message:
        "No major booking risks detected."

      });

    }



    // Perform the side effect or state update expressed on the following line.
    res.json({

      success:true,

      data:{

        metrics:{

          pendingBookings,

          cancelledBookings,

          unpaidBookings,

          oldPendingBookings

        },

        risks

      }

    });



  }catch(error){

    // Perform the side effect or state update expressed on the following line.
    next(error);

  }

};
