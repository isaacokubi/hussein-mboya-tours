import Booking from "../models/Booking.js";
import Destination from "../models/Destination.js";
import Payment from "../models/Payment.js";
import Staff from "../models/Staff.js";
import Tour from "../models/Tour.js";
import User from "../models/User.js";
import Vehicle from "../models/Vehicle.js";
import Agent from "../models/Agent.js";
import { requireTenantId } from "../tenancy/context.js";

const active = { isDeleted: { $ne: true } };
const paymentNetAmount = {
  $max: [0, { $subtract: [{ $ifNull: ["$amount", 0] }, { $ifNull: ["$refundedAmount", 0] }] }],
};

const paidPaymentStatuses = ["paid", "completed", "success"];
const normalizeName = (value) => String(value ?? "").trim().replace(/\s+/g, " ");
const customerName = (customer, booking) => {
  const direct = normalizeName(customer?.name || booking?.customerSnapshot?.name);
  if (direct && !/^undefined( undefined)?$/i.test(direct) && !/^null( null)?$/i.test(direct)) return direct;
  const first = normalizeName(customer?.firstName || booking?.customerSnapshot?.firstName);
  const last = normalizeName(customer?.lastName || booking?.customerSnapshot?.lastName);
  const combined = `${first} ${last}`.trim();
  return combined || "Customer";
};

export const getDashboardMetrics = async (req, res) => {
  try {
    const tenantId = requireTenantId();
    const scoped = (query = {}) => ({ tenantId, ...query });

    const [
      users,
      customers,
      adminUsers,
      adminStaff,
      staff,
      guides,
      guideUsers,
      drivers,
      agents,
      approvedAgents,
      pendingAgents,
      vehicles,
      availableVehicles,
      assignedVehicles,
      maintenanceVehicles,
      tours,
      destinations,
      bookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      refundedBookings,
      payments,
      completedPayments,
      pendingPayments,
      failedPayments,
      revenueResult,
      bookingStatus,
      monthlyRevenue,
      recentBookingsRaw,
      popularTours,
    ] = await Promise.all([
      User.countDocuments(scoped({ ...active, status: { $ne: "blocked" } })),
      User.countDocuments(scoped({ ...active, role: "customer", status: { $ne: "blocked" } })),
      User.countDocuments(scoped({ ...active, role: { $in: ["admin", "administrator", "super_admin"] }, status: { $ne: "blocked" } })),
      Staff.countDocuments(scoped({ ...active, position: "admin", isActive: { $ne: false }, status: { $ne: "inactive" } })),
      Staff.countDocuments(scoped({ ...active, isActive: { $ne: false }, status: { $ne: "inactive" } })),
      Staff.countDocuments(scoped({ ...active, isActive: { $ne: false }, status: { $ne: "inactive" }, $or: [{ position: { $in: ["guide", "tour_guide", "tourguide"] } }, { role: { $in: ["guide", "tour_guide", "tourguide"] } }] })),
      User.countDocuments(scoped({ ...active, role: { $in: ["guide", "tour_guide", "tourguide"] }, status: { $ne: "blocked" } })),
      Staff.countDocuments(scoped({ ...active, isActive: { $ne: false }, status: { $ne: "inactive" }, $or: [{ position: { $in: ["driver", "chauffeur", "tour_driver", "tourdriver"] } }, { role: { $in: ["driver", "chauffeur", "tour_driver", "tourdriver"] } }] })),
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
      Payment.countDocuments(scoped({ ...active, status: { $in: ["completed", "paid", "success"] } })),
      Payment.countDocuments(scoped({ ...active, status: { $in: ["pending", "partial"] } })),
      Payment.countDocuments(scoped({ ...active, status: { $in: ["failed", "cancelled"] } })),
      Payment.aggregate([
        { $match: scoped({ ...active, status: { $in: ["completed", "paid", "success"] } }) },
        { $group: { _id: null, gross: { $sum: { $ifNull: ["$amount", 0] } }, refunds: { $sum: { $cond: [{ $eq: ["$refundStatus", "completed"] }, { $ifNull: ["$refundedAmount", 0] }, 0] } } } },
      ]),
      Booking.aggregate([
        { $match: scoped(active) },
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Payment.aggregate([
        { $match: scoped({ ...active, status: { $in: ["completed", "paid", "success"] } }) },
        { $group: { _id: { year: { $year: { $ifNull: ["$paidAt", "$createdAt"] } }, month: { $month: { $ifNull: ["$paidAt", "$createdAt"] } } }, amount: { $sum: paymentNetAmount } } },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
      Booking.find(scoped(active)).sort({ createdAt: -1 }).limit(5).populate("customer", "name firstName lastName email phone").populate("tour", "title").lean(),
      Booking.aggregate([
        { $match: { ...scoped(active), status: { $nin: ["cancelled", "refunded"] }, tour: { $ne: null } } },
        { $group: { _id: "$tour", totalBookings: { $sum: 1 }, paidBookings: { $sum: { $cond: [{ $in: [{ $toLower: { $ifNull: ["$paymentStatus", ""] } }, paidPaymentStatuses] }, 1, 0] } }, bookingValue: { $sum: { $ifNull: ["$totalAmount", 0] } } } },
        { $sort: { paidBookings: -1, totalBookings: -1, bookingValue: -1 } },
        { $limit: 5 },
        { $lookup: { from: "tours", localField: "_id", foreignField: "_id", as: "tour" } },
        { $unwind: "$tour" },
        { $match: { "tour.isDeleted": { $ne: true } } },
        { $project: { _id: 1, title: "$tour.title", totalBookings: 1, paidBookings: 1, bookingValue: 1 } },
      ]),
    ]);

    const gross = Number(revenueResult[0]?.gross || 0);
    const refunds = Number(revenueResult[0]?.refunds || 0);
    const revenue = Math.max(0, gross - refunds);
    const paymentStats = { completed: completedPayments, completedAmount: revenue, pending: pendingPayments, failed: failedPayments };
    const statusData = bookingStatus.map((item) => ({ status: String(item._id || "unknown").toLowerCase(), count: Number(item.count || 0) }));
    const normalizedRecentBookings = recentBookingsRaw.map((booking) => ({
      ...booking,
      customer: booking.customer ? { ...booking.customer, name: customerName(booking.customer, booking) } : { name: customerName(null, booking), email: booking.customerSnapshot?.email || booking.customerEmail || "", phone: booking.customerSnapshot?.phone || booking.customerPhone || "" },
      tour: booking.tour || { title: "Unavailable tour", deleted: true },
      amount: Number(booking.totalAmount ?? booking.amount ?? booking.subtotal ?? 0),
      paymentStatus: String(booking.paymentStatus || "pending").toLowerCase(),
    }));
    const formattedMonthlyRevenue = monthlyRevenue.map((item) => ({ month: `${item._id.month}/${item._id.year}`, amount: Number(item.amount || 0) }));

    return res.json({
      success: true,
      scope: { tenantId: String(tenantId), type: "tenant" },
      data: {
        users, customers, admins: Math.max(adminUsers, adminStaff), staff, guides: Math.max(guides, guideUsers), drivers,
        agents, approvedAgents, pendingAgents, vehicles, availableVehicles, assignedVehicles, maintenanceVehicles,
        tours, destinations, bookings, pendingBookings, confirmedBookings, completedBookings, cancelledBookings, refundedBookings,
        payments, completedPayments, pendingPayments, failedPayments, revenue, grossRevenue: gross, refundedRevenue: refunds,
        revenueCurrency: "KES", paymentStats, status: statusData, statusData, monthlyRevenue: formattedMonthlyRevenue,
        recentBookings: normalizedRecentBookings, popularTours,
        summary: { pendingBookings, confirmedBookings, completedBookings, cancelledBookings, refundedBookings },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Admin dashboard metrics error:", error);
    return res.status(error.status || 500).json({ success: false, message: error.message || "Unable to load dashboard metrics." });
  }
};

export const getUserAnalytics = async (req, res) => { try { requireTenantId(); const tenantId = requireTenantId(); const filter = { tenantId, ...active }; const [total, activeUsers, customers, agents] = await Promise.all([User.countDocuments(filter), User.countDocuments({ ...filter, isActive: { $ne: false } }), User.countDocuments({ ...filter, role: "customer" }), User.countDocuments({ ...filter, role: "agent" })]); return res.json({ success: true, data: { total, active: activeUsers, customers, agents } }); } catch (error) { return res.status(error.status || 500).json({ success: false, message: error.message }); } };
export const getBookingAnalytics = async (req, res) => { try { const tenantId = requireTenantId(); const status = await Booking.aggregate([{ $match: { tenantId, ...active } }, { $group: { _id: "$status", count: { $sum: 1 } } }, { $sort: { _id: 1 } }]); return res.json({ success: true, data: { status: status.map((x) => ({ status: String(x._id || "unknown").toLowerCase(), count: Number(x.count || 0) })) } }); } catch (error) { return res.status(error.status || 500).json({ success: false, message: error.message }); } };
export const getRevenueAnalytics = async (req, res) => { try { const tenantId = requireTenantId(); const monthly = await Payment.aggregate([{ $match: { tenantId, ...active, status: { $in: ["completed", "paid", "success"] } } }, { $group: { _id: { year: { $year: { $ifNull: ["$paidAt", "$createdAt"] } }, month: { $month: { $ifNull: ["$paidAt", "$createdAt"] } } }, revenue: { $sum: paymentNetAmount }, bookings: { $sum: 1 } } }, { $sort: { "_id.year": 1, "_id.month": 1 } }]); return res.json({ success: true, data: { monthly } }); } catch (error) { return res.status(error.status || 500).json({ success: false, message: error.message }); } };
