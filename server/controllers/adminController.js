// server/controllers/adminController.js

import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Tour from "../models/Tour.js";
import Destination from "../models/Destination.js";
import Payment from "../models/Payment.js";


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

      status,

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
                "completed"
              ]
            },

            status:"confirmed"
          }
        },


        {
          $group:{
            _id:null,

            total:{
              $sum:{
                $max:[
                  0,
                  {
                    $subtract:[
                      {
                        $subtract:[
                          { $ifNull:["$totalAmount",0] },
                          { $ifNull:["$balanceAmount",0] }
                        ]
                      },
                      { $ifNull:["$refundAmount",0] }
                    ]
                  }
                ]
              }
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

              status:"$status",

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
                "completed"
              ]
            },

            status:"confirmed"

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
              $sum:{
                $max:[
                  0,
                  {
                    $subtract:[
                      {
                        $subtract:[
                          { $ifNull:["$totalAmount",0] },
                          { $ifNull:["$balanceAmount",0] }
                        ]
                      },
                      { $ifNull:["$refundAmount",0] }
                    ]
                  }
                ]
              }
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
          $match: {
            isDeleted: { $ne: true },
            status: { $nin: ["cancelled", "refunded"] },
          },
        },
        {
          $group: {
            _id: "$tour",
            totalBookings: { $sum: 1 },
            confirmedPaidBookings: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ["$status", "confirmed"] },
                      { $in: ["$paymentStatus", ["paid", "completed"]] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            revenue: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ["$status", "confirmed"] },
                      { $in: ["$paymentStatus", ["paid", "completed"]] },
                    ],
                  },
                  {
                    $max: [
                      0,
                      {
                        $subtract: [
                          {
                            $subtract: [
                              { $ifNull: ["$totalAmount", 0] },
                              { $ifNull: ["$balanceAmount", 0] },
                            ],
                          },
                          { $ifNull: ["$refundAmount", 0] },
                        ],
                      },
                    ],
                  },
                  0,
                ],
              },
            },
          },
        },
        {
          $sort: {
            totalBookings: -1,
            confirmedPaidBookings: -1,
          },
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

            totalBookings:1,
            confirmedPaidBookings:1,
            revenue:1

          }

        }


      ]),





      /*
      |--------------------------------------------------------------------------
      | BOOKING COUNTS
      |--------------------------------------------------------------------------
      */

      Booking.countDocuments({
        status:"pending"
      }),



      Booking.countDocuments({
        status:"confirmed"
      }),



      Booking.countDocuments({
        status:"completed"
      }),



      Booking.countDocuments({
        status:"cancelled"
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
    | RECENT BOOKINGS
    |--------------------------------------------------------------------------
    */

    const recentBookings = await Booking.find({
      isDeleted:false
    })
      .sort({
        createdAt:-1
      })
      .limit(5)
      .populate("customer","name email")
      .populate("tour","title")
      .lean();


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



        status,



        monthlyRevenue,



        popularTours,



        paymentStats,



        vehicleStats,


        recentBookings,


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






/*
|--------------------------------------------------------------------------
| ADMIN ANALYTICS COMPATIBILITY ENDPOINTS
|--------------------------------------------------------------------------
*/

export const getUserAnalytics = async (req, res, next) => {
  try {
    const [total, active, customers, agents] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: { $ne: false } }),
      User.countDocuments({ role: "customer" }),
      User.countDocuments({ role: "agent" }),
    ]);

    return res.status(200).json({
      success: true,
      data: { total, active, customers, agents },
    });
  } catch (error) {
    next(error);
  }
};

export const getBookingAnalytics = async (req, res, next) => {
  try {
    const status = await Booking.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    return res.status(200).json({
      success: true,
      data: { status },
    });
  } catch (error) {
    next(error);
  }
};

export const getRevenueAnalytics = async (req, res, next) => {
  try {
    const monthly = await Booking.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          status: { $ne: "cancelled" },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$totalAmount" },
          bookings: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    return res.status(200).json({
      success: true,
      data: { monthly },
    });
  } catch (error) {
    next(error);
  }
};
