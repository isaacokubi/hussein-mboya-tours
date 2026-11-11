/**
 * Purpose: mpesa Api client application module. Main declarations: initiateMpesa, checkPaymentStatus, verifyPayment.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import api from "./axios";

// Declare initiateMpesa for use by the surrounding module or function.
export const initiateMpesa = async (data) => {
  // Declare response for use by the surrounding module or function.
  const response = await api.post("/mpesa/stkpush", data);
  // Return the data value to the caller.
  return response.data;
};

// Declare checkPaymentStatus for use by the surrounding module or function.
export const checkPaymentStatus = async (checkoutRequestId) => {
  // Declare response for use by the surrounding module or function.
  const response = await api.get(`/mpesa/status/${checkoutRequestId}`);
  // Return the data value to the caller.
  return response.data;
};

// Declare verifyPayment for use by the surrounding module or function.
export const verifyPayment = async (bookingId) => {
  // Declare response for use by the surrounding module or function.
  const response = await api.get(`/mpesa/verify/${bookingId}`);
  // Return the data value to the caller.
  return response.data;
};

export default api;
