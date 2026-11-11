/**
 * Purpose: roles Api client application module. Main declarations: getRoles, createRole, updateRole, deleteRole.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// client/src/api/admin/rolesApi.js

// Load ../api/axios so this module can use its exported dependencies.
import api from "../api/axios";

// Declare getRoles for use by the surrounding module or function.
export const getRoles = async()=>{

    // Declare { data } for use by the surrounding module or function.
    const { data } =
    await api.get("/admin/roles");

    // Return the value of data to the caller.
    return data;
};

// Declare createRole for use by the surrounding module or function.
export const createRole = async(payload)=>{

    // Declare { data } for use by the surrounding module or function.
    const { data } =
    await api.post(
        "/admin/roles",
        payload
    );

    // Return the value of data to the caller.
    return data;
};

// Declare updateRole for use by the surrounding module or function.
export const updateRole = async(
    id,
    payload
)=>{

    // Declare { data } for use by the surrounding module or function.
    const { data } =
    await api.put(
        `/admin/roles/${id}`,
        payload
    );

    // Return the value of data to the caller.
    return data;
};

// Declare deleteRole for use by the surrounding module or function.
export const deleteRole = async(id)=>{

    // Declare { data } for use by the surrounding module or function.
    const { data } =
    await api.delete(
        `/admin/roles/${id}`
    );

    // Return the value of data to the caller.
    return data;
};
