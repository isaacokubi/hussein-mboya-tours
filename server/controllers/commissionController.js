/**
 * Purpose: commission Controller HTTP controller. Main declarations: commissionQuery, serializeCommission, getCommissions, getAgentCommissions, approveCommission.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { publicErrorMessage } from "../utils/publicError.js";
// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
// Load ../tenancy/tenantQuery.js so this module can use its exported dependencies.
import { tenantFilter } from "../tenancy/tenantQuery.js";
// Load ../models/Commission.js so this module can use its exported dependencies.
import Commission from "../models/Commission.js";
// Load ../models/Agent.js so this module can use its exported dependencies.
import Agent from "../models/Agent.js";

// Declare commissionQuery for use by the surrounding module or function.
const commissionQuery = (req) =>
  Commission.find(tenantFilter(req, { isDeleted: { $ne: true } }))
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

// Declare serializeCommission for use by the surrounding module or function.
const serializeCommission = (commission) => {
  // Declare item for use by the surrounding module or function.
  const item = commission?.toObject ? commission.toObject({ virtuals: true }) : commission;
  // Declare agent for use by the surrounding module or function.
  const agent = item?.agent || null;
  // Declare booking for use by the surrounding module or function.
  const booking = item?.booking || null;
  // Declare user for use by the surrounding module or function.
  const user = agent?.user || null;

  // Return the object assembled below to the caller.
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

// Declare getCommissions for use by the surrounding module or function.
export const getCommissions = async (req, res) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare commissions for use by the surrounding module or function.
    const commissions = await commissionQuery(req);
    // Return the result of res.json() to the caller.
    return res.json({ success: true, data: commissions.map(serializeCommission) });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.error("Admin get commissions error:", error);
    // Return the result of res.status(error.status || 500).json() to the caller.
    return res.status(error.status || 500).json({ success: false, message: publicErrorMessage(error) });
  }
};

// Declare getAgentCommissions for use by the surrounding module or function.
export const getAgentCommissions = async (req, res) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (!mongoose.isValidObjectId(req.params.agentId)) and run the matching branch.
    if (!mongoose.isValidObjectId(req.params.agentId)) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({ success: false, message: "Invalid agent ID." });
    }
    // Declare commissions for use by the surrounding module or function.
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

    // Return the result of res.json() to the caller.
    return res.json({ success: true, data: commissions.map(serializeCommission) });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.error("Admin get agent commissions error:", error);
    // Return the result of res.status(error.status || 500).json() to the caller.
    return res.status(error.status || 500).json({ success: false, message: publicErrorMessage(error) });
  }
};

// Declare approveCommission for use by the surrounding module or function.
export const approveCommission = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare commission for use by the surrounding module or function.
    const commission = await Commission.findOne(mergeTenantFilter(req, { _id: req.params.id }));
    // Check the condition (!commission) and run the matching branch.
    if (!commission) return res.status(404).json({ success: false, message: "Commission not found." });
    // Check the condition (commission.status === "paid") and run the matching branch.
    if (commission.status === "paid") return res.status(400).json({ success: false, message: "Commission is already paid." });
    // Check the condition (!["pending"].includes(commission.status)) and run the matching branch.
    if (!["pending"].includes(commission.status)) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({ success: false, message: "Only pending commissions can be approved." });
    }

    // Perform the side effect or state update expressed on the following line.
    commission.status = "approved";
    // Perform the side effect or state update expressed on the following line.
    commission.approvedBy = req.user._id;
    // Perform the side effect or state update expressed on the following line.
    commission.approvedAt = new Date();
    // Perform the side effect or state update expressed on the following line.
    commission.updatedBy = req.user._id;
    // Perform the side effect or state update expressed on the following line.
    await commission.save();

    // Return the result of res.json() to the caller.
    return res.json({ success: true, message: "Commission approved.", data: commission });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

// Declare payCommission for use by the surrounding module or function.
export const payCommission = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare { paymentMethod = "MPESA", paymentReference = "", transactionId = "", notes = "" } for use by the surrounding module or function.
    const { paymentMethod = "MPESA", paymentReference = "", transactionId = "", notes = "" } = req.body || {};
    // Declare allowedMethods for use by the surrounding module or function.
    const allowedMethods = ["BANK_TRANSFER", "MPESA", "CASH", "CHEQUE"];
    // Check the condition (!allowedMethods.includes(paymentMethod)) and run the matching branch.
    if (!allowedMethods.includes(paymentMethod)) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({ success: false, message: "Invalid commission payment method." });
    }
    // Declare normalizedReference for use by the surrounding module or function.
    const normalizedReference = String(paymentReference || transactionId || "").trim();
    // Check the condition (!normalizedReference) and run the matching branch.
    if (!normalizedReference) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({ success: false, message: "A payment reference or transaction ID is required." });
    }

    // Declare commission for use by the surrounding module or function.
    const commission = await Commission.findOne(mergeTenantFilter(req, { _id: req.params.id }));
    // Check the condition (!commission) and run the matching branch.
    if (!commission) return res.status(404).json({ success: false, message: "Commission not found." });
    // Check the condition (commission.status === "paid") and run the matching branch.
    if (commission.status === "paid") return res.status(400).json({ success: false, message: "Commission is already paid." });
    // Check the condition (!["approved", "processing"].includes(commission.status)) and run the matching branch.
    if (!["approved", "processing"].includes(commission.status)) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({ success: false, message: "Only an approved or processing commission can be paid." });
    }

    // Declare duplicatePayment for use by the surrounding module or function.
    const duplicatePayment = await Commission.findOne(
      mergeTenantFilter({
        _id: { $ne: commission._id },
        isDeleted: { $ne: true },
        $or: [
          { paymentReference: normalizedReference },
          { transactionId: normalizedReference },
        ],
      })
    ).select("_id booking agent paymentReference transactionId").lean();

    // Check the condition (duplicatePayment) and run the matching branch.
    if (duplicatePayment) {
      // Return the result of res.status(409).json() to the caller.
      return res.status(409).json({
        success: false,
        code: "COMMISSION_PAYMENT_REFERENCE_EXISTS",
        message: "That payment reference or transaction ID has already been recorded for another commission.",
      });
    }

    // Perform the side effect or state update expressed on the following line.
    commission.status = "paid";
    // Perform the side effect or state update expressed on the following line.
    commission.paymentMethod = paymentMethod;
    // Perform the side effect or state update expressed on the following line.
    commission.paymentReference = normalizedReference;
    // Perform the side effect or state update expressed on the following line.
    commission.transactionId = String(transactionId || normalizedReference).trim();
    // Perform the side effect or state update expressed on the following line.
    commission.paidAt = new Date();
    // Perform the side effect or state update expressed on the following line.
    commission.updatedBy = req.user._id;
    // Check the condition (notes) and run the matching branch.
    if (notes) commission.financeNotes = String(notes).trim();
    // Perform the side effect or state update expressed on the following line.
    await commission.save();

    // Declare agent for use by the surrounding module or function.
    const agent = await Agent.findOne(mergeTenantFilter({ _id: commission.agent }));
    // Check the condition (agent) and run the matching branch.
    if (agent) {
      // Declare amount for use by the surrounding module or function.
      const amount = Number(commission.amount || 0);
      // Perform the side effect or state update expressed on the following line.
      agent.paidCommission = Number(agent.paidCommission || 0) + amount;
      // Perform the side effect or state update expressed on the following line.
      agent.pendingCommission = Math.max(0, Number(agent.pendingCommission || 0) - amount);
      // Perform the side effect or state update expressed on the following line.
      agent.walletBalance = Math.max(0, Number(agent.walletBalance || 0) - amount);
      // Perform the side effect or state update expressed on the following line.
      await agent.save();
    }

    // Return the result of res.json() to the caller.
    return res.json({ success: true, message: "Commission payment confirmed and recorded.", data: commission });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};
