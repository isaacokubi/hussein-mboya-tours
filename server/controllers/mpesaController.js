import {mergeTenantFilter} from "../tenancy/secureQuery.js";
// server/controllers/mpesaController.js

import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { initiateStkPush } from "../services/mpesaService.js";
import {
  failBookingPayment,
  completeBookingPayment,
  getPayableBookingAmount,
} from "../services/paymentLifecycleService.js";

const formatPhoneNumber = (phone) => {
  if (!phone) return "";
  let formatted = String(phone).trim();
  if (formatted.startsWith("+254")) formatted = formatted.slice(1);
  if (formatted.startsWith("0")) formatted = `254${formatted.slice(1)}`;
  if (formatted.startsWith("7") || formatted.startsWith("1")) formatted = `254${formatted}`;
  return formatted;
};

const isStaffRole = (user) => {
  const role = String(user?.roleId?.name || user?.role || user?.legacyRole || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]/g, "");
  return [
    "admin",
    "superadmin",
    "administrator",
    "manager",
    "tourmanager",
    "guide",
    "tourguide",
    "agent",
    "travelagent",
  ].includes(role);
};

const ownsBooking = (booking, user) =>
  Boolean(user?._id) &&
  (booking.user?.toString() === user._id.toString() ||
    booking.customer?.toString() === user._id.toString());

export const getMpesaToken = async (req, res) =>
  res.status(501).json({ success: false, message: "Direct M-Pesa token access is disabled." });

export const stkPush = async (req, res) => {
  try {
    const { phoneNumber, phone, bookingId } = req.body || {};
    const requestedAmount = Number(req.body?.amount);

    if (!bookingId || !(phoneNumber || phone)) {
      return res.status(400).json({ success: false, message: "Phone number and booking ID are required." });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    if (!isStaffRole(req.user) && !ownsBooking(booking, req.user)) {
      return res.status(403).json({ success: false, message: "You do not have permission to pay this booking." });
    }

    const payableAmount = Number(getPayableBookingAmount(booking));
    if (!Number.isFinite(payableAmount) || payableAmount <= 0) {
      return res.status(400).json({ success: false, message: "This booking has no outstanding balance." });
    }

    const paymentAmount = Number.isFinite(requestedAmount) && requestedAmount > 0
      ? requestedAmount
      : payableAmount;

    if (!Number.isInteger(paymentAmount) || paymentAmount < 1 || paymentAmount > payableAmount) {
      return res.status(400).json({
        success: false,
        message: `Payment amount must be a whole KES amount between 1 and ${Math.floor(payableAmount).toLocaleString()}.`,
        balance: payableAmount,
      });
    }

    const existingPayment = await Payment.findOne(mergeTenantFilter(req,{ booking: booking._id, status: "pending" });
    if (existingPayment) {
      return res.status(200).json({
        success: true,
        message: "A payment request is already waiting for confirmation.",
        data: {
          CheckoutRequestID: existingPayment.checkoutRequestID,
          checkoutRequestID: existingPayment.checkoutRequestID,
          amount: existingPayment.amount,
        },
      });
    }

    const customerPhone = formatPhoneNumber(
      phoneNumber || phone || booking?.contact?.phone || booking?.customerSnapshot?.phone || req.user?.phone
    );

    const response = await initiateStkPush({
      phone: customerPhone,
      amount: paymentAmount,
      bookingId: booking._id.toString(),
    });

    await Payment.create({
      booking: booking._id,
      user: booking.user || booking.customer || null,
      customer: booking.user || booking.customer || null,
      provider: "MPESA",
      method: "mpesa",
      paymentMethod: "MPESA",
      amount: paymentAmount,
      phoneNumber: customerPhone,
      merchantRequestID: response.MerchantRequestID,
      checkoutRequestID: response.CheckoutRequestID,
      status: "pending",
    });

    booking.paymentStatus = "pending";
    await booking.save();

    return res.status(200).json({
      success: true,
      message: `M-Pesa STK Push sent for KES ${paymentAmount.toLocaleString()}.`,
      data: { ...response, amount: paymentAmount },
    });
  } catch (error) {
    console.error("STK PUSH ERROR:", error);
    return res.status(500).json({ success: false, message: error.message || "M-Pesa STK Push failed" });
  }
};

export const mpesaCallback = async (req, res) => {
  try {
    const stkCallback = req.body?.Body?.stkCallback;
    if (!stkCallback) return res.json({ ResultCode: 0, ResultDesc: "Accepted" });

    const checkoutRequestID = stkCallback.CheckoutRequestID || stkCallback.checkoutRequestID || stkCallback.checkoutRequestId;
    if (!checkoutRequestID) return res.json({ ResultCode: 0, ResultDesc: "Accepted" });

    const payment = await Payment.findOne(mergeTenantFilter(req,{
      $or: [{ checkoutRequestID }, { checkoutRequestId: checkoutRequestID }],
    });
    if (!payment) return res.json({ ResultCode: 0, ResultDesc: "Accepted" });

    const booking = await Booking.findById(payment.booking);
    if (!booking) return res.json({ ResultCode: 0, ResultDesc: "Accepted" });

    if (["completed", "failed"].includes(String(payment.status).toLowerCase())) {
      return res.json({ ResultCode: 0, ResultDesc: "Already processed" });
    }

    const resultCode = Number(stkCallback.ResultCode);
    const resultDescription = stkCallback.ResultDesc || "M-Pesa payment failed.";

    if (resultCode !== 0) {
      await failBookingPayment({
        payment,
        booking,
        failureReason: resultDescription,
        paymentData: { checkoutRequestID, callbackResponse: stkCallback },
      });
      return res.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    const items = stkCallback.CallbackMetadata?.Item || [];
    const getValue = (name) => items.find((item) => item.Name === name)?.Value ?? null;
    const paidAmount = Number(getValue("Amount"));
    const expectedAmount = Number(payment.amount);
    const mpesaReceiptNumber = String(getValue("MpesaReceiptNumber") || "").trim();

    if (!Number.isFinite(paidAmount) || paidAmount <= 0) {
      await failBookingPayment({ payment, booking, failureReason: "M-Pesa callback did not contain a valid paid amount.", paymentData: { callbackResponse: stkCallback } });
      return res.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    if (Math.round(paidAmount) !== Math.round(expectedAmount)) {
      await failBookingPayment({
        payment,
        booking,
        failureReason: `M-Pesa amount mismatch. Expected ${expectedAmount}, received ${paidAmount}.`,
        paymentData: { amount: paidAmount, callbackResponse: stkCallback },
      });
      return res.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    if (!mpesaReceiptNumber) {
      await failBookingPayment({
        payment,
        booking,
        failureReason: "M-Pesa callback did not contain a receipt number.",
        paymentData: { amount: paidAmount, callbackResponse: stkCallback },
      });
      return res.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    const lifecycleResult = await completeBookingPayment({
      payment,
      booking,
      paymentData: {
        amount: paidAmount,
        phoneNumber: getValue("PhoneNumber") || payment.phoneNumber || "",
        mpesaReceiptNumber,
        merchantRequestID: stkCallback.MerchantRequestID || stkCallback.merchantRequestID || payment.merchantRequestID || "",
        checkoutRequestID,
        transactionDate: getValue("TransactionDate"),
        paymentMethod: "MPESA",
        callbackResponse: stkCallback,
      },
    });

    try {
      const managers = await User.find(mergeTenantFilter(req,{
        $or: [
          { role: { $in: ["admin", "superadmin", "super_admin", "manager", "tour_manager", "tourmanager"] } },
          { legacyRole: { $in: ["admin", "superadmin", "super_admin", "manager", "tour_manager", "tourmanager"] } },
        ],
      }).select("_id");
      if (managers.length) {
        await Notification.insertMany(managers.map((manager) => ({
          recipient: manager._id,
          user: manager._id,
          title: lifecycleResult?.booking?.paymentStatus === "paid" ? "Booking Fully Paid" : "Booking Payment Received",
          message: `Booking ${booking.bookingNumber || booking._id} received a payment of KES ${paidAmount.toLocaleString()}.`,
          type: "booking",
        })));
      }
    } catch (notificationError) {
      console.error("M-Pesa notification error:", notificationError.message);
    }

    return res.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (error) {
    console.error("MPESA CALLBACK ERROR:", error);
    return res.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }
};

export const checkTransactionStatus = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate("booking")
      .populate("user", "name email phone")
      .populate("customer", "name email phone");
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });
    return res.status(200).json({ success: true, payment });
  } catch (error) { next(error); }
};

export const getBookingPayments = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.bookingId || req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    if (!isStaffRole(req.user) && !ownsBooking(booking, req.user)) {
      return res.status(403).json({ success: false, message: "You do not have permission to view these payments." });
    }
    const payments = await Payment.find(mergeTenantFilter(req,{ booking: booking._id })
      .populate("user", "name email phone")
      .populate("customer", "name email phone")
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: payments.length, payments });
  } catch (error) { next(error); }
};

export const getAllPayments = async (req, res, next) => {
  try {
    const { status, provider, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (provider) filter.provider = provider;
    const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const safePage = Math.max(Number(page) || 1, 1);
    const payments = await Payment.find(filter)
      .populate("booking", "bookingNumber status paymentStatus totalAmount amountPaid balanceAmount")
      .populate("user", "name email phone")
      .populate("customer", "name email phone")
      .sort({ createdAt: -1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit);
    const total = await Payment.countDocuments(filter);
    return res.status(200).json({ success: true, count: payments.length, pagination: { total, page: safePage, pages: Math.ceil(total / safeLimit) }, payments });
  } catch (error) { next(error); }
};

export const getPaymentByReceipt = async (req, res, next) => {
  try {
    const payment = await Payment.findOne(mergeTenantFilter(req,{ mpesaReceiptNumber: req.params.receipt })
      .populate("booking")
      .populate("user", "name email phone")
      .populate("customer", "name email phone");
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });
    return res.status(200).json({ success: true, payment });
  } catch (error) { next(error); }
};

export const handleRefundResult = async (req, res) => res.json({ ResultCode: 0, ResultDesc: "Accepted" });
export const handleRefundTimeout = async (req, res) => res.json({ ResultCode: 0, ResultDesc: "Accepted" });

export const checkCheckoutStatus = async (req, res, next) => {
  try {
    const checkoutRequestId = req.params.checkoutRequestId;
    const payment = await Payment.findOne(mergeTenantFilter(req,{
      $or: [{ checkoutRequestID: checkoutRequestId }, { checkoutRequestId }],
    }).populate("booking").lean();
    if (!payment) return res.status(404).json({ success: false, message: "Payment request not found" });
    return res.status(200).json({ success: true, data: { status: payment.status, failureReason: payment.failureReason || "", booking: payment.booking || null, payment } });
  } catch (error) { next(error); }
};

export const verifyBookingPayment = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.bookingId).lean();
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    const payment = await Payment.findOne(mergeTenantFilter(req,{ booking: booking._id }).sort({ createdAt: -1 }).lean();
    return res.status(200).json({ success: true, data: { booking, payment, paymentStatus: booking.paymentStatus } });
  } catch (error) { next(error); }
};
