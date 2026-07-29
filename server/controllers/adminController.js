// server/controllers/adminController.js

import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Tour from "../models/Tour.js";


// ============================================================
// ADMIN DASHBOARD STATISTICS
// ============================================================

export const getDashboardStats = async (req, res) => {

  try {


    // ============================================================
    // USERS
    // ============================================================

    const users = await User.countDocuments();



    // ============================================================
    // BOOKINGS
    // ============================================================

    const bookings = await Booking.countDocuments();



    // ============================================================
    // TOURS
    // ============================================================

    const tours = await Tour.countDocuments();




    // ============================================================
    // REVENUE
    // Source of truth: Booking collection
    // Only successful paid bookings count
    // ============================================================

    const revenueData = await Booking.aggregate([

      {
        $match:{
          paymentStatus:"paid"
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

    ]);


    const revenue = revenueData[0]?.total || 0;






    // ============================================================
    // BOOKING STATUS
    // Shows booking + payment status together
    // ============================================================

    const bookingStatus = await Booking.aggregate([

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

    ]);







    // ============================================================
    // MONTHLY REVENUE
    // ============================================================

    const monthlyRevenue = await Booking.aggregate([

      {
        $match:{
          paymentStatus:"paid"
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

    ]);









    // ============================================================
    // POPULAR TOURS
    // ============================================================

    const popularTours = await Booking.aggregate([


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

          totalBookings:1

        }

      }


    ]);








    // ============================================================
    // VEHICLE STATS
    // ============================================================

    const vehicleStats=[];





    res.status(200).json({

      success:true,


      data:{

        users,

        tours,

        bookings,

        revenue,

        bookingStatus,

        monthlyRevenue,

        popularTours,

        vehicleStats

      }

    });




  } catch(error){


    res.status(500).json({

      success:false,

      message:error.message

    });


  }


};