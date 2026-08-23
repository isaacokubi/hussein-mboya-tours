import { tenantFilter } from "../tenancy/tenantQuery.js";
import { requireTenantId } from "../tenancy/context.js";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";

const amountAfterRefund = {
  $subtract: [
    { $ifNull: ["$amount", 0] },
    { $ifNull: ["$refundedAmount", 0] },
  ],
};

const nonNegativeAmount = {
  $cond: [
    { $gt: [amountAfterRefund, 0] },
    amountAfterRefund,
    0,
  ],
};

export const getRevenueAnalytics = async (req) => {
  requireTenantId();
  const [result] = await Payment.aggregate([
    { $match: { ...tenantFilter(req), status: "completed" } },
    { $group: { _id: null, totalRevenue: { $sum: nonNegativeAmount }, totalPayments: { $sum: 1 } } },
  ]);
  return result || { totalRevenue: 0, totalPayments: 0 };
};

export const getBookingAnalytics = async (req) => {
  requireTenantId();
  return Booking.aggregate([
    { $match: { ...tenantFilter(req), isDeleted: { $ne: true } } },
    { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, bookings: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
};

export const getPopularTours = async (req) => {
  requireTenantId();
  return Payment.aggregate([
    { $match: { ...tenantFilter(req), status: "completed", booking: { $ne: null } } },
    { $group: { _id: "$booking", paidAmount: { $sum: nonNegativeAmount } } },
    { $lookup: { from: "bookings", localField: "_id", foreignField: "_id", as: "booking" } },
    { $unwind: "$booking" },
    { $match: { "booking.tenantId": tenantFilter(req).tenantId, "booking.isDeleted": { $ne: true } } },
    { $group: { _id: "$booking.tour", totalBookings: { $sum: 1 }, confirmedPaidBookings: { $sum: 1 }, revenue: { $sum: "$paidAmount" } } },
    { $lookup: { from: "tours", localField: "_id", foreignField: "_id", as: "tour" } },
    { $unwind: "$tour" },
    { $match: { "tour.tenantId": tenantFilter(req).tenantId, "tour.isDeleted": { $ne: true } } },
    { $project: { totalBookings: 1, confirmedPaidBookings: 1, revenue: 1, "tour._id": 1, "tour.title": 1, "tour.slug": 1, "tour.price": 1, "tour.featuredImage": 1 } },
    { $sort: { confirmedPaidBookings: -1, revenue: -1 } },
    { $limit: 10 },
  ]);
};
