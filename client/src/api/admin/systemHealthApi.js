/**
 * Purpose: system Health Api client application module. Main declarations: getSystemHealth, getAll.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// client/src/api/admin/systemHealthApi.js

// Load ../axios so this module can use its exported dependencies.
import api from "../axios";

/*
 * SYSTEM HEALTH
 *
 * The backend mounts systemHealthRoutes at /api/system, so the canonical
 * authenticated health endpoint is /api/system/health. Axios already
 * provides the /api prefix in local and production environments.
 */
// Declare getSystemHealth for use by the surrounding module or function.
export const getSystemHealth = async () => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get("/system/health");
  // Return the value of data to the caller.
  return data;
};

// Backwards-compatible helper used by older consumers of this module.
// Declare getAll for use by the surrounding module or function.
export const getAll = async () => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get("/system/health");
  // Return the value of data to the caller.
  return data;
};
