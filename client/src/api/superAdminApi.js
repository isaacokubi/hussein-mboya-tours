/**
 * Purpose: super Admin Api client application module. Main declarations: getSuperAdminDashboard, getSuperAdminRevenue, getAuditLogs, getSecurityStatus, getDatabaseStatus.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import axios from "./axios";

// Canonical platform dashboard endpoint. Keep both exported names for
// compatibility, but never maintain two different dashboard data sources.
// Declare getSuperAdminDashboard for use by the surrounding module or function.
export const getSuperAdminDashboard = async () => {
  // Declare response for use by the surrounding module or function.
  const response = await axios.get("/superadmin/dashboard");
  // Return the data value to the caller.
  return response.data;
};

// Declare getSuperAdminDashboardMetrics for use by the surrounding module or function.
export const getSuperAdminDashboardMetrics = getSuperAdminDashboard;

// Declare getSuperAdminRevenue for use by the surrounding module or function.
export const getSuperAdminRevenue = async () => {
  // Declare response for use by the surrounding module or function.
  const response = await axios.get("/superadmin/revenue");
  // Return the data value to the caller.
  return response.data;
};

// Declare getAuditLogs for use by the surrounding module or function.
export const getAuditLogs = async (params = {}) =>
  (await axios.get("/superadmin/audit", { params })).data;

// Declare getSecurityStatus for use by the surrounding module or function.
export const getSecurityStatus = async () =>
  (await axios.get("/superadmin/security")).data;

// Declare getDatabaseStatus for use by the surrounding module or function.
export const getDatabaseStatus = async () =>
  (await axios.get("/superadmin/database")).data;

// Declare getSystemHealth for use by the surrounding module or function.
export const getSystemHealth = async () =>
  (await axios.get("/superadmin/system")).data;

// Declare getApiMonitor for use by the surrounding module or function.
export const getApiMonitor = async () =>
  (await axios.get("/superadmin/api-monitor")).data;

// Declare getSettings for use by the surrounding module or function.
export const getSettings = async () => {
  // Declare response for use by the surrounding module or function.
  const response = await axios.get("/superadmin/settings");
  // Return the data value to the caller.
  return response.data;
};

// Declare updateSettings for use by the surrounding module or function.
export const updateSettings = async (data) => {
  // Declare response for use by the surrounding module or function.
  const response = await axios.put("/superadmin/settings", data);
  // Return the data value to the caller.
  return response.data;
};

// Declare getSecurityEvents for use by the surrounding module or function.
export const getSecurityEvents = async () =>
  (await axios.get("/security/events")).data;

// Declare getRoles for use by the surrounding module or function.
export const getRoles = async () => {
  // Declare response for use by the surrounding module or function.
  const response = await axios.get("/superadmin/roles");
  // Return the expression shown below to the caller.
  return response.data.roles || response.data.data || [];
};

// Declare getRole for use by the surrounding module or function.
export const getRole = async (id) => {
  // Declare response for use by the surrounding module or function.
  const response = await axios.get(`/superadmin/roles/${id}`);
  // Return the expression shown below to the caller.
  return response.data.role || response.data.data || response.data;
};

// Declare getPermissions for use by the surrounding module or function.
export const getPermissions = async () => {
  // Declare response for use by the surrounding module or function.
  const response = await axios.get("/superadmin/roles/permissions/all");
  // Return the expression shown below to the caller.
  return response.data.permissions || response.data.data || [];
};

// Declare updateRolePermissions for use by the surrounding module or function.
export const updateRolePermissions = async (id, permissions) => {
  // Declare response for use by the surrounding module or function.
  const response = await axios.put(
    `/superadmin/roles/${id}/permissions`,
    { permissions },
  );

  // Return the data value to the caller.
  return response.data;
};
