/**
 * Purpose: super Admin Role Api client application module. Main declarations: getSuperAdminRoles, getSuperAdminRole, getSuperAdminPermissions, updateSuperAdminRolePermissions.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import api from "../axios";

// Declare getSuperAdminRoles for use by the surrounding module or function.
export const getSuperAdminRoles = async () => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get("/superadmin/roles");
  // Return the expression shown below to the caller.
  return data?.roles || data?.data || [];
};

// Declare getSuperAdminRole for use by the surrounding module or function.
export const getSuperAdminRole = async (id) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get(`/superadmin/roles/${id}`);
  // Return the expression shown below to the caller.
  return data?.role || data?.data || data;
};

// Declare getSuperAdminPermissions for use by the surrounding module or function.
export const getSuperAdminPermissions = async () => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get("/superadmin/roles/permissions/all");
  // Return the expression shown below to the caller.
  return data?.permissions || data?.data || [];
};

// Declare updateSuperAdminRolePermissions for use by the surrounding module or function.
export const updateSuperAdminRolePermissions = async (id, permissions) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.put(`/superadmin/roles/${id}/permissions`, { permissions });
  // Return the expression shown below to the caller.
  return data?.role || data?.data || data;
};
