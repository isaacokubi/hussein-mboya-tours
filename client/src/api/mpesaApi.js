import axios from "axios";

/*
|--------------------------------------------------------------------------
| AXIOS INSTANCE
|--------------------------------------------------------------------------
*/

const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api",

  headers: {
    "Content-Type": "application/json",
  },

  timeout: 30000,
});

/*
|--------------------------------------------------------------------------
| REQUEST INTERCEPTOR
|--------------------------------------------------------------------------
*/

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/*
|--------------------------------------------------------------------------
| RESPONSE INTERCEPTOR
|--------------------------------------------------------------------------
*/

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Request failed";

    return Promise.reject(
      new Error(message)
    );
  }
);

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