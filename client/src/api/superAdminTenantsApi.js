/**
 * Purpose: super Admin Tenants Api client application module. Main declarations: getSuperAdminTenantPlans, getSuperAdminTenants, getSuperAdminTenant, createSuperAdminTenant, updateSuperAdminTenantStatus.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import axios from "./axios";

// Declare getSuperAdminTenantPlans for use by the surrounding module or function.
export const getSuperAdminTenantPlans = async () => (await axios.get("/superadmin/tenant-plans")).data;
// Declare getSuperAdminTenants for use by the surrounding module or function.
export const getSuperAdminTenants = async (params = {}) => (await axios.get("/superadmin/tenants", { params })).data;
// Declare getSuperAdminTenant for use by the surrounding module or function.
export const getSuperAdminTenant = async (id) => (await axios.get(`/superadmin/tenants/${id}`)).data;
// Declare createSuperAdminTenant for use by the surrounding module or function.
export const createSuperAdminTenant = async (payload) => (await axios.post("/superadmin/tenants", payload)).data;
// Declare updateSuperAdminTenantStatus for use by the surrounding module or function.
export const updateSuperAdminTenantStatus = async (id, status) => (await axios.patch(`/superadmin/tenants/${id}/status`, { status })).data;
// Declare switchSuperAdminTenantPlan for use by the surrounding module or function.
export const switchSuperAdminTenantPlan = async (id, plan) => (await axios.patch(`/superadmin/tenants/${id}/subscription/plan`, { plan })).data;
// Declare deleteSuperAdminTenant for use by the surrounding module or function.
export const deleteSuperAdminTenant = async (id, confirmation) => (await axios.delete(`/superadmin/tenants/${id}`, { data: { confirmation } })).data;
// Declare getSuperAdminTenantMpesa for use by the surrounding module or function.
export const getSuperAdminTenantMpesa = async (id, environment = "sandbox") => (await axios.get(`/superadmin/tenants/${id}/mpesa`, { params: { environment } })).data;
// Declare saveSuperAdminTenantMpesa for use by the surrounding module or function.
export const saveSuperAdminTenantMpesa = async (id, payload) => (await axios.put(`/superadmin/tenants/${id}/mpesa`, payload)).data;
// Declare disableSuperAdminTenantMpesa for use by the surrounding module or function.
export const disableSuperAdminTenantMpesa = async (id) => (await axios.delete(`/superadmin/tenants/${id}/mpesa`)).data;
// Declare validateSuperAdminTenantMpesa for use by the surrounding module or function.
export const validateSuperAdminTenantMpesa = async (id, environment) => (await axios.post(`/superadmin/tenants/${id}/mpesa/validate`, { environment })).data;
