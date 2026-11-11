/**
 * Purpose: analytics Service business-logic service. Main declarations: getRevenueAnalytics, getBookingAnalytics, getPopularTours.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { tenantFilter } from "../tenancy/tenantQuery.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { requireTenantId } from "../tenancy/context.js";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ../models/Payment.js so this module can use its exported dependencies.
import Payment from "../models/Payment.js";
// Load ./bookingRevenueService.js so this module can use its exported dependencies.
import { getBookingRevenueMetrics } from "./bookingRevenueService.js";

// Declare amountAfterRefund for use by the surrounding module or function.
const amountAfterRefund = {
  $subtract: [
    { $ifNull: ["$amount", 0] },
    { $ifNull: ["$refundedAmount", 0] },
  ],
};

// Declare nonNegativeAmount for use by the surrounding module or function.
const nonNegativeAmount = {
  $cond: [
    { $gt: [amountAfterRefund, 0] },
    amountAfterRefund,
    0,
  ],
};

// Declare getRevenueAnalytics for use by the surrounding module or function.
export const getRevenueAnalytics = async (req) => {
  // Declare metrics for use by the surrounding module or function.
  const metrics = await getBookingRevenueMetrics(req);
  // Return the object assembled below to the caller.
  return {
    totalRevenue: metrics.revenue,
    totalPayments: metrics.paidBookings,
    revenueBasis: metrics.basis,
    currency: metrics.currency,
  };
};

// Declare getBookingAnalytics for use by the surrounding module or function.
export const getBookingAnalytics = async (req) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Return the result of Booking.aggregate() to the caller.
  return Booking.aggregate([
    { $match: { ...tenantFilter(req), isDeleted: { $ne: true } } },
    { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, bookings: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
};

// Declare getPopularTours for use by the surrounding module or function.
export const getPopularTours = async (req) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Return the result of Payment.aggregate() to the caller.
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
