import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
// server/controllers/adminController.js

import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Tour from "../models/Tour.js";
import Destination from "../models/Destination.js";
import { getBookingRevenueMetrics } from "../services/bookingRevenueService.js";
import { getPostedRevenueReport } from "../services/financeReportingService.js";

const cleanName = (value) => {
  const text = String(value ?? "").trim().replace(/\s+/g, " ");
  return text && !/^undefined( undefined)?$/i.test(text) && !/^null( null)?$/i.test(text) ? text : "";
};

const bookingCustomerFallback = (booking) => {
  const snapshot = booking?.customerSnapshot || {};
  const contact = booking?.contact || {};
  const user = booking?.user || {};
  const name = cleanName(snapshot.name) || cleanName(contact.name) || cleanName(user.name) || [cleanName(snapshot.firstName), cleanName(snapshot.lastName)].filter(Boolean).join(" ");
  return {
    name: name || "Customer",
    email: cleanName(snapshot.email) || cleanName(contact.email) || cleanName(user.email),
    phone: cleanName(snapshot.phone) || cleanName(contact.phone) || cleanName(user.phone),
    deleted: !booking?.customer && !booking?.user,
  };
};

const bookingTourFallback = (booking) => {
  if (booking?.tour) return booking.tour;
  if (booking?.customTourRequest?.destination) {
    return { title: `Custom tour — ${booking.customTourRequest.destination}`, custom: true };
  }
  return { title: "Tour unavailable", deleted: true };
};

export const getDashboardStats = async (req, res, next) => {
  try {
    requireTenantId();
    const userFilter = mergeTenantFilter({ isDeleted: { $ne: true } });
    const bookingFilter = mergeTenantFilter({ isDeleted: { $ne: true } });
    const tourFilter = mergeTenantFilter({ isDeleted: { $ne: true } });
    const destinationFilter = mergeTenantFilter({ isDeleted: false, active: true });

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

    const paymentStats = {
      completed: paymentStatsData.filter((item) => ["paid", "completed", "success"].includes(item._id)).reduce((sum, item) => sum + item.count, 0),
      pending: paymentStatsData.filter((item) => ["pending", "partial"].includes(item._id)).reduce((sum, item) => sum + item.count, 0),
      failed: paymentStatsData.filter((item) => ["failed", "cancelled"].includes(item._id)).reduce((sum, item) => sum + item.count, 0),
    };

    const recentRaw = await Booking.find(bookingFilter)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("customer", "name email phone")
      .populate("user", "name email phone")
      .populate("tour", "title")
      .populate("customTourRequest", "destination")
      .lean();

    const recentBookings = recentRaw.map((booking) => ({
      ...booking,
      customer: booking.customer || bookingCustomerFallback(booking),
      tour: bookingTourFallback(booking),
    }));

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
    next(error);
  }
};

export const getUserAnalytics = async (req, res, next) => {
  try {
    const [total, active, customers, agents] = await Promise.all([
      User.countDocuments(mergeTenantFilter({ isDeleted: { $ne: true } })),
      User.countDocuments(mergeTenantFilter({ isDeleted: { $ne: true }, isActive: { $ne: false } })),
      User.countDocuments(mergeTenantFilter({ isDeleted: { $ne: true }, role: "customer" })),
      User.countDocuments(mergeTenantFilter({ isDeleted: { $ne: true }, role: "agent" })),
    ]);
    return res.status(200).json({ success: true, data: { total, active, customers, agents } });
  } catch (error) { next(error); }
};

export const getBookingAnalytics = async (req, res, next) => {
  try {
    const status = await Booking.aggregate([
      { $match: mergeTenantFilter({ isDeleted: { $ne: true } }) },
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    return res.status(200).json({ success: true, data: { status } });
  } catch (error) { next(error); }
};

export const getRevenueAnalytics = async (req, res, next) => {
  try {
    const report = await getPostedRevenueReport();
    const monthly = report.monthly;
    return res.status(200).json({ success: true, data: { monthly, revenueBasis: "posted_journals" } });
  } catch (error) { next(error); }
};
