// client/src/api/admin/systemHealthApi.js

import api from "../axios";

/*
 * SYSTEM HEALTH
 *
 * The backend mounts systemHealthRoutes at /api/system, so the canonical
 * authenticated health endpoint is /api/system/health. Axios already
 * provides the /api prefix in local and production environments.
 */
export const getSystemHealth = async () => {
  const { data } = await api.get("/system/health");
  return data;
};

// Backwards-compatible helper used by older consumers of this module.
export const getAll = async () => {
  const { data } = await api.get("/system/health");
  return data;
};
