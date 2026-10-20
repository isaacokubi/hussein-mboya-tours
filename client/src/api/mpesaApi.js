import api from "./axios";

// Ask the backend to validate and start an STK Push; this response only means a prompt was requested.
export const initiateMpesa = async (data) => {
  const response = await api.post("/mpesa/stkpush", data);
  return response.data;
};

// Read the payment state already persisted by the server; this endpoint is suitable for lightweight polling.
export const checkPaymentStatus = async (checkoutRequestId) => {
  const response = await api.get(`/mpesa/status/${checkoutRequestId}`);
  return response.data;
};

// Ask the server to reconcile an uncertain request with Daraja after an explicit user action.
// It is not used for every poll, to avoid unnecessary provider calls.
export const queryPaymentStatus = async (checkoutRequestId) => {
  const response = await api.get(`/mpesa/query/${checkoutRequestId}`);
  return response.data;
};

// Verify the latest persisted payment against a booking without trusting browser-side totals.
export const verifyPayment = async (bookingId) => {
  const response = await api.get(`/mpesa/verify/${bookingId}`);
  return response.data;
};

export default api;
