import axios from "./axios";

export const getTenantSubscription = async () => (await axios.get("/subscription")).data;
export const startTenantSubscriptionPayment = async (payload) => (await axios.post("/subscription/mpesa", payload)).data;
export const getTenantSubscriptionPaymentStatus = async (checkoutRequestId) => (await axios.get(`/subscription/payment/${checkoutRequestId}`)).data;
export const activateTenantSubscription = async (id, payload) => (await axios.post(`/superadmin/tenants/${id}/subscription/activate`, payload)).data;
