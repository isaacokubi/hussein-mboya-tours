import api from "./axios";

export const createPrivacyRequest = async (payload) => (await api.post("/privacy/requests", payload)).data;
export const getPrivacyRequests = async (status = "") => (await api.get("/privacy/admin/requests", { params: status ? { status } : {} })).data;
export const updatePrivacyRequest = async (id, payload) => (await api.patch(`/privacy/admin/requests/${id}`, payload)).data;
