import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";

/*
|--------------------------------------------------------------------------
| TOTAL REVENUE
|--------------------------------------------------------------------------
|
| Completed Payment records are the source of truth for cash received.
| Booking.totalAmount represents booking value and must not be treated as
| collected revenue.
|
|--------------------------------------------------------------------------
*/

export const getRevenueAnalytics = async () => {
  const [result] = await Payment.aggregate([
    {
      $match: {
        status: "completed",
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: {
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
        totalPayments: {
          $sum: 1,
        },
      },
    },
  ]);

  return (
    result || {
      totalRevenue: 0,
      totalPayments: 0,
    }
  );
};

/*
|--------------------------------------------------------------------------
| BOOKINGS PER MONTH
|--------------------------------------------------------------------------
*/

export const getBookingAnalytics = async () => {
  return Booking.aggregate([
    {
      $match: {
        isDeleted: { $ne: true },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m",
            date: "$createdAt",
          },
        },
        bookings: {
          $sum: 1,
        },
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },
  ]);
};

/*
|--------------------------------------------------------------------------
| MOST POPULAR TOURS
|--------------------------------------------------------------------------
*/

export const getPopularTours = async () => {
  return Booking.aggregate([
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
      $sort: { totalBookings: -1, confirmedPaidBookings: -1 },
    },
    { $limit: 10 },
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
        preserveNullAndEmptyArrays: false,
      },
    },
    {
      $match: { "tour.isDeleted": { $ne: true } },
    },
    {
      $project: {
        totalBookings: 1,
        confirmedPaidBookings: 1,
        revenue: 1,
        "tour._id": 1,
        "tour.title": 1,
        "tour.slug": 1,
        "tour.price": 1,
        "tour.featuredImage": 1,
      },
    },
  ]);
};
