// server/controllers/adminController.js

import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Tour from "../models/Tour.js";
import Destination from "../models/Destination.js";
import Payment from "../models/Payment.js";

export const getDashboardStats = async (req, res, next) => {
  try {
    const [users, bookings, tours, destinations, revenueData, status, monthlyRevenue, popularTours, pendingBookings, confirmedBookings, completedBookings, cancelledBookings, paymentStatsData] = await Promise.all([
      User.countDocuments(),
      Booking.countDocuments(),
      Tour.countDocuments(),
      Destination.countDocuments({ isDeleted: false, active: true }),
      Payment.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, total: { $sum: { $max: [0, { $subtract: [{ $ifNull: ["$amount", 0] }, { $ifNull: ["$refundedAmount", 0] }] }] } } } },
      ]),
      Booking.aggregate([{ $group: { _id: { status: "$status", paymentStatus: "$paymentStatus" }, count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Payment.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: { year: { $year: { $ifNull: ["$paidAt", "$createdAt"] } }, month: { $month: { $ifNull: ["$paidAt", "$createdAt"] } } }, total: { $sum: { $max: [0, { $subtract: [{ $ifNull: ["$amount", 0] }, { $ifNull: ["$refundedAmount", 0] }] }] } } } },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
      Booking.aggregate([
        { $match: { isDeleted: { $ne: true }, status: { $nin: ["cancelled", "refunded"] } } },
        { $group: { _id: "$tour", totalBookings: { $sum: 1 }, confirmedPaidBookings: { $sum: { $cond: [{ $in: ["$paymentStatus", ["paid", "completed"]] }, 1, 0] } }, revenue: { $sum: { $cond: [{ $in: ["$paymentStatus", ["paid", "completed"]] }, { $max: [0, { $subtract: [{ $subtract: [{ $ifNull: ["$totalAmount", 0] }, { $ifNull: ["$balanceAmount", 0] }] }, { $ifNull: ["$refundAmount", 0] }] }] }, 0] } } } },
        { $sort: { totalBookings: -1, confirmedPaidBookings: -1 } },
        { $limit: 5 },
        { $lookup: { from: "tours", localField: "_id", foreignField: "_id", as: "tour" } },
        { $unwind: { path: "$tour", preserveNullAndEmptyArrays: true } },
        { $project: { _id: 1, title: { $ifNull: ["$tour.title", "Deleted/Unavailable Tour"] }, price: "$tour.price", destination: "$tour.destination", totalBookings: 1, confirmedPaidBookings: 1, revenue: 1 } },
      ]),
      Booking.countDocuments({ status: "pending" }),
      Booking.countDocuments({ status: "confirmed" }),
      Booking.countDocuments({ status: "completed" }),
      Booking.countDocuments({ status: "cancelled" }),
      Booking.aggregate([{ $group: { _id: "$paymentStatus", count: { $sum: 1 } } }]),
    ]);

    const paymentStats = {
      completed: paymentStatsData.filter((item) => ["paid", "completed", "success"].includes(item._id)).reduce((sum, item) => sum + item.count, 0),
      pending: paymentStatsData.filter((item) => ["pending", "partial"].includes(item._id)).reduce((sum, item) => sum + item.count, 0),
      failed: paymentStatsData.filter((item) => ["failed", "cancelled"].includes(item._id)).reduce((sum, item) => sum + item.count, 0),
    };

    const recentRaw = await Booking.find({ isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("customer", "name email phone")
      .populate("tour", "title")
      .lean();

    // Historical bookings must remain displayable even when the customer account
    // has been deleted. Prefer the live user, then the booking snapshot, then a
    // stable fallback rather than allowing a null populate to blank the dashboard.
    const recentBookings = recentRaw.map((booking) => ({
      ...booking,
      customer: booking.customer || {
        name: booking.customerSnapshot?.name || "Deleted User",
        email: booking.customerSnapshot?.email || booking.customerEmail || "",
        phone: booking.customerSnapshot?.phone || booking.customerPhone || "",
        deleted: true,
      },
      tour: booking.tour || {
        title: "Deleted/Unavailable Tour",
        deleted: true,
      },
    }));

    return res.status(200).json({
      success: true,
      data: {
        users,
        bookings,
        tours,
        destinations,
        revenue: revenueData[0]?.total || 0,
        status,
        monthlyRevenue,
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
      User.countDocuments(),
      User.countDocuments({ isActive: { $ne: false } }),
      User.countDocuments({ role: "customer" }),
      User.countDocuments({ role: "agent" }),
    ]);
    return res.status(200).json({ success: true, data: { total, active, customers, agents } });
  } catch (error) { next(error); }
};

export const getBookingAnalytics = async (req, res, next) => {
  try {
    const status = await Booking.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }, { $sort: { count: -1 } }]);
    return res.status(200).json({ success: true, data: { status } });
  } catch (error) { next(error); }
};

export const getRevenueAnalytics = async (req, res, next) => {
  try {
    const monthly = await Payment.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: { year: { $year: { $ifNull: ["$paidAt", "$createdAt"] } }, month: { $month: { $ifNull: ["$paidAt", "$createdAt"] } } }, revenue: { $sum: { $max: [0, { $subtract: [{ $ifNull: ["$amount", 0] }, { $ifNull: ["$refundedAmount", 0] }] }] } }, bookings: { $sum: 1 } } },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);
    return res.status(200).json({ success: true, data: { monthly } });
  } catch (error) { next(error); }
};
