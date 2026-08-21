import { tenantFilter } from "../tenancy/tenantQuery.js";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import Tour from "../models/Tour.js";


export const getAIAnalytics = async(req,res,next)=>{

  try{


    const monthlyRevenue =
      await Payment.aggregate([

        {
          $match:{
            status:"completed"
          }
        },

        {
          $group:{
            _id:{
              month:{
                $month:"$createdAt"
              },
              year:{
                $year:"$createdAt"
              }
            },

            revenue:{
              $sum:"$amount"
            }
          }
        },

        {
          $sort:{
            "_id.year":1,
            "_id.month":1
          }
        }

      ]);



    const topTours =
      await Booking.aggregate([

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
          $limit:5
        }

      ]);



    const bookingStatus =
      await Booking.aggregate([

        {
          $group:{
            _id:"$status",
            count:{
              $sum:1
            }
          }
        }

      ]);



    const totalTours =
      await Tour.countDocuments();


    const recentBookings =
      await Booking.find(tenantFilter(req))
        .sort({createdAt:-1})
        .limit(10)
        .populate("tour");




    res.json({

      success:true,

      data:{

        monthlyRevenue,

        topTours,

        bookingStatus,

        totalTours,

        recentBookings

      }

    });


  }catch(error){

    next(error);

  }

};
