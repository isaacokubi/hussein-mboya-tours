import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import Refund from "../models/Refund.js";
import Payment from "../models/Payment.js";
import {
  refundBookingPayment,
  completeBookingPayment,
} from "../services/paymentLifecycleService.js";
import Booking from "../models/Booking.js";
import RefundAudit from "../models/RefundAudit.js";
import { requestMpesaRefund } from "../services/mpesaRefundService.js";

export const getPayments = async (req, res, next) => {
  requireTenantId();
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const query = mergeTenantFilter(req, {});
    if (req.query.status) query.status = req.query.status;
    if (req.query.method) query.method = req.query.method;

    const payments = await Payment.find(query)
      .populate("customer", "name email phone")
      .populate({ path: "booking", select: "bookingNumber travelDate totalAmount status", populate: { path: "tour", select: "title" } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Payment.countDocuments(query);
    return res.json({ success: true, page, limit, total, payments });
  } catch (error) {
    return next(error);
  }
};

export const getPaymentStats = async (req, res, next) => {
  requireTenantId();
  try {
    const stats = await Payment.aggregate([
      { $match: mergeTenantFilter(req, {}) },
      { $group: { _id: "$status", count: { $sum: 1 }, amount: { $sum: "$amount" } } },
    ]);
    return res.json({ success: true, stats });
  } catch (error) {
    return next(error);
  }
};

export const updatePaymentStatus = async (req, res, next) => {
  requireTenantId();
  try {
    const payment = await Payment.findOne(mergeTenantFilter(req, { _id: req.params.id }));
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });

    const nextStatus = String(req.body?.status || "").trim().toLowerCase();
    const allowedStatuses = ["pending", "processing", "completed", "failed", "cancelled", "refunded"];
    if (!allowedStatuses.includes(nextStatus)) return res.status(400).json({ success: false, message: "Invalid payment status" });

    if (nextStatus === "completed") {
      const booking = await Booking.findOne(mergeTenantFilter(req, { _id: payment.booking }));
      if (!booking) return res.status(404).json({ success: false, message: "Booking not found for payment" });
      if (!["BANK", "CASH"].includes(String(payment.provider || "").toUpperCase())) {
        return res.status(409).json({ success: false, message: "Provider payments must be confirmed by their provider callback/verification flow." });
      }
      const result = await completeBookingPayment({
        payment,
        booking,
        paymentData: {
          amount: Number(payment.amount),
          paymentMethod: payment.paymentMethod || payment.method,
          transactionId: payment.transactionId || undefined,
          paymentReference: payment.transactionReference || undefined,
        },
      });
      return res.json({ success: true, payment: result.payment, booking: result.booking });
    }

    if (nextStatus === "refunded") {
      return res.status(409).json({ success: false, message: "Use the refund workflow to refund a payment." });
    }

    payment.status = nextStatus;
    if (nextStatus === "failed") {
      payment.failureReason = String(req.body?.failureReason || "Marked failed by authorized staff").slice(0, 500);
      payment.failedAt = new Date();
    }
    await payment.save();
    return res.json({ success: true, payment });
  } catch (error) {
    return next(error);
  }
};

export const getPayment = async (req, res, next) => {
  requireTenantId();
  try {
    const payment = await Payment.findOne(mergeTenantFilter(req, { _id: req.params.id }))
      .populate("customer")
      .populate("booking");
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });
    return res.json({ success: true, payment });
  } catch (error) {
    return next(error);
  }
};

const submitMpesaRefund = async ({ payment, booking, amount, phone }) => {
  const refundAmount = Number(amount);
  const refundedAmount = Number(payment.refundedAmount || 0);
  const refundableAmount = Math.max(0, Number(payment.amount || 0) - refundedAmount);
  if (!Number.isFinite(refundAmount) || refundAmount <= 0 || refundAmount > refundableAmount) {
    throw new Error(`Invalid refund amount. Maximum refundable amount is ${refundableAmount}.`);
  }

  if (payment.refundStatus === "processing") throw new Error("A refund is already processing for this payment.");

  const refundResponse = await requestMpesaRefund({
    amount: refundAmount,
    phone,
    transactionId: payment.mpesaReceiptNumber || payment.checkoutRequestID || payment._id,
  });

  const refundReference = String(refundResponse.ConversationID || refundResponse.OriginatorConversationID || "").trim();
  if (!refundReference) throw new Error("M-Pesa did not return a refund conversation reference.");

  payment.refundStatus = "processing";
  payment.refundReference = refundReference;
  payment.refundRequestedAmount = refundAmount;
  payment.refundRequestedAt = new Date();
  await payment.save();

  if (booking) {
    booking.refundStatus = "processing";
    await booking.save();
  }

  return { refundResponse, refundAmount };
};

export const refundPayment = async (req, res, next) => {
  requireTenantId();
  try {
    const payment = await Payment.findOne(mergeTenantFilter(req, { _id: req.params.id })).populate("booking").populate("customer");
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });
    if (payment.status !== "completed") return res.status(400).json({ success: false, message: "Only completed payments can be refunded" });

    const phone = payment.phoneNumber || payment.phone || payment.customer?.phone;
    if (!phone) return res.status(400).json({ success: false, message: "Customer phone number missing" });

    const { refundResponse, refundAmount } = await submitMpesaRefund({
      payment,
      booking: payment.booking,
      amount: req.body?.amount ?? (Number(payment.amount) - Number(payment.refundedAmount || 0)),
      phone,
    });

    return res.json({ success: true, message: "Refund request submitted", refundResponse, refundAmount, payment });
  } catch (error) {
    return next(error);
  }
};

export const getPaymentAnalytics = async (req, res, next) => {
  requireTenantId();
  try {
    const analytics = await Payment.aggregate([
      { $match: mergeTenantFilter(req, {}) },
      { $group: { _id: "$status", count: { $sum: 1 }, amount: { $sum: "$amount" } } },
      { $sort: { count: -1 } },
    ]);
    return res.status(200).json({ success: true, analytics });
  } catch (error) {
    return next(error);
  }
};

export const refundBooking = async (req, res, next) => {
  requireTenantId();
  try {
    const booking = await Booking.findOne(mergeTenantFilter(req, { _id: req.params.id }));
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    const payment = await Payment.findOne(mergeTenantFilter(req, { booking: booking._id, status: "completed" })).sort({ createdAt: -1 });
    if (!payment) return res.status(404).json({ success: false, message: "No completed payment found for this booking" });

    const phone = payment.phoneNumber || payment.phone || booking.contact?.phone || booking.customerSnapshot?.phone;
    if (!phone) return res.status(400).json({ success: false, message: "Customer phone number missing" });

    const { refundResponse, refundAmount } = await submitMpesaRefund({
      payment,
      booking,
      amount: req.body?.amount ?? (Number(payment.amount) - Number(payment.refundedAmount || 0)),
      phone,
    });

    // Do not mark the payment/booking refunded until M-Pesa confirms success.
    return res.status(200).json({ success: true, message: "Refund request submitted", refundResponse, refundAmount, payment, booking });
  } catch (error) {
    return next(error);
  }
};

export const processRefund = async (req, res, next) => {
  requireTenantId();
  try {
    const refund = await Refund.findOne(mergeTenantFilter(req, { _id: req.params.id }));
    if (!refund) return res.status(404).json({ success: false, message: "Refund not found" });

    const status = String(req.body.status || "processing").trim().toLowerCase();
    const allowedStatuses = ["requested", "approved", "processing", "completed", "rejected"];
    if (!allowedStatuses.includes(status)) return res.status(400).json({ success: false, message: "Invalid refund status" });

    refund.status = status;
    if (req.body.mpesaReference) refund.mpesaReference = req.body.mpesaReference;
    if (status === "completed") refund.processedAt = new Date();
    await refund.save();

    if (status === "completed" && refund.payment) {
      const payment = await Payment.findOne(mergeTenantFilter(req, { _id: refund.payment }));
      if (payment) {
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
      const booking = await Booking.findOne(mergeTenantFilter(req, { _id: refund.booking }));
      if (booking) {
        booking.refundStatus = status;
        await booking.save();
      }
    }

    return res.status(200).json({ success: true, message: "Refund updated successfully", data: refund });
  } catch (error) {
    return next(error);
  }
};
