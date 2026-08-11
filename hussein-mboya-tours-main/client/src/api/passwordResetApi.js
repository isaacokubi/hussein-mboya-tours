import api from "./axios";

export const requestPasswordReset = async (phone) => {
  const { data } = await api.post("/auth/password-reset/request", { phone });
  return data;
};

export const resetPasswordWithCode = async (payload) => {
  const { data } = await api.post("/auth/password-reset/confirm", payload);
  return data;
};
