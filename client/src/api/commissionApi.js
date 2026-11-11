/**
 * Purpose: commission Api client application module. Main declarations: getCommissions, approveCommission, payCommission.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import api from "./axios";

// Declare getCommissions for use by the surrounding module or function.
export const getCommissions = async () => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get("/commissions");
  // Return the expression shown below to the caller.
  return data?.data || [];
};

// Declare approveCommission for use by the surrounding module or function.
export const approveCommission = async (id) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.patch(`/commissions/${id}/approve`);
  // Return the value of data to the caller.
  return data;
};

// Declare payCommission for use by the surrounding module or function.
export const payCommission = async (id, payload) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.post(`/commissions/${id}/pay`, payload);
  // Return the value of data to the caller.
  return data;
};
