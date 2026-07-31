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
    | BASIC COUNTS (RUN IN PARALLEL)
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
    ] = await Promise.all([
      User.countDocuments(),

      Booking.countDocuments(),

      Tour.countDocuments(),

      /*
      |--------------------------------------------------------------------------
      | REVENUE
      |--------------------------------------------------------------------------
      */

      Booking.aggregate([
        {
          $match: {
            paymentStatus: "paid",
            bookingStatus: {
              $ne: "cancelled",
            },
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
      ]),

      /*
      |--------------------------------------------------------------------------
      | BOOKING STATUS
      |--------------------------------------------------------------------------
      */

      Booking.aggregate([
        {
          $group: {
            _id: {
              bookingStatus: "$bookingStatus",
              paymentStatus: "$paymentStatus",
            },
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

      /*
      |--------------------------------------------------------------------------
      | MONTHLY REVENUE
      |--------------------------------------------------------------------------
      */

      Booking.aggregate([
        {
          $match: {
            paymentStatus: "paid",
            bookingStatus: {
              $ne: "cancelled",
            },
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
      ]),

      /*
      |--------------------------------------------------------------------------
      | POPULAR TOURS
      |--------------------------------------------------------------------------
      */

      Booking.aggregate([
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
        {
          $lookup: {
            from: "tours",
            localField: "_id",
            foreignField: "_id",
            as: "tour",
          },
        },
        {
          $unwind: {
            path: "$tour",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            title: "$tour.title",
            price: "$tour.price",
            destination: "$tour.destination",
            totalBookings: 1,
          },
        },
      ]),

      Booking.countDocuments({
        bookingStatus: "pending",
      }),

      Booking.countDocuments({
        bookingStatus: "confirmed",
      }),

      Booking.countDocuments({
        bookingStatus: "completed",
      }),

      Booking.countDocuments({
        bookingStatus: "cancelled",
      }),
    ]);

    /*
    |--------------------------------------------------------------------------
    | TOTAL REVENUE
    |--------------------------------------------------------------------------
    */

    const revenue = revenueData[0]?.total || 0;

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
      success: true,

      data: {
        users,
        bookings,
        tours,
        revenue,

        bookingStatus,

        monthlyRevenue,

        popularTours,

        vehicleStats,

        summary: {
          pendingBookings,
          confirmedBookings,
          completedBookings,
          cancelledBookings,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};