# Client API module: `client/src/api/admin/adminPaymentApi.js`

**Source:** [client/src/api/admin/adminPaymentApi.js](../../../../client/src/api/admin/adminPaymentApi.js)

## Responsibility

This module is the client-side transport boundary for the admin payment feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- api from ../axios

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `getAdminPayments` (source line 75)

`async (params = {}) => {`

Calls: `GET /admin/payments`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.
### `getPaymentStats` (source line 81)

`async () => {`

Calls: `GET /admin/payments/stats`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getPaymentAnalytics` (source line 86)

`async (params = {}) => {`

Calls: `GET /admin/payments/analytics`. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.
### `updatePaymentStatus` (source line 91)

`async (id, payload) => {`

Calls: `PATCH /admin/payments/${…}`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `refundPayment` (source line 96)

`async (id) => {`

Calls: `PATCH /admin/payments/${…}/refund`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getPaymentReconciliation` (source line 101)

`async () => {`

Calls: `GET /admin/payments/reconciliation`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `exportPaymentsCSV` (source line 117)

`async (params = {}) => {`

Calls: `GET /admin/payments/export/csv`. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.
### `exportPaymentsPDF` (source line 122)

`async (params = {}) => {`

Calls: `GET /admin/payments/export/pdf`. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.

## Callers

- [`client/src/pages/admin/finance/Reconciliation.jsx`](../../../../client/src/pages/admin/finance/Reconciliation.jsx)
- [`client/src/pages/admin/payments/AdminPayments.jsx`](../../../../client/src/pages/admin/payments/AdminPayments.jsx)

## Runtime and failure behavior

An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.

## Source excerpt

```js
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

const mpesaCheckoutReference = (payment) => firstValue(
  payment?.checkoutRequestID,
  payment?.checkoutRequestId,
  payment?.merchantRequestID,
  payment?.merchantRequestId
);

const normalizePayment = (payment = {}) => {
  const booking = payment.booking && typeof payment.booking === "object" ? payment.booking : null;
  const hospitalityBooking = payment.hospitalityBooking && typeof payment.hospitalityBooking === "object"
    ? payment.hospitalityBooking
    : null;

  const bookingId = booking?._id || hospitalityBooking?._id || payment.booking || payment.hospitalityBooking;
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

  const receiptNumber = firstValue(
    payment.mpesaReceiptNumber,
    payment.mpesaReceipt,
    payment.receiptNumber,
    payment.transactionReference,
    payment.transactionId,
    payment.refundReference,
    mpesaCallbackReceipt(payment)
  );

  const paymentReference = firstValue(
    payment.transactionReference,
    payment.transactionId,
    payment.mpesaReceiptNumber,
    payment.refundReference,
    mpesaCheckoutReference(payment)
  );

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
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.
