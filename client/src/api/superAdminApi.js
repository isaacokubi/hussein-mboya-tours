import axios from "./axios";


export const getSuperAdminDashboard=async()=>{
const response = await axios.get("/superadmin/dashboard");
return response.data;
};


export const getAuditLogs=()=>{
return axios.get("/superadmin/audit");
};


export const getSecurityStatus=()=>{
return axios.get("/superadmin/security");
};


export const getDatabaseStatus=()=>{
return axios.get("/superadmin/database");
};


export const getSystemHealth=()=>{
return axios.get("/superadmin/system");
};


export const getApiMonitor=()=>{
return axios.get("/superadmin/api-monitor");
};
