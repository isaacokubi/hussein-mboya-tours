/**
 * Purpose: admin Dashboard Tenant Controller HTTP controller. Main declarations: getDashboardStats, first, getUserAnalytics, getBookingAnalytics, getRevenueAnalytics.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { requireTenantId } from "../tenancy/context.js";
// Load ../tenancy/tenantQuery.js so this module can use its exported dependencies.
import { tenantFilter } from "../tenancy/tenantQuery.js";
// Load ../models/User.js so this module can use its exported dependencies.
import User from "../models/User.js";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ../models/Tour.js so this module can use its exported dependencies.
import Tour from "../models/Tour.js";
// Load ../models/Destination.js so this module can use its exported dependencies.
import Destination from "../models/Destination.js";
// Load ../models/Payment.js so this module can use its exported dependencies.
import Payment from "../models/Payment.js";
// Load ../services/financeReportingService.js so this module can use its exported dependencies.
import { getPostedRevenueReport } from "../services/financeReportingService.js";
// Load ../models/Staff.js so this module can use its exported dependencies.
import Staff from "../models/Staff.js";
// Load ../models/Vehicle.js so this module can use its exported dependencies.
import Vehicle from "../models/Vehicle.js";
// Load ../models/Agent.js so this module can use its exported dependencies.
import Agent from "../models/Agent.js";

// Declare active for use by the surrounding module or function.
const active = { isDeleted: { $ne: true } };
// Declare paidPaymentStatuses for use by the surrounding module or function.
const paidPaymentStatuses = ["paid", "completed", "success"];

// Declare getDashboardStats for use by the surrounding module or function.
export const getDashboardStats = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare usersFilter for use by the surrounding module or function.
    const usersFilter = tenantFilter(req, active);
    // Declare bookingsFilter for use by the surrounding module or function.
    const bookingsFilter = tenantFilter(req, active);
    // Declare toursFilter for use by the surrounding module or function.
    const toursFilter = tenantFilter(req, active);
    // Declare destinationsFilter for use by the surrounding module or function.
    const destinationsFilter = tenantFilter(req, { isDeleted: { $ne: true }, active: { $ne: false } });
    // Declare staffFilter for use by the surrounding module or function.
    const staffFilter = tenantFilter(req, { isDeleted: { $ne: true } });
    // Declare vehicleFilter for use by the surrounding module or function.
    const vehicleFilter = tenantFilter(req, { isDeleted: { $ne: true } });
    // Declare agentFilter for use by the surrounding module or function.
    const agentFilter = tenantFilter(req, { status: { $ne: "deleted" } });

    // Declare [users, bookings, tours, destinations, customers, revenueReport, bookingStatus, paymentStatus, pending, confirmed, completed, cancelled, recentBookings, popularTours, admins, staff, guides, drivers, agents, approvedAgents, vehicles, availableVehicles] for use by the surrounding module or function.
    const [users, bookings, tours, destinations, customers, revenueReport, bookingStatus, paymentStatus, pending, confirmed, completed, cancelled, recentBookings, popularTours, admins, staff, guides, drivers, agents, approvedAgents, vehicles, availableVehicles] = await Promise.all([
      User.countDocuments(usersFilter), Booking.countDocuments(bookingsFilter), Tour.countDocuments(toursFilter), Destination.countDocuments(destinationsFilter),
      User.countDocuments(tenantFilter(req, { ...active, $or: [{ role: "customer" }, { legacyRole: "customer" }] })),
      
      getPostedRevenueReport(),
      Booking.aggregate([{ $match: bookingsFilter }, { $group: { _id: "$status", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Booking.aggregate([{ $match: bookingsFilter }, { $group: { _id: "$paymentStatus", count: { $sum: 1 } } }]),
      Booking.countDocuments(tenantFilter(req, { ...active, status: "pending" })), Booking.countDocuments(tenantFilter(req, { ...active, status: "confirmed" })),
      Booking.countDocuments(tenantFilter(req, { ...active, status: "completed" })), Booking.countDocuments(tenantFilter(req, { ...active, status: "cancelled" })),
      Booking.find(bookingsFilter).sort({ createdAt: -1 }).limit(5).populate("customer", "name firstName lastName email phone").populate("user", "name firstName lastName email phone").populate("tour", "title").populate("customTourRequest", "destination").lean(),
      Booking.aggregate([
        { $match: { ...bookingsFilter, status: { $nin: ["cancelled", "refunded"] }, tour: { $ne: null } } },
        { $group: { _id: "$tour", totalBookings: { $sum: 1 }, paidBookings: { $sum: { $cond: [{ $in: [{ $toLower: { $ifNull: ["$paymentStatus", ""] } }, paidPaymentStatuses] }, 1, 0] } }, bookingValue: { $sum: { $ifNull: ["$totalAmount", 0] } } } },
        { $sort: { paidBookings: -1, totalBookings: -1, bookingValue: -1 } }, { $limit: 5 },
        { $lookup: { from: "tours", localField: "_id", foreignField: "_id", as: "tour" } }, { $unwind: "$tour" },
        { $project: { _id: 1, title: "$tour.title", totalBookings: 1, paidBookings: 1, bookingValue: 1 } },
      ]),
      User.countDocuments(tenantFilter(req, { ...active, role: { $in: ["admin", "super_admin", "superadmin", "administrator"] } })), Staff.countDocuments(staffFilter),
      Staff.countDocuments(tenantFilter(req, { ...staffFilter, position: "guide" })), Staff.countDocuments(tenantFilter(req, { ...staffFilter, position: "driver" })),
      Agent.countDocuments(agentFilter), Agent.countDocuments(tenantFilter(req, { ...agentFilter, isApproved: true })), Vehicle.countDocuments(vehicleFilter),
      Vehicle.countDocuments(tenantFilter(req, { ...vehicleFilter, status: "available", isActive: true })),
    ]);

    // Declare payments for use by the surrounding module or function.
    const payments = {
      completed: paymentStatus.filter((x) => paidPaymentStatuses.includes(String(x._id || "").toLowerCase())).reduce((n, x) => n + x.count, 0),
      pending: paymentStatus.filter((x) => ["pending", "partial"].includes(String(x._id || "").toLowerCase())).reduce((n, x) => n + x.count, 0),
      failed: paymentStatus.filter((x) => ["failed", "cancelled"].includes(String(x._id || "").toLowerCase())).reduce((n, x) => n + x.count, 0),
    };
    // Declare normalizedBookings for use by the surrounding module or function.
    const normalizedBookings = recentBookings.map((booking) => {
      // Declare customer for use by the surrounding module or function.
      const customer = booking.customer || {};
      // Declare user for use by the surrounding module or function.
      const user = booking.user || {};
      // Declare snapshot for use by the surrounding module or function.
      const snapshot = booking.customerSnapshot || {};
      // Declare contact for use by the surrounding module or function.
      const contact = booking.contact || {};
      // Declare first for use by the surrounding module or function.
      const first = (...values) => values.map((value) => String(value ?? "").trim().replace(/\s+/g, " ")).find((value) => value && !/^(?:undefined(?:\s+undefined)?|null(?:\s+null)?)$/i.test(value)) || "";
      // Declare customerName for use by the surrounding module or function.
      const customerName = first(customer.name, [customer.firstName, customer.lastName].filter(Boolean).join(" "), snapshot.name, [snapshot.firstName, snapshot.lastName].filter(Boolean).join(" "), contact.name, user.name, customer.email, snapshot.email, contact.email, user.email, customer.phone, snapshot.phone, contact.phone, user.phone) || "Customer record unavailable";
      // Declare normalizedCustomer for use by the surrounding module or function.
      const normalizedCustomer = { ...customer, name: customerName, email: first(customer.email, snapshot.email, contact.email, user.email), phone: first(customer.phone, snapshot.phone, contact.phone, user.phone) };
      // Declare tour for use by the surrounding module or function.
      const tour = booking.tour || (booking.customTourRequest?.destination ? { title: `Custom tour — ${booking.customTourRequest.destination}`, custom: true } : { title: "Tour record unavailable" });
      // Return the object assembled below to the caller.
      return { ...booking, customer: normalizedCustomer, tour, amount: Number(booking.totalAmount ?? booking.amount ?? booking.subtotal ?? 0), paymentStatus: booking.paymentStatus || "pending" };
    });
    // Declare monthlyRevenue for use by the surrounding module or function.
    const monthlyRevenue = revenueReport.monthly;

    // Return the result of res.json() to the caller.
    return res.json({ success: true, data: { users, customers, admins, staff, guides, drivers, agents, approvedAgents, vehicles, availableVehicles, tours, destinations, bookings, revenue: Number(revenueReport.total || 0), recentBookings: normalizedBookings, popularTours, paymentStats: payments, monthlyRevenue: monthlyRevenue.map((x) => ({ month: `${x._id.month}/${x._id.year}`, amount: Number(x.revenue || 0) })), status: bookingStatus, summary: { pendingBookings: pending, confirmedBookings: confirmed, completedBookings: completed, cancelledBookings: cancelled } } });
  } catch (error) { console.error("Admin dashboard error:", error); next(error); }
};

// Declare getUserAnalytics for use by the surrounding module or function.
export const getUserAnalytics = async (req, res, next) => { try { requireTenantId(); const filter = tenantFilter(req, active); const [total, activeUsers, customers, agents] = await Promise.all([User.countDocuments(filter), User.countDocuments(tenantFilter(req, { ...active, isActive: { $ne: false } })), User.countDocuments(tenantFilter(req, { ...active, role: "customer" })), User.countDocuments(tenantFilter(req, { ...active, role: "agent" }))]); res.json({ success: true, data: { total, active: activeUsers, customers, agents } }); } catch (error) { next(error); } };
// Declare getBookingAnalytics for use by the surrounding module or function.
export const getBookingAnalytics = async (req, res, next) => { try { requireTenantId(); const status = await Booking.aggregate([{ $match: tenantFilter(req, active) }, { $group: { _id: "$status", count: { $sum: 1 } } }, { $sort: { count: -1 } }]); res.json({ success: true, data: { status } }); } catch (error) { next(error); } };
// Declare getRevenueAnalytics for use by the surrounding module or function.
export const getRevenueAnalytics = async (req, res, next) => { try { requireTenantId(); const report = await getPostedRevenueReport(); res.json({ success: true, data: { monthly: report.monthly, revenueBasis: "posted_journals" } }); } catch (error) { next(error); } };
