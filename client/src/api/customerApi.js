/**
 * Purpose: customer Api client application module. Main declarations: getAdminCustomers, getCustomerProfile, getAgentCustomers, getCustomers, getCustomerById.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import api from "./axios";

/*
 * Customer-management API contract.
 *
 * The server exposes customer management at /api/customers and Agent
 * customer access at /api/agent/customers. Keep this module aligned with
 * those canonical routes instead of retaining legacy /admin/customers and
 * /agents/customers paths that no longer exist.
 */

/**
 * Get customers available to an administrator.
 * GET /api/customers
 */
// Declare getAdminCustomers for use by the surrounding module or function.
export const getAdminCustomers = async (params = {}) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get("/customers", { params });
  // Return the value of data to the caller.
  return data;
};

/**
 * Get the customer-management profile for an administrator.
 * GET /api/customers/:id
 */
// Declare getCustomerProfile for use by the surrounding module or function.
export const getCustomerProfile = async (id) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get(`/customers/${id}`);
  // Return the value of data to the caller.
  return data;
};

/**
 * Get customers associated with the authenticated Agent.
 * GET /api/agent/customers
 */
// Declare getAgentCustomers for use by the surrounding module or function.
export const getAgentCustomers = async (params = {}) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get("/agent/customers", { params });
  // Return the value of data to the caller.
  return data;
};

/**
 * Generic customer-management alias used by existing admin screens.
 * GET /api/customers
 */
// Declare getCustomers for use by the surrounding module or function.
export const getCustomers = async (params = {}) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get("/customers", { params });
  // Return the value of data to the caller.
  return data;
};

/**
 * Get a single customer profile.
 * GET /api/customers/:id
 */
// Declare getCustomerById for use by the surrounding module or function.
export const getCustomerById = async (id) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get(`/customers/${id}`);
  // Return the value of data to the caller.
  return data;
};
