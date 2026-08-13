import axios from "./axios";

export const getSuperAdminDashboard = async () => {
  const response = await axios.get("/superadmin/dashboard");
  return response.data;
};

export const getAuditLogs = async () =>
  (await axios.get("/superadmin/audit")).data;

export const getSecurityStatus = async () =>
  (await axios.get("/superadmin/security")).data;

export const getDatabaseStatus = async () =>
  (await axios.get("/superadmin/database")).data;

export const getSystemHealth = async () =>
  (await axios.get("/superadmin/system")).data;

export const getApiMonitor = async () =>
  (await axios.get("/superadmin/api-monitor")).data;
