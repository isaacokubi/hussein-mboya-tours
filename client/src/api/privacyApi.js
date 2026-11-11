/**
 * Purpose: privacy Api client application module. Main declarations: createPrivacyRequest, getPrivacyRequests, updatePrivacyRequest.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import api from "./axios";

// Declare createPrivacyRequest for use by the surrounding module or function.
export const createPrivacyRequest = async (payload) => (await api.post("/privacy/requests", payload)).data;
// Declare getPrivacyRequests for use by the surrounding module or function.
export const getPrivacyRequests = async (status = "") => (await api.get("/privacy/admin/requests", { params: status ? { status } : {} })).data;
// Declare updatePrivacyRequest for use by the surrounding module or function.
export const updatePrivacyRequest = async (id, payload) => (await api.patch(`/privacy/admin/requests/${id}`, payload)).data;
