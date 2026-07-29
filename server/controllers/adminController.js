// server/controllers/adminController.js

import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Tour from "../models/Tour.js";
import Payment from "../models/Payment.js";

// ============================================================
// ADMIN DASHBOARD STATISTICS
// ============================================================

export const getDashboardStats = async (req, res) => {
  try {
    /*
|--------------------------------------------------------------------------
| USERS
|--------------------------------------------------------------------------
*/

    const users = await User.countDocuments();

    /*
|--------------------------------------------------------------------------
| BOOKINGS
|--------------------------------------------------------------------------
*/

    const bookings = await Booking.countDocuments();

    /*
|--------------------------------------------------------------------------
| TOURS
|--------------------------------------------------------------------------
*/

    const tours = await Tour.countDocuments();

    /*
|--------------------------------------------------------------------------
| REVENUE
|--------------------------------------------------------------------------
*/

    const revenueData = await Payment.aggregate([
      {
        $match: {
          status: "paid",
        },
      },

      {
        $group: {
          _id: null,

          total: {
            $sum: "$amount",
          },
        },
      },
    ]);

    const revenue = revenueData[0]?.total || 0;

    /*
|--------------------------------------------------------------------------
| BOOKING STATUS
|--------------------------------------------------------------------------
*/

    const bookingStatus = await Booking.aggregate([
      {
        $group: {
          _id: "$status",

          count: {
            $sum: 1,
          },
        },
      },
    ]);

    /*
|--------------------------------------------------------------------------
| MONTHLY REVENUE
|--------------------------------------------------------------------------
*/

    const monthlyRevenue = await Payment.aggregate([
      {
        $match: {
          status: "paid",
        },
      },

      {
        $group: {
          _id: {
            month: {
              $month: "$createdAt",
            },

            year: {
              $year: "$createdAt",
            },
          },

          total: {
            $sum: "$amount",
          },
        },
      },

      {
        $sort: {
          "_id.year": 1,

          "_id.month": 1,
        },
      },
    ]);

    /*
|--------------------------------------------------------------------------
| POPULAR TOURS
|--------------------------------------------------------------------------
*/

    const popularTours = await Booking.aggregate([
      {
        $group: {
          _id: "$tour",

          totalBookings: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          totalBookings: -1,
        },
      },

      {
        $limit: 5,
      },
    ]);

    /*
|--------------------------------------------------------------------------
| VEHICLE STATS
|--------------------------------------------------------------------------
*/

    // Add vehicle aggregation here later
    // when Vehicle model is connected

    const vehicleStats = [];

    res.status(200).json({
      success: true,

      data: {
        users,

        tours,

        bookings,

        revenue,

        bookingStatus,

        monthlyRevenue,

        popularTours,

        vehicleStats,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};
