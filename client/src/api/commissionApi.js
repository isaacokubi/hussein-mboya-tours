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
