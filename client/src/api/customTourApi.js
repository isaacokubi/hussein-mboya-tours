/**
 * Purpose: custom Tour Api client application module. Main declarations: createCustomTourRequest, getMyCustomTourRequests, getAdminCustomTourRequests, quoteCustomTourRequest, assignCustomTourResources.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import api from "./axios";export const createCustomTourRequest=async(payload)=>(await api.post("/custom-tour-requests",payload)).data;export const getMyCustomTourRequests=async()=>(await api.get("/custom-tour-requests/mine")).data;export const getAdminCustomTourRequests=async()=>(await api.get("/custom-tour-requests/admin")).data;export const quoteCustomTourRequest=async({id,...payload})=>(await api.patch(`/custom-tour-requests/admin/${id}/quote`,payload)).data;
// Declare assignCustomTourResources for use by the surrounding module or function.
export const assignCustomTourResources=async({id,guide,driver,agent})=>(await api.patch(`/custom-tour-requests/admin/${id}/assign`,{guide,driver,agent})).data;

// Declare convertCustomTourRequest for use by the surrounding module or function.
export const convertCustomTourRequest=async(id)=>(await api.post(`/custom-tour-requests/${id}/convert`)).data;
