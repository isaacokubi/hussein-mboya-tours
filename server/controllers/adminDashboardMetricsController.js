import Booking from "../models/Booking.js";
import Destination from "../models/Destination.js";
import Payment from "../models/Payment.js";
import Review from "../models/Review.js";
import Staff from "../models/Staff.js";
import Tour from "../models/Tour.js";
import User from "../models/User.js";
import Vehicle from "../models/Vehicle.js";
import Agent from "../models/Agent.js";
import { requireTenantId } from "../tenancy/context.js";
import { getBookingRevenueMetrics } from "../services/bookingRevenueService.js";
import { getPostedRevenueReport } from "../services/financeReportingService.js";

const active = { isDeleted: { $ne: true } };
const paidStatuses = ["paid", "completed", "success"];
const customerUserFilter = { $or: [{ role: "customer" }, { legacyRole: "customer" }] };
const clean = (v) => String(v ?? "").trim().replace(/\s+/g, " ");
const good = (v) => { const s = clean(v); return s && !/^undefined(?: undefined)?$/i.test(s) && !/^null(?: null)?$/i.test(s) ? s : ""; };
const customerName = (customer, user, booking) => good(customer?.name) || `${good(customer?.firstName) || good(user?.firstName) || good(booking?.customerSnapshot?.firstName)} ${good(customer?.lastName) || good(user?.lastName) || good(booking?.customerSnapshot?.lastName)}`.trim() || good(user?.name) || good(booking?.customerSnapshot?.name) || good(booking?.contact?.name) || "Customer";

export const getDashboardMetrics = async (req, res) => {
  try {
    const tenantId = requireTenantId();
    const scoped = (q = {}) => ({ tenantId, ...q });
    const [users, customers, staff, guides, drivers, agents, approvedAgents, pendingAgents, vehicles, availableVehicles, assignedVehicles, maintenanceVehicles, tours, destinations, bookings, pendingBookings, confirmedBookings, completedBookings, cancelledBookings, refundedBookings, payments, completedPayments, pendingPayments, failedPayments, revenueResult, bookingStatus, monthlyRevenue, recentBookingsRaw, popularTours, averageBookingResult, customerRatingResult] = await Promise.all([
      User.countDocuments(scoped({ ...active, status: { $ne: "blocked" } })),
      User.countDocuments(scoped({ ...active, ...customerUserFilter, status: { $ne: "blocked" } })),
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
      Tour.countDocuments(scoped(active)),
      Destination.countDocuments(scoped(active)),
      Booking.countDocuments(scoped(active)),
      Booking.countDocuments(scoped({ ...active, status: "pending" })),
      Booking.countDocuments(scoped({ ...active, status: "confirmed" })),
      Booking.countDocuments(scoped({ ...active, status: "completed" })),
      Booking.countDocuments(scoped({ ...active, status: "cancelled" })),
      Booking.countDocuments(scoped({ ...active, status: "refunded" })),
      Payment.countDocuments(scoped(active)),
      Payment.countDocuments(scoped({ ...active, status: { $in: paidStatuses } })),
      Payment.countDocuments(scoped({ ...active, status: { $in: ["pending", "processing", "partial"] } })),
      Payment.countDocuments(scoped({ ...active, status: { $in: ["failed", "cancelled"] } })),
      getBookingRevenueMetrics(req),
      Booking.aggregate([{ $match: scoped(active) }, { $group: { _id: "$status", count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
      getPostedRevenueReport(),
      Booking.find(scoped(active)).sort({ createdAt: -1 }).limit(5).populate("customer", "name firstName lastName email phone").populate("user", "name firstName lastName email phone").populate("tour", "title").lean(),
      Booking.aggregate([{ $match: scoped({ ...active, paymentStatus: { $in: paidStatuses }, status: { $nin: ["cancelled", "refunded"] }, tour: { $ne: null } }) }, { $group: { _id: "$tour", totalBookings: { $sum: 1 }, confirmedPaidBookings: { $sum: 1 }, revenue: { $sum: { $max: [0, { $subtract: [{ $ifNull: ["$totalAmount", 0] }, { $ifNull: ["$refundAmount", 0] }] }] } } } }, { $sort: { confirmedPaidBookings: -1, revenue: -1 } }, { $limit: 5 }, { $lookup: { from: "tours", localField: "_id", foreignField: "_id", as: "tour" } }, { $unwind: "$tour" }, { $match: { "tour.isDeleted": { $ne: true } } }, { $project: { _id: 1, title: "$tour.title", totalBookings: 1, confirmedPaidBookings: 1, revenue: 1 } }]),
      Booking.aggregate([{ $match: scoped(active) }, { $group: { _id: null, average: { $avg: { $ifNull: ["$totalAmount", 0] } } } }]),
      Review.aggregate([{ $match: scoped(active) }, { $group: { _id: null, average: { $avg: "$rating" }, count: { $sum: 1 } } }])
    ]);

    const revenue = Number(revenueResult?.revenue || 0);
    const gross = revenue;
    const refunds = 0;
    const statusData = bookingStatus.map((x) => ({ status: clean(x._id).toLowerCase() || "unknown", count: Number(x.count || 0) }));
    const recentBookings = recentBookingsRaw.map((b) => ({ ...b, customer: { ...(b.customer || {}), name: customerName(b.customer, b.user, b), email: b.customer?.email || b.user?.email || b.customerSnapshot?.email || b.contact?.email || "", phone: b.customer?.phone || b.user?.phone || b.customerSnapshot?.phone || b.contact?.phone || "" }, tour: b.tour || { title: b.customTourRequest ? "Custom tour request" : "Tour unavailable" }, amount: Number(b.totalAmount ?? b.amount ?? b.subtotal ?? 0), paymentStatus: clean(b.paymentStatus).toLowerCase() || "pending" }));
    const monthly = monthlyRevenue.monthly.map((x) => ({ month: `${x._id.month}/${x._id.year}`, amount: Number(x.revenue || 0) }));
    const paymentStats = { completed: completedPayments, completedAmount: revenue, pending: pendingPayments, failed: failedPayments };
    const conversionRate = bookings > 0 ? Number((((confirmedBookings + completedBookings) / bookings) * 100).toFixed(1)) : 0;
    const averageBookingValue = averageBookingResult[0]?.average != null ? Number(averageBookingResult[0].average) : 0;
    const customerRating = customerRatingResult[0]?.average != null ? Number(customerRatingResult[0].average.toFixed(1)) : 0;
    const topTour = popularTours[0] || null;

    return res.json({
      success: true,
      scope: { tenantId: String(tenantId), type: "tenant" },
      data: {
        users, customers, staff, guides, drivers, agents, approvedAgents, pendingAgents,
        vehicles, availableVehicles, assignedVehicles, maintenanceVehicles,
        tours, destinations, bookings, pendingBookings, confirmedBookings, completedBookings, cancelledBookings, refundedBookings,
        payments, completedPayments, pendingPayments, failedPayments,
        revenue, grossRevenue: gross, refundedRevenue: refunds, revenueCurrency: "KES", revenueBasis: "posted_journals", paymentStats,
        conversionRate, averageBookingValue, customerRating,
        topTour: topTour?.title || null,
        popularTours,
        status: statusData, statusData, monthlyRevenue: monthly, recentBookings,
        summary: { bookings, pendingBookings, confirmedBookings, completedBookings, cancelledBookings, refundedBookings }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Admin dashboard metrics error:", error);
    return res.status(error.status || 500).json({ success: false, message: error.message || "Unable to load dashboard metrics." });
  }
};

export const getUserAnalytics = async (req, res) => { try { const tenantId = requireTenantId(); const filter = { tenantId, ...active }; const [total, activeUsers, customers, agents] = await Promise.all([User.countDocuments(filter), User.countDocuments({ ...filter, status: { $ne: "blocked" } }), User.countDocuments({ tenantId, ...active, ...customerUserFilter }), Agent.countDocuments({ tenantId, ...active, status: { $ne: "inactive" } })]); return res.json({ success: true, data: { total, active: activeUsers, customers, agents } }); } catch (error) { return res.status(error.status || 500).json({ success: false, message: error.message }); } };
export const getBookingAnalytics = async (req, res) => { try { const tenantId = requireTenantId(); const status = await Booking.aggregate([{ $match: { tenantId, ...active } }, { $group: { _id: "$status", count: { $sum: 1 } } }]); return res.json({ success: true, data: { status: status.map((x) => ({ status: clean(x._id).toLowerCase(), count: Number(x.count || 0) })) } }); } catch (error) { return res.status(error.status || 500).json({ success: false, message: error.message }); } };
export const getRevenueAnalytics = async (req, res) => { try { requireTenantId(); const report = await getPostedRevenueReport(); return res.json({ success: true, data: { monthly: report.monthly, revenueBasis: "posted_journals" } }); } catch (error) { return res.status(error.status || 500).json({ success: false, message: error.message }); } };
