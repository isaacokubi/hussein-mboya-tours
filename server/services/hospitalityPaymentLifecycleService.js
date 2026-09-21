import mongoose from "mongoose";
import Payment from "../models/Payment.js";
import HotelBooking from "../models/HotelBooking.js";
import AirportTransferBooking from "../models/AirportTransferBooking.js";
import Notification from "../models/Notification.js";
import { postPaymentToLedger } from "./operationalAccountingService.js";
import { syncHospitalityInvoicePayments } from "./hospitalityInvoiceService.js";

const MODELS = { hotel: HotelBooking, airport_transfer: AirportTransferBooking };

export const getHospitalityModel = (type) =>
  MODELS[String(type || "").trim().toLowerCase()] || null;

export const getHospitalityPayableAmount = async (booking, { session = null } = {}) => {
  const total = Number(booking?.totalAmount || 0);
  if (!Number.isFinite(total) || total <= 0) throw new Error("Booking has an invalid total amount.");

  const query = Payment.aggregate([
    { $match: { tenantId: booking.tenantId, hospitalityBooking: booking._id, hospitalityType: { $in: ["hotel", "airport_transfer"] }, status: { $in: ["completed", "refunded"] } } },
    { $project: { net: { $max: [0, { $subtract: ["$amount", { $ifNull: ["$refundedAmount", 0] }] }] } } },
    { $group: { _id: null, total: { $sum: "$net" } } },
  ]);
  if (session) query.session(session);
  const [paid] = await query;
  return Math.max(0, Math.round((total - Number(paid?.total || 0)) * 100) / 100);
};

export const syncHospitalityPaymentStatus = async ({ type, booking, payment, session = null }) => {
  const paymentQuery = Payment.find({
    tenantId: booking.tenantId,
    hospitalityBooking: booking._id,
    hospitalityType: type,
    status: { $in: ["completed", "refunded"] },
  });
  if (session) paymentQuery.session(session);
  const payments = await paymentQuery.select("amount refundedAmount").lean();

  const paid = payments.reduce((sum, item) => sum + Math.max(0, Number(item.amount || 0) - Number(item.refundedAmount || 0)), 0);
  const total = Number(booking.totalAmount || 0);
  booking.paymentStatus = paid >= total && total > 0 ? "paid" : paid > 0 ? "partial" : payment?.status === "failed" ? "failed" : "pending";
  if (booking.paymentStatus === "paid" && booking.status === "pending") booking.status = "confirmed";
  await booking.save(session ? { session } : undefined);

  const invoice = await syncHospitalityInvoicePayments({ type, booking, session });
  return { booking, invoice, paidAmount: paid, balance: Math.max(0, total - paid) };
};

export const completeHospitalityPayment = async ({ payment, booking, paymentData = {} }) => {
  if (!payment || !booking) throw new Error("Payment and hospitality booking are required.");

  const session = await mongoose.startSession();
  let result;
  try {
    await session.withTransaction(async () => {
      const paymentDoc = await Payment.findOne({ _id: payment._id, tenantId: payment.tenantId, hospitalityBooking: booking._id }).session(session);
      if (!paymentDoc) throw new Error("Payment not found.");

      const Model = getHospitalityModel(paymentDoc.hospitalityType);
      if (!Model) throw new Error("Invalid hospitality booking type.");
      const bookingDoc = await Model.findOne({ _id: booking._id, tenantId: paymentDoc.tenantId }).session(session);
      if (!bookingDoc) throw new Error("Hospitality booking not found.");

      if (paymentDoc.status === "completed") {
        result = { payment: paymentDoc, ...(await syncHospitalityPaymentStatus({ type: paymentDoc.hospitalityType, booking: bookingDoc, payment: paymentDoc, session })) };
        return;
      }

      const amount = Number(paymentData.amount ?? paymentDoc.amount ?? 0);
      if (!Number.isFinite(amount) || amount <= 0) throw new Error("Completed payment has an invalid amount.");

      const priorQuery = Payment.aggregate([
        { $match: { tenantId: bookingDoc.tenantId, hospitalityBooking: bookingDoc._id, hospitalityType: paymentDoc.hospitalityType, status: { $in: ["completed", "refunded"] }, _id: { $ne: paymentDoc._id } } },
        { $project: { net: { $max: [0, { $subtract: ["$amount", { $ifNull: ["$refundedAmount", 0] }] }] } } },
        { $group: { _id: null, total: { $sum: "$net" } } },
      ]);
      priorQuery.session(session);
      const [prior] = await priorQuery;

      const total = Number(bookingDoc.totalAmount || 0);
      const remaining = Math.max(0, total - Number(prior?.total || 0));
      if (amount > remaining) throw new Error("Payment amount " + amount + " exceeds remaining balance " + remaining + ".");

      paymentDoc.status = "completed";
      paymentDoc.amount = amount;
      paymentDoc.paidAt = paymentDoc.paidAt || new Date();
      if (paymentData.paymentMethod) paymentDoc.paymentMethod = paymentData.paymentMethod;
      if (paymentData.phoneNumber) paymentDoc.phoneNumber = String(paymentData.phoneNumber).trim();
      if (paymentData.mpesaReceiptNumber) {
        paymentDoc.mpesaReceiptNumber = String(paymentData.mpesaReceiptNumber).trim();
        paymentDoc.transactionId = paymentDoc.mpesaReceiptNumber;
        paymentDoc.transactionReference = paymentDoc.mpesaReceiptNumber;
      }
      if (paymentData.transactionId) paymentDoc.transactionId = String(paymentData.transactionId).trim();
      if (paymentData.paymentReference) paymentDoc.transactionReference = String(paymentData.paymentReference).trim();
      if (paymentData.checkoutRequestID) paymentDoc.checkoutRequestID = paymentData.checkoutRequestID;
      if (paymentData.merchantRequestID) paymentDoc.merchantRequestID = paymentData.merchantRequestID;
      if (paymentData.transactionDate) paymentDoc.transactionDate = paymentData.transactionDate;
      if (paymentData.callbackResponse) paymentDoc.callbackResponse = paymentData.callbackResponse;

      await paymentDoc.save({ session });
      await postPaymentToLedger(paymentDoc, { session });

      const synced = await syncHospitalityPaymentStatus({ type: paymentDoc.hospitalityType, booking: bookingDoc, payment: paymentDoc, session });

      if (bookingDoc.user) {
        const label = paymentDoc.hospitalityType === "hotel" ? "Hotel reservation" : "Airport transfer";
        await Notification.create([{
          tenantId: bookingDoc.tenantId,
          recipient: bookingDoc.user,
          user: bookingDoc.user,
          title: label + " payment received",
          message: label + " " + bookingDoc.reference + " received KES " + amount.toLocaleString() + " via " + (paymentDoc.paymentMethod || paymentDoc.provider) + ".",
          type: "booking",
        }], { session });
      }

      result = { payment: paymentDoc, ...synced };
    });
    return result;
  } finally {
    await session.endSession();
  }
};

export const failHospitalityPayment = async ({ payment, booking, reason = "Payment failed.", paymentData = {} }) => {
  if (!payment) throw new Error("Payment is required.");

  const session = await mongoose.startSession();
  let result;
  try {
    await session.withTransaction(async () => {
      const paymentDoc = await Payment.findOne({ _id: payment._id, tenantId: payment.tenantId }).session(session);
      if (!paymentDoc) throw new Error("Payment not found.");

      paymentDoc.status = "failed";
      paymentDoc.failureReason = String(reason).slice(0, 500);
      paymentDoc.failedAt = new Date();
      if (paymentData.checkoutRequestID) paymentDoc.checkoutRequestID = paymentData.checkoutRequestID;
      if (paymentData.callbackResponse) paymentDoc.callbackResponse = paymentData.callbackResponse;
      await paymentDoc.save({ session });

      let bookingDoc = null;
      if (booking) {
        const Model = getHospitalityModel(paymentDoc.hospitalityType);
        bookingDoc = Model ? await Model.findOne({ _id: booking._id, tenantId: paymentDoc.tenantId }).session(session) : null;
        if (!bookingDoc) throw new Error("Hospitality booking not found.");
        bookingDoc.paymentStatus = "failed";
        await bookingDoc.save({ session });
        await syncHospitalityInvoicePayments({ type: paymentDoc.hospitalityType, booking: bookingDoc, session });
      }
      result = { payment: paymentDoc, booking: bookingDoc };
    });
    return result;
  } finally {
    await session.endSession();
  }
};

export const assertHospitalityPaymentAccess = (booking, user) => {
  if (!booking || !user?._id) return false;
  const role = String(user.role || user.legacyRole || "").toLowerCase();
  const staff = ["admin", "super_admin", "superadmin", "manager", "tour_manager", "tourmanager", "agent"].includes(role);
  return staff || String(booking.user || "") === String(user._id) || String(booking.customer || "") === String(user._id);
};
