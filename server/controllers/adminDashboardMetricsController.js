/**
 * Purpose: admin Dashboard Metrics Controller HTTP controller. Main declarations: clean, good, customerName, getDashboardMetrics, scoped.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { publicErrorMessage } from "../utils/publicError.js";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ../models/Destination.js so this module can use its exported dependencies.
import Destination from "../models/Destination.js";
// Load ../models/Payment.js so this module can use its exported dependencies.
import Payment from "../models/Payment.js";
// Load ../models/Review.js so this module can use its exported dependencies.
import Review from "../models/Review.js";
// Load ../models/Staff.js so this module can use its exported dependencies.
import Staff from "../models/Staff.js";
// Load ../models/Tour.js so this module can use its exported dependencies.
import Tour from "../models/Tour.js";
// Load ../models/User.js so this module can use its exported dependencies.
import User from "../models/User.js";
// Load ../models/Vehicle.js so this module can use its exported dependencies.
import Vehicle from "../models/Vehicle.js";
// Load ../models/Agent.js so this module can use its exported dependencies.
import Agent from "../models/Agent.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { requireTenantId } from "../tenancy/context.js";
// Load ../services/bookingRevenueService.js so this module can use its exported dependencies.
import { getBookingRevenueMetrics } from "../services/bookingRevenueService.js";
// Load ../services/financeReportingService.js so this module can use its exported dependencies.
import { getPostedRevenueReport } from "../services/financeReportingService.js";

// Declare active for use by the surrounding module or function.
const active = { isDeleted: { $ne: true } };
// Declare paidStatuses for use by the surrounding module or function.
const paidStatuses = ["paid", "completed", "success"];
// Declare customerUserFilter for use by the surrounding module or function.
const customerUserFilter = { $or: [{ role: "customer" }, { legacyRole: "customer" }] };
// Declare clean for use by the surrounding module or function.
const clean = (v) => String(v ?? "").trim().replace(/\s+/g, " ");
// Declare good for use by the surrounding module or function.
const good = (v) => { const s = clean(v); return s && !/^undefined(?: undefined)?$/i.test(s) && !/^null(?: null)?$/i.test(s) ? s : ""; };
// Declare customerName for use by the surrounding module or function.
const customerName = (customer, user, booking) => good(customer?.name) || `${good(customer?.firstName) || good(user?.firstName) || good(booking?.customerSnapshot?.firstName)} ${good(customer?.lastName) || good(user?.lastName) || good(booking?.customerSnapshot?.lastName)}`.trim() || good(user?.name) || good(booking?.customerSnapshot?.name) || good(booking?.contact?.name) || "Customer";

// Declare getDashboardMetrics for use by the surrounding module or function.
export const getDashboardMetrics = async (req, res) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = requireTenantId();
    // Declare scoped for use by the surrounding module or function.
    const scoped = (q = {}) => ({ tenantId, ...q });
    // Declare [users, customers, staff, guides, drivers, agents, approvedAgents, pendingAgents, vehicles, availableVehicles, assignedVehicles, maintenanceVehicles, tours, destinations, bookings, pendingBookings, confirmedBookings, completedBookings, cancelledBookings, refundedBookings, payments, completedPayments, pendingPayments, failedPayments, revenueResult, bookingStatus, monthlyRevenue, recentBookingsRaw, popularTours, averageBookingResult, customerRatingResult] for use by the surrounding module or function.
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

    // Declare revenue for use by the surrounding module or function.
    const revenue = Number(revenueResult?.revenue || 0);
    // Declare gross for use by the surrounding module or function.
    const gross = revenue;
    // Declare refunds for use by the surrounding module or function.
    const refunds = 0;
    // Declare statusData for use by the surrounding module or function.
    const statusData = bookingStatus.map((x) => ({ status: clean(x._id).toLowerCase() || "unknown", count: Number(x.count || 0) }));
    // Declare recentBookings for use by the surrounding module or function.
    const recentBookings = recentBookingsRaw.map((b) => ({ ...b, customer: { ...(b.customer || {}), name: customerName(b.customer, b.user, b), email: b.customer?.email || b.user?.email || b.customerSnapshot?.email || b.contact?.email || "", phone: b.customer?.phone || b.user?.phone || b.customerSnapshot?.phone || b.contact?.phone || "" }, tour: b.tour || { title: b.customTourRequest ? "Custom tour request" : "Tour unavailable" }, amount: Number(b.totalAmount ?? b.amount ?? b.subtotal ?? 0), paymentStatus: clean(b.paymentStatus).toLowerCase() || "pending" }));
    // Declare monthly for use by the surrounding module or function.
    const monthly = monthlyRevenue.monthly.map((x) => ({ month: `${x._id.month}/${x._id.year}`, amount: Number(x.revenue || 0) }));
    // Declare paymentStats for use by the surrounding module or function.
    const paymentStats = { completed: completedPayments, completedAmount: revenue, pending: pendingPayments, failed: failedPayments };
    // Declare conversionRate for use by the surrounding module or function.
    const conversionRate = bookings > 0 ? Number((((confirmedBookings + completedBookings) / bookings) * 100).toFixed(1)) : 0;
    // Declare averageBookingValue for use by the surrounding module or function.
    const averageBookingValue = averageBookingResult[0]?.average != null ? Number(averageBookingResult[0].average) : 0;
    // Declare customerRating for use by the surrounding module or function.
    const customerRating = customerRatingResult[0]?.average != null ? Number(customerRatingResult[0].average.toFixed(1)) : 0;
    // Declare topTour for use by the surrounding module or function.
    const topTour = popularTours[0] || null;

    // Return the result of res.json() to the caller.
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
    // Perform the side effect or state update expressed on the following line.
    console.error("Admin dashboard metrics error:", error);
    // Return the result of res.status(error.status || 500).json() to the caller.
    return res.status(error.status || 500).json({ success: false, message: publicErrorMessage(error, "Unable to load dashboard metrics.") });
  }
};

// Declare getUserAnalytics for use by the surrounding module or function.
export const getUserAnalytics = async (req, res) => { try { const tenantId = requireTenantId(); const filter = { tenantId, ...active }; const [total, activeUsers, customers, agents] = await Promise.all([User.countDocuments(filter), User.countDocuments({ ...filter, status: { $ne: "blocked" } }), User.countDocuments({ tenantId, ...active, ...customerUserFilter }), Agent.countDocuments({ tenantId, ...active, status: { $ne: "inactive" } })]); return res.json({ success: true, data: { total, active: activeUsers, customers, agents } }); } catch (error) { return res.status(error.status || 500).json({ success: false, message: publicErrorMessage(error) }); } };
// Declare getBookingAnalytics for use by the surrounding module or function.
export const getBookingAnalytics = async (req, res) => { try { const tenantId = requireTenantId(); const status = await Booking.aggregate([{ $match: { tenantId, ...active } }, { $group: { _id: "$status", count: { $sum: 1 } } }]); return res.json({ success: true, data: { status: status.map((x) => ({ status: clean(x._id).toLowerCase(), count: Number(x.count || 0) })) } }); } catch (error) { return res.status(error.status || 500).json({ success: false, message: publicErrorMessage(error) }); } };
// Declare getRevenueAnalytics for use by the surrounding module or function.
export const getRevenueAnalytics = async (req, res) => { try { requireTenantId(); const report = await getPostedRevenueReport(); return res.json({ success: true, data: { monthly: report.monthly, revenueBasis: "posted_journals" } }); } catch (error) { return res.status(error.status || 500).json({ success: false, message: publicErrorMessage(error) }); } };
