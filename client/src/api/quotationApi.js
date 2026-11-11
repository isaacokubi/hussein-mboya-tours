/**
 * Purpose: quotation Api client application module. Main declarations: getAgentQuotations, createQuotation, updateQuotationStatus.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import api from "./axios";

// Declare getAgentQuotations for use by the surrounding module or function.
export const getAgentQuotations = async () => (await api.get("/agent/quotes")).data;
// Declare createQuotation for use by the surrounding module or function.
export const createQuotation = async (payload) => (await api.post("/agent/quotes", payload)).data;
// Declare updateQuotationStatus for use by the surrounding module or function.
export const updateQuotationStatus = async ({ id, status }) => (await api.patch(`/agent/quotes/${id}/status`, { status })).data;
