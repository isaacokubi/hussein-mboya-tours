import api from "./axios";

export const getFinanceStats = async () => {
  const { data } = await api.get("/admin/finance");
  return data;
};

export const requestRefund = async (id, payload) => {
  const { data } = await api.post(`/admin/bookings/${id}/refund`, payload);
  return data;
};

export const processRefund = async (id, payload) => {
  const { data } = await api.put(`/admin/refunds/${id}/process`, payload);
  return data;
};

export const getReports = async (params = {}) => {
  const { data } = await api.get("/admin/finance/reports", { params });
  return data;
};

export const getMpesaTransactions = async (params = {}) => {
  const { data } = await api.get("/admin/finance/transactions", { params });
  return data;
};

export const getFinancialStatements = async (params = {}) => {
  const { data } = await api.get("/admin/finance/accounting/statements", { params });
  return data;
};

export const getArAging = async (params = {}) => {
  const { data } = await api.get("/admin/finance/accounting/ar-aging", { params });
  return data;
};

export const getApAging = async (params = {}) => {
  const { data } = await api.get("/admin/finance/accounting/ap-aging", { params });
  return data;
};

export const getCashFlow = async (params = {}) => {
  const { data } = await api.get("/admin/finance/accounting/cash-flow", { params });
  return data;
};

export const reconcileOperationalAccounting = async () => {
  const { data } = await api.post("/admin/finance/accounting/operational-reconciliation");
  return data;
};
