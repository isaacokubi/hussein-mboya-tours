/**
 * Purpose: settings Api client application module. Main declarations: getSettings, updateSettings, getPublicSettings.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import api from "./axios";

// Declare getSettings for use by the surrounding module or function.
export const getSettings = async () => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get("/admin/settings");
  // Return the value of data to the caller.
  return data;
};

/**
 * The settings route is an Express JSON endpoint. The previous implementation
 * sent FormData even when no logo was being uploaded. Because the route has no
 * multipart parser, req.body was empty and the controller fell back to its
 * defaults, making admin edits appear to save while the values did not stick.
 */
// Declare updateSettings for use by the surrounding module or function.
export const updateSettings = async (settings = {}) => {
  // Declare payload for use by the surrounding module or function.
  const payload = { ...settings };
  // Perform the side effect or state update expressed on the following line.
  delete payload.logoFile;

  // Check the condition (typeof payload.seoKeywords === "string") and run the matching branch.
  if (typeof payload.seoKeywords === "string") {
    // Perform the side effect or state update expressed on the following line.
    payload.seoKeywords = payload.seoKeywords
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
  }

  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.put("/admin/settings", payload, {
    headers: { "Content-Type": "application/json" },
  });
  // Return the value of data to the caller.
  return data;
};

// Declare getPublicSettings for use by the surrounding module or function.
export const getPublicSettings = async () => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get("/settings/public");
  // Return the value of data to the caller.
  return data;
};
