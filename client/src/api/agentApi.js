/**
 * Purpose: agent Api client application module. Main declarations: fetchAgentDashboard, fetchAgentBookings, fetchAgentQuotes, fetchAgentCustomers, fetchAgentCommission.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import api from "./axios";

/*
|--------------------------------------------------------------------------
| AGENT DASHBOARD
|--------------------------------------------------------------------------
*/

// Declare fetchAgentDashboard for use by the surrounding module or function.
export const fetchAgentDashboard = async () => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get(
    "/agent/dashboard"
  );

  // Return the value of data to the caller.
  return data;
};

/*
|--------------------------------------------------------------------------
| AGENT BOOKINGS
|--------------------------------------------------------------------------
*/

// Declare fetchAgentBookings for use by the surrounding module or function.
export const fetchAgentBookings = async (params = {}) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get(
    "/agent/bookings",
    {
      params,
    }
  );

  // Return the value of data to the caller.
  return data;
};

/*
|--------------------------------------------------------------------------
| AGENT QUOTATIONS
|--------------------------------------------------------------------------
*/

// Declare fetchAgentQuotes for use by the surrounding module or function.
export const fetchAgentQuotes = async () => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get(
    "/agent/quotes"
  );

  // Return the value of data to the caller.
  return data;
};

/*
|--------------------------------------------------------------------------
| AGENT CUSTOMERS
|--------------------------------------------------------------------------
*/

// Declare fetchAgentCustomers for use by the surrounding module or function.
export const fetchAgentCustomers = async () => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get(
    "/agent/customers"
  );

  // Return the value of data to the caller.
  return data;
};

/*
|--------------------------------------------------------------------------
| AGENT COMMISSION
|--------------------------------------------------------------------------
*/

// Declare fetchAgentCommission for use by the surrounding module or function.
export const fetchAgentCommission = async () => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get(
    "/agent/commission"
  );

  // Return the value of data to the caller.
  return data;
};
