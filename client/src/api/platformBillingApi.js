/**
 * Purpose: platform Billing Api client application module. Main declarations: getPlatformBillingConfig, updatePlatformBillingConfig.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import axios from "./axios";

// Declare getPlatformBillingConfig for use by the surrounding module or function.
export const getPlatformBillingConfig = async () => (await axios.get("/superadmin/billing/config")).data;
// Declare updatePlatformBillingConfig for use by the surrounding module or function.
export const updatePlatformBillingConfig = async (payload) => (await axios.put("/superadmin/billing/config", payload)).data;
