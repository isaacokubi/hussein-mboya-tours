/**
 * Purpose: admin Controller HTTP controller. Main declarations: cleanName, bookingCustomerFallback, bookingTourFallback, getDashboardStats, getUserAnalytics.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
// server/controllers/adminController.js

// Load ../models/User.js so this module can use its exported dependencies.
import User from "../models/User.js";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ../models/Tour.js so this module can use its exported dependencies.
import Tour from "../models/Tour.js";
// Load ../models/Destination.js so this module can use its exported dependencies.
import Destination from "../models/Destination.js";
// Load ../services/bookingRevenueService.js so this module can use its exported dependencies.
import { getBookingRevenueMetrics } from "../services/bookingRevenueService.js";
// Load ../services/financeReportingService.js so this module can use its exported dependencies.
import { getPostedRevenueReport } from "../services/financeReportingService.js";

// Declare cleanName for use by the surrounding module or function.
const cleanName = (value) => {
  // Declare text for use by the surrounding module or function.
  const text = String(value ?? "").trim().replace(/\s+/g, " ");
  // Return the expression shown below to the caller.
  return text && !/^undefined( undefined)?$/i.test(text) && !/^null( null)?$/i.test(text) ? text : "";
};

// Declare bookingCustomerFallback for use by the surrounding module or function.
const bookingCustomerFallback = (booking) => {
  // Declare customer for use by the surrounding module or function.
  const customer = booking?.customer || {};
  // Declare snapshot for use by the surrounding module or function.
  const snapshot = booking?.customerSnapshot || {};
  // Declare contact for use by the surrounding module or function.
  const contact = booking?.contact || {};
  // Declare user for use by the surrounding module or function.
  const user = booking?.user || {};
  // Declare name for use by the surrounding module or function.
  const name = cleanName(customer.name)
    || [cleanName(customer.firstName), cleanName(customer.lastName)].filter(Boolean).join(" ")
    || cleanName(snapshot.name)
    || [cleanName(snapshot.firstName), cleanName(snapshot.lastName)].filter(Boolean).join(" ")
    || cleanName(contact.name)
    || cleanName(user.name);
  // Return the object assembled below to the caller.
  return {
    name: name || cleanName(customer.email) || cleanName(snapshot.email) || cleanName(contact.email) || cleanName(user.email) || cleanName(customer.phone) || cleanName(snapshot.phone) || cleanName(contact.phone) || cleanName(user.phone) || "Customer",
    email: cleanName(customer.email) || cleanName(snapshot.email) || cleanName(contact.email) || cleanName(user.email),
    phone: cleanName(customer.phone) || cleanName(snapshot.phone) || cleanName(contact.phone) || cleanName(user.phone),
    deleted: !booking?.customer && !booking?.user,
  };
};

// Declare bookingTourFallback for use by the surrounding module or function.
const bookingTourFallback = (booking) => {
  // Check the condition (booking?.tour) and run the matching branch.
  if (booking?.tour) return booking.tour;
  // Check the condition (booking?.customTourRequest?.destination) and run the matching branch.
  if (booking?.customTourRequest?.destination) {
    // Return the object assembled below to the caller.
    return { title: `Custom tour — ${booking.customTourRequest.destination}`, custom: true };
  }
  // Return the object assembled below to the caller.
  return { title: "Tour unavailable", deleted: true };
};

// Declare getDashboardStats for use by the surrounding module or function.
export const getDashboardStats = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    requireTenantId();
    // Declare userFilter for use by the surrounding module or function.
    const userFilter = mergeTenantFilter({ isDeleted: { $ne: true } });
    // Declare bookingFilter for use by the surrounding module or function.
    const bookingFilter = mergeTenantFilter({ isDeleted: { $ne: true } });
    // Declare tourFilter for use by the surrounding module or function.
    const tourFilter = mergeTenantFilter({ isDeleted: { $ne: true } });
    // Declare destinationFilter for use by the surrounding module or function.
    const destinationFilter = mergeTenantFilter({ isDeleted: false, active: true });

    // Declare [users, bookings, tours, destinations, revenueData, status, monthlyRevenue, popularTours, pendingBookings, confirmedBookings, completedBookings, cancelledBookings, paymentStatsData] for use by the surrounding module or function.
    const [users, bookings, tours, destinations, revenueData, status, monthlyRevenue, popularTours, pendingBookings, confirmedBookings, completedBookings, cancelledBookings, paymentStatsData] = await Promise.all([
      User.countDocuments(userFilter),
      Booking.countDocuments(bookingFilter),
      Tour.countDocuments(tourFilter),
      Destination.countDocuments(destinationFilter),
      getBookingRevenueMetrics(req),
      Booking.aggregate([
        { $match: bookingFilter },
        { $group: { _id: { status: "$status", paymentStatus: "$paymentStatus" }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      getPostedRevenueReport(),
      Booking.aggregate([
        { $match: mergeTenantFilter({ isDeleted: { $ne: true }, status: { $nin: ["cancelled", "refunded"] }, tour: { $ne: null } }) },
        { $lookup: { from: "tours", localField: "tour", foreignField: "_id", as: "tour" } },
        { $unwind: "$tour" },
        { $match: { "tour.isDeleted": { $ne: true } } },
        { $group: { _id: "$tour._id", totalBookings: { $sum: 1 }, confirmedPaidBookings: { $sum: { $cond: [{ $in: ["$paymentStatus", ["paid", "completed"]] }, 1, 0] } }, revenue: { $sum: { $cond: [{ $in: ["$paymentStatus", ["paid", "completed"]] }, { $max: [0, { $subtract: [{ $subtract: [{ $ifNull: ["$totalAmount", 0] }, { $ifNull: ["$balanceAmount", 0] }] }, { $ifNull: ["$refundAmount", 0] }] }] }, 0] } } } },
        { $sort: { totalBookings: -1, confirmedPaidBookings: -1 } },
        { $limit: 5 },
        { $lookup: { from: "tours", localField: "_id", foreignField: "_id", as: "tour" } },
        { $unwind: "$tour" },
        { $project: { _id: 1, title: "$tour.title", price: "$tour.price", destination: "$tour.destination", totalBookings: 1, confirmedPaidBookings: 1, revenue: 1 } },
      ]),
      Booking.countDocuments(mergeTenantFilter({ isDeleted: { $ne: true }, status: "pending" })),
      Booking.countDocuments(mergeTenantFilter({ isDeleted: { $ne: true }, status: "confirmed" })),
      Booking.countDocuments(mergeTenantFilter({ isDeleted: { $ne: true }, status: "completed" })),
      Booking.countDocuments(mergeTenantFilter({ isDeleted: { $ne: true }, status: "cancelled" })),
      Booking.aggregate([
        { $match: bookingFilter },
        { $group: { _id: "$paymentStatus", count: { $sum: 1 } } },
      ]),
    ]);

    // Declare paymentStats for use by the surrounding module or function.
    const paymentStats = {
      completed: paymentStatsData.filter((item) => ["paid", "completed", "success"].includes(item._id)).reduce((sum, item) => sum + item.count, 0),
      pending: paymentStatsData.filter((item) => ["pending", "partial"].includes(item._id)).reduce((sum, item) => sum + item.count, 0),
      failed: paymentStatsData.filter((item) => ["failed", "cancelled"].includes(item._id)).reduce((sum, item) => sum + item.count, 0),
    };

    // Declare recentRaw for use by the surrounding module or function.
    const recentRaw = await Booking.find(bookingFilter)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("customer", "name email phone")
      .populate("user", "name email phone")
      .populate("tour", "title")
      .populate("customTourRequest", "destination")
      .lean();

    // Declare recentBookings for use by the surrounding module or function.
    const recentBookings = recentRaw.map((booking) => ({
      ...booking,
      customer: { ...(booking.customer || {}), ...bookingCustomerFallback(booking) },
      tour: bookingTourFallback(booking),
    }));

    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({
      success: true,
      data: {
        users,
        bookings,
        tours,
        destinations,
        revenue: Number(revenueData?.revenue || 0),
        status,
        monthlyRevenue: monthlyRevenue.monthly,
        revenueBasis: "posted_journals",
        popularTours,
        paymentStats,
        vehicleStats: [],
        recentBookings,
        summary: { pendingBookings, confirmedBookings, completedBookings, cancelledBookings },
      },
    });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

// Declare getUserAnalytics for use by the surrounding module or function.
export const getUserAnalytics = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare [total, active, customers, agents] for use by the surrounding module or function.
    const [total, active, customers, agents] = await Promise.all([
      User.countDocuments(mergeTenantFilter({ isDeleted: { $ne: true } })),
      User.countDocuments(mergeTenantFilter({ isDeleted: { $ne: true }, isActive: { $ne: false } })),
      User.countDocuments(mergeTenantFilter({ isDeleted: { $ne: true }, $or: [{ role: "customer" }, { legacyRole: "customer" }] })), 
      User.countDocuments(mergeTenantFilter({ isDeleted: { $ne: true }, role: "agent" })),
    ]);
    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({ success: true, data: { total, active, customers, agents } });
  } catch (error) { next(error); }
};

// Declare getBookingAnalytics for use by the surrounding module or function.
export const getBookingAnalytics = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare status for use by the surrounding module or function.
    const status = await Booking.aggregate([
      { $match: mergeTenantFilter({ isDeleted: { $ne: true } }) },
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({ success: true, data: { status } });
  } catch (error) { next(error); }
};

// Declare getRevenueAnalytics for use by the surrounding module or function.
export const getRevenueAnalytics = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare report for use by the surrounding module or function.
    const report = await getPostedRevenueReport();
    // Declare monthly for use by the surrounding module or function.
    const monthly = report.monthly;
    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({ success: true, data: { monthly, revenueBasis: "posted_journals" } });
  } catch (error) { next(error); }
};
