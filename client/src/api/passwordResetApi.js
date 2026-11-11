/**
 * Purpose: password Reset Api client application module. Main declarations: requestPasswordReset, resetPasswordWithCode.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import api from "./axios";

// Declare requestPasswordReset for use by the surrounding module or function.
export const requestPasswordReset = async ({ email }) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.post("/auth/password-reset/request", { email });
  // Return the value of data to the caller.
  return data;
};

// Declare resetPasswordWithCode for use by the surrounding module or function.
export const resetPasswordWithCode = async (payload) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.post("/auth/password-reset/confirm", payload);
  // Return the value of data to the caller.
  return data;
};
