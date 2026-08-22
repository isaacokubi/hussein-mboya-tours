import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import Review from "../models/Review.js";
import Tour from "../models/Tour.js";
import User from "../models/User.js";
import Vehicle from "../models/Vehicle.js";


export const getAIIntelligence = async (req,res,next)=>{

  try {

    const [
      totalBookings,
      confirmedBookings,
      failedPayments,
      completedPayments,
      averageBooking,
      topTours,
      rating,
      totalTours,
      totalCustomers,
      totalVehicles
    ] = await Promise.all([

      Booking.countDocuments(),

      Booking.countDocuments({
        paymentStatus:"paid"
      }),

      Payment.countDocuments({
        status:"failed"
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

      Booking.aggregate([
        {
          $group:{
            _id:null,
            average:{
              $avg:"$totalAmount"
            }
          }
        }
      ]),

      Booking.aggregate([
        {
          $match:{
            tour:{
              $ne:null
            }
          }
        },
        {
          $group:{
            _id:"$tour",
            bookings:{
              $sum:1
            }
          }
        },
        {
          $sort:{
            bookings:-1
          }
        },
        {
          $limit:1
        },
        {
          $lookup:{
            from:"tours",
            localField:"_id",
            foreignField:"_id",
            as:"tour"
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

      Tour.countDocuments(),

      User.countDocuments({
        role:"customer"
      }),

      Vehicle.countDocuments()

    ]);


    const conversionRate =
      totalBookings
        ? Number(
            (
              (confirmedBookings / totalBookings) * 100
            ).toFixed(1)
          )
        : 0;


    const recommendations=[];


    if(failedPayments > 0){
      recommendations.push(
        `${failedPayments} failed payment attempts detected. Follow up with customers.`
      );
    }


    if(conversionRate < 50){
      recommendations.push(
        "Booking conversion is low. Review checkout and payment flow."
      );
    }


    if(
      rating[0]?.average &&
      rating[0].average < 4
    ){
      recommendations.push(
        "Customer satisfaction needs attention."
      );
    }


    res.json({

      success:true,

      data:{

        conversionRate,

        confirmedBookings,

        failedPayments,

        revenue:
          completedPayments[0]?.total || 0,

        averageBookingValue:
          averageBooking[0]?.average || 0,

        topTour:
          topTours[0]?.tour?.[0]?.title || "No data",

        customerRating:
          rating[0]?.average
            ? Number(rating[0].average.toFixed(1))
            : 0,

        totalTours,

        totalCustomers,

        totalVehicles,

        totalBookings,

        recommendations

      }

    });


  } catch(error){

    next(error);

  }

};
