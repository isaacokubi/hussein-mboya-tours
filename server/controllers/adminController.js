// server/controllers/adminController.js

import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Tour from "../models/Tour.js";


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



      /*
      |--------------------------------------------------------------------------
      | TOTAL REVENUE
      |--------------------------------------------------------------------------
      */

      Booking.aggregate([

        {
          $match:{
            paymentStatus:"paid",

            bookingStatus:{
              $ne:"cancelled"
            }
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

            paymentStatus:"paid",

            bookingStatus:{
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

        paymentStatsData.find(
          item => item._id === "paid"
        )?.count || 0,



      pending:

        paymentStatsData.find(
          item => item._id === "pending"
        )?.count || 0,



      failed:

        paymentStatsData.find(
          item => item._id === "failed"
        )?.count || 0


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