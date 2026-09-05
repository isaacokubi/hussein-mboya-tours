import api from "./axios";

export const getCommissions = async () => {
  const { data } = await api.get("/commissions");
  return data?.data || [];
};

export const approveCommission = async (id) => {
  const { data } = await api.patch(`/commissions/${id}/approve`);
  return data;
};

export const payCommission = async (id, payload) => {
  const { data } = await api.post(`/commissions/${id}/pay`, payload);
  return data;
};

export const getAgentWithdrawals = async () => {
  const { data } = await api.get("/agent-withdrawals");
  return data?.data || [];
};

export const approveAgentWithdrawal = async (id) => {
  const { data } = await api.patch(`/agent-withdrawals/${id}/approve`);
  return data;
};

export const rejectAgentWithdrawal = async (id, reason) => {
  const { data } = await api.patch(`/agent-withdrawals/${id}/reject`, { reason });
  return data;
};

export const completeAgentWithdrawal = async (id, paymentReference = "") => {
  const { data } = await api.post(`/agent-withdrawals/${id}/complete`, {
    paymentReference,
    transactionId: paymentReference,
  });
  return data;
};
