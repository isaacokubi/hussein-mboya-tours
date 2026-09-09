import api from "./axios";

export const listWebsiteIntegrations = async () => {
  const { data } = await api.get("/integrations/keys");
  return data;
};

export const createWebsiteIntegration = async (payload) => {
  const { data } = await api.post("/integrations/keys", payload);
  return data;
};

export const revokeWebsiteIntegration = async (id) => {
  const { data } = await api.delete(`/integrations/keys/${id}`);
  return data;
};