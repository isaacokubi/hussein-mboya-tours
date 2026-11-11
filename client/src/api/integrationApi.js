/**
 * Purpose: integration Api client application module. Main declarations: listWebsiteIntegrations, createWebsiteIntegration, revokeWebsiteIntegration.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import api from "./axios";

// Declare listWebsiteIntegrations for use by the surrounding module or function.
export const listWebsiteIntegrations = async () => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get("/integrations/keys");
  // Return the value of data to the caller.
  return data;
};

// Declare createWebsiteIntegration for use by the surrounding module or function.
export const createWebsiteIntegration = async (payload) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.post("/integrations/keys", payload);
  // Return the value of data to the caller.
  return data;
};

// Declare revokeWebsiteIntegration for use by the surrounding module or function.
export const revokeWebsiteIntegration = async (id) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.delete(`/integrations/keys/${id}`);
  // Return the value of data to the caller.
  return data;
};