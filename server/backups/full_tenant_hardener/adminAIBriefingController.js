import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import Review from "../models/Review.js";
import Tour from "../models/Tour.js";


export const getAIBriefing = async(req,res,next)=>{

  try {


    const [
      pendingBookings,
      confirmedBookings,
      paidBookings,
      completedPayments,
      reviews,
      totalTours
    ] = await Promise.all([

      Booking.countDocuments({
        status:"pending"
      }),

      Booking.countDocuments({
        status:"confirmed"
      }),

      Booking.countDocuments({
        paymentStatus:"paid"
      }),

      Payment.aggregate([
        {
          $match:{
            status:"completed"
          }
        },
        {
          $group:{
            _id:null,
            total:{
              $sum:"$amount"
            }
          }
        }
      ]),

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

      Tour.countDocuments()

    ]);



    const revenue =
      completedPayments[0]?.total || 0;


    const rating =
      reviews[0]?.average
      ? Number(reviews[0].average.toFixed(1))
      : 0;



    const recommendations=[];



    if(pendingBookings > 0){

      recommendations.push(
        `Follow up ${pendingBookings} pending booking(s).`
      );

    }


    if(rating < 4){

      recommendations.push(
        "Review customer feedback and improve service quality."
      );

    }


    if(paidBookings > 10){

      recommendations.push(
        "Prepare additional transport resources for high demand."
      );

    }



    res.json({

      success:true,

      data:{

        summary:
        `Today's operations show ${pendingBookings} pending bookings, ${paidBookings} paid bookings, KES ${revenue} revenue and customer rating ${rating}/5.`,

        metrics:{

          pendingBookings,
      confirmedBookings,

          confirmedBookings,

          revenue,

          rating,

          totalTours

        },


        recommendations

      }

    });



  }catch(error){

    next(error);

  }

};
