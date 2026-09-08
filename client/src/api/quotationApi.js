import api from "./axios";

export const getAgentQuotations = async () => (await api.get("/agent/quotes")).data;
export const createQuotation = async (payload) => (await api.post("/agent/quotes", payload)).data;
export const updateQuotationStatus = async ({ id, status }) => (await api.patch(`/agent/quotes/${id}/status`, { status })).data;
