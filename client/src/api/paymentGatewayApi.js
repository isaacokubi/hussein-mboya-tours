/**
 * Purpose: payment Gateway Api client application module. Main declarations: listPaymentGateways, getPaymentGateway, savePaymentGateway, disablePaymentGateway, validatePaymentGateway.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import api from "./axios";

// Declare listPaymentGateways for use by the surrounding module or function.
export const listPaymentGateways = async () => (await api.get("/admin/payment-gateways")).data;
// Declare getPaymentGateway for use by the surrounding module or function.
export const getPaymentGateway = async (provider, environment) => (await api.get(`/admin/payment-gateways/${provider}`, { params: environment ? { environment } : {} })).data;
// Declare savePaymentGateway for use by the surrounding module or function.
export const savePaymentGateway = async (provider, payload) => (await api.put(`/admin/payment-gateways/${provider}`, payload)).data;
// Declare disablePaymentGateway for use by the surrounding module or function.
export const disablePaymentGateway = async (provider) => (await api.delete(`/admin/payment-gateways/${provider}`)).data;
// Declare validatePaymentGateway for use by the surrounding module or function.
export const validatePaymentGateway = async (provider, environment) => (await api.post(`/admin/payment-gateways/${provider}/validate`, { environment })).data;
