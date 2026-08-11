import api from "./axios";

export const getSettings = async () => {
  const { data } = await api.get("/admin/settings");
  return data;
};

export const updateSettings = async (settings) => {
  const { data } = await api.put("/admin/settings", settings);
  return data;
};
