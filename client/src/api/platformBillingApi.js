import axios from "./axios";

export const getPlatformBillingConfig = async () => (await axios.get("/superadmin/billing/config")).data;
export const updatePlatformBillingConfig = async (payload) => (await axios.put("/superadmin/billing/config", payload)).data;
