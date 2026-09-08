import api from "./axios";

export const getSettings = async () => {
  const { data } = await api.get("/admin/settings");
  return data;
};

/**
 * The settings route is an Express JSON endpoint. The previous implementation
 * sent FormData even when no logo was being uploaded. Because the route has no
 * multipart parser, req.body was empty and the controller fell back to its
 * defaults, making admin edits appear to save while the values did not stick.
 */
export const updateSettings = async (settings = {}) => {
  const payload = { ...settings };
  delete payload.logoFile;

  if (typeof payload.seoKeywords === "string") {
    payload.seoKeywords = payload.seoKeywords
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
  }

  const { data } = await api.put("/admin/settings", payload, {
    headers: { "Content-Type": "application/json" },
  });
  return data;
};

export const getPublicSettings = async () => {
  const { data } = await api.get("/settings/public");
  return data;
};
