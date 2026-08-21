import { mergeTenantFilter } from "../tenancy/context.js";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import Review from "../models/Review.js";
import Vehicle from "../models/Vehicle.js";


export const getAIAlerts = async (req,res,next)=>{

  try {

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


    const alerts=[];


    if(pendingBookings > 0){

      alerts.push({
        level:"warning",
        title:"Pending bookings",
        message:
        `${pendingBookings} booking(s) require customer follow-up.`
      });

    }


    if(failedPayments > 0){

      alerts.push({
        level:"danger",
        title:"Failed payments",
        message:
        `${failedPayments} payment attempt(s) failed.`
      });

    }


    const rating =
      reviews[0]?.average || 0;


    if(rating < 4){

      alerts.push({
        level:"warning",
        title:"Customer satisfaction",
        message:
        `Average rating is ${rating.toFixed(1)}/5. Review customer feedback.`
      });

    }


    if(vehicles < 3){

      alerts.push({
        level:"warning",
        title:"Fleet availability",
        message:
        "Vehicle availability is low. Check upcoming tours."
      });

    }


    if(todayBookings > 5){

      alerts.push({
        level:"success",
        title:"High demand detected",
        message:
        `${todayBookings} bookings received today.`
      });

    }


    res.json({

      success:true,

      data:{
        alerts
      }

    });


  }catch(error){

    next(error);

  }

};
