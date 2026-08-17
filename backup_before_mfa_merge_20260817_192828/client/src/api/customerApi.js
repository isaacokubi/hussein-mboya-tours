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
export const getAdminCustomers = async (params = {}) => {
  const { data } = await api.get("/customers", { params });
  return data;
};

/**
 * Get the customer-management profile for an administrator.
 * GET /api/customers/:id
 */
export const getCustomerProfile = async (id) => {
  const { data } = await api.get(`/customers/${id}`);
  return data;
};

/**
 * Get customers associated with the authenticated Agent.
 * GET /api/agent/customers
 */
export const getAgentCustomers = async (params = {}) => {
  const { data } = await api.get("/agent/customers", { params });
  return data;
};

/**
 * Generic customer-management alias used by existing admin screens.
 * GET /api/customers
 */
export const getCustomers = async (params = {}) => {
  const { data } = await api.get("/customers", { params });
  return data;
};

/**
 * Get a single customer profile.
 * GET /api/customers/:id
 */
export const getCustomerById = async (id) => {
  const { data } = await api.get(`/customers/${id}`);
  return data;
};
