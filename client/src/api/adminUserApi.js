/**
 * Purpose: admin User Api client application module. Main declarations: getAdminUsers, updateUserStatus, updateUserProfile, deleteUser, createStaffAccount.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import api from "./axios";

// Declare getAdminUsers for use by the surrounding module or function.
export const getAdminUsers = async (params = {}) => (await api.get("/admin/users", { params })).data;

// Declare updateUserStatus for use by the surrounding module or function.
export const updateUserStatus = async ({ id, status }) => {
  // Check the condition (!id) and run the matching branch.
  if (!id) throw new Error("User ID is required");
  // Return the data value to the caller.
  return (await api.put(`/admin/users/${id}/status`, { status })).data;
};

// Declare updateUserProfile for use by the surrounding module or function.
export const updateUserProfile = async ({ id, ...payload }) => {
  // Check the condition (!id) and run the matching branch.
  if (!id) throw new Error("User ID is required");
  // Return the data value to the caller.
  return (await api.put(`/admin/users/${id}`, payload)).data;
};

// Declare deleteUser for use by the surrounding module or function.
export const deleteUser = async (userId) => {
  // Check the condition (!userId) and run the matching branch.
  if (!userId) throw new Error("User ID is required");
  // Return the data value to the caller.
  return (await api.delete(`/admin/users/${userId}`)).data;
};

// Declare createStaffAccount for use by the surrounding module or function.
export const createStaffAccount = async (payload) => (await api.post("/admin/users/staff", payload)).data;
// Declare createCompanyAccount for use by the surrounding module or function.
export const createCompanyAccount = async (payload) => (await api.post("/superadmin/users/accounts", payload)).data;

// Declare getAdminStaff for use by the surrounding module or function.
export const getAdminStaff = async (params = {}) => (await api.get("/staff", { params })).data;
// Declare createStaff for use by the surrounding module or function.
export const createStaff = async (payload) => (await api.post("/staff", payload)).data;
// Declare updateStaff for use by the surrounding module or function.
export const updateStaff = async ({ id, ...payload }) => (await api.put(`/staff/${id}`, payload)).data;
// Declare updateStaffStatus for use by the surrounding module or function.
export const updateStaffStatus = async ({ id, active }) => (await api.put(`/staff/${id}/status`, { isActive: active, status: active ? "active" : "inactive", availability: active ? "available" : "offline" })).data;
// Declare deleteStaff for use by the surrounding module or function.
export const deleteStaff = async (id) => (await api.delete(`/staff/${id}`)).data;
