import api from "./axios";

export const createStripeCheckout = async (payload) => (await api.post("/payments/stripe/checkout", payload)).data;
export const createPaypalOrder = async (payload) => (await api.post("/payments/paypal/orders", payload)).data;
export const capturePaypalOrder = async (payload) => (await api.post("/payments/paypal/orders/capture", payload)).data;
export const createBankTransferPayment = async (payload) => (await api.post("/payments/stripe/bank-transfer", payload)).data;
export const createCashPayment = async (payload) => (await api.post("/payments/cash", payload)).data;
