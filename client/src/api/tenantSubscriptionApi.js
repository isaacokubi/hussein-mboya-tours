/**
 * Purpose: tenant Subscription Api client application module. Main declarations: getTenantSubscription, startTenantSubscriptionPayment, getTenantSubscriptionPaymentStatus, activateTenantSubscription.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import axios from "./axios";

// Declare getTenantSubscription for use by the surrounding module or function.
export const getTenantSubscription = async () => (await axios.get("/subscription")).data;
// Declare startTenantSubscriptionPayment for use by the surrounding module or function.
export const startTenantSubscriptionPayment = async (payload) => (await axios.post("/subscription/mpesa", payload)).data;
// Declare getTenantSubscriptionPaymentStatus for use by the surrounding module or function.
export const getTenantSubscriptionPaymentStatus = async (checkoutRequestId) => (await axios.get(`/subscription/payment/${checkoutRequestId}`)).data;
// Declare activateTenantSubscription for use by the surrounding module or function.
export const activateTenantSubscription = async (id, payload) => (await axios.post(`/superadmin/tenants/${id}/subscription/activate`, payload)).data;
