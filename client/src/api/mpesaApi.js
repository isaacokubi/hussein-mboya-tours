import api from "./axios";

/*
|--------------------------------------------------------------------------
| AXIOS INSTANCE
|--------------------------------------------------------------------------
*/

const API = api;

/*
|--------------------------------------------------------------------------
| INITIATE MPESA STK PUSH
|--------------------------------------------------------------------------
*/

export const initiateMpesa = async (data) => {
  const response = await API.post(
    "/mpesa/stkpush",
    data
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| CHECK PAYMENT STATUS
|--------------------------------------------------------------------------
*/

export const checkPaymentStatus = async (
  checkoutRequestId
) => {
  const response = await API.get(
    `/mpesa/status/${checkoutRequestId}`
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| VERIFY PAYMENT
|--------------------------------------------------------------------------
*/

export const verifyPayment = async (
  bookingId
) => {
  const response = await API.get(
    `/mpesa/verify/${bookingId}`
  );

  return response.data;
};

export default API;