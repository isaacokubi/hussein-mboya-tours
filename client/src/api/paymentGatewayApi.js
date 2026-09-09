import api from "./axios";

export const listPaymentGateways = async () => (await api.get("/admin/payment-gateways")).data;
export const getPaymentGateway = async (provider) => (await api.get(`/admin/payment-gateways/${provider}`)).data;
export const savePaymentGateway = async (provider, payload) => (await api.put(`/admin/payment-gateways/${provider}`, payload)).data;
export const disablePaymentGateway = async (provider) => (await api.delete(`/admin/payment-gateways/${provider}`)).data;
