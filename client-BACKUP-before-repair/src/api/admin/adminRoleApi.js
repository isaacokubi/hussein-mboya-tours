// client/src/api/admin/adminRoleApi.js

import api from "../axios";


/*
|--------------------------------------------------------------------------
| ADMIN ROLES
|--------------------------------------------------------------------------
*/


export const getAdminRoles = async () => {

  const { data } = await api.get(
    "/admin/roles"
  );

  return data;

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
