import api from "./axios";

export const getSettings = async () => {
  const { data } = await api.get("/admin/settings");
  return data;
};

export const updateSettings = async (settings) => {
  const payload = new FormData();
  Object.entries(settings || {}).forEach(([key, value]) => {
    if (key === "logoFile" || value === undefined || value === null) return;
    if (Array.isArray(value)) payload.append(key, JSON.stringify(value));
    else payload.append(key, String(value));
  });
  if (settings?.logoFile) payload.append("logo", settings.logoFile);
  const { data } = await api.put("/admin/settings", payload);
  return data;
};

export const getPublicSettings = async () => {
  const { data } = await api.get("/settings/public");
  return data;
};
