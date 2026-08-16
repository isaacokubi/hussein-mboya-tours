import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";

// A confirmed payment is the sole financial source of truth. Booking status is deliberately ignored.

export const getRevenueAnalytics = async () => {
  const [result] = await Payment.aggregate([
    { $match: { status: "completed" } },
    { $group: {
      _id: null,
      totalRevenue: { $sum: { $max: [0, { $subtract: [{ $ifNull: ["$amount", 0] }, { $ifNull: ["$refundedAmount", 0] }] }] } },
      totalPayments: { $sum: 1 },
    }},
  ]);
  return result || { totalRevenue: 0, totalPayments: 0 };
};

export const getBookingAnalytics = async () => Booking.aggregate([
  { $match: { isDeleted: { $ne: true } } },
  { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, bookings: { $sum: 1 } } },
  { $sort: { _id: 1 } },
]);

/*
 * Tour popularity/revenue is payment-led. A booking does not become
 * financially recognized merely because its booking status says confirmed.
 * Only completed Payment records contribute to confirmed payment counts
 * and recognized revenue.
 */
export const getPopularTours = async () => Payment.aggregate([
  { $match: { status: "completed", booking: { $ne: null } } },
  { $group: {
    _id: "$booking",
    paidAmount: { $sum: { $max: [0, { $subtract: [{ $ifNull: ["$amount", 0] }, { $ifNull: ["$refundedAmount", 0] }] }] } },
  }},
  { $lookup: { from: "bookings", localField: "_id", foreignField: "_id", as: "booking" } },
  { $unwind: "$booking" },
  { $match: { "booking.isDeleted": { $ne: true } } },
  { $group: {
    _id: "$booking.tour",
    totalBookings: { $sum: 1 },
    confirmedPaidBookings: { $sum: 1 },
    revenue: { $sum: "$paidAmount" },
  }},
  { $lookup: { from: "tours", localField: "_id", foreignField: "_id", as: "tour" } },
  { $unwind: "$tour" },
  { $match: { "tour.isDeleted": { $ne: true } } },
  { $project: {
    totalBookings: 1,
    confirmedPaidBookings: 1,
    revenue: 1,
    "tour._id": 1,
    "tour.title": 1,
    "tour.slug": 1,
    "tour.price": 1,
    "tour.featuredImage": 1,
  }},
  { $sort: { confirmedPaidBookings: -1, revenue: -1 } },
  { $limit: 10 },
]);
