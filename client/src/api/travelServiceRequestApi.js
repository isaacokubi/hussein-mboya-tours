/**
 * Purpose: travel Service Request Api client application module. Main declarations: getTravelServiceRequests, getTravelServiceSummary, createTravelServiceRequest, updateTravelServiceRequest.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import api from "./axios";

// Declare getTravelServiceRequests for use by the surrounding module or function.
export const getTravelServiceRequests = (params = {}) => api.get("/admin/operations/service-requests", { params });
// Declare getTravelServiceSummary for use by the surrounding module or function.
export const getTravelServiceSummary = () => api.get("/admin/operations/service-requests/summary");
// Declare createTravelServiceRequest for use by the surrounding module or function.
export const createTravelServiceRequest = (payload) => api.post("/admin/operations/service-requests", payload);
// Declare updateTravelServiceRequest for use by the surrounding module or function.
export const updateTravelServiceRequest = (id, payload) => api.patch(`/admin/operations/service-requests/${id}`, payload);
