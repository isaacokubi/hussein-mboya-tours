import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
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
  requireTenantId();
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
        $or: [
          { role: "customer" },
          { legacyRole: "customer" },
        ],
      }),

      Booking.aggregate([

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

      ]),

      Payment.aggregate([
        {
          $match: {
            status: "completed",
          },
        },
        {
          $group: {
            _id: {
              year: {
                $year: { $ifNull: ["$paidAt", "$createdAt"] },
              },
              month: {
                $month: { $ifNull: ["$paidAt", "$createdAt"] },
              },
            },
            revenue: {
              $sum: {
                $max: [
                  0,
                  {
                    $subtract: [
                      { $ifNull: ["$amount", 0] },
                      { $ifNull: ["$refundedAmount", 0] },
                    ],
                  },
                ],
              },
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

/*
|--------------------------------------------------------------------------
| REVENUE-ONLY ANALYTICS
|--------------------------------------------------------------------------
*/

export const revenueAnalytics = async (req, res, next) => {
  try {
    const revenue = await getRevenueAnalytics();

    return res.status(200).json({
      success: true,
      data: { revenue },
    });
  } catch (error) {
    next(error);
  }
};
