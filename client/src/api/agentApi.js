import axios from "axios";

/*
|--------------------------------------------------------------------------
| API INSTANCE
|--------------------------------------------------------------------------
*/

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",

  headers: {
    "Content-Type": "application/json",
  },
});

/*
|--------------------------------------------------------------------------
| ATTACH TOKEN
|--------------------------------------------------------------------------
*/

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  },
);

/*
|--------------------------------------------------------------------------
| AGENT DASHBOARD
|--------------------------------------------------------------------------
*/

export const fetchAgentDashboard = async () => {
  const response = await api.get("/agent/dashboard");

  return response.data;
};

/*
|--------------------------------------------------------------------------
| AGENT BOOKINGS
|--------------------------------------------------------------------------
*/

export const fetchAgentBookings = async () => {
  const response = await api.get("/agent/bookings");

  return response.data;
};

/*
|--------------------------------------------------------------------------
| AGENT QUOTATIONS
|--------------------------------------------------------------------------
*/

export const fetchAgentQuotes = async () => {
  const response = await api.get("/agent/quotes");

  return response.data;
};

/*
|--------------------------------------------------------------------------
| AGENT CUSTOMERS
|--------------------------------------------------------------------------
*/

export const fetchAgentCustomers = async () => {
  const response = await api.get("/agent/customers");

  return response.data;
};

/*
|--------------------------------------------------------------------------
| AGENT COMMISSION
|--------------------------------------------------------------------------
*/

export const fetchAgentCommission = async () => {
  const response = await api.get("/agent/commission");

  return response.data;
};
