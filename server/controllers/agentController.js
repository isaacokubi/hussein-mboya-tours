import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import Booking from "../models/Booking.js";
import Commission from "../models/Commission.js";
import Agent from "../models/Agent.js";
import AgentWithdrawal from "../models/AgentWithdrawal.js";
import { getSystemSettings } from "../services/settingsService.js";

const getGlobalCommissionRate = async (req) => {
  const settings = await getSystemSettings({ req, tenantId: req.tenantId || req.user?.tenantId || null });
  const rate = Number(settings?.defaultCommissionRate);
  return Number.isFinite(rate) && rate >= 0 && rate <= 100 ? rate : 10;
};

const getAgent = async (user) => {
  const tenantFilter = mergeTenantFilter({});
  let agent = await Agent.findOne({ ...tenantFilter, user: user._id }).lean();
  if (!agent && user.email) {
    agent = await Agent.findOne({ ...tenantFilter, email: String(user.email).toLowerCase() }).lean();
  }
  return agent;
};

export const getAgentDashboard = async (req, res, next) => {
  requireTenantId();
  try {
    let agent = await getAgent(req.user);
    if (!agent) {
      agent = (await Agent.create({
        ...mergeTenantFilter({}), user: req.user._id,
        companyName: req.user.name || "", email: String(req.user.email || "").toLowerCase(),
        phone: req.user.phone || "", status: "active", isApproved: false,
      })).toObject();
    } else if (!agent.user) {
      await Agent.updateOne(mergeTenantFilter({ _id: agent._id }), { $set: { user: req.user._id } });
    }

    const globalCommissionRate = await getGlobalCommissionRate(req);
    if (Number(agent.commissionRate) !== globalCommissionRate) {
      await Agent.updateOne(mergeTenantFilter({ _id: agent._id }), { $set: { commissionRate: globalCommissionRate } });
      agent.commissionRate = globalCommissionRate;
    }

    const base = mergeTenantFilter({ agent: agent._id, isDeleted: { $ne: true } });
    const commissionBase = mergeTenantFilter({ agent: agent._id, isDeleted: { $ne: true } });
    const withdrawalBase = mergeTenantFilter({ agent: agent._id });
    const now = new Date();
    const activeStatuses = ["confirmed", "assigned", "ongoing"];

    const [
      bookings, upcomingBookings, completedTours, salesResult, guestsResult, customersResult,
      paidCommissionResult, pendingBookings, cancelledBookings, outstandingResult, recentBookings,
      completedWithdrawalsResult, reservedWithdrawalsResult,
    ] = await Promise.all([
      Booking.countDocuments(base),
      Booking.countDocuments({ ...base, status: { $in: activeStatuses }, travelDate: { $gte: now } }),
      Booking.countDocuments({ ...base, status: "completed" }),
      Booking.aggregate([
        { $match: { ...base, paymentStatus: "paid", status: { $nin: ["cancelled", "failed", "refunded"] } } },
        { $group: { _id: null, totalSales: { $sum: { $ifNull: ["$totalAmount", 0] } } } },
      ]),
      Booking.aggregate([
        { $match: { ...base, status: { $ne: "cancelled" } } },
        { $group: { _id: null, totalGuests: { $sum: { $ifNull: ["$numberOfGuests", { $size: { $ifNull: ["$travelers", []] } }] } } } },
      ]),
      Booking.aggregate([
        { $match: { ...base, status: { $ne: "cancelled" } } },
        { $group: { _id: "$customer" } },
        { $match: { _id: { $ne: null } } },
        { $count: "totalCustomers" },
      ]),
      Commission.aggregate([
        { $match: { ...commissionBase, status: "paid" } },
        { $group: { _id: null, paidCommission: { $sum: { $ifNull: ["$amount", 0] } } } },
      ]),
      Booking.countDocuments({ ...base, status: "pending" }),
      Booking.countDocuments({ ...base, status: "cancelled" }),
      Booking.aggregate([
        { $match: { ...base, status: { $nin: ["cancelled", "refunded"] } } },
        { $group: { _id: null, outstandingSales: { $sum: { $ifNull: ["$balanceAmount", 0] } } } },
      ]),
      Booking.find(base)
        .populate("tour", "title name price duration destination")
        .populate("customer", "name firstName lastName email phone")
        .sort({ createdAt: -1 }).limit(5).lean(),
      AgentWithdrawal.aggregate([
        { $match: { ...withdrawalBase, status: "completed" } },
        { $group: { _id: null, total: { $sum: { $ifNull: ["$amount", 0] } } } },
      ]),
      AgentWithdrawal.aggregate([
        { $match: { ...withdrawalBase, status: { $in: ["pending", "approved", "processing"] } } },
        { $group: { _id: null, total: { $sum: { $ifNull: ["$amount", 0] } } } },
      ]),
    ]);

    const totalSales = Number(salesResult[0]?.totalSales || 0);
    const paidCommission = Number(paidCommissionResult[0]?.paidCommission || 0);
    const totalCommission = Number(((totalSales * globalCommissionRate) / 100).toFixed(2));
    const pendingCommission = Math.max(0, Number((totalCommission - paidCommission).toFixed(2)));
    const withdrawnCommission = Number(completedWithdrawalsResult[0]?.total || 0);
    const reservedWithdrawals = Number(reservedWithdrawalsResult[0]?.total || 0);
    const walletBalance = Math.max(0, Number((paidCommission - withdrawnCommission - reservedWithdrawals).toFixed(2)));

    return res.status(200).json({
      success: true,
      data: {
        agent: {
          id: agent._id,
          companyName: agent.companyName,
          walletBalance,
          commissionRate: globalCommissionRate,
          status: agent.status,
          isApproved: Boolean(agent.isApproved),
          pendingApproval: !agent.isApproved,
        },
        statistics: {
          bookings,
          upcomingBookings,
          completedTours,
          pendingBookings,
          cancelledBookings,
          totalSales,
          outstandingSales: Number(outstandingResult[0]?.outstandingSales || 0),
          totalCommission,
          pendingCommission,
          paidCommission,
          withdrawnCommission,
          reservedWithdrawals,
          totalGuests: Number(guestsResult[0]?.totalGuests || 0),
          totalCustomers: Number(customersResult[0]?.totalCustomers || 0),
        },
        recentBookings,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAgentBookings = async (req, res, next) => {
  try {
    const agent = await getAgent(req.user);
    if (!agent) return res.status(404).json({ success: false, message: "Agent profile not found." });
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(10, Math.max(1, Number(req.query.limit) || 10));
    const filter = mergeTenantFilter({ agent: agent._id, isDeleted: { $ne: true } });
    if (req.query.status) filter.status = req.query.status;
    const [items, total] = await Promise.all([
      Booking.find(filter).populate("tour", "title name").populate("customer", "name firstName lastName email phone")
        .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Booking.countDocuments(filter),
    ]);
    return res.json({ success: true, data: items, bookings: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
};

export const getAgentCustomers = async (req, res, next) => {
  try {
    const agent = await getAgent(req.user);
    if (!agent) return res.status(404).json({ success: false, message: "Agent profile not found." });
    const bookings = await Booking.find(mergeTenantFilter({ agent: agent._id, isDeleted: { $ne: true } }))
      .populate("customer", "name firstName lastName email phone")
      .select("customer customerSnapshot contact").lean();
    const seen = new Map();
    for (const booking of bookings) {
      const customer = booking.customer || booking.customerSnapshot || booking.contact;
      if (!customer) continue;
      const key = String(customer._id || customer.email || customer.phone || customer.name || "");
      if (key && !seen.has(key)) seen.set(key, customer);
    }
    return res.json({ success: true, data: Array.from(seen.values()) });
  } catch (error) { next(error); }
};

export const getMyAgentCommission = async (req, res, next) => {
  try {
    const agent = await getAgent(req.user);
    if (!agent) return res.status(404).json({ success: false, message: "Agent profile not found." });
    const commissions = await Commission.find(mergeTenantFilter({ agent: agent._id, isDeleted: { $ne: true } }))
      .populate("booking").sort({ createdAt: -1 }).lean();
    const globalCommissionRate = await getGlobalCommissionRate(req);
    return res.status(200).json({ success: true, commissionRate: globalCommissionRate, data: commissions });
  } catch (error) { next(error); }
};
