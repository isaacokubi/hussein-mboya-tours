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
  (await axios.get("/system/health")).data;

export const getApiMonitor = async () =>
  (await axios.get("/superadmin/api-monitor")).data;


export const getSettings = async () => {
  const response = await axios.get("/settings/public");
  return response.data;
};


export const updateSettings = async (data) => {
  const response = await axios.put("/settings", data);
  return response.data;
};
