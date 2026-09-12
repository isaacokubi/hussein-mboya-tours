import api from "./axios";

export const getAdminUsers = async (params = {}) => (await api.get("/admin/users", { params })).data;

export const updateUserStatus = async ({ id, status }) => {
  if (!id) throw new Error("User ID is required");
  return (await api.put(`/admin/users/${id}/status`, { status })).data;
};

export const updateUserProfile = async ({ id, ...payload }) => {
  if (!id) throw new Error("User ID is required");
  return (await api.put(`/admin/users/${id}`, payload)).data;
};

export const deleteUser = async (userId) => {
  if (!userId) throw new Error("User ID is required");
  return (await api.delete(`/admin/users/${userId}`)).data;
};

export const createStaffAccount = async (payload) => (await api.post("/admin/users/staff", payload)).data;
export const createCompanyAccount = async (payload) => (await api.post("/superadmin/users/accounts", payload)).data;

export const getAdminStaff = async (params = {}) => (await api.get("/staff", { params })).data;
export const createStaff = async (payload) => (await api.post("/staff", payload)).data;
export const updateStaff = async ({ id, ...payload }) => (await api.put(`/staff/${id}`, payload)).data;
export const updateStaffStatus = async ({ id, active }) => (await api.put(`/staff/${id}/status`, { isActive: active, status: active ? "active" : "inactive", availability: active ? "available" : "offline" })).data;
export const deleteStaff = async (id) => (await api.delete(`/staff/${id}`)).data;
