/**
 * Purpose: tour Report Controller HTTP controller. Main declarations: getTourReports.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ../models/Tour.js so this module can use its exported dependencies.
import Tour from "../models/Tour.js";
// Load ../models/User.js so this module can use its exported dependencies.
import User from "../models/User.js";
// Load ../models/Payment.js so this module can use its exported dependencies.
import Payment from "../models/Payment.js";
// Load ../services/bookingRevenueService.js so this module can use its exported dependencies.
import { getBookingRevenueMetrics } from "../services/bookingRevenueService.js";
// Load ../services/financeReportingService.js so this module can use its exported dependencies.
import { getPostedRevenueReport } from "../services/financeReportingService.js";

// Declare getTourReports for use by the surrounding module or function.
export const getTourReports = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare bookingFilter for use by the surrounding module or function.
    const bookingFilter = mergeTenantFilter(req, { isDeleted: { $ne: true } });
    // Declare paymentFilter for use by the surrounding module or function.
    const paymentFilter = mergeTenantFilter(req, { status: "completed", isDeleted: { $ne: true } });
    // Declare tourFilter for use by the surrounding module or function.
    const tourFilter = mergeTenantFilter(req, { isDeleted: { $ne: true } });
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = req.tenantId;

    // Declare [totalBookings, revenueResult, bookingStatus, popularTours, monthlyRevenue, totalCustomers, totalTours, completedTours] for use by the surrounding module or function.
    const [totalBookings, revenueResult, bookingStatus, popularTours, monthlyRevenue, totalCustomers, totalTours, completedTours] = await Promise.all([
      Booking.countDocuments(bookingFilter),
      getBookingRevenueMetrics(req, { isDeleted: { $ne: true } }),
      Booking.aggregate([{ $match: bookingFilter }, { $group: { _id: "$status", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Payment.aggregate([
        { $match: paymentFilter },
        { $lookup: { from: "bookings", localField: "booking", foreignField: "_id", as: "bookingDoc" } },
        { $unwind: "$bookingDoc" },
        { $match: { "bookingDoc.isDeleted": { $ne: true }, "bookingDoc.tenantId": tenantId } },
        { $lookup: { from: "tours", localField: "bookingDoc.tour", foreignField: "_id", as: "tour" } },
        { $unwind: "$tour" },
        { $match: { "tour.isDeleted": { $ne: true }, "tour.tenantId": tenantId } },
        { $group: { _id: "$tour._id", bookings: { $addToSet: "$bookingDoc._id" }, revenue: { $sum: { $max: [0, { $subtract: [{ $ifNull: ["$amount", 0] }, { $ifNull: ["$refundedAmount", 0] }] }] } } } },
        { $project: { bookings: { $size: "$bookings" }, revenue: 1 } },
        { $sort: { bookings: -1, revenue: -1 } },
        { $limit: 5 },
        { $lookup: { from: "tours", localField: "_id", foreignField: "_id", as: "tour" } },
        { $unwind: "$tour" },
        { $project: { bookings: 1, revenue: 1, title: "$tour.title", slug: "$tour.slug", price: "$tour.price", image: "$tour.images" } },
      ]),
      getPostedRevenueReport(),
      User.countDocuments(mergeTenantFilter(req, { $or: [{ role: "customer" }, { legacyRole: "customer" }] })),
      Tour.countDocuments(tourFilter),
      Tour.countDocuments(mergeTenantFilter(req, { status: "completed", isDeleted: { $ne: true } })),
    ]);

    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({ success: true, data: { totalBookings, totalRevenue: Number(revenueResult?.revenue || 0), totalCustomers, totalTours, completedTours, bookingStatus, popularTours, monthlyRevenue: monthlyRevenue.monthly, revenueBasis: "posted_journals" } });
  } catch (error) { console.error("TOUR REPORT ERROR:", error); next(error); }
};
