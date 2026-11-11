/**
 * Purpose: tenant Api client application module. Main declarations: getTenants, createTenant, getTenant, updateTenant, selectTenant.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import api from "./axios";

// Declare getTenants for use by the surrounding module or function.
export const getTenants = async () => (await api.get("/tenants")).data;
// Declare createTenant for use by the surrounding module or function.
export const createTenant = async (payload) => (await api.post("/tenants", payload)).data;
// Declare getTenant for use by the surrounding module or function.
export const getTenant = async (id) => (await api.get(`/tenants/${id}`)).data;
// Declare updateTenant for use by the surrounding module or function.
export const updateTenant = async (id, payload) => (await api.patch(`/tenants/${id}`, payload)).data;

// Declare selectTenant for use by the surrounding module or function.
export const selectTenant = (tenant) => {
  // Check the condition (!tenant) and run the matching branch.
  if (!tenant) return;
  // Perform the side effect or state update expressed on the following line.
  localStorage.setItem("tenantId", String(tenant._id));
  // Perform the side effect or state update expressed on the following line.
  localStorage.setItem("tenantSlug", tenant.slug);
  // Perform the side effect or state update expressed on the following line.
  window.dispatchEvent(new CustomEvent("tenant:changed", { detail: tenant }));
  // Perform the side effect or state update expressed on the following line.
  window.location.reload();
};
