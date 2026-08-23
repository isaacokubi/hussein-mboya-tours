// client/src/api/admin/rolesApi.js

import api from "../api/axios";

export const getRoles = async()=>{

    const { data } =
    await api.get("/admin/roles");

    return data;
};

export const createRole = async(payload)=>{

    const { data } =
    await api.post(
        "/admin/roles",
        payload
    );

    return data;
};

export const updateRole = async(
    id,
    payload
)=>{

    const { data } =
    await api.put(
        `/admin/roles/${id}`,
        payload
    );

    return data;
};

export const deleteRole = async(id)=>{

    const { data } =
    await api.delete(
        `/admin/roles/${id}`
    );

    return data;
};
