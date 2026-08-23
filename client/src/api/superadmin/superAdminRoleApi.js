import api from "../axios";

export const getSuperAdminRoles = async () => {
  const { data } = await api.get("/superadmin/roles");
  return data?.roles || data?.data || [];
};

export const getSuperAdminRole = async (id) => {
  const { data } = await api.get(`/superadmin/roles/${id}`);
  return data?.role || data?.data || data;
};

export const getSuperAdminPermissions = async () => {
  const { data } = await api.get("/superadmin/roles/permissions/all");
  return data?.permissions || data?.data || [];
};

export const updateSuperAdminRolePermissions = async (id, permissions) => {
  const { data } = await api.put(`/superadmin/roles/${id}/permissions`, { permissions });
  return data?.role || data?.data || data;
};
