/**
 * Purpose: admin Payment Controller HTTP controller. Main declarations: getPayments, getPaymentStats, updatePaymentStatus, getPayment, submitMpesaRefund.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
// Load ../models/Refund.js so this module can use its exported dependencies.
import Refund from "../models/Refund.js";
// Load ../models/Payment.js so this module can use its exported dependencies.
import Payment from "../models/Payment.js";
// Load ../services/paymentLifecycleService.js so this module can use its exported dependencies.
import {
  refundBookingPayment,
  completeBookingPayment,
} from "../services/paymentLifecycleService.js";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ../models/RefundAudit.js so this module can use its exported dependencies.
import RefundAudit from "../models/RefundAudit.js";
// Load ../services/mpesaRefundService.js so this module can use its exported dependencies.
import { requestMpesaRefund } from "../services/mpesaRefundService.js";
// Load ../services/settingsService.js so this module can use its exported dependencies.
import { getSystemSettings } from "../services/settingsService.js";

// Declare getPayments for use by the surrounding module or function.
export const getPayments = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare page for use by the surrounding module or function.
    const page = Math.max(1, Number(req.query.page) || 1);
    // Declare limit for use by the surrounding module or function.
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    // Declare query for use by the surrounding module or function.
    const query = mergeTenantFilter(req, {});
    // Check the condition (req.query.status) and run the matching branch.
    if (req.query.status) query.status = req.query.status;
    // Check the condition (req.query.method) and run the matching branch.
    if (req.query.method) query.method = req.query.method;

    // Declare payments for use by the surrounding module or function.
    const payments = await Payment.find(query)
      .populate("customer", "name email phone")
      .populate({
        path: "booking",
        select: "bookingNumber reference travelDate totalAmount status paymentStatus",
        populate: { path: "tour", select: "title name" },
      })
      .populate({
        path: "hospitalityBooking",
        select: "bookingNumber bookingReference reference confirmationNumber status paymentStatus",
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Declare total for use by the surrounding module or function.
    const total = await Payment.countDocuments(query);
    // Return the result of res.json() to the caller.
    return res.json({ success: true, page, limit, total, payments });
  } catch (error) {
    // Return the result of next() to the caller.
    return next(error);
  }
};

// Declare getPaymentStats for use by the surrounding module or function.
export const getPaymentStats = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare stats for use by the surrounding module or function.
    const stats = await Payment.aggregate([
      { $match: mergeTenantFilter(req, {}) },
      { $project: { status: 1, amount: { $ifNull: ["$amount", 0] }, refundedAmount: { $ifNull: ["$refundedAmount", 0] } } },
      { $group: { _id: "$status", count: { $sum: 1 }, amount: { $sum: "$amount" }, netAmount: { $sum: { $max: [0, { $subtract: ["$amount", "$refundedAmount"] }] } } } },
    ]);
    // Return the result of res.json() to the caller.
    return res.json({ success: true, stats });
  } catch (error) {
    // Return the result of next() to the caller.
    return next(error);
  }
};

// Declare updatePaymentStatus for use by the surrounding module or function.
export const updatePaymentStatus = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare payment for use by the surrounding module or function.
    const payment = await Payment.findOne(mergeTenantFilter(req, { _id: req.params.id }));
    // Check the condition (!payment) and run the matching branch.
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });

    // Declare nextStatus for use by the surrounding module or function.
    const nextStatus = String(req.body?.status || "").trim().toLowerCase();
    // Declare allowedStatuses for use by the surrounding module or function.
    const allowedStatuses = ["pending", "processing", "completed", "failed", "cancelled", "refunded"];
    // Check the condition (!allowedStatuses.includes(nextStatus)) and run the matching branch.
    if (!allowedStatuses.includes(nextStatus)) return res.status(400).json({ success: false, message: "Invalid payment status" });

    // Check the condition (nextStatus === "completed") and run the matching branch.
    if (nextStatus === "completed") {
      // Declare booking for use by the surrounding module or function.
      const booking = await Booking.findOne(mergeTenantFilter(req, { _id: payment.booking }));
      // Check the condition (!booking) and run the matching branch.
      if (!booking) return res.status(404).json({ success: false, message: "Booking not found for payment" });
      // Check the condition (!["BANK", "CASH"].includes(String(payment.provider || "").toUpperCase() and run the matching branch.
      if (!["BANK", "CASH"].includes(String(payment.provider || "").toUpperCase())) {
        // Return the result of res.status(409).json() to the caller.
        return res.status(409).json({ success: false, message: "Provider payments must be confirmed by their provider callback/verification flow." });
      }
      // Check the condition (payment.status === "completed") and run the matching branch.
      if (payment.status === "completed") return res.status(409).json({ success: false, message: "This manual payment has already been confirmed." });
      // Declare settings for use by the surrounding module or function.
      const settings = await getSystemSettings(req);
      // Declare confirmationReference for use by the surrounding module or function.
      const confirmationReference = String(req.body?.confirmationReference || req.body?.receiptNumber || "").trim().slice(0, 200);
      // Check the condition (String(payment.provider).toUpperCase() === "CASH" && settings.cashRece) and run the matching branch.
      if (String(payment.provider).toUpperCase() === "CASH" && settings.cashReceiptRequired === true && !confirmationReference) return res.status(400).json({ success: false, message: "A cash receipt number is required by this tenant." });
      // Declare result for use by the surrounding module or function.
      const result = await completeBookingPayment({
        payment,
        booking,
        paymentData: {
          amount: Number(payment.amount),
          paymentMethod: payment.paymentMethod || payment.method,
          transactionId: payment.transactionId || undefined,
          paymentReference: confirmationReference || payment.transactionReference || undefined,
        },
      });
      // Perform the side effect or state update expressed on the following line.
      result.payment.manualConfirmation = { confirmedBy: req.user?._id || null, confirmedAt: new Date(), amount: Number(payment.amount), currency: String(payment.currency || "KES").toUpperCase(), reference: confirmationReference, notes: String(req.body?.confirmationNotes || "").trim().slice(0, 1000) };
      // Perform the side effect or state update expressed on the following line.
      await result.payment.save();
      // Return the result of res.json() to the caller.
      return res.json({ success: true, payment: result.payment, booking: result.booking });
    }

    // Check the condition (nextStatus === "refunded") and run the matching branch.
    if (nextStatus === "refunded") {
      // Return the result of res.status(409).json() to the caller.
      return res.status(409).json({ success: false, message: "Use the refund workflow to refund a payment." });
    }

    // Perform the side effect or state update expressed on the following line.
    payment.status = nextStatus;
    // Check the condition (nextStatus === "failed") and run the matching branch.
    if (nextStatus === "failed") {
      // Perform the side effect or state update expressed on the following line.
      payment.failureReason = String(req.body?.failureReason || "Marked failed by authorized staff").slice(0, 500);
      // Perform the side effect or state update expressed on the following line.
      payment.failedAt = new Date();
    }
    // Perform the side effect or state update expressed on the following line.
    await payment.save();
    // Return the result of res.json() to the caller.
    return res.json({ success: true, payment });
  } catch (error) {
    // Return the result of next() to the caller.
    return next(error);
  }
};

// Declare getPayment for use by the surrounding module or function.
export const getPayment = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare payment for use by the surrounding module or function.
    const payment = await Payment.findOne(mergeTenantFilter(req, { _id: req.params.id }))
      .populate("customer")
      .populate("booking")
      .populate("hospitalityBooking");
    // Check the condition (!payment) and run the matching branch.
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });
    // Return the result of res.json() to the caller.
    return res.json({ success: true, payment });
  } catch (error) {
    // Return the result of next() to the caller.
    return next(error);
  }
};

// Declare submitMpesaRefund for use by the surrounding module or function.
const submitMpesaRefund = async ({ payment, booking, amount, phone }) => {
  // Declare refundAmount for use by the surrounding module or function.
  const refundAmount = Number(amount);
  // Declare refundedAmount for use by the surrounding module or function.
  const refundedAmount = Number(payment.refundedAmount || 0);
  // Declare refundableAmount for use by the surrounding module or function.
  const refundableAmount = Math.max(0, Number(payment.amount || 0) - refundedAmount);
  // Check the condition (!Number.isFinite(refundAmount) || refundAmount <= 0 || refundAmount > ) and run the matching branch.
  if (!Number.isFinite(refundAmount) || refundAmount <= 0 || refundAmount > refundableAmount) {
    // Stop the current operation by raising a new Error instance.
    throw new Error(`Invalid refund amount. Maximum refundable amount is ${refundableAmount}.`);
  }

  // Declare transactionId for use by the surrounding module or function.
  const transactionId = String(payment.mpesaReceiptNumber || payment.transactionId || "").trim();
  // Check the condition (!transactionId) and run the matching branch.
  if (!transactionId) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("Original M-Pesa transaction ID is missing; verify the payment before requesting a reversal.");
  }

  // Claim the refund atomically before calling Daraja. This closes the race where
  // two concurrent refund requests both observe a non-processing payment and
  // submit two provider reversals for the same funds.
  // Declare claimedPayment for use by the surrounding module or function.
  const claimedPayment = await Payment.findOneAndUpdate(
    {
      _id: payment._id,
      tenantId: payment.tenantId,
      status: "completed",
      refundStatus: { $in: ["none", "failed"] },
      $expr: {
        $lte: [
          { $add: [{ $ifNull: ["$refundedAmount", 0] }, refundAmount] },
          { $ifNull: ["$amount", 0] },
        ],
      },
    },
    {
      $set: {
        refundStatus: "processing",
        refundRequestedAmount: refundAmount,
        refundRequestedAt: new Date(),
      },
    },
    { new: true }
  );

  // Check the condition (!claimedPayment) and run the matching branch.
  if (!claimedPayment) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("A refund is already processing, or the payment is no longer refundable.");
  }

  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare refundResponse for use by the surrounding module or function.
    const refundResponse = await requestMpesaRefund({
      amount: refundAmount,
      phone,
      transactionId,
    });

    // Declare refundReference for use by the surrounding module or function.
    const refundReference = String(
      refundResponse.ConversationID ||
      refundResponse.OriginatorConversationID ||
      ""
    ).trim();
    // Check the condition (!refundReference) and run the matching branch.
    if (!refundReference) throw new Error("M-Pesa did not return a refund conversation reference.");

    // Perform the side effect or state update expressed on the following line.
    claimedPayment.refundReference = refundReference;
    // Perform the side effect or state update expressed on the following line.
    await claimedPayment.save();

    // Check the condition (booking) and run the matching branch.
    if (booking) {
      // Perform the side effect or state update expressed on the following line.
      booking.refundStatus = "processing";
      // Perform the side effect or state update expressed on the following line.
      await booking.save();
    }

    // Return the object assembled below to the caller.
    return { refundResponse, refundAmount, payment: claimedPayment };
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    await Payment.updateOne(
      { _id: claimedPayment._id, tenantId: claimedPayment.tenantId, refundStatus: "processing" },
      {
        $set: { refundStatus: "failed", refundRequestedAmount: 0 },
        $unset: { refundReference: "", refundRequestedAt: "" },
      }
    ).catch(() => undefined);
    // Stop the current operation by raising the value of error.
    throw error;
  }
};

// Declare refundPayment for use by the surrounding module or function.
export const refundPayment = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare payment for use by the surrounding module or function.
    const payment = await Payment.findOne(mergeTenantFilter(req, { _id: req.params.id })).populate("booking").populate("customer");
    // Check the condition (!payment) and run the matching branch.
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });
    // Check the condition (payment.status !== "completed") and run the matching branch.
    if (payment.status !== "completed") return res.status(400).json({ success: false, message: "Only completed payments can be refunded" });
    // Check the condition (String(payment.provider || "").toUpperCase() !== "MPESA") and run the matching branch.
    if (String(payment.provider || "").toUpperCase() !== "MPESA") {
      // Return the result of res.status(501).json() to the caller.
      return res.status(501).json({ success: false, message: "Automated refunds are not available for this payment method. Use the authorized reconciliation workflow." });
    }

    // Declare phone for use by the surrounding module or function.
    const phone = payment.phoneNumber || payment.phone || payment.customer?.phone;
    // Check the condition (!phone) and run the matching branch.
    if (!phone) return res.status(400).json({ success: false, message: "Customer phone number missing" });

    // Declare { refundResponse, refundAmount, payment: updatedPayment } for use by the surrounding module or function.
    const { refundResponse, refundAmount, payment: updatedPayment } = await submitMpesaRefund({
      payment,
      booking: payment.booking,
      amount: req.body?.amount ?? (Number(payment.amount) - Number(payment.refundedAmount || 0)),
      phone,
    });

    // Return the result of res.json() to the caller.
    return res.json({ success: true, message: "Refund request submitted", refundResponse, refundAmount, payment: updatedPayment });
  } catch (error) {
    // Return the result of next() to the caller.
    return next(error);
  }
};

// Declare getPaymentAnalytics for use by the surrounding module or function.
export const getPaymentAnalytics = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare analytics for use by the surrounding module or function.
    const analytics = await Payment.aggregate([
      { $match: mergeTenantFilter(req, {}) },
      { $group: { _id: "$status", count: { $sum: 1 }, amount: { $sum: "$amount" } } },
      { $sort: { count: -1 } },
    ]);
    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({ success: true, analytics });
  } catch (error) {
    // Return the result of next() to the caller.
    return next(error);
  }
};

// Declare refundBooking for use by the surrounding module or function.
export const refundBooking = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare booking for use by the surrounding module or function.
    const booking = await Booking.findOne(mergeTenantFilter(req, { _id: req.params.id }));
    // Check the condition (!booking) and run the matching branch.
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    // Declare payment for use by the surrounding module or function.
    const payment = await Payment.findOne(mergeTenantFilter(req, { booking: booking._id, status: "completed" })).sort({ createdAt: -1 });
    // Check the condition (!payment) and run the matching branch.
    if (!payment) return res.status(404).json({ success: false, message: "No completed payment found for this booking" });

    // Declare phone for use by the surrounding module or function.
    const phone = payment.phoneNumber || payment.phone || booking.contact?.phone || booking.customerSnapshot?.phone;
    // Check the condition (!phone) and run the matching branch.
    if (!phone) return res.status(400).json({ success: false, message: "Customer phone number missing" });

    // Check the condition (String(payment.provider || "").toUpperCase() !== "MPESA") and run the matching branch.
    if (String(payment.provider || "").toUpperCase() !== "MPESA") {
      // Return the result of res.status(501).json() to the caller.
      return res.status(501).json({ success: false, message: "Automated refunds are not available for this payment method. Use the authorized reconciliation workflow." });
    }

    // Declare { refundResponse, refundAmount, payment: updatedPayment } for use by the surrounding module or function.
    const { refundResponse, refundAmount, payment: updatedPayment } = await submitMpesaRefund({
      payment,
      booking,
      amount: req.body?.amount ?? (Number(payment.amount) - Number(payment.refundedAmount || 0)),
      phone,
    });

    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({ success: true, message: "Refund request submitted", refundResponse, refundAmount, payment: updatedPayment, booking });
  } catch (error) {
    // Return the result of next() to the caller.
    return next(error);
  }
};

// Declare processRefund for use by the surrounding module or function.
export const processRefund = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare refund for use by the surrounding module or function.
    const refund = await Refund.findOne(mergeTenantFilter(req, { _id: req.params.id }));
    // Check the condition (!refund) and run the matching branch.
    if (!refund) return res.status(404).json({ success: false, message: "Refund not found" });

    // Declare status for use by the surrounding module or function.
    const status = String(req.body.status || "processing").trim().toLowerCase();
    // Declare allowedStatuses for use by the surrounding module or function.
    const allowedStatuses = ["requested", "approved", "processing", "completed", "rejected"];
    // Check the condition (!allowedStatuses.includes(status)) and run the matching branch.
    if (!allowedStatuses.includes(status)) return res.status(400).json({ success: false, message: "Invalid refund status" });

    // Perform the side effect or state update expressed on the following line.
    refund.status = status;
    // Check the condition (req.body.mpesaReference) and run the matching branch.
    if (req.body.mpesaReference) refund.mpesaReference = req.body.mpesaReference;
    // Check the condition (status === "completed") and run the matching branch.
    if (status === "completed") refund.processedAt = new Date();
    // Perform the side effect or state update expressed on the following line.
    await refund.save();

    // Check the condition (status === "completed" && refund.payment) and run the matching branch.
    if (status === "completed" && refund.payment) {
      // Declare payment for use by the surrounding module or function.
      const payment = await Payment.findOne(mergeTenantFilter(req, { _id: refund.payment }));
      // Check the condition (payment) and run the matching branch.
      if (payment) {
        // Perform the side effect or state update expressed on the following line.
        await refundBookingPayment({
          payment,
          refundAmount: Number(refund.amount || 0),
          refundData: {
            refundReference: refund.mpesaReference || `refund-${refund._id}`,
            refundStatus: "completed",
            refundResponse: { refundId: String(refund._id), refundRecord: true },
          },
        });
      }
    } else if (refund.booking) {
      // Declare booking for use by the surrounding module or function.
      const booking = await Booking.findOne(mergeTenantFilter(req, { _id: refund.booking }));
      // Check the condition (booking) and run the matching branch.
      if (booking) {
        // Perform the side effect or state update expressed on the following line.
        booking.refundStatus = status;
        // Perform the side effect or state update expressed on the following line.
        await booking.save();
      }
    }

    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({ success: true, message: "Refund updated successfully", data: refund });
  } catch (error) {
    // Return the result of next() to the caller.
    return next(error);
  }
};
