import axios from "./axios";

export const getSuperAdminTenantPlans = async () => (await axios.get("/superadmin/tenant-plans")).data;
export const getSuperAdminTenants = async (params = {}) => (await axios.get("/superadmin/tenants", { params })).data;
export const getSuperAdminTenant = async (id) => (await axios.get(`/superadmin/tenants/${id}`)).data;
export const createSuperAdminTenant = async (payload) => (await axios.post("/superadmin/tenants", payload)).data;
export const updateSuperAdminTenantStatus = async (id, status) => (await axios.patch(`/superadmin/tenants/${id}/status`, { status })).data;
export const switchSuperAdminTenantPlan = async (id, plan) => (await axios.patch(`/superadmin/tenants/${id}/subscription/plan`, { plan })).data;
export const deleteSuperAdminTenant = async (id, confirmation) => (await axios.delete(`/superadmin/tenants/${id}`, { data: { confirmation } })).data;
export const getSuperAdminTenantMpesa = async (id, environment = "sandbox") => (await axios.get(`/superadmin/tenants/${id}/mpesa`, { params: { environment } })).data;
export const saveSuperAdminTenantMpesa = async (id, payload) => (await axios.put(`/superadmin/tenants/${id}/mpesa`, payload)).data;
export const disableSuperAdminTenantMpesa = async (id) => (await axios.delete(`/superadmin/tenants/${id}/mpesa`)).data;
export const validateSuperAdminTenantMpesa = async (id, environment) => (await axios.post(`/superadmin/tenants/${id}/mpesa/validate`, { environment })).data;
