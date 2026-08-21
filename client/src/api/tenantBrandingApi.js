import api from "./api";

export const getTenantBranding = async () => {
    const response = await api.get(
        "/tenant/branding"
    );

    return response.data;
};


export const updateTenantBranding = async (data) => {

    const response = await api.put(
        "/tenant/branding",
        data
    );

    return response.data;
};
