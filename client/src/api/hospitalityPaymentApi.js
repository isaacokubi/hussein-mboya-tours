import api from "./axios";

export const initiateHospitalityMpesa = async (payload) => (await api.post("/hospitality-payments/mpesa", payload)).data;
export const getHospitalityPayments = async ({ bookingId, type }) => (await api.get(`/hospitality-payments/${bookingId}`, { params: { type } })).data;
