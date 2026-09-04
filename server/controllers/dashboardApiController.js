import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import Booking from "../models/Booking.js";
import Commission from "../models/Commission.js";
import Agent from "../models/Agent.js";
import User from "../models/User.js";

const ACTIVE_BOOKING_STATUSES = ["confirmed", "assigned", "ongoing", "completed"];

export const getAgentDashboard = async (req, res, next) => {
  requireTenantId();
  try {
    const tenantId = requireTenantId();
    const agent = await Agent.findOne(
      mergeTenantFilter(req, { user: req.user._id })
    ).lean();

    if (!agent) return res.status(404).json({ success: false, message: "Agent profile not found." });

    const agentBookingFilter = mergeTenantFilter(req, { agent: agent._id, isDeleted: { $ne: true } });
    const commissionFilter = mergeTenantFilter(req, { agent: agent._id });
    const customerFilter = mergeTenantFilter(req, { role: "customer", status: { $ne: "deleted" } });

    const [allAgentBookings, totalCustomers, totalCommissionResult, pendingCommissionResult, paidCommissionResult, recentBookings] = await Promise.all([
      Booking.find(agentBookingFilter)
        .select("status bookingStatus paymentStatus totalAmount amount numberOfGuests guests numberOfPeople travelDate createdAt customer user tour")
        .lean(),
      Booking.countDocuments(mergeTenantFilter(req, { agent: agent._id, isDeleted: { $ne: true }, status: { $nin: ["cancelled", "refunded"] } })),
      Commission.aggregate([{ $match: commissionFilter }, { $group: { _id: null, total: { $sum: { $ifNull: ["$amount", 0] } } } }]),
      Commission.aggregate([{ $match: mergeTenantFilter(req, { agent: agent._id, status: "pending" }) }, { $group: { _id: null, total: { $sum: { $ifNull: ["$amount", 0] } } } }]),
      Commission.aggregate([{ $match: mergeTenantFilter(req, { agent: agent._id, status: { $in: ["paid", "completed"] } }) }, { $group: { _id: null, total: { $sum: { $ifNull: ["$amount", 0] } } } }]),
      Booking.find(agentBookingFilter)
        .populate("customer", "name email")
        .populate("user", "name email")
        .populate("tour", "title name")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    const normalizeStatus = (booking) => String(booking?.status || booking?.bookingStatus || "pending").toLowerCase();
    const normalizePayment = (booking) => {
      const value = booking?.paymentStatus;
      return String(typeof value === "object" ? value?.status || value?.paymentStatus || "pending" : value || "pending").toLowerCase();
    };
    const activeBookings = allAgentBookings.filter((b) => ACTIVE_BOOKING_STATUSES.includes(normalizeStatus(b)));
    const upcomingBookings = allAgentBookings.filter((b) => b.travelDate && new Date(b.travelDate) >= new Date() && !["cancelled", "refunded", "completed"].includes(normalizeStatus(b)));
    const completedBookings = allAgentBookings.filter((b) => normalizeStatus(b) === "completed");
    const pendingBookings = allAgentBookings.filter((b) => normalizeStatus(b) === "pending");
    const totalSales = allAgentBookings.reduce((sum, b) => ACTIVE_BOOKING_STATUSES.includes(normalizeStatus(b)) && ["paid", "completed", "success"].includes(normalizePayment(b)) ? sum + Number(b.totalAmount ?? b.amount ?? 0) : sum, 0);
    const totalGuests = activeBookings.reduce((sum, b) => sum + Number(b.numberOfGuests ?? b.guests ?? b.numberOfPeople ?? 1), 0);
    const uniqueCustomerIds = new Set(allAgentBookings.filter((b) => !["cancelled", "refunded"].includes(normalizeStatus(b))).map((b) => String(b.customer || b.user || "")).filter(Boolean));
    const tenantCustomerCount = await User.countDocuments(customerFilter);

    const statistics = {
      bookings: allAgentBookings.length,
      totalBookings: allAgentBookings.length,
      activeBookings: activeBookings.length,
      upcomingBookings: upcomingBookings.length,
      completedBookings: completedBookings.length,
      completedTours: completedBookings.length,
      pendingBookings: pendingBookings.length,
      totalSales,
      totalCommission: Number(totalCommissionResult[0]?.total || agent.totalCommission || 0),
      pendingCommission: Number(pendingCommissionResult[0]?.total || agent.pendingCommission || 0),
      paidCommission: Number(paidCommissionResult[0]?.total || agent.paidCommission || 0),
      totalCustomers: uniqueCustomerIds.size || totalCustomers || tenantCustomerCount,
      totalGuests,
    };

    return res.status(200).json({
      success: true,
      tenantId: tenantId.toString(),
      data: {
        agent: { id: agent._id, companyName: agent.companyName, commissionRate: agent.commissionRate, walletBalance: agent.walletBalance, status: agent.status, isApproved: agent.isApproved },
        statistics,
        stats: statistics,
        recentBookings,
      },
    });
  } catch (error) {
    next(error);
  }
};
