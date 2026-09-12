import mongoose from "mongoose";
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import { tenantFilter } from "../tenancy/tenantQuery.js";
import Commission from "../models/Commission.js";
import Agent from "../models/Agent.js";

const commissionQuery = () =>
  Commission.find(tenantFilter({}))
    .populate({
      path: "agent",
      select: "user companyName phone email location commissionRate status isApproved totalBookings totalSales totalCommission pendingCommission paidCommission walletBalance",
      populate: { path: "user", select: "name email phone role status isActive" },
    })
    .populate({
      path: "booking",
      select: "bookingNumber totalAmount status paymentStatus user customer tour agent createdAt",
      populate: [
        { path: "tour", select: "title name" },
        { path: "user", select: "name email phone" },
        { path: "customer", select: "name email phone" },
      ],
    })
    .sort({ createdAt: -1 });

const serializeCommission = (commission) => {
  const item = commission?.toObject ? commission.toObject({ virtuals: true }) : commission;
  const agent = item?.agent || null;
  const booking = item?.booking || null;
  const user = agent?.user || null;

  return {
    ...item,
    agent: agent
      ? {
          ...agent,
          displayName:
            String(user?.name || "").trim() ||
            String(agent.companyName || "").trim() ||
            String(agent.email || "").trim() ||
            "Agent account",
          displayEmail: String(user?.email || agent.email || "").trim(),
          displayPhone: String(user?.phone || agent.phone || "").trim(),
        }
      : null,
    booking: booking
      ? {
          ...booking,
          displayNumber:
            String(booking.bookingNumber || "").trim() ||
            (booking._id ? `Booking ${String(booking._id).slice(-8).toUpperCase()}` : "Booking"),
        }
      : null,
    commissionAmount: Number(item?.amount || 0),
    bookingValue: Number(item?.bookingAmount || booking?.totalAmount || 0),
    netAmount: Math.max(
      0,
      Number(item?.amount || 0) - Number(item?.refundedAmount || 0)
    ),
  };
};

export const getCommissions = async (req, res) => {
  requireTenantId();
  try {
    const commissions = await commissionQuery();
    return res.json({ success: true, data: commissions.map(serializeCommission) });
  } catch (error) {
    console.error("Admin get commissions error:", error);
    return res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

export const getAgentCommissions = async (req, res) => {
  requireTenantId();
  try {
    if (!mongoose.isValidObjectId(req.params.agentId)) {
      return res.status(400).json({ success: false, message: "Invalid agent ID." });
    }
    const commissions = await Commission.find(
      mergeTenantFilter({ agent: new mongoose.Types.ObjectId(req.params.agentId) })
    )
      .populate({
        path: "agent",
        select: "user companyName phone email location commissionRate status isApproved",
        populate: { path: "user", select: "name email phone role status isActive" },
      })
      .populate({
        path: "booking",
        select: "bookingNumber totalAmount status paymentStatus user customer tour agent createdAt",
        populate: [
          { path: "tour", select: "title name" },
          { path: "user", select: "name email phone" },
          { path: "customer", select: "name email phone" },
        ],
      })
      .sort({ createdAt: -1 });

    return res.json({ success: true, data: commissions.map(serializeCommission) });
  } catch (error) {
    console.error("Admin get agent commissions error:", error);
    return res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

export const approveCommission = async (req, res, next) => {
  try {
    const commission = await Commission.findOne(mergeTenantFilter(req, { _id: req.params.id }));
    if (!commission) return res.status(404).json({ success: false, message: "Commission not found." });
    if (commission.status === "paid") return res.status(400).json({ success: false, message: "Commission is already paid." });
    if (!["pending"].includes(commission.status)) {
      return res.status(400).json({ success: false, message: "Only pending commissions can be approved." });
    }

    commission.status = "approved";
    commission.approvedBy = req.user._id;
    commission.approvedAt = new Date();
    commission.updatedBy = req.user._id;
    await commission.save();

    return res.json({ success: true, message: "Commission approved.", data: commission });
  } catch (error) {
    next(error);
  }
};

export const payCommission = async (req, res, next) => {
  try {
    const { paymentMethod = "MPESA", paymentReference = "", transactionId = "", notes = "" } = req.body || {};
    const allowedMethods = ["BANK_TRANSFER", "MPESA", "CASH", "CHEQUE"];
    if (!allowedMethods.includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: "Invalid commission payment method." });
    }
    if (!String(paymentReference || transactionId || "").trim()) {
      return res.status(400).json({ success: false, message: "A payment reference or transaction ID is required." });
    }

    const commission = await Commission.findOne(mergeTenantFilter(req, { _id: req.params.id }));
    if (!commission) return res.status(404).json({ success: false, message: "Commission not found." });
    if (commission.status === "paid") return res.status(400).json({ success: false, message: "Commission is already paid." });
    if (!["approved", "processing", "pending"].includes(commission.status)) {
      return res.status(400).json({ success: false, message: "Only an active commission can be paid." });
    }

    commission.status = "paid";
    commission.paymentMethod = paymentMethod;
    commission.paymentReference = String(paymentReference || transactionId || "").trim();
    commission.transactionId = String(transactionId || paymentReference || "").trim();
    commission.paidAt = new Date();
    commission.updatedBy = req.user._id;
    if (notes) commission.financeNotes = String(notes).trim();
    await commission.save();

    const agent = await Agent.findOne(mergeTenantFilter({ _id: commission.agent }));
    if (agent) {
      const amount = Number(commission.amount || 0);
      agent.paidCommission = Number(agent.paidCommission || 0) + amount;
      agent.pendingCommission = Math.max(0, Number(agent.pendingCommission || 0) - amount);
      agent.walletBalance = Math.max(0, Number(agent.walletBalance || 0) - amount);
      await agent.save();
    }

    return res.json({ success: true, message: "Commission payment confirmed and recorded.", data: commission });
  } catch (error) {
    next(error);
  }
};
