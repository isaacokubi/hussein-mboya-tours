/**
 * Purpose: hospitality Payment Lifecycle Service business-logic service. Main declarations: getHospitalityModel, getHospitalityPayableAmount, syncHospitalityPaymentStatus, completeHospitalityPayment, failHospitalityPayment.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../models/Payment.js so this module can use its exported dependencies.
import Payment from "../models/Payment.js";
// Load ../models/HotelBooking.js so this module can use its exported dependencies.
import HotelBooking from "../models/HotelBooking.js";
// Load ../models/AirportTransferBooking.js so this module can use its exported dependencies.
import AirportTransferBooking from "../models/AirportTransferBooking.js";
// Load ../models/Notification.js so this module can use its exported dependencies.
import Notification from "../models/Notification.js";
// Load ./operationalAccountingService.js so this module can use its exported dependencies.
import { postPaymentToLedger } from "./operationalAccountingService.js";
// Load ./hospitalityInvoiceService.js so this module can use its exported dependencies.
import { syncHospitalityInvoicePayments } from "./hospitalityInvoiceService.js";

// Declare MODELS for use by the surrounding module or function.
const MODELS = { hotel: HotelBooking, airport_transfer: AirportTransferBooking };

// Declare getHospitalityModel for use by the surrounding module or function.
export const getHospitalityModel = (type) =>
  MODELS[String(type || "").trim().toLowerCase()] || null;

// Declare getHospitalityPayableAmount for use by the surrounding module or function.
export const getHospitalityPayableAmount = async (booking, { session = null } = {}) => {
  // Declare total for use by the surrounding module or function.
  const total = Number(booking?.totalAmount || 0);
  // Check the condition (!Number.isFinite(total) || total <= 0) and run the matching branch.
  if (!Number.isFinite(total) || total <= 0) throw new Error("Booking has an invalid total amount.");

  // Declare query for use by the surrounding module or function.
  const query = Payment.aggregate([
    { $match: { tenantId: booking.tenantId, hospitalityBooking: booking._id, hospitalityType: { $in: ["hotel", "airport_transfer"] }, status: { $in: ["completed", "refunded"] } } },
    { $project: { net: { $max: [0, { $subtract: ["$amount", { $ifNull: ["$refundedAmount", 0] }] }] } } },
    { $group: { _id: null, total: { $sum: "$net" } } },
  ]);
  // Check the condition (session) and run the matching branch.
  if (session) query.session(session);
  // Declare [paid] for use by the surrounding module or function.
  const [paid] = await query;
  // Return the result of Math.max() to the caller.
  return Math.max(0, Math.round((total - Number(paid?.total || 0)) * 100) / 100);
};

// Declare syncHospitalityPaymentStatus for use by the surrounding module or function.
export const syncHospitalityPaymentStatus = async ({ type, booking, payment, session = null }) => {
  // Declare paymentQuery for use by the surrounding module or function.
  const paymentQuery = Payment.find({
    tenantId: booking.tenantId,
    hospitalityBooking: booking._id,
    hospitalityType: type,
    status: { $in: ["completed", "refunded"] },
  });
  // Check the condition (session) and run the matching branch.
  if (session) paymentQuery.session(session);
  // Declare payments for use by the surrounding module or function.
  const payments = await paymentQuery.select("amount refundedAmount").lean();

  // Declare paid for use by the surrounding module or function.
  const paid = payments.reduce((sum, item) => sum + Math.max(0, Number(item.amount || 0) - Number(item.refundedAmount || 0)), 0);
  // Declare total for use by the surrounding module or function.
  const total = Number(booking.totalAmount || 0);
  // Perform the side effect or state update expressed on the following line.
  booking.paymentStatus = paid >= total && total > 0 ? "paid" : paid > 0 ? "partial" : payment?.status === "failed" ? "failed" : "pending";
  // Check the condition (booking.paymentStatus === "paid" && booking.status === "pending") and run the matching branch.
  if (booking.paymentStatus === "paid" && booking.status === "pending") booking.status = "confirmed";
  // Perform the side effect or state update expressed on the following line.
  await booking.save(session ? { session } : undefined);

  // Declare invoice for use by the surrounding module or function.
  const invoice = await syncHospitalityInvoicePayments({ type, booking, session });
  // Return the object assembled below to the caller.
  return { booking, invoice, paidAmount: paid, balance: Math.max(0, total - paid) };
};

// Declare completeHospitalityPayment for use by the surrounding module or function.
export const completeHospitalityPayment = async ({ payment, booking, paymentData = {} }) => {
  // Check the condition (!payment || !booking) and run the matching branch.
  if (!payment || !booking) throw new Error("Payment and hospitality booking are required.");

  // Declare session for use by the surrounding module or function.
  const session = await mongoose.startSession();
  // Declare result for use by the surrounding module or function.
  let result;
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    await session.withTransaction(async () => {
      // Declare paymentDoc for use by the surrounding module or function.
      const paymentDoc = await Payment.findOne({ _id: payment._id, tenantId: payment.tenantId, hospitalityBooking: booking._id }).session(session);
      // Check the condition (!paymentDoc) and run the matching branch.
      if (!paymentDoc) throw new Error("Payment not found.");

      // Declare Model for use by the surrounding module or function.
      const Model = getHospitalityModel(paymentDoc.hospitalityType);
      // Check the condition (!Model) and run the matching branch.
      if (!Model) throw new Error("Invalid hospitality booking type.");
      // Declare bookingDoc for use by the surrounding module or function.
      const bookingDoc = await Model.findOne({ _id: booking._id, tenantId: paymentDoc.tenantId }).session(session);
      // Check the condition (!bookingDoc) and run the matching branch.
      if (!bookingDoc) throw new Error("Hospitality booking not found.");

      // Check the condition (paymentDoc.status === "completed") and run the matching branch.
      if (paymentDoc.status === "completed") {
        // Perform the side effect or state update expressed on the following line.
        result = { payment: paymentDoc, ...(await syncHospitalityPaymentStatus({ type: paymentDoc.hospitalityType, booking: bookingDoc, payment: paymentDoc, session })) };
        // Return the result to the caller.
        return;
      }

      // Declare amount for use by the surrounding module or function.
      const amount = Number(paymentData.amount ?? paymentDoc.amount ?? 0);
      // Check the condition (!Number.isFinite(amount) || amount <= 0) and run the matching branch.
      if (!Number.isFinite(amount) || amount <= 0) throw new Error("Completed payment has an invalid amount.");

      // Declare priorQuery for use by the surrounding module or function.
      const priorQuery = Payment.aggregate([
        { $match: { tenantId: bookingDoc.tenantId, hospitalityBooking: bookingDoc._id, hospitalityType: paymentDoc.hospitalityType, status: { $in: ["completed", "refunded"] }, _id: { $ne: paymentDoc._id } } },
        { $project: { net: { $max: [0, { $subtract: ["$amount", { $ifNull: ["$refundedAmount", 0] }] }] } } },
        { $group: { _id: null, total: { $sum: "$net" } } },
      ]);
      // Perform the side effect or state update expressed on the following line.
      priorQuery.session(session);
      // Declare [prior] for use by the surrounding module or function.
      const [prior] = await priorQuery;

      // Declare total for use by the surrounding module or function.
      const total = Number(bookingDoc.totalAmount || 0);
      // Declare remaining for use by the surrounding module or function.
      const remaining = Math.max(0, total - Number(prior?.total || 0));
      // Check the condition (amount > remaining) and run the matching branch.
      if (amount > remaining) throw new Error("Payment amount " + amount + " exceeds remaining balance " + remaining + ".");

      // Perform the side effect or state update expressed on the following line.
      paymentDoc.status = "completed";
      // Perform the side effect or state update expressed on the following line.
      paymentDoc.amount = amount;
      // Perform the side effect or state update expressed on the following line.
      paymentDoc.paidAt = paymentDoc.paidAt || new Date();
      // Check the condition (paymentData.paymentMethod) and run the matching branch.
      if (paymentData.paymentMethod) paymentDoc.paymentMethod = paymentData.paymentMethod;
      // Check the condition (paymentData.phoneNumber) and run the matching branch.
      if (paymentData.phoneNumber) paymentDoc.phoneNumber = String(paymentData.phoneNumber).trim();
      // Check the condition (paymentData.mpesaReceiptNumber) and run the matching branch.
      if (paymentData.mpesaReceiptNumber) {
        // Perform the side effect or state update expressed on the following line.
        paymentDoc.mpesaReceiptNumber = String(paymentData.mpesaReceiptNumber).trim();
        // Perform the side effect or state update expressed on the following line.
        paymentDoc.transactionId = paymentDoc.mpesaReceiptNumber;
        // Perform the side effect or state update expressed on the following line.
        paymentDoc.transactionReference = paymentDoc.mpesaReceiptNumber;
      }
      // Check the condition (paymentData.transactionId) and run the matching branch.
      if (paymentData.transactionId) paymentDoc.transactionId = String(paymentData.transactionId).trim();
      // Check the condition (paymentData.paymentReference) and run the matching branch.
      if (paymentData.paymentReference) paymentDoc.transactionReference = String(paymentData.paymentReference).trim();
      // Check the condition (paymentData.checkoutRequestID) and run the matching branch.
      if (paymentData.checkoutRequestID) paymentDoc.checkoutRequestID = paymentData.checkoutRequestID;
      // Check the condition (paymentData.merchantRequestID) and run the matching branch.
      if (paymentData.merchantRequestID) paymentDoc.merchantRequestID = paymentData.merchantRequestID;
      // Check the condition (paymentData.transactionDate) and run the matching branch.
      if (paymentData.transactionDate) paymentDoc.transactionDate = paymentData.transactionDate;
      // Check the condition (paymentData.callbackResponse) and run the matching branch.
      if (paymentData.callbackResponse) paymentDoc.callbackResponse = paymentData.callbackResponse;

      // Perform the side effect or state update expressed on the following line.
      await paymentDoc.save({ session });
      // Perform the side effect or state update expressed on the following line.
      await postPaymentToLedger(paymentDoc, { session });

      // Declare synced for use by the surrounding module or function.
      const synced = await syncHospitalityPaymentStatus({ type: paymentDoc.hospitalityType, booking: bookingDoc, payment: paymentDoc, session });

      // Check the condition (bookingDoc.user) and run the matching branch.
      if (bookingDoc.user) {
        // Declare label for use by the surrounding module or function.
        const label = paymentDoc.hospitalityType === "hotel" ? "Hotel reservation" : "Airport transfer";
        // Perform the side effect or state update expressed on the following line.
        await Notification.create([{
          tenantId: bookingDoc.tenantId,
          recipient: bookingDoc.user,
          user: bookingDoc.user,
          title: label + " payment received",
          message: label + " " + bookingDoc.reference + " received KES " + amount.toLocaleString() + " via " + (paymentDoc.paymentMethod || paymentDoc.provider) + ".",
          type: "booking",
        }], { session });
      }

      // Perform the side effect or state update expressed on the following line.
      result = { payment: paymentDoc, ...synced };
    });
    // Return the value of result to the caller.
    return result;
  } finally {
    // Perform the side effect or state update expressed on the following line.
    await session.endSession();
  }
};

// Declare failHospitalityPayment for use by the surrounding module or function.
export const failHospitalityPayment = async ({ payment, booking, reason = "Payment failed.", paymentData = {} }) => {
  // Check the condition (!payment) and run the matching branch.
  if (!payment) throw new Error("Payment is required.");

  // Declare session for use by the surrounding module or function.
  const session = await mongoose.startSession();
  // Declare result for use by the surrounding module or function.
  let result;
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    await session.withTransaction(async () => {
      // Declare paymentDoc for use by the surrounding module or function.
      const paymentDoc = await Payment.findOne({ _id: payment._id, tenantId: payment.tenantId }).session(session);
      // Check the condition (!paymentDoc) and run the matching branch.
      if (!paymentDoc) throw new Error("Payment not found.");

      // Perform the side effect or state update expressed on the following line.
      paymentDoc.status = "failed";
      // Perform the side effect or state update expressed on the following line.
      paymentDoc.failureReason = String(reason).slice(0, 500);
      // Perform the side effect or state update expressed on the following line.
      paymentDoc.failedAt = new Date();
      // Check the condition (paymentData.checkoutRequestID) and run the matching branch.
      if (paymentData.checkoutRequestID) paymentDoc.checkoutRequestID = paymentData.checkoutRequestID;
      // Check the condition (paymentData.callbackResponse) and run the matching branch.
      if (paymentData.callbackResponse) paymentDoc.callbackResponse = paymentData.callbackResponse;
      // Perform the side effect or state update expressed on the following line.
      await paymentDoc.save({ session });

      // Declare bookingDoc for use by the surrounding module or function.
      let bookingDoc = null;
      // Check the condition (booking) and run the matching branch.
      if (booking) {
        // Declare Model for use by the surrounding module or function.
        const Model = getHospitalityModel(paymentDoc.hospitalityType);
        // Perform the side effect or state update expressed on the following line.
        bookingDoc = Model ? await Model.findOne({ _id: booking._id, tenantId: paymentDoc.tenantId }).session(session) : null;
        // Check the condition (!bookingDoc) and run the matching branch.
        if (!bookingDoc) throw new Error("Hospitality booking not found.");
        // Perform the side effect or state update expressed on the following line.
        bookingDoc.paymentStatus = "failed";
        // Perform the side effect or state update expressed on the following line.
        await bookingDoc.save({ session });
        // Perform the side effect or state update expressed on the following line.
        await syncHospitalityInvoicePayments({ type: paymentDoc.hospitalityType, booking: bookingDoc, session });
      }
      // Perform the side effect or state update expressed on the following line.
      result = { payment: paymentDoc, booking: bookingDoc };
    });
    // Return the value of result to the caller.
    return result;
  } finally {
    // Perform the side effect or state update expressed on the following line.
    await session.endSession();
  }
};

// Declare assertHospitalityPaymentAccess for use by the surrounding module or function.
export const assertHospitalityPaymentAccess = (booking, user) => {
  // Check the condition (!booking || !user?._id) and run the matching branch.
  if (!booking || !user?._id) return false;
  // Declare role for use by the surrounding module or function.
  const role = String(user.role || user.legacyRole || "").toLowerCase();
  // Declare staff for use by the surrounding module or function.
  const staff = ["admin", "super_admin", "superadmin", "manager", "tour_manager", "tourmanager", "agent"].includes(role);
  // Return the expression shown below to the caller.
  return staff || String(booking.user || "") === String(user._id) || String(booking.customer || "") === String(user._id);
};
