import axios from "./axios";

export const getSuperAdminDashboard = async () => {
  const response = await axios.get("/superadmin/dashboard");
  return response.data;
};

export const getAuditLogs = async (params = {}) =>
  (await axios.get("/superadmin/audit", { params })).data;

export const getSecurityStatus = async () =>
  (await axios.get("/superadmin/security")).data;

export const getDatabaseStatus = async () =>
  (await axios.get("/superadmin/database")).data;

export const getSystemHealth = async () =>
  (await axios.get("/superadmin/system")).data;

export const getApiMonitor = async () =>
  (await axios.get("/superadmin/api-monitor")).data;

// SuperAdmin settings are platform-scoped and must not call tenant-scoped
// /settings/public or /admin/settings endpoints.
export const getSettings = async () => {
  const response = await axios.get("/superadmin/settings");
  return response.data;
};

export const updateSettings = async (data) => {
  const response = await axios.put("/superadmin/settings", data);
  return response.data;
};

export const getSecurityEvents = async () =>
  (await axios.get("/security/events")).data;

// Keep the legacy role helpers aligned with the platform-scoped RBAC API.
export const getRoles = async () => {
  const response = await axios.get("/superadmin/roles");
  return response.data.roles || response.data.data || [];
};

export const getRole = async (id) => {
  const response = await axios.get(`/superadmin/roles/${id}`);
  return response.data.role || response.data.data || response.data;
};

export const getPermissions = async () => {
  const response = await axios.get("/superadmin/roles/permissions/all");
  return response.data.permissions || response.data.data || [];
};

export const updateRolePermissions = async (id, permissions) => {
  const response = await axios.put(
    `/superadmin/roles/${id}/permissions`,
    { permissions },
  );

  return response.data;
};
