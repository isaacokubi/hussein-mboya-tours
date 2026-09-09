import api from "./axios";

export const getTravelServiceRequests = (params = {}) => api.get("/admin/operations/service-requests", { params });
export const getTravelServiceSummary = () => api.get("/admin/operations/service-requests/summary");
export const createTravelServiceRequest = (payload) => api.post("/admin/operations/service-requests", payload);
export const updateTravelServiceRequest = (id, payload) => api.patch(`/admin/operations/service-requests/${id}`, payload);
