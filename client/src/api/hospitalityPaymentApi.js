import api from "./axios";

export const initiateHospitalityMpesa = async (payload) => (await api.post("/hospitality-payments/mpesa", payload)).data;
export const initiateHospitalityCard = async (payload) => (await api.post("/hospitality-payments/card", payload)).data;
export const verifyHospitalityCard = async (sessionId) => (await api.get(`/hospitality-payments/card/verify/${encodeURIComponent(sessionId)}`)).data;
export const submitHospitalityBank = async (payload) => (await api.post("/hospitality-payments/bank", payload)).data;
export const confirmHospitalityBank = async (paymentId, payload = {}) => (await api.post(`/hospitality-payments/bank/${paymentId}/confirm`, payload)).data;
export const getHospitalityPayments = async ({ bookingId, type }) => (await api.get(`/hospitality-payments/${bookingId}`, { params: { type } })).data;
