import api from "./axios";

export const requestPasswordReset = async ({ email }) => {
  const { data } = await api.post("/auth/password-reset/request", { email });
  return data;
};

export const resetPasswordWithCode = async (payload) => {
  const { data } = await api.post("/auth/password-reset/confirm", payload);
  return data;
};
