import { ensureCustomerProfile } from "../services/customerProfileService.js";

/**
 * Keep the CRM customer profile synchronized with authenticated customer
 * accounts. This is intentionally best-effort for authentication: a profile
 * sync failure must not invalidate an otherwise valid login/session.
 */
export const syncCustomerProfile = async (req, res, next) => {
  try {
    if (req.user && String(req.user.role || "").trim().toLowerCase() === "customer") {
      await ensureCustomerProfile(req.user, { createdBy: req.user._id });
    }
  } catch (error) {
    console.error("CUSTOMER PROFILE SYNC ERROR:", error);
  }
  next();
};
