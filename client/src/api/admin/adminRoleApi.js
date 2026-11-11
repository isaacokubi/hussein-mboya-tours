/**
 * Purpose: admin Role Api client application module. Main declarations: getAdminRoles, getAdminRole, createAdminRole, updateAdminRole, deleteAdminRole.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// client/src/api/admin/adminRoleApi.js

// Load ../axios so this module can use its exported dependencies.
import api from "../axios";


/*
|--------------------------------------------------------------------------
| ADMIN ROLES
|--------------------------------------------------------------------------
*/


// Declare getAdminRoles for use by the surrounding module or function.
export const getAdminRoles = async () => {

  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare { data } for use by the surrounding module or function.
    const { data } = await api.get("/admin/roles");
    // Return the value of data to the caller.
    return data;
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.error("ADMIN ROLES API ERROR:", error?.response?.data || error);
    // Stop the current operation by raising the value of error.
    throw error;
  }

};





// Declare getAdminRole for use by the surrounding module or function.
export const getAdminRole = async (id) => {

  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get(
    `/admin/roles/${id}`
  );

  // Return the value of data to the caller.
  return data;

};





// Declare createAdminRole for use by the surrounding module or function.
export const createAdminRole = async (payload) => {

  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.post(
    "/admin/roles",
    payload
  );

  // Return the value of data to the caller.
  return data;

};





// Declare updateAdminRole for use by the surrounding module or function.
export const updateAdminRole = async (
  id,
  payload
) => {

  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.put(
    `/admin/roles/${id}`,
    payload
  );

  // Return the value of data to the caller.
  return data;

};





// Declare deleteAdminRole for use by the surrounding module or function.
export const deleteAdminRole = async (id) => {

  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.delete(
    `/admin/roles/${id}`
  );

  // Return the value of data to the caller.
  return data;

};





// Declare toggleRoleStatus for use by the surrounding module or function.
export const toggleRoleStatus = async (
  id,
  payload
) => {

  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.patch(
    `/admin/roles/${id}`,
    payload
  );

  // Return the value of data to the caller.
  return data;

};


// Declare getAdminPermissions for use by the surrounding module or function.
export const getAdminPermissions = async () => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare { data } for use by the surrounding module or function.
    const { data } = await api.get("/admin/roles/permissions/all");
    // Return the value of data to the caller.
    return data;
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.error("ADMIN PERMISSIONS API ERROR:", error?.response?.data || error);
    // Stop the current operation by raising the value of error.
    throw error;
  }
};

// Declare updateAdminRolePermissions for use by the surrounding module or function.
export const updateAdminRolePermissions = async (id, permissions) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.put(
    `/admin/roles/${id}/permissions`,
    { permissions }
  );
  // Return the value of data to the caller.
  return data;
};


// ===============================
// SUPER ADMIN ROLE MANAGEMENT
// ===============================

// Declare getRoles for use by the surrounding module or function.
export const getRoles = async () => {

    // Declare response for use by the surrounding module or function.
    const response = await api.get(
        "/admin/roles"
    );

    // Return the data value to the caller.
    return response.data;

};


// Declare updateRolePermissions for use by the surrounding module or function.
export const updateRolePermissions = async (
    id,
    permissions
)=>{

    // Declare response for use by the surrounding module or function.
    const response = await api.put(
        `/admin/roles/${id}/permissions`,
        {
            permissions
        }
    );

    // Return the data value to the caller.
    return response.data;

};
