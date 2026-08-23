import { mergeTenantFilter } from "../tenancy/context.js";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";


export const getBookingRiskAnalysis = async (
  req,
  res,
  next
)=>{

  try {


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



    const risks=[];



    if(oldPendingBookings > 0){

      risks.push({

        level:"high",

        title:"Old pending bookings",

        message:
        `${oldPendingBookings} booking(s) have been pending for more than 3 days. Contact customers.`

      });

    }



    if(unpaidBookings > 0){

      risks.push({

        level:"medium",

        title:"Payment risks",

        message:
        `${unpaidBookings} payment record(s) need attention.`

      });

    }



    if(cancelledBookings > pendingBookings){

      risks.push({

        level:"medium",

        title:"Cancellation trend",

        message:
        "Cancelled bookings are higher than pending bookings. Review customer experience."

      });

    }



    if(!risks.length){

      risks.push({

        level:"low",

        title:"Booking health",

        message:
        "No major booking risks detected."

      });

    }



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

    next(error);

  }

};
