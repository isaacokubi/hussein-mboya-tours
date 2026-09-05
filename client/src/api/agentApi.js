import api from "./axios";

export const fetchAgentDashboard = async () => {
  const { data } = await api.get("/agent/dashboard");
  return data;
};

export const fetchAgentBookings = async (params = {}) => {
  const { data } = await api.get("/agent/bookings", { params });
  return data;
};

export const fetchAgentQuotes = async () => {
  const { data } = await api.get("/agent/quotes");
  return data;
};

export const fetchAgentCustomers = async () => {
  const { data } = await api.get("/agent/customers");
  return data;
};

export const fetchAgentCommission = async () => {
  const { data } = await api.get("/agent/commission");
  return data;
};

export const fetchAgentWithdrawals = async () => {
  const { data } = await api.get("/agent-withdrawals/mine");
  return data;
};

export const requestAgentWithdrawal = async (payload) => {
  const { data } = await api.post("/agent-withdrawals", payload);
  return data;
};
