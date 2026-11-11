/**
 * Purpose: hospitality Payment Api client application module. Main declarations: initiateHospitalityMpesa, initiateHospitalityCard, verifyHospitalityCard, submitHospitalityBank, confirmHospitalityBank.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import api from "./axios";

// Declare initiateHospitalityMpesa for use by the surrounding module or function.
export const initiateHospitalityMpesa = async (payload) => (await api.post("/hospitality-payments/mpesa", payload)).data;
// Declare initiateHospitalityCard for use by the surrounding module or function.
export const initiateHospitalityCard = async (payload) => (await api.post("/hospitality-payments/card", payload)).data;
// Declare verifyHospitalityCard for use by the surrounding module or function.
export const verifyHospitalityCard = async (sessionId) => (await api.get(`/hospitality-payments/card/verify/${encodeURIComponent(sessionId)}`)).data;
// Declare submitHospitalityBank for use by the surrounding module or function.
export const submitHospitalityBank = async (payload) => (await api.post("/hospitality-payments/bank", payload)).data;
// Declare confirmHospitalityBank for use by the surrounding module or function.
export const confirmHospitalityBank = async (paymentId, payload = {}) => (await api.post(`/hospitality-payments/bank/${paymentId}/confirm`, payload)).data;
// Declare getHospitalityPayments for use by the surrounding module or function.
export const getHospitalityPayments = async ({ bookingId, type }) => (await api.get(`/hospitality-payments/${bookingId}`, { params: { type } })).data;
