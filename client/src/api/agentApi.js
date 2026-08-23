import api from "./axios";

/*
|--------------------------------------------------------------------------
| AGENT DASHBOARD
|--------------------------------------------------------------------------
*/

export const fetchAgentDashboard = async () => {
  const { data } = await api.get(
    "/agent/dashboard"
  );

  return data;
};

/*
|--------------------------------------------------------------------------
| AGENT BOOKINGS
|--------------------------------------------------------------------------
*/

export const fetchAgentBookings = async (params = {}) => {
  const { data } = await api.get(
    "/agent/bookings",
    {
      params,
    }
  );

  return data;
};

/*
|--------------------------------------------------------------------------
| AGENT QUOTATIONS
|--------------------------------------------------------------------------
*/

export const fetchAgentQuotes = async () => {
  const { data } = await api.get(
    "/agent/quotes"
  );

  return data;
};

/*
|--------------------------------------------------------------------------
| AGENT CUSTOMERS
|--------------------------------------------------------------------------
*/

export const fetchAgentCustomers = async () => {
  const { data } = await api.get(
    "/agent/customers"
  );

  return data;
};

/*
|--------------------------------------------------------------------------
| AGENT COMMISSION
|--------------------------------------------------------------------------
*/

export const fetchAgentCommission = async () => {
  const { data } = await api.get(
    "/agent/commission"
  );

  return data;
};
