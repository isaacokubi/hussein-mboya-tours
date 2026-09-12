// client/src/api/admin/adminPaymentApi.js

import api from "../axios";

const clean = (value) => (value === null || value === undefined ? "" : String(value).trim());

const firstValue = (...values) => values.map(clean).find(Boolean) || "";

const mpesaCallbackReceipt = (payment) => {
  const metadata = payment?.callbackResponse?.Body?.stkCallback?.CallbackMetadata?.Item
    || payment?.callbackResponse?.body?.stkCallback?.CallbackMetadata?.Item
    || payment?.callbackResponse?.CallbackMetadata?.Item
    || payment?.providerQueryResponse?.Body?.stkCallback?.CallbackMetadata?.Item
    || [];

  if (!Array.isArray(metadata)) return "";
  return clean(metadata.find((item) => String(item?.Name || "").toLowerCase() === "mpesareceiptnumber")?.Value);
};

const normalizePayment = (payment = {}) => {
  const booking = payment.booking && typeof payment.booking === "object" ? payment.booking : null;
  const bookingNumber = firstValue(
    booking?.bookingNumber,
    booking?.reference,
    payment.bookingNumber,
    payment.bookingReference
  );
  const receiptNumber = firstValue(
    payment.mpesaReceiptNumber,
    payment.mpesaReceipt,
    payment.receiptNumber,
    payment.transactionReference,
    payment.transactionId,
    payment.refundReference,
    mpesaCallbackReceipt(payment)
  );

  return {
    ...payment,
    bookingNumber,
    receiptNumber,
    bookingDisplay: bookingNumber || (booking?._id ? `Booking ${String(booking._id).slice(-8).toUpperCase()}` : ""),
    receiptDisplay: receiptNumber,
    tourName: firstValue(booking?.tour?.title, booking?.tour?.name, payment.tourName),
    paymentReference: firstValue(payment.transactionReference, payment.transactionId, payment.mpesaReceiptNumber),
  };
};

/*
|--------------------------------------------------------------------------
| ADMIN PAYMENTS
|--------------------------------------------------------------------------
*/

export const getAdminPayments = async (params = {}) => {
  const { data } = await api.get("/admin/payments", { params });
  if (!data || !Array.isArray(data.payments)) return data;
  return { ...data, payments: data.payments.map(normalizePayment) };
};

export const getPaymentStats = async () => {
  const { data } = await api.get("/admin/payments/stats");
  return data;
};

export const getPaymentAnalytics = async (params = {}) => {
  const { data } = await api.get("/admin/payments/analytics", { params });
  return data;
};

export const updatePaymentStatus = async (id, payload) => {
  const { data } = await api.patch(`/admin/payments/${id}`, payload);
  return data;
};

export const refundPayment = async (id) => {
  const res = await api.patch(`/admin/payments/${id}/refund`);
  return res.data;
};

export const getPaymentReconciliation = async () => {
  const res = await api.get("/admin/payments/reconciliation");
  return res.data;
};

const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const exportPaymentsCSV = async (params = {}) => {
  const { data } = await api.get("/admin/payments/export/csv", { params, responseType: "blob" });
  downloadBlob(data, "payments-report.csv");
};

export const exportPaymentsPDF = async (params = {}) => {
  const { data } = await api.get("/admin/payments/export/pdf", { params, responseType: "blob" });
  downloadBlob(data, "payments-report.pdf");
};
