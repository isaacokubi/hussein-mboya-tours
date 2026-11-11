/**
 * Purpose: admin AIAnalytics Controller HTTP controller. Main declarations: getAIAnalytics.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { requireTenantId } from "../tenancy/context.js";
// Load ../tenancy/tenantQuery.js so this module can use its exported dependencies.
import { tenantFilter } from "../tenancy/tenantQuery.js";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ../models/Payment.js so this module can use its exported dependencies.
import Payment from "../models/Payment.js";
// Load ../models/Tour.js so this module can use its exported dependencies.
import Tour from "../models/Tour.js";

// Declare getAIAnalytics for use by the surrounding module or function.
export const getAIAnalytics = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    requireTenantId();
    // Declare filter for use by the surrounding module or function.
    const filter = tenantFilter(req);
    // Declare bookingFilter for use by the surrounding module or function.
    const bookingFilter = { ...filter, isDeleted: { $ne: true } };
    // Declare paymentFilter for use by the surrounding module or function.
    const paymentFilter = { ...filter, status: "completed" };
    // Declare tourFilter for use by the surrounding module or function.
    const tourFilter = { ...filter, isDeleted: { $ne: true } };

    // Declare [monthlyRevenue, bookingActivity, topTours, bookingStatus, totalTours, recentBookings] for use by the surrounding module or function.
    const [monthlyRevenue, bookingActivity, topTours, bookingStatus, totalTours, recentBookings] = await Promise.all([
      Payment.aggregate([
        { $match: paymentFilter },
        { $group: { _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } }, revenue: { $sum: "$amount" } } },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ]),
      Booking.aggregate([
        { $match: bookingFilter },
        { $group: { _id: { day: { $dayOfMonth: "$createdAt" }, month: { $month: "$createdAt" }, year: { $year: "$createdAt" } }, bookings: { $sum: 1 } } },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
        { $limit: 31 }
      ]),
      Booking.aggregate([
        { $match: { ...bookingFilter, tour: { $ne: null } } },
        { $group: { _id: "$tour", bookings: { $sum: 1 } } },
        { $sort: { bookings: -1 } },
        { $limit: 5 },
        { $lookup: { from: "tours", localField: "_id", foreignField: "_id", as: "tour" } },
        { $project: { _id: 1, bookings: 1, tour: { $arrayElemAt: ["$tour", 0] } } }
      ]),
      Booking.aggregate([
        { $match: bookingFilter },
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Tour.countDocuments(tourFilter),
      Booking.find(bookingFilter).sort({ createdAt: -1 }).limit(10).populate("tour")
    ]);

    // Return the result of res.json() to the caller.
    return res.json({
      success: true,
      data: { monthlyRevenue, bookingActivity, topTours, bookingStatus, totalTours, recentBookings }
    });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};
