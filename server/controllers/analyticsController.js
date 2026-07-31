import Booking from "../models/Booking.js";
import User from "../models/User.js";
import Vehicle from "../models/Vehicle.js";

import {
  getRevenueAnalytics,
  getBookingAnalytics,
  getPopularTours,
} from "../services/analyticsService.js";

/*
|--------------------------------------------------------------------------
| ADMIN ANALYTICS DASHBOARD
|--------------------------------------------------------------------------
*/

export const getAnalytics = async (req, res, next) => {
  try {

    /*
    |--------------------------------------------------------------------------
    | Execute All Queries In Parallel
    |--------------------------------------------------------------------------
    */

    const [

      revenue,

      bookings,

      popularTours,

      customers,

      bookingStatus,

      monthlyRevenue,

      vehicleStats

    ] = await Promise.all([

      getRevenueAnalytics(),

      getBookingAnalytics(),

      getPopularTours(),

      User.countDocuments({
        role: "customer",
      }),

      Booking.aggregate([

        {
          $group: {
            _id: "$bookingStatus",

            count: {
              $sum: 1,
            },
          },
        },

        {
          $sort: {
            count: -1,
          },
        },

      ]),

      Booking.aggregate([

        {
          $match: {
            paymentStatus: "paid",
          },
        },

        {
          $group: {

            _id: {

              year: {
                $year: "$createdAt",
              },

              month: {
                $month: "$createdAt",
              },

            },

            revenue: {
              $sum: "$amount",
            },

            bookings: {
              $sum: 1,
            },

          },

        },

        {
          $sort: {
            "_id.year": 1,
            "_id.month": 1,
          },
        },

      ]),

      Vehicle.aggregate([

        {
          $group: {

            _id: "$status",

            count: {
              $sum: 1,
            },

          },

        },

        {
          $sort: {
            count: -1,
          },
        },

      ])

    ]);

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    res.status(200).json({

      success: true,

      data: {

        revenue,

        customers,

        bookings,

        bookingStatus,

        monthlyRevenue,

        popularTours,

        vehicleStats,

      },

    });

  } catch (error) {

    next(error);

  }
};

/*
|--------------------------------------------------------------------------
| TOUR MANAGER ANALYTICS
|--------------------------------------------------------------------------
*/

export const dashboardAnalytics = async (req, res, next) => {
  try {

    const [

      revenue,

      bookings,

      popularTours

    ] = await Promise.all([

      getRevenueAnalytics(),

      getBookingAnalytics(),

      getPopularTours()

    ]);

    res.status(200).json({

      success: true,

      data: {

        revenue,

        bookings,

        popularTours,

      },

    });

  } catch (error) {

    next(error);

  }
};