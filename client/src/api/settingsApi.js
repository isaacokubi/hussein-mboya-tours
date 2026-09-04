import api from "./axios";

export const getSettings = async () => {
  const { data } = await api.get("/admin/settings");
  return data;
};

export const updateSettings = async (settings = {}) => {
  const payload = { ...settings };
  const logoFile = payload.logoFile;
  delete payload.logoFile;

  if (typeof payload.seoKeywords === "string") {
    payload.seoKeywords = payload.seoKeywords
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
  }

  // The settings endpoint accepts JSON for normal edits and multipart/form-data
  // when a tenant uploads a logo. Keep the simple JSON path for normal saves.
  if (!logoFile) {
    const { data } = await api.put("/admin/settings", payload, {
      headers: { "Content-Type": "application/json" },
    });
    return data;
  }

  const form = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (typeof value === "object") form.append(key, JSON.stringify(value));
    else form.append(key, String(value));
  });
  form.append("logo", logoFile);

  const { data } = await api.put("/admin/settings", form);
  return data;
};

export const getPublicSettings = async () => {
  const { data } = await api.get("/settings/public");
  return data;
};
