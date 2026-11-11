/**
 * Purpose: admin Payment Api client application module. Main declarations: clean, firstValue, mpesaCallbackReceipt, mpesaCheckoutReference, normalizePayment.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// client/src/api/admin/adminPaymentApi.js

// Load ../axios so this module can use its exported dependencies.
import api from "../axios";

// Declare clean for use by the surrounding module or function.
const clean = (value) => (value === null || value === undefined ? "" : String(value).trim());
// Declare firstValue for use by the surrounding module or function.
const firstValue = (...values) => values.map(clean).find(Boolean) || "";

// Declare mpesaCallbackReceipt for use by the surrounding module or function.
const mpesaCallbackReceipt = (payment) => {
  // Declare metadata for use by the surrounding module or function.
  const metadata = payment?.callbackResponse?.Body?.stkCallback?.CallbackMetadata?.Item
    || payment?.callbackResponse?.body?.stkCallback?.CallbackMetadata?.Item
    || payment?.callbackResponse?.CallbackMetadata?.Item
    || payment?.providerQueryResponse?.Body?.stkCallback?.CallbackMetadata?.Item
    || [];

  // Check the condition (!Array.isArray(metadata)) and run the matching branch.
  if (!Array.isArray(metadata)) return "";
  // Return the result of clean() to the caller.
  return clean(metadata.find((item) => String(item?.Name || "").toLowerCase() === "mpesareceiptnumber")?.Value);
};

// Declare mpesaCheckoutReference for use by the surrounding module or function.
const mpesaCheckoutReference = (payment) => firstValue(
  payment?.checkoutRequestID,
  payment?.checkoutRequestId,
  payment?.merchantRequestID,
  payment?.merchantRequestId
);

// Declare normalizePayment for use by the surrounding module or function.
const normalizePayment = (payment = {}) => {
  // Declare booking for use by the surrounding module or function.
  const booking = payment.booking && typeof payment.booking === "object" ? payment.booking : null;
  // Declare hospitalityBooking for use by the surrounding module or function.
  const hospitalityBooking = payment.hospitalityBooking && typeof payment.hospitalityBooking === "object"
    ? payment.hospitalityBooking
    : null;

  // Declare bookingId for use by the surrounding module or function.
  const bookingId = booking?._id || hospitalityBooking?._id || payment.booking || payment.hospitalityBooking;
  // Declare bookingNumber for use by the surrounding module or function.
  const bookingNumber = firstValue(
    booking?.bookingNumber,
    booking?.reference,
    hospitalityBooking?.bookingNumber,
    hospitalityBooking?.bookingReference,
    hospitalityBooking?.reference,
    hospitalityBooking?.confirmationNumber,
    payment.bookingNumber,
    payment.bookingReference,
    payment.hospitalityBookingNumber,
    payment.hospitalityBookingReference
  );

  // Declare receiptNumber for use by the surrounding module or function.
  const receiptNumber = firstValue(
    payment.mpesaReceiptNumber,
    payment.mpesaReceipt,
    payment.receiptNumber,
    payment.transactionReference,
    payment.transactionId,
    payment.refundReference,
    mpesaCallbackReceipt(payment)
  );

  // Declare paymentReference for use by the surrounding module or function.
  const paymentReference = firstValue(
    payment.transactionReference,
    payment.transactionId,
    payment.mpesaReceiptNumber,
    payment.refundReference,
    mpesaCheckoutReference(payment)
  );

  // Return the object assembled below to the caller.
  return {
    ...payment,
    bookingNumber,
    receiptNumber,
    bookingDisplay: bookingNumber || (bookingId ? `Booking ${String(bookingId).slice(-8).toUpperCase()}` : ""),
    receiptDisplay: receiptNumber || paymentReference,
    paymentReference,
    tourName: firstValue(booking?.tour?.title, booking?.tour?.name, payment.tourName),
  };
};

// Declare getAdminPayments for use by the surrounding module or function.
export const getAdminPayments = async (params = {}) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get("/admin/payments", { params });
  // Check the condition (!data || !Array.isArray(data.payments)) and run the matching branch.
  if (!data || !Array.isArray(data.payments)) return data;
  // Return the object assembled below to the caller.
  return { ...data, payments: data.payments.map(normalizePayment) };
};

// Declare getPaymentStats for use by the surrounding module or function.
export const getPaymentStats = async () => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get("/admin/payments/stats");
  // Return the value of data to the caller.
  return data;
};

// Declare getPaymentAnalytics for use by the surrounding module or function.
export const getPaymentAnalytics = async (params = {}) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get("/admin/payments/analytics", { params });
  // Return the value of data to the caller.
  return data;
};

// Declare updatePaymentStatus for use by the surrounding module or function.
export const updatePaymentStatus = async (id, payload) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.patch(`/admin/payments/${id}`, payload);
  // Return the value of data to the caller.
  return data;
};

// Declare refundPayment for use by the surrounding module or function.
export const refundPayment = async (id) => {
  // Declare res for use by the surrounding module or function.
  const res = await api.patch(`/admin/payments/${id}/refund`);
  // Return the data value to the caller.
  return res.data;
};

// Declare getPaymentReconciliation for use by the surrounding module or function.
export const getPaymentReconciliation = async () => {
  // Declare res for use by the surrounding module or function.
  const res = await api.get("/admin/payments/reconciliation");
  // Return the data value to the caller.
  return res.data;
};

// Declare downloadBlob for use by the surrounding module or function.
const downloadBlob = (blob, filename) => {
  // Declare url for use by the surrounding module or function.
  const url = window.URL.createObjectURL(blob);
  // Declare link for use by the surrounding module or function.
  const link = document.createElement("a");
  // Perform the side effect or state update expressed on the following line.
  link.href = url;
  // Perform the side effect or state update expressed on the following line.
  link.download = filename;
  // Perform the side effect or state update expressed on the following line.
  document.body.appendChild(link);
  // Perform the side effect or state update expressed on the following line.
  link.click();
  // Perform the side effect or state update expressed on the following line.
  link.remove();
  // Perform the side effect or state update expressed on the following line.
  window.URL.revokeObjectURL(url);
};

// Declare exportPaymentsCSV for use by the surrounding module or function.
export const exportPaymentsCSV = async (params = {}) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get("/admin/payments/export/csv", { params, responseType: "blob" });
  // Perform the side effect or state update expressed on the following line.
  downloadBlob(data, "payments-report.csv");
};

// Declare exportPaymentsPDF for use by the surrounding module or function.
export const exportPaymentsPDF = async (params = {}) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get("/admin/payments/export/pdf", { params, responseType: "blob" });
  // Perform the side effect or state update expressed on the following line.
  downloadBlob(data, "payments-report.pdf");
};
