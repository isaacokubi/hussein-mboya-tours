import Booking from "../models/Booking.js";
import Tour from "../models/Tour.js";
import User from "../models/User.js";

/*
|--------------------------------------------------------------------------
| DASHBOARD STATISTICS
|--------------------------------------------------------------------------
*/

export const dashboardStats = async (req, res, next) => {
  try {
    const [
      users,
      tours,
      bookings,
      revenueData,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
    ] = await Promise.all([
      User.countDocuments(),

      Tour.countDocuments(),

      Booking.countDocuments(),

      Booking.aggregate([
        {
          $match: {
            paymentStatus: "paid",
            bookingStatus: {
              $nin: ["cancelled", "refunded"],
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

    const revenue = revenueData[0]?.total || 0;

    res.status(200).json({
      success: true,

      data: {
        users,
        tours,
        bookings,
        revenue,

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