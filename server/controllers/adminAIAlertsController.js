/**
 * Purpose: admin AIAlerts Controller HTTP controller. Main declarations: getAIAlerts.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ../models/Payment.js so this module can use its exported dependencies.
import Payment from "../models/Payment.js";
// Load ../models/Review.js so this module can use its exported dependencies.
import Review from "../models/Review.js";
// Load ../models/Vehicle.js so this module can use its exported dependencies.
import Vehicle from "../models/Vehicle.js";


// Declare getAIAlerts for use by the surrounding module or function.
export const getAIAlerts = async (req,res,next)=>{
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();

  // Run this operation with a dedicated error-handling path for failures.
  try {

    // Declare [ pendingBookings, failedPayments, reviews, vehicles, todayBookings ] for use by the surrounding module or function.
    const [
      pendingBookings,
      failedPayments,
      reviews,
      vehicles,
      todayBookings
    ] = await Promise.all([

      Booking.countDocuments({
        status:"pending"
      }),

      Payment.countDocuments({
        status:"failed"
      }),

      Review.aggregate([
        {
          $group:{
            _id:null,
            average:{
              $avg:"$rating"
            }
          }
        }
      ]),

      Vehicle.countDocuments({
        status:"available"
      }),

      Booking.countDocuments({
        createdAt:{
          $gte:new Date(
            new Date().setHours(0,0,0,0)
          )
        }
      })

    ]);


    // Declare alerts for use by the surrounding module or function.
    const alerts=[];


    // Check the condition (pendingBookings > 0) and run the matching branch.
    if(pendingBookings > 0){

      // Perform the side effect or state update expressed on the following line.
      alerts.push({
        level:"warning",
        title:"Pending bookings",
        message:
        `${pendingBookings} booking(s) require customer follow-up.`
      });

    }


    // Check the condition (failedPayments > 0) and run the matching branch.
    if(failedPayments > 0){

      // Perform the side effect or state update expressed on the following line.
      alerts.push({
        level:"danger",
        title:"Failed payments",
        message:
        `${failedPayments} payment attempt(s) failed.`
      });

    }


    // Declare rating for use by the surrounding module or function.
    const rating =
      reviews[0]?.average || 0;


    // Check the condition (rating < 4) and run the matching branch.
    if(rating < 4){

      // Perform the side effect or state update expressed on the following line.
      alerts.push({
        level:"warning",
        title:"Customer satisfaction",
        message:
        `Average rating is ${rating.toFixed(1)}/5. Review customer feedback.`
      });

    }


    // Check the condition (vehicles < 3) and run the matching branch.
    if(vehicles < 3){

      // Perform the side effect or state update expressed on the following line.
      alerts.push({
        level:"warning",
        title:"Fleet availability",
        message:
        "Vehicle availability is low. Check upcoming tours."
      });

    }


    // Check the condition (todayBookings > 5) and run the matching branch.
    if(todayBookings > 5){

      // Perform the side effect or state update expressed on the following line.
      alerts.push({
        level:"success",
        title:"High demand detected",
        message:
        `${todayBookings} bookings received today.`
      });

    }


    // Perform the side effect or state update expressed on the following line.
    res.json({

      success:true,

      data:{
        alerts
      }

    });


  }catch(error){

    // Perform the side effect or state update expressed on the following line.
    next(error);

  }

};
