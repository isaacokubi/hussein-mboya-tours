/**
 * Purpose: checkout Payments Api client application module. Main declarations: createStripeCheckout, createPaypalOrder, capturePaypalOrder, createBankTransferPayment, createCashPayment.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import api from "./axios";

// Declare createStripeCheckout for use by the surrounding module or function.
export const createStripeCheckout = async (payload) => (await api.post("/payments/stripe/checkout", payload)).data;
// Declare createPaypalOrder for use by the surrounding module or function.
export const createPaypalOrder = async (payload) => (await api.post("/payments/paypal/orders", payload)).data;
// Declare capturePaypalOrder for use by the surrounding module or function.
export const capturePaypalOrder = async (payload) => (await api.post("/payments/paypal/orders/capture", payload)).data;
// Declare createBankTransferPayment for use by the surrounding module or function.
export const createBankTransferPayment = async (payload) => (await api.post("/payments/stripe/bank-transfer", payload)).data;
// Declare createCashPayment for use by the surrounding module or function.
export const createCashPayment = async (payload) => (await api.post("/payments/cash", payload)).data;
