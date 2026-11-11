/**
 * Purpose: agent Controller HTTP controller. Main declarations: getGlobalCommissionRate, getAgent, cleanText, bookingCustomerFallback, bookingTourFallback.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ../models/Commission.js so this module can use its exported dependencies.
import Commission from "../models/Commission.js";
// Load ../models/Agent.js so this module can use its exported dependencies.
import Agent from "../models/Agent.js";
// Load ../services/settingsService.js so this module can use its exported dependencies.
import { getSystemSettings } from "../services/settingsService.js";

// Declare getGlobalCommissionRate for use by the surrounding module or function.
const getGlobalCommissionRate = async (req) => {
  // Declare settings for use by the surrounding module or function.
  const settings = await getSystemSettings({ req, tenantId: req.tenantId || req.user?.tenantId || null });
  // Declare rate for use by the surrounding module or function.
  const rate = Number(settings?.defaultCommissionRate);
  // Return the expression shown below to the caller.
  return Number.isFinite(rate) && rate >= 0 && rate <= 100 ? rate : 10;
};

// Declare getAgent for use by the surrounding module or function.
const getAgent = async (user) => {
  // Declare tenantFilter for use by the surrounding module or function.
  const tenantFilter = mergeTenantFilter({});
  // Declare agent for use by the surrounding module or function.
  let agent = await Agent.findOne({ ...tenantFilter, user: user._id }).lean();
  // Check the condition (!agent && user.email) and run the matching branch.
  if (!agent && user.email) agent = await Agent.findOne({ ...tenantFilter, email: String(user.email).toLowerCase() }).lean();
  // Return the value of agent to the caller.
  return agent;
};

// Declare cleanText for use by the surrounding module or function.
const cleanText = (value) => {
  // Check the condition (value === undefined || value === null) and run the matching branch.
  if (value === undefined || value === null) return "";
  // Declare text for use by the surrounding module or function.
  const text = String(value).trim();
  // Check the condition (!text || /^undefined(?:\s+undefined)?$/i.test(text) || /^null(?:\s+nul) and run the matching branch.
  if (!text || /^undefined(?:\s+undefined)?$/i.test(text) || /^null(?:\s+null)?$/i.test(text)) return "";
  // Return the value of text to the caller.
  return text;
};

// Declare bookingCustomerFallback for use by the surrounding module or function.
const bookingCustomerFallback = (booking) => {
  // Declare customer for use by the surrounding module or function.
  const customer = booking?.customer;
  // Declare snapshot for use by the surrounding module or function.
  const snapshot = booking?.customerSnapshot || {};
  // Declare contact for use by the surrounding module or function.
  const contact = booking?.contact || {};
  // Declare name for use by the surrounding module or function.
  const name = cleanText(customer?.name)
    || [cleanText(customer?.firstName), cleanText(customer?.lastName)].filter(Boolean).join(" ")
    || cleanText(snapshot.name)
    || cleanText(contact.name);
  // Declare email for use by the surrounding module or function.
  const email = cleanText(customer?.email) || cleanText(snapshot.email) || cleanText(contact.email);
  // Declare phone for use by the surrounding module or function.
  const phone = cleanText(customer?.phone) || cleanText(snapshot.phone) || cleanText(contact.phone);
  // Return the expression shown below to the caller.
  return name || email || phone ? { ...(customer || {}), name: name || undefined, email: email || undefined, phone: phone || undefined } : null;
};

// Declare bookingTourFallback for use by the surrounding module or function.
const bookingTourFallback = (booking) => {
  // Check the condition (booking?.tour) and run the matching branch.
  if (booking?.tour) return booking.tour;
  // Declare custom for use by the surrounding module or function.
  const custom = booking?.customTourRequest;
  // Check the condition (!custom) and run the matching branch.
  if (!custom) return null;
  // Declare destination for use by the surrounding module or function.
  const destination = cleanText(custom.destination);
  // Return the expression shown below to the caller.
  return destination ? { title: `Custom trip — ${destination}`, destination } : { title: "Custom trip" };
};

// Declare normalizeRecentBooking for use by the surrounding module or function.
const normalizeRecentBooking = (booking) => ({ ...booking, customer: bookingCustomerFallback(booking), tour: bookingTourFallback(booking) });

// Declare getAgentDashboard for use by the surrounding module or function.
export const getAgentDashboard = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare agent for use by the surrounding module or function.
    let agent = await getAgent(req.user);
    // Check the condition (!agent) and run the matching branch.
    if (!agent) {
      // Perform the side effect or state update expressed on the following line.
      agent = (await Agent.create({ ...mergeTenantFilter({}), user: req.user._id, companyName: req.user.name || "", email: String(req.user.email || "").toLowerCase(), phone: req.user.phone || "", status: "active", isApproved: false })).toObject();
    } else if (!agent.user) {
      // Perform the side effect or state update expressed on the following line.
      await Agent.updateOne(mergeTenantFilter({ _id: agent._id }), { $set: { user: req.user._id } });
    }

    // Declare globalCommissionRate for use by the surrounding module or function.
    const globalCommissionRate = await getGlobalCommissionRate(req);
    // Check the condition (Number(agent.commissionRate) !== globalCommissionRate) and run the matching branch.
    if (Number(agent.commissionRate) !== globalCommissionRate) {
      // Perform the side effect or state update expressed on the following line.
      await Agent.updateOne(mergeTenantFilter({ _id: agent._id }), { $set: { commissionRate: globalCommissionRate } });
      // Perform the side effect or state update expressed on the following line.
      agent.commissionRate = globalCommissionRate;
    }

    // Declare base for use by the surrounding module or function.
    const base = mergeTenantFilter({ agent: agent._id, isDeleted: { $ne: true } });
    // Declare commissionBase for use by the surrounding module or function.
    const commissionBase = mergeTenantFilter({ agent: agent._id, isDeleted: { $ne: true } });
    // Declare now for use by the surrounding module or function.
    const now = new Date();
    // Declare activeStatuses for use by the surrounding module or function.
    const activeStatuses = ["confirmed", "assigned", "ongoing"];

    // Declare [bookings, upcomingBookings, completedTours, salesResult, guestsResult, customersResult, commissionResult, pendingCommissionResult, paidCommissionResult, pendingBookings, cancelledBookings, recentRaw] for use by the surrounding module or function.
    const [bookings, upcomingBookings, completedTours, salesResult, guestsResult, customersResult, commissionResult, pendingCommissionResult, paidCommissionResult, pendingBookings, cancelledBookings, recentRaw] = await Promise.all([
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
        { $group: { _id: { $ifNull: ["$customer", { $ifNull: ["$customerSnapshot.phone", "$contact.phone"] }] } } },
        { $match: { _id: { $nin: [null, ""] } } },
        { $count: "totalCustomers" },
      ]),
      Commission.aggregate([
        { $match: { ...commissionBase, status: { $nin: ["cancelled", "rejected"] } } },
        { $group: { _id: null, totalCommission: { $sum: { $ifNull: ["$amount", 0] } } } },
      ]),
      Commission.aggregate([
        { $match: { ...commissionBase, status: "pending" } },
        { $group: { _id: null, pendingCommission: { $sum: { $ifNull: ["$amount", 0] } } } },
      ]),
      Commission.aggregate([
        { $match: { ...commissionBase, status: "paid" } },
        { $group: { _id: null, paidCommission: { $sum: { $ifNull: ["$amount", 0] } } } },
      ]),
      Booking.countDocuments({ ...base, status: "pending" }),
      Booking.countDocuments({ ...base, status: "cancelled" }),
      Booking.find(base)
        .populate("tour", "title name price duration destination")
        .populate("customTourRequest", "destination durationDays people startDate")
        .populate("customer", "name firstName lastName email phone")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({
      success: true,
      data: {
        agent: {
          id: agent._id,
          companyName: agent.companyName,
          walletBalance: Number(agent.walletBalance || 0),
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
          totalSales: salesResult[0]?.totalSales || 0,
          totalCommission: commissionResult[0]?.totalCommission || 0,
          pendingCommission: pendingCommissionResult[0]?.pendingCommission || 0,
          paidCommission: paidCommissionResult[0]?.paidCommission || 0,
          totalGuests: guestsResult[0]?.totalGuests || 0,
          totalCustomers: customersResult[0]?.totalCustomers || 0,
        },
        recentBookings: recentRaw.map(normalizeRecentBooking),
      },
    });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

// Declare getAgentBookings for use by the surrounding module or function.
export const getAgentBookings = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare agent for use by the surrounding module or function.
    const agent = await getAgent(req.user);
    // Check the condition (!agent) and run the matching branch.
    if (!agent) return res.status(404).json({ success: false, message: "Agent profile not found." });
    // Declare page for use by the surrounding module or function.
    const page = Math.max(1, Number(req.query.page) || 1);
    // Declare limit for use by the surrounding module or function.
    const limit = Math.min(10, Math.max(1, Number(req.query.limit) || 10));
    // Declare filter for use by the surrounding module or function.
    const filter = mergeTenantFilter({ agent: agent._id, isDeleted: { $ne: true } });
    // Check the condition (req.query.status) and run the matching branch.
    if (req.query.status) filter.status = req.query.status;
    // Declare [items, total] for use by the surrounding module or function.
    const [items, total] = await Promise.all([
      Booking.find(filter)
        .populate("tour", "title name")
        .populate("customer", "name firstName lastName email phone")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Booking.countDocuments(filter),
    ]);
    // Return the result of res.json() to the caller.
    return res.json({ success: true, data: items, bookings: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

// Declare getAgentCustomers for use by the surrounding module or function.
export const getAgentCustomers = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare agent for use by the surrounding module or function.
    const agent = await getAgent(req.user);
    // Check the condition (!agent) and run the matching branch.
    if (!agent) return res.status(404).json({ success: false, message: "Agent profile not found." });
    // Declare bookings for use by the surrounding module or function.
    const bookings = await Booking.find(mergeTenantFilter({ agent: agent._id, isDeleted: { $ne: true } }))
      .populate("customer", "name firstName lastName email phone")
      .select("customer customerSnapshot contact")
      .lean();
    // Declare seen for use by the surrounding module or function.
    const seen = new Map();
    // Repeat the enclosed work for each required iteration.
    for (const booking of bookings) {
      // Declare customer for use by the surrounding module or function.
      const customer = booking.customer || booking.customerSnapshot || booking.contact;
      // Check the condition (!customer) and run the matching branch.
      if (!customer) continue;
      // Declare key for use by the surrounding module or function.
      const key = String(customer._id || customer.email || customer.phone || customer.name || "");
      // Check the condition (key && !seen.has(key)) and run the matching branch.
      if (key && !seen.has(key)) seen.set(key, customer);
    }
    // Return the result of res.json() to the caller.
    return res.json({ success: true, data: Array.from(seen.values()) });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

// Declare getMyAgentCommission for use by the surrounding module or function.
export const getMyAgentCommission = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare agent for use by the surrounding module or function.
    const agent = await getAgent(req.user);
    // Check the condition (!agent) and run the matching branch.
    if (!agent) return res.status(404).json({ success: false, message: "Agent profile not found." });
    // Declare commissions for use by the surrounding module or function.
    const commissions = await Commission.find(mergeTenantFilter({ agent: agent._id, isDeleted: { $ne: true } }))
      .populate("booking")
      .sort({ createdAt: -1 })
      .lean();
    // Declare globalCommissionRate for use by the surrounding module or function.
    const globalCommissionRate = await getGlobalCommissionRate(req);
    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({ success: true, commissionRate: globalCommissionRate, data: commissions });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};
