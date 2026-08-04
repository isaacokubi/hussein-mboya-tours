// server/controllers/adminController.js

import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Tour from "../models/Tour.js";
import Destination from "../models/Destination.js";


/*
|--------------------------------------------------------------------------
| ADMIN DASHBOARD STATISTICS
|--------------------------------------------------------------------------
*/

export const getDashboardStats = async (req, res, next) => {

  try {


    /*
    |--------------------------------------------------------------------------
    | RUN ALL ANALYTICS IN PARALLEL
    |--------------------------------------------------------------------------
    */

    const [

      users,

      bookings,

      tours,

      destinations,

      revenueData,

      bookingStatus,

      monthlyRevenue,

      popularTours,

      pendingBookings,

      confirmedBookings,

      completedBookings,

      cancelledBookings,

      paymentStatsData,

    ] = await Promise.all([



      /*
      |--------------------------------------------------------------------------
      | USERS
      |--------------------------------------------------------------------------
      */

      User.countDocuments(),



      /*
      |--------------------------------------------------------------------------
      | BOOKINGS
      |--------------------------------------------------------------------------
      */

      Booking.countDocuments(),



      /*
      |--------------------------------------------------------------------------
      | TOURS
      |--------------------------------------------------------------------------
      */

      Tour.countDocuments(),

      Destination.countDocuments({
        isDeleted:false,
        active:true
      }),

      /*
      |--------------------------------------------------------------------------
      | TOTAL REVENUE
      |--------------------------------------------------------------------------
      */

      Booking.aggregate([

        {
          $match:{
            paymentStatus:{
              $in:[
                "paid",
                "partial",
                "completed"
              ]
            },

            status:{
              $ne:"cancelled"
            }
          }
        },


        {
          $group:{
            _id:null,

            total:{
              $sum:"$totalAmount"
            }
          }
        }

      ]),




      /*
      |--------------------------------------------------------------------------
      | BOOKING STATUS
      |--------------------------------------------------------------------------
      */

      Booking.aggregate([

        {
          $group:{

            _id:{

              bookingStatus:"$bookingStatus",

              paymentStatus:"$paymentStatus"

            },


            count:{
              $sum:1
            }

          }

        },


        {
          $sort:{
            count:-1
          }
        }

      ]),




      /*
      |--------------------------------------------------------------------------
      | MONTHLY REVENUE
      |--------------------------------------------------------------------------
      */

      Booking.aggregate([

        {
          $match:{

            paymentStatus:{
              $in:[
                "paid",
                "partial",
                "completed"
              ]
            },

            status:{
              $ne:"cancelled"
            }

          }
        },


        {
          $group:{

            _id:{

              year:{
                $year:"$createdAt"
              },


              month:{
                $month:"$createdAt"
              }

            },


            total:{
              $sum:"$totalAmount"
            }

          }
        },


        {
          $sort:{

            "_id.year":1,

            "_id.month":1

          }

        }

      ]),




      /*
      |--------------------------------------------------------------------------
      | POPULAR TOURS
      |--------------------------------------------------------------------------
      */

      Booking.aggregate([


        {
          $group:{

            _id:"$tour",

            totalBookings:{
              $sum:1
            }

          }

        },


        {
          $sort:{
            totalBookings:-1
          }
        },


        {
          $limit:5
        },


        {
          $lookup:{

            from:"tours",

            localField:"_id",

            foreignField:"_id",

            as:"tour"

          }

        },


        {
          $unwind:{

            path:"$tour",

            preserveNullAndEmptyArrays:true

          }

        },


        {
          $project:{

            _id:1,

            title:"$tour.title",

            price:"$tour.price",

            destination:"$tour.destination",

            totalBookings:1

          }

        }


      ]),





      /*
      |--------------------------------------------------------------------------
      | BOOKING COUNTS
      |--------------------------------------------------------------------------
      */

      Booking.countDocuments({
        bookingStatus:"pending"
      }),



      Booking.countDocuments({
        bookingStatus:"confirmed"
      }),



      Booking.countDocuments({
        bookingStatus:"completed"
      }),



      Booking.countDocuments({
        bookingStatus:"cancelled"
      }),





      /*
      |--------------------------------------------------------------------------
      | PAYMENT ANALYTICS
      |--------------------------------------------------------------------------
      */

      Booking.aggregate([

        {
          $group:{

            _id:"$paymentStatus",

            count:{
              $sum:1
            }

          }

        }

      ])



    ]);





    /*
    |--------------------------------------------------------------------------
    | FORMAT PAYMENT ANALYTICS
    |--------------------------------------------------------------------------
    */

    const paymentStats = {


      completed:

        paymentStatsData
          .filter(
            item =>
              [
                "paid",
                "completed",
                "success"
              ].includes(item._id)
          )
          .reduce(
            (sum,item)=>sum + item.count,
            0
          ),



      pending:

        paymentStatsData
          .filter(
            item =>
              [
                "pending",
                "partial"
              ].includes(item._id)
          )
          .reduce(
            (sum,item)=>sum + item.count,
            0
          ),



      failed:

        paymentStatsData
          .filter(
            item =>
              [
                "failed",
                "cancelled"
              ].includes(item._id)
          )
          .reduce(
            (sum,item)=>sum + item.count,
            0
          )


    };





    /*
    |--------------------------------------------------------------------------
    | TOTAL REVENUE
    |--------------------------------------------------------------------------
    */

    const revenue =
      revenueData[0]?.total || 0;





    /*
    |--------------------------------------------------------------------------
    | VEHICLE STATS
    |--------------------------------------------------------------------------
    */

    const vehicleStats = [];





    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    res.status(200).json({

      success:true,


      data:{


        users,


        bookings,


        tours,

        destinations,

        revenue,



        bookingStatus,



        monthlyRevenue,



        popularTours,



        paymentStats,



        vehicleStats,



        summary:{


          pendingBookings,


          confirmedBookings,


          completedBookings,


          cancelledBookings


        }


      }


    });



  } catch(error){

    next(error);

  }

};
