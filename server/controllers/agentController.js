import Booking from "../models/Booking.js";
import Commission from "../models/Commission.js";
import Agent from "../models/Agent.js";

const getAgent = async (user) => {
  let agent = await Agent.findOne({ user: user._id }).lean();
  if (!agent && user.email) agent = await Agent.findOne({ email: String(user.email).toLowerCase() }).lean();
  return agent;
};

export const getAgentDashboard = async (req, res, next) => {
  try {
    let agent = await getAgent(req.user);
    if (!agent) {
      agent = (await Agent.create({ user: req.user._id, companyName: req.user.name || "", email: String(req.user.email || "").toLowerCase(), phone: req.user.phone || "", status: "active", isApproved: false })).toObject();
    } else if (!agent.user) {
      await Agent.updateOne({ _id: agent._id }, { $set: { user: req.user._id } });
    }

    const base = { agent: agent._id, isDeleted: { $ne: true } };
    const now = new Date();
    const activeStatuses = ["confirmed", "assigned", "ongoing"];
    const [bookings, upcomingBookings, completedTours, salesResult, guestsResult, commissionResult, pendingBookings, cancelledBookings, recentBookings] = await Promise.all([
      Booking.countDocuments(base),
      Booking.countDocuments({ ...base, status: { $in: activeStatuses }, travelDate: { $gte: now } }),
      Booking.countDocuments({ ...base, status: "completed" }),
      Booking.aggregate([
        { $match: { ...base, paymentStatus: { $in: ["paid", "completed"] }, status: { $nin: ["cancelled", "failed"] } } },
        { $group: { _id: null, totalSales: { $sum: { $ifNull: ["$amountPaid", "$totalAmount"] } } } },
      ]),
      Booking.aggregate([
        { $match: { ...base, status: { $ne: "cancelled" } } },
        { $group: { _id: null, totalGuests: { $sum: { $ifNull: ["$numberOfGuests", { $size: { $ifNull: ["$travelers", []] } }] } } } },
      ]),
      Commission.aggregate([{ $match: { agent: agent._id, status: { $nin: ["cancelled", "reversed"] } } }, { $group: { _id: null, totalCommission: { $sum: { $ifNull: ["$amount", 0] } } } }]),
      Booking.countDocuments({ ...base, status: "pending" }),
      Booking.countDocuments({ ...base, status: "cancelled" }),
      Booking.find(base).populate("tour", "title name price duration destination").populate("customer", "name firstName lastName email phone").sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    return res.status(200).json({ success: true, data: {
      agent: { id: agent._id, companyName: agent.companyName, walletBalance: agent.walletBalance, commissionRate: agent.commissionRate, status: agent.status, isApproved: Boolean(agent.isApproved), pendingApproval: !agent.isApproved },
      statistics: { bookings, upcomingBookings, completedTours, pendingBookings, cancelledBookings, totalSales: salesResult[0]?.totalSales || 0, totalCommission: commissionResult[0]?.totalCommission || 0, totalGuests: guestsResult[0]?.totalGuests || 0 },
      recentBookings,
    } });
  } catch (error) { next(error); }
};

export const getAgentBookings = async (req, res, next) => {
  try {
    const agent = await getAgent(req.user);
    if (!agent) return res.status(404).json({ success: false, message: "Agent profile not found." });
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(10, Math.max(1, Number(req.query.limit) || 10));
    const filter = { agent: agent._id, isDeleted: { $ne: true } };
    if (req.query.status) filter.status = req.query.status;
    const [items, total] = await Promise.all([
      Booking.find(filter).populate("tour", "title name").populate("customer", "name firstName lastName email phone").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Booking.countDocuments(filter),
    ]);
    return res.json({ success: true, data: items, bookings: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
};

export const getAgentCustomers = async (req, res, next) => {
  try {
    const agent = await getAgent(req.user);
    if (!agent) return res.status(404).json({ success: false, message: "Agent profile not found." });
    const bookings = await Booking.find({ agent: agent._id, isDeleted: { $ne: true } }).populate("customer", "name firstName lastName email phone").select("customer customerSnapshot contact").lean();
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
    const commissions = await Commission.find({ agent: agent._id }).populate("booking").sort({ createdAt: -1 }).lean();
    return res.status(200).json({ success: true, data: commissions });
  } catch (error) { next(error); }
};