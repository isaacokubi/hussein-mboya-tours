import { getSystemSettings } from "../services/settingsService.js";
import Payment from "../models/Payment.js";

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
    const payment = await Payment.findOne({
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
      booking,
      customer,
      user,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (provider) query.provider = provider;
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
    const {
      user,
      customer,
      booking,
      provider,
      method,
      paymentMethod,
      amount,
      currency,
      phone,
      phoneNumber,
      transactionId,
      transactionReference,
      invoiceNumber,
      notes,
    } = req.body;

    if (!booking) {
      return res.status(400).json({
        success: false,
        message: "Booking is required",
      });
    }

    if (amount === undefined || amount === null) {
      return res.status(400).json({
        success: false,
        message: "Payment amount is required",
      });
    }

    if (!provider) {
      return res.status(400).json({
        success: false,
        message: "Payment provider is required",
      });
    }

    if (!method) {
      return res.status(400).json({
        success: false,
        message: "Payment method is required",
      });
    }

    const payment = await Payment.create({
      user: user || null,
      customer: customer || null,
      booking,
      provider,
      method,
      paymentMethod: paymentMethod || undefined,
      amount: Number(amount),
      currency: currency || currency,
      phone: phone || "",
      phoneNumber: phoneNumber || phone || "",
      transactionId: transactionId || "",
      transactionReference: transactionReference || "",
      invoiceNumber: invoiceNumber || "",
      notes: notes || "",
    });

    return res.status(201).json({
      success: true,
      message: "Payment created successfully",
      payment,
    });
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
    const { status, failureReason } = req.body;

    const allowedStatuses = [
      "pending",
      "processing",
      "completed",
      "failed",
      "cancelled",
      "refunded",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status",
      });
    }

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    payment.status = status;

    if (status === "completed" && !payment.paidAt) {
      payment.paidAt = new Date();
    }

    if (status === "failed" && failureReason) {
      payment.failureReason = failureReason;
    }

    await payment.save();

    return res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      payment,
    });
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
    const {
      receiptNumber,
      transactionId = "",
    } = req.body;

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    payment.status = "completed";
    payment.mpesaReceiptNumber =
      receiptNumber || payment.mpesaReceiptNumber || "";
    payment.transactionId =
      transactionId || payment.transactionId || "";
    payment.paidAt = new Date();

    await payment.save();

    return res.status(200).json({
      success: true,
      message: "Payment marked as completed",
      payment,
    });
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
