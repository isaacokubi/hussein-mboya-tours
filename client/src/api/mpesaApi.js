import api from "./axios";

export const initiateMpesa = async (data) => {
  const response = await api.post("/mpesa/stkpush", data);
  return response.data;
};

export const checkPaymentStatus = async (checkoutRequestId) => {
  const response = await api.get(`/mpesa/status/${checkoutRequestId}`);
  return response.data;
};

export const verifyPayment = async (bookingId) => {
  const response = await api.get(`/mpesa/verify/${bookingId}`);
  return response.data;
};

export default api;
