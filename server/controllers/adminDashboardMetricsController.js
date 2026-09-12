import Booking from "../models/Booking.js";
import Customer from "../models/Customer.js";
import Destination from "../models/Destination.js";
import Payment from "../models/Payment.js";
import Staff from "../models/Staff.js";
import Tour from "../models/Tour.js";
import User from "../models/User.js";
import Vehicle from "../models/Vehicle.js";
import Agent from "../models/Agent.js";
import { requireTenantId } from "../tenancy/context.js";

const active = { isDeleted: { $ne: true } };
const paidStatuses = ["paid", "completed", "success"];
const clean = (v) => String(v ?? "").trim().replace(/\s+/g, " ");
const good = (v) => { const s = clean(v); return s && !/^undefined(?: undefined)?$/i.test(s) && !/^null(?: null)?$/i.test(s) ? s : ""; };
const customerName = (customer, user, booking) => good(customer?.name) || `${good(customer?.firstName) || good(user?.firstName) || good(booking?.customerSnapshot?.firstName)} ${good(customer?.lastName) || good(user?.lastName) || good(booking?.customerSnapshot?.lastName)}`.trim() || good(user?.name) || good(booking?.customerSnapshot?.name) || good(booking?.contact?.name) || "Customer";
const netAmount = { $max: [0, { $subtract: [{ $ifNull: ["$amount", 0] }, { $ifNull: ["$refundedAmount", 0] }] }] };

export const getDashboardMetrics = async (req, res) => {
  try {
    const tenantId = requireTenantId();
    const scoped = (q = {}) => ({ tenantId, ...q });
    const [users, customers, staff, guides, drivers, agents, approvedAgents, pendingAgents, vehicles, availableVehicles, assignedVehicles, maintenanceVehicles, tours, destinations, bookings, pendingBookings, confirmedBookings, completedBookings, cancelledBookings, refundedBookings, payments, completedPayments, pendingPayments, failedPayments, revenueResult, bookingStatus, monthlyRevenue, recentBookingsRaw, popularTours] = await Promise.all([
      User.countDocuments(scoped({ ...active, status: { $ne: "blocked" } })),
      Customer.countDocuments(scoped({ ...active, status: { $ne: "blocked" } })),
      Staff.countDocuments(scoped({ ...active, isActive: { $ne: false }, status: { $nin: ["inactive", "suspended"] } })),
      Staff.countDocuments(scoped({ ...active, isActive: { $ne: false }, status: { $nin: ["inactive", "suspended"] }, $or: [{ position: "guide" }, { role: "guide" }] })),
      Staff.countDocuments(scoped({ ...active, isActive: { $ne: false }, status: { $nin: ["inactive", "suspended"] }, $or: [{ position: "driver" }, { role: "driver" }] })),
      Agent.countDocuments(scoped({ isDeleted: { $ne: true }, status: { $ne: "inactive" } })),
      Agent.countDocuments(scoped({ isDeleted: { $ne: true }, status: { $ne: "inactive" }, $or: [{ isApproved: true }, { status: "approved" }] })),
      Agent.countDocuments(scoped({ isDeleted: { $ne: true }, status: { $nin: ["inactive", "approved"] }, isApproved: { $ne: true } })),
      Vehicle.countDocuments(scoped({ ...active, isActive: { $ne: false } })),
      Vehicle.countDocuments(scoped({ ...active, isActive: { $ne: false }, status: "available" })),
      Vehicle.countDocuments(scoped({ ...active, isActive: { $ne: false }, status: "assigned" })),
      Vehicle.countDocuments(scoped({ ...active, isActive: { $ne: false }, status: "maintenance" })),
      Tour.countDocuments(scoped(active)), Destination.countDocuments(scoped(active)), Booking.countDocuments(scoped(active)),
      Booking.countDocuments(scoped({ ...active, status: "pending" })), Booking.countDocuments(scoped({ ...active, status: "confirmed" })), Booking.countDocuments(scoped({ ...active, status: "completed" })), Booking.countDocuments(scoped({ ...active, status: "cancelled" })), Booking.countDocuments(scoped({ ...active, status: "refunded" })),
      Payment.countDocuments(scoped(active)), Payment.countDocuments(scoped({ ...active, status: { $in: paidStatuses } })), Payment.countDocuments(scoped({ ...active, status: { $in: ["pending", "partial"] } })), Payment.countDocuments(scoped({ ...active, status: { $in: ["failed", "cancelled"] } })),
      Payment.aggregate([{ $match: scoped({ ...active, status: { $in: paidStatuses } }) }, { $group: { _id: null, gross: { $sum: { $ifNull: ["$amount", 0] } }, refunds: { $sum: { $cond: [{ $eq: ["$refundStatus", "completed"] }, { $ifNull: ["$refundedAmount", 0] }, 0] } } } }]),
      Booking.aggregate([{ $match: scoped(active) }, { $group: { _id: "$status", count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
      Payment.aggregate([{ $match: scoped({ ...active, status: { $in: paidStatuses } }) }, { $group: { _id: { year: { $year: { $ifNull: ["$paidAt", "$createdAt"] } }, month: { $month: { $ifNull: ["$paidAt", "$createdAt"] } } }, amount: { $sum: netAmount } } }, { $sort: { "_id.year": 1, "_id.month": 1 } }]),
      Booking.find(scoped(active)).sort({ createdAt: -1 }).limit(5).populate("customer", "name firstName lastName email phone").populate("user", "name firstName lastName email phone").populate("tour", "title").lean(),
      Booking.aggregate([{ $match: scoped({ ...active, status: { $nin: ["cancelled", "refunded"] }, tour: { $ne: null } }) }, { $group: { _id: "$tour", totalBookings: { $sum: 1 }, paidBookings: { $sum: { $cond: [{ $in: [{ $toLower: { $ifNull: ["$paymentStatus", ""] } }, paidStatuses] }, 1, 0] } }, bookingValue: { $sum: { $ifNull: ["$totalAmount", 0] } } } }, { $sort: { paidBookings: -1, totalBookings: -1, bookingValue: -1 } }, { $limit: 5 }, { $lookup: { from: "tours", localField: "_id", foreignField: "_id", as: "tour" } }, { $unwind: "$tour" }, { $match: { "tour.isDeleted": { $ne: true } } }, { $project: { _id: 1, title: "$tour.title", totalBookings: 1, paidBookings: 1, bookingValue: 1 } }]),
    ]);
    const gross = Number(revenueResult[0]?.gross || 0), refunds = Number(revenueResult[0]?.refunds || 0), revenue = Math.max(0, gross - refunds);
    const statusData = bookingStatus.map((x) => ({ status: clean(x._id).toLowerCase() || "unknown", count: Number(x.count || 0) }));
    const recentBookings = recentBookingsRaw.map((b) => ({ ...b, customer: { ...(b.customer || {}), name: customerName(b.customer, b.user, b), email: b.customer?.email || b.user?.email || b.customerSnapshot?.email || b.contact?.email || "", phone: b.customer?.phone || b.user?.phone || b.customerSnapshot?.phone || b.contact?.phone || "" }, tour: b.tour || { title: b.customTourRequest ? "Custom tour request" : "Tour unavailable" }, amount: Number(b.totalAmount ?? b.amount ?? b.subtotal ?? 0), paymentStatus: clean(b.paymentStatus).toLowerCase() || "pending" }));
    const monthly = monthlyRevenue.map((x) => ({ month: `${x._id.month}/${x._id.year}`, amount: Number(x.amount || 0) }));
    const paymentStats = { completed: completedPayments, completedAmount: revenue, pending: pendingPayments, failed: failedPayments };
    return res.json({ success: true, scope: { tenantId: String(tenantId), type: "tenant" }, data: { users, customers, staff, guides, drivers, agents, approvedAgents, pendingAgents, vehicles, availableVehicles, assignedVehicles, maintenanceVehicles, tours, destinations, bookings, pendingBookings, confirmedBookings, completedBookings, cancelledBookings, refundedBookings, payments, completedPayments, pendingPayments, failedPayments, revenue, grossRevenue: gross, refundedRevenue: refunds, revenueCurrency: "KES", paymentStats, status: statusData, statusData, monthlyRevenue: monthly, recentBookings, popularTours, summary: { bookings, pendingBookings, confirmedBookings, completedBookings, cancelledBookings, refundedBookings } }, timestamp: new Date().toISOString() });
  } catch (error) { console.error("Admin dashboard metrics error:", error); return res.status(error.status || 500).json({ success: false, message: error.message || "Unable to load dashboard metrics." }); }
};

export const getUserAnalytics = async (req, res) => { try { const tenantId = requireTenantId(); const filter = { tenantId, ...active }; const [total, activeUsers, customers, agents] = await Promise.all([User.countDocuments(filter), User.countDocuments({ ...filter, isActive: { $ne: false } }), Customer.countDocuments(filter), Agent.countDocuments({ ...filter, status: { $ne: "inactive" } })]); return res.json({ success: true, data: { total, active: activeUsers, customers, agents } }); } catch (error) { return res.status(error.status || 500).json({ success: false, message: error.message }); } };
export const getBookingAnalytics = async (req, res) => { try { const tenantId = requireTenantId(); const status = await Booking.aggregate([{ $match: { tenantId, ...active } }, { $group: { _id: "$status", count: { $sum: 1 } } }]); return res.json({ success: true, data: { status: status.map((x) => ({ status: clean(x._id).toLowerCase(), count: Number(x.count || 0) })) } }); } catch (error) { return res.status(error.status || 500).json({ success: false, message: error.message }); } };
export const getRevenueAnalytics = async (req, res) => { try { const tenantId = requireTenantId(); const monthly = await Payment.aggregate([{ $match: { tenantId, ...active, status: { $in: paidStatuses } } }, { $group: { _id: { year: { $year: { $ifNull: ["$paidAt", "$createdAt"] } }, month: { $month: { $ifNull: ["$paidAt", "$createdAt"] } } }, revenue: { $sum: netAmount }, bookings: { $sum: 1 } } }]); return res.json({ success: true, data: { monthly } }); } catch (error) { return res.status(error.status || 500).json({ success: false, message: error.message }); } };
