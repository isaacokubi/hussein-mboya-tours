import api from "./axios";

export const getSuperAdminDashboard = async () => (await api.get("/superadmin/dashboard")).data;
export const getRoles = async () => (await api.get("/admin/roles")).data;
export const getSystemHealth = async () => (await api.get("/superadmin-tools/system")).data;
export const getAuditLogs = async () => (await api.get("/superadmin-tools/audit")).data;
export const getSecurity = async () => (await api.get("/superadmin-tools/security")).data;
export const getSettings = async () => (await api.get("/superadmin-tools/settings")).data;
export const getDatabaseStatus = async () => (await api.get("/superadmin-tools/database")).data;
export const getApiMonitor = async () => (await api.get("/superadmin-tools/api-monitor")).data;
