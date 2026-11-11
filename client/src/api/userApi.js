/**
 * Purpose: user Api client application module. Main declarations: getProfile.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import api from "./axios";

// Declare getProfile for use by the surrounding module or function.
export const getProfile = async () => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get("/users/profile");
  // Return the value of data to the caller.
  return data;
};

// Declare getAll for use by the surrounding module or function.
export const getAll = getProfile;
