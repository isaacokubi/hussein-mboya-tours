// client/src/api/admin/adminRoleApi.js

import api from "../axios";


/*
|--------------------------------------------------------------------------
| ADMIN ROLES
|--------------------------------------------------------------------------
*/


export const getAdminRoles = async () => {

  try {
    const { data } = await api.get("/admin/roles");
    return data;
  } catch (error) {
    console.error("ADMIN ROLES API ERROR:", error?.response?.data || error);
    throw error;
  }

};





export const getAdminRole = async (id) => {

  const { data } = await api.get(
    `/admin/roles/${id}`
  );

  return data;

};





export const createAdminRole = async (payload) => {

  const { data } = await api.post(
    "/admin/roles",
    payload
  );

  return data;

};





export const updateAdminRole = async (
  id,
  payload
) => {

  const { data } = await api.put(
    `/admin/roles/${id}`,
    payload
  );

  return data;

};





export const deleteAdminRole = async (id) => {

  const { data } = await api.delete(
    `/admin/roles/${id}`
  );

  return data;

};





export const toggleRoleStatus = async (
  id,
  payload
) => {

  const { data } = await api.patch(
    `/admin/roles/${id}`,
    payload
  );

  return data;

};


export const getAdminPermissions = async () => {
  try {
    const { data } = await api.get("/admin/roles/permissions/all");
    return data;
  } catch (error) {
    console.error("ADMIN PERMISSIONS API ERROR:", error?.response?.data || error);
    throw error;
  }
};

export const updateAdminRolePermissions = async (id, permissions) => {
  const { data } = await api.put(
    `/admin/roles/${id}/permissions`,
    { permissions }
  );
  return data;
};


// ===============================
// SUPER ADMIN ROLE MANAGEMENT
// ===============================

export const getRoles = async () => {

    const response = await api.get(
        "/admin/roles"
    );

    return response.data;

};


export const updateRolePermissions = async (
    id,
    permissions
)=>{

    const response = await api.put(
        `/admin/roles/${id}/permissions`,
        {
            permissions
        }
    );

    return response.data;

};


