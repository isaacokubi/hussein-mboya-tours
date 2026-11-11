/**
 * Purpose: finance Api client application module. Main declarations: getFinanceStats, requestRefund, processRefund, getReports, getMpesaTransactions.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import api from "./axios";

// Declare getFinanceStats for use by the surrounding module or function.
export const getFinanceStats = async () => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get("/admin/finance");
  // Return the value of data to the caller.
  return data;
};

// Declare requestRefund for use by the surrounding module or function.
export const requestRefund = async (id, payload) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.post(`/admin/bookings/${id}/refund`, payload);
  // Return the value of data to the caller.
  return data;
};

// Declare processRefund for use by the surrounding module or function.
export const processRefund = async (id, payload) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.put(`/admin/refunds/${id}/process`, payload);
  // Return the value of data to the caller.
  return data;
};

// Declare getReports for use by the surrounding module or function.
export const getReports = async (params = {}) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get("/admin/finance/reports", { params });
  // Return the value of data to the caller.
  return data;
};

// Declare getMpesaTransactions for use by the surrounding module or function.
export const getMpesaTransactions = async (params = {}) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get("/admin/finance/transactions", { params });
  // Return the value of data to the caller.
  return data;
};

// Declare getFinancialStatements for use by the surrounding module or function.
export const getFinancialStatements = async (params = {}) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get("/admin/finance/accounting/statements", { params });
  // Return the value of data to the caller.
  return data;
};

// Declare getArAging for use by the surrounding module or function.
export const getArAging = async (params = {}) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get("/admin/finance/accounting/ar-aging", { params });
  // Return the value of data to the caller.
  return data;
};

// Declare getApAging for use by the surrounding module or function.
export const getApAging = async (params = {}) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get("/admin/finance/accounting/ap-aging", { params });
  // Return the value of data to the caller.
  return data;
};

// Declare getCashFlow for use by the surrounding module or function.
export const getCashFlow = async (params = {}) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get("/admin/finance/accounting/cash-flow", { params });
  // Return the value of data to the caller.
  return data;
};

// Declare reconcileOperationalAccounting for use by the surrounding module or function.
export const reconcileOperationalAccounting = async () => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.post("/admin/finance/accounting/operational-reconciliation");
  // Return the value of data to the caller.
  return data;
};
