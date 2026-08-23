import { requireTenantId } from "../tenancy/context.js";
import { tenantFilter } from "../tenancy/tenantQuery.js";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Tour from "../models/Tour.js";
import Destination from "../models/Destination.js";
import Payment from "../models/Payment.js";

const active = { isDeleted: { $ne: true } };
const completedAmount = {
  $max: [0, { $subtract: [{ $ifNull: ["$amount", 0] }, { $ifNull: ["$refundedAmount", 0] }] }],
};

export const getDashboardStats = async (req, res, next) => {
  requireTenantId();
  try {
    const usersFilter = tenantFilter(req, active);
    const bookingsFilter = tenantFilter(req, active);
    const toursFilter = tenantFilter(req, active);
    const destinationsFilter = tenantFilter(req, { isDeleted: { $ne: true }, active: { $ne: false } });
    const paymentsFilter = tenantFilter(req, { status: "completed" });

    const [users, bookings, tours, destinations, customers, revenue, bookingStatus, paymentStatus, pending, confirmed, completed, cancelled, recentBookings, popularTours] = await Promise.all([
      User.countDocuments(usersFilter),
      Booking.countDocuments(bookingsFilter),
      Tour.countDocuments(toursFilter),
      Destination.countDocuments(destinationsFilter),
      User.countDocuments(tenantFilter(req, { ...active, role: "customer" })),
      Payment.aggregate([{ $match: paymentsFilter }, { $group: { _id: null, total: { $sum: completedAmount } } }]),
      Booking.aggregate([{ $match: bookingsFilter }, { $group: { _id: "$status", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Booking.aggregate([{ $match: bookingsFilter }, { $group: { _id: "$paymentStatus", count: { $sum: 1 } } }]),
      Booking.countDocuments(tenantFilter(req, { ...active, status: "pending" })),
      Booking.countDocuments(tenantFilter(req, { ...active, status: "confirmed" })),
      Booking.countDocuments(tenantFilter(req, { ...active, status: "completed" })),
      Booking.countDocuments(tenantFilter(req, { ...active, status: "cancelled" })),
      Booking.find(bookingsFilter).sort({ createdAt: -1 }).limit(5).populate("customer", "name email phone").populate("tour", "title").lean(),
      Booking.aggregate([
        { $match: { ...bookingsFilter, status: { $nin: ["cancelled", "refunded"] }, tour: { $ne: null } } },
        { $group: { _id: "$tour", totalBookings: { $sum: 1 }, bookingValue: { $sum: { $ifNull: ["$totalAmount", 0] } } } },
        { $sort: { totalBookings: -1, bookingValue: -1 } },
        { $limit: 5 },
        { $lookup: { from: "tours", localField: "_id", foreignField: "_id", as: "tour" } },
        { $unwind: "$tour" },
        { $project: { _id: 1, title: "$tour.title", totalBookings: 1, bookingValue: 1 } },
      ]),
    ]);

    const payments = {
      completed: paymentStatus.filter((x) => ["paid", "completed", "success"].includes(x._id)).reduce((n, x) => n + x.count, 0),
      pending: paymentStatus.filter((x) => ["pending", "partial"].includes(x._id)).reduce((n, x) => n + x.count, 0),
      failed: paymentStatus.filter((x) => ["failed", "cancelled"].includes(x._id)).reduce((n, x) => n + x.count, 0),
    };

    const normalizedBookings = recentBookings.map((booking) => ({
      ...booking,
      customer: booking.customer || { name: booking.customerSnapshot?.name || "Customer" },
      tour: booking.tour || { title: "Unavailable tour" },
      amount: Number(booking.totalAmount ?? booking.amount ?? booking.subtotal ?? 0),
      paymentStatus: booking.paymentStatus || "pending",
    }));

    const monthlyRevenue = await Payment.aggregate([
      { $match: paymentsFilter },
      { $group: { _id: { year: { $year: { $ifNull: ["$paidAt", "$createdAt"] } }, month: { $month: { $ifNull: ["$paidAt", "$createdAt"] } } }, amount: { $sum: completedAmount } } },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    return res.json({
      success: true,
      data: {
        users, customers, tours, destinations, bookings,
        revenue: revenue[0]?.total || 0,
        recentBookings: normalizedBookings,
        popularTours,
        paymentStats: payments,
        monthlyRevenue: monthlyRevenue.map((x) => ({ month: `${x._id.month}/${x._id.year}`, amount: x.amount || 0 })),
        status: bookingStatus,
        summary: { pendingBookings: pending, confirmedBookings: confirmed, completedBookings: completed, cancelledBookings: cancelled },
      },
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    next(error);
  }
};

export const getUserAnalytics = async (req, res, next) => {
  try {
    requireTenantId();
    const filter = tenantFilter(req, active);
    const [total, activeUsers, customers, agents] = await Promise.all([
      User.countDocuments(filter),
      User.countDocuments(tenantFilter(req, { ...active, isActive: { $ne: false } })),
      User.countDocuments(tenantFilter(req, { ...active, role: "customer" })),
      User.countDocuments(tenantFilter(req, { ...active, role: "agent" })),
    ]);
    res.json({ success: true, data: { total, active: activeUsers, customers, agents } });
  } catch (error) { next(error); }
};

export const getBookingAnalytics = async (req, res, next) => {
  try {
    requireTenantId();
    const status = await Booking.aggregate([{ $match: tenantFilter(req, active) }, { $group: { _id: "$status", count: { $sum: 1 } } }, { $sort: { count: -1 } }]);
    res.json({ success: true, data: { status } });
  } catch (error) { next(error); }
};

export const getRevenueAnalytics = async (req, res, next) => {
  try {
    requireTenantId();
    const monthly = await Payment.aggregate([{ $match: tenantFilter(req, { status: "completed" }) }, { $group: { _id: { year: { $year: { $ifNull: ["$paidAt", "$createdAt"] } }, month: { $month: { $ifNull: ["$paidAt", "$createdAt"] } } }, revenue: { $sum: completedAmount }, bookings: { $sum: 1 } } }, { $sort: { "_id.year": 1, "_id.month": 1 } }]);
    res.json({ success: true, data: { monthly } });
  } catch (error) { next(error); }
};
