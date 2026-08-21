import {mergeTenantFilter} from "../tenancy/secureQuery.js";
import { getSystemSettings } from "../services/settingsService.js";
import Payment from "../models/Payment.js";
import Booking from "../models/Booking.js";
import { completeBookingPayment, getPayableBookingAmount, userOwnsBooking } from "../services/paymentLifecycleService.js";

/*
|--------------------------------------------------------------------------
| PAYMENT CONTROLLER
|--------------------------------------------------------------------------
| Payment model is defined only in:
| models/Payment.js
|
| This controller must contain controller functions only.
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| GET PAYMENT BY ID
|--------------------------------------------------------------------------
*/

export const getPaymentById = async (req, res, next) => {
  try {

    const settings = await getSystemSettings();

    const companyName =
      settings.companyName || "Company";

    const currency =
      settings.currency || "KES";

    const payment = await Payment.findById(req.params.id)
      .populate("booking")
      .populate("customer")
      .populate("user");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    return res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    return next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET PAYMENT BY BOOKING
|--------------------------------------------------------------------------
*/

export const getPaymentByBooking = async (req, res, next) => {
  try {
    const payment = await Payment.findOne(mergeTenantFilter(req,{
      booking: req.params.bookingId,
    })
      .sort({ createdAt: -1 })
      .populate("booking")
      .populate("customer")
      .populate("user");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found for this booking",
      });
    }

    return res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    return next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET PAYMENTS
|--------------------------------------------------------------------------
*/

export const getPayments = async (req, res, next) => {
  try {
    const {
      status,
      provider,
      method,
      booking,
      customer,
      user,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (provider) query.provider = provider;
    if (method) query.method = method;
    if (booking) query.booking = booking;
    if (customer) query.customer = customer;
    if (user) query.user = user;

    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.min(
      Math.max(Number(limit) || 20, 1),
      100
    );

    const skip = (pageNumber - 1) * limitNumber;

    const [payments, total] = await Promise.all([
      Payment.find(query)
        .populate("booking")
        .populate("customer")
        .populate("user")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber),

      Payment.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      payments,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        pages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    return next(error);
  }
};

/*
|--------------------------------------------------------------------------
| CREATE PAYMENT
|--------------------------------------------------------------------------
*/

export const createPayment = async (req, res, next) => {
  try {
    const { booking: bookingId, provider, method, paymentMethod, phone, phoneNumber, transactionReference, notes } = req.body || {};

    if (!bookingId || !provider || !method) {
      return res.status(400).json({ success: false, message: "Booking, provider and payment method are required" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    if (!userOwnsBooking(booking, req.user)) {
      return res.status(403).json({ success: false, message: "You do not have permission to create a payment for this booking" });
    }

    const amount = getPayableBookingAmount(booking);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ success: false, message: "No amount is due for this booking" });
    }

    // This generic endpoint can create only a pending payment intent.
    // Financial completion must happen through the provider/lifecycle flow.
    const payment = await Payment.create({
      user: req.user._id,
      customer: req.user._id,
      booking: booking._id,
      provider: String(provider).toUpperCase(),
      method,
      paymentMethod: paymentMethod || undefined,
      amount,
      currency: process.env.DEFAULT_CURRENCY || "KES",
      phone: String(phone || "").trim(),
      phoneNumber: String(phoneNumber || phone || "").trim(),
      transactionReference: String(transactionReference || "").trim(),
      notes: String(notes || "").trim().slice(0, 1000),
      status: "pending",
    });

    return res.status(201).json({ success: true, message: "Payment intent created successfully", payment });
  } catch (error) {
    return next(error);
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE PAYMENT STATUS
|--------------------------------------------------------------------------
*/

export const updatePaymentStatus = async (req, res, next) => {
  try {
    const status = String(req.body?.status || "").trim().toLowerCase();
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });

    if (status === "completed") {
      const booking = await Booking.findById(payment.booking);
      if (!booking) return res.status(404).json({ success: false, message: "Booking not found for payment" });
      if (!["BANK", "CASH"].includes(String(payment.provider || "").toUpperCase())) {
        return res.status(409).json({ success: false, message: "Provider payments must be completed by provider verification" });
      }
      const result = await completeBookingPayment({
        payment,
        booking,
        paymentData: { amount: Number(payment.amount), paymentMethod: payment.paymentMethod || payment.method },
      });
      return res.json({ success: true, payment: result.payment, booking: result.booking });
    }

    if (["refunded"].includes(status)) {
      return res.status(409).json({ success: false, message: "Use the refund workflow" });
    }

    if (!["pending", "processing", "failed", "cancelled"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid payment status" });
    }

    payment.status = status;
    if (status === "failed") {
      payment.failureReason = String(req.body?.failureReason || "Marked failed by authorized staff").slice(0, 500);
      payment.failedAt = new Date();
    }
    await payment.save();
    return res.status(200).json({ success: true, message: "Payment status updated successfully", payment });
  } catch (error) {
    return next(error);
  }
};

/*
|--------------------------------------------------------------------------
| MARK PAYMENT COMPLETED
|--------------------------------------------------------------------------
*/

export const markPaymentCompleted = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });
    const booking = await Booking.findById(payment.booking);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found for payment" });

    if (!["BANK", "CASH"].includes(String(payment.provider || "").toUpperCase())) {
      return res.status(409).json({ success: false, message: "Provider payments cannot be manually completed" });
    }

    const result = await completeBookingPayment({
      payment,
      booking,
      paymentData: {
        amount: Number(payment.amount),
        transactionId: req.body?.transactionId || payment.transactionId || undefined,
        paymentReference: req.body?.receiptNumber || payment.transactionReference || undefined,
        paymentMethod: payment.paymentMethod || payment.method,
      },
    });

    return res.status(200).json({ success: true, message: "Payment completed through financial lifecycle", payment: result.payment, booking: result.booking });
  } catch (error) {
    return next(error);
  }
};

/*
|--------------------------------------------------------------------------
| MARK PAYMENT FAILED
|--------------------------------------------------------------------------
*/

export const markPaymentFailed = async (req, res, next) => {
  try {
    const { reason = "" } = req.body;

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    payment.status = "failed";
    payment.failureReason = reason;

    await payment.save();

    return res.status(200).json({
      success: true,
      message: "Payment marked as failed",
      payment,
    });
  } catch (error) {
    return next(error);
  }
};

/*
|--------------------------------------------------------------------------
| REQUEST REFUND
|--------------------------------------------------------------------------
*/

export const requestRefund = async (req, res, next) => {
  try {
    const {
      amount,
      refundReference = "",
    } = req.body;

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    if (payment.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Only completed payments can be refunded",
      });
    }

    const refundAmount =
      amount === undefined
        ? payment.amount
        : Number(amount);

    if (
      !Number.isFinite(refundAmount) ||
      refundAmount <= 0 ||
      refundAmount > payment.amount
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid refund amount",
      });
    }

    payment.refundStatus = "requested";
    payment.refundRequestedAt = new Date();
    payment.refundReference = refundReference;
    payment.refundedAmount = refundAmount;

    await payment.save();

    return res.status(200).json({
      success: true,
      message: "Refund requested successfully",
      payment,
    });
  } catch (error) {
    return next(error);
  }
};

/*
|--------------------------------------------------------------------------
| EXPORT DEFAULT
|--------------------------------------------------------------------------
*/

export default {
  getPaymentById,
  getPaymentByBooking,
  getPayments,
  createPayment,
  updatePaymentStatus,
  markPaymentCompleted,
  markPaymentFailed,
  requestRefund,
};
