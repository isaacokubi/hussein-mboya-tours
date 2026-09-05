import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import { tenantFilter } from "../tenancy/tenantQuery.js";
import Commission from "../models/Commission.js";
import Agent from "../models/Agent.js";
import AgentWithdrawal from "../models/AgentWithdrawal.js";
import Booking from "../models/Booking.js";
import { getSystemSettings } from "../services/settingsService.js";

const getCommissionRate = async (req) => {
  const settings = await getSystemSettings({ req, tenantId: req.tenantId || req.user?.tenantId || null });
  const rate = Number(settings?.defaultCommissionRate);
  return Number.isFinite(rate) && rate >= 0 && rate <= 100 ? rate : 10;
};

const syncEarnedCommissions = async (req) => {
  const rate = await getCommissionRate(req);
  const bookingFilter = mergeTenantFilter({ agent: { $ne: null }, paymentStatus: "paid", status: { $nin: ["cancelled", "failed", "refunded"] }, isDeleted: { $ne: true } });
  const bookings = await Booking.find(bookingFilter).select("_id agent customer tour totalAmount").lean();
  if (!bookings.length) return;

  for (const booking of bookings) {
    const amount = Number(booking.totalAmount || 0);
    if (!booking.agent || amount <= 0) continue;
    const commissionAmount = Number(((amount * rate) / 100).toFixed(2));
    const commissionFilter = mergeTenantFilter({ booking: booking._id });
    let commission = await Commission.findOne(commissionFilter);
    if (commission) {
      commission.agent = booking.agent;
      commission.booking = booking._id;
      commission.customer = booking.customer || null;
      commission.tour = booking.tour || null;
      commission.bookingAmount = amount;
      commission.rate = rate;
      commission.amount = commissionAmount;
      commission.updatedBy = req.user?._id;
      await commission.save();
      continue;
    }
    commission = new Commission({ agent: booking.agent, booking: booking._id, customer: booking.customer || null, tour: booking.tour || null, bookingAmount: amount, rate, amount: commissionAmount, status: "pending", createdBy: req.user?._id, updatedBy: req.user?._id });
    try {
      await commission.save();
    } catch (error) {
      if (error?.code === 11000) {
        const existing = await Commission.findOne(commissionFilter);
        if (!existing) throw error;
        existing.agent = booking.agent; existing.booking = booking._id; existing.customer = booking.customer || null; existing.tour = booking.tour || null; existing.bookingAmount = amount; existing.rate = rate; existing.amount = commissionAmount; existing.updatedBy = req.user?._id;
        await existing.save();
      } else throw error;
    }
  }
};

export const getCommissions = async (req, res) => {
  requireTenantId();
  try {
    await syncEarnedCommissions(req);
    const commissions = await Commission.find(tenantFilter(req))
      .populate({ path: "agent", populate: { path: "user", select: "name email" } })
      .populate("booking")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: commissions });
  } catch (error) {
    console.error("[Commission] getCommissions failed:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAgentCommissions = async (req, res) => {
  requireTenantId();
  try {
    const commissions = await Commission.find(mergeTenantFilter(req, { agent: req.params.agentId, isDeleted: { $ne: true } }))
      .populate("booking").sort({ createdAt: -1 });
    res.json({ success: true, data: commissions });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const approveCommission = async (req, res, next) => {
  try {
    const commission = await Commission.findOne(mergeTenantFilter(req, { _id: req.params.id }));
    if (!commission) return res.status(404).json({ success: false, message: "Commission not found." });
    if (commission.status === "paid") return res.status(400).json({ success: false, message: "Commission is already paid." });
    commission.status = "approved";
    commission.approvedBy = req.user._id;
    commission.approvedAt = new Date();
    commission.updatedBy = req.user._id;
    await commission.save();
    return res.json({ success: true, message: "Commission approved.", data: commission });
  } catch (error) { next(error); }
};

export const payCommission = async (req, res, next) => {
  try {
    const { paymentMethod = "MPESA", paymentReference = "", transactionId = "", notes = "" } = req.body || {};
    const allowedMethods = ["BANK_TRANSFER", "MPESA", "CASH", "CHEQUE"];
    if (!allowedMethods.includes(paymentMethod)) return res.status(400).json({ success: false, message: "Invalid commission payment method." });
    const commission = await Commission.findOne(mergeTenantFilter(req, { _id: req.params.id, isDeleted: { $ne: true } }));
    if (!commission) return res.status(404).json({ success: false, message: "Commission not found." });
    if (commission.status === "paid") return res.status(400).json({ success: false, message: "Commission is already paid." });
    if (!["approved", "processing", "pending"].includes(commission.status)) return res.status(400).json({ success: false, message: "Only an active commission can be paid." });

    commission.status = "paid";
    commission.paymentMethod = paymentMethod;
    commission.paymentReference = String(paymentReference || "").trim();
    commission.transactionId = String(transactionId || "").trim();
    commission.paidAt = new Date();
    commission.updatedBy = req.user._id;
    if (notes) commission.financeNotes = String(notes).trim();
    await commission.save();

    const agent = await Agent.findOne(mergeTenantFilter(req, { _id: commission.agent }));
    if (agent) {
      const agentCommissionFilter = mergeTenantFilter(req, { agent: agent._id, isDeleted: { $ne: true } });
      const withdrawalFilter = mergeTenantFilter(req, { agent: agent._id });
      const [totals, pending, paid, withdrawn, reserved] = await Promise.all([
        Commission.aggregate([{ $match: { ...agentCommissionFilter, status: { $nin: ["cancelled", "rejected"] } } }, { $group: { _id: null, total: { $sum: { $ifNull: ["$amount", 0] } } } }]),
        Commission.aggregate([{ $match: { ...agentCommissionFilter, status: { $in: ["pending", "approved", "processing"] } } }, { $group: { _id: null, total: { $sum: { $ifNull: ["$amount", 0] } } } }]),
        Commission.aggregate([{ $match: { ...agentCommissionFilter, status: "paid" } }, { $group: { _id: null, total: { $sum: { $ifNull: ["$amount", 0] } } } }]),
        AgentWithdrawal.aggregate([{ $match: { ...withdrawalFilter, status: "completed" } }, { $group: { _id: null, total: { $sum: { $ifNull: ["$amount", 0] } } } }]),
        AgentWithdrawal.aggregate([{ $match: { ...withdrawalFilter, status: { $in: ["pending", "approved", "processing"] } } }, { $group: { _id: null, total: { $sum: { $ifNull: ["$amount", 0] } } } }]),
      ]);
      agent.totalCommission = Number(totals[0]?.total || 0);
      agent.pendingCommission = Number(pending[0]?.total || 0);
      agent.paidCommission = Number(paid[0]?.total || 0);
      agent.walletBalance = Math.max(0, Number((agent.paidCommission - Number(withdrawn[0]?.total || 0) - Number(reserved[0]?.total || 0)).toFixed(2)));
      await agent.save();
    }
    return res.json({ success: true, message: "Commission payment confirmed and added to the agent wallet.", data: commission });
  } catch (error) { next(error); }
};
