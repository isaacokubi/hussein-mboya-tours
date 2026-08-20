import api from "./axios";

export const getTenants = async () => (await api.get("/tenants")).data;
export const createTenant = async (payload) => (await api.post("/tenants", payload)).data;
export const getTenant = async (id) => (await api.get(`/tenants/${id}`)).data;
export const updateTenant = async (id, payload) => (await api.patch(`/tenants/${id}`, payload)).data;

export const selectTenant = (tenant) => {
  if (!tenant) return;
  localStorage.setItem("tenantId", String(tenant._id));
  localStorage.setItem("tenantSlug", tenant.slug);
  window.dispatchEvent(new CustomEvent("tenant:changed", { detail: tenant }));
  window.location.reload();
};
