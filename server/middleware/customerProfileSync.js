/**
 * Purpose: customer Profile Sync request middleware. Main declarations: syncCustomerProfile.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { ensureCustomerProfile } from "../services/customerProfileService.js";

/**
 * Keep the CRM customer profile synchronized with authenticated customer
 * accounts. This is intentionally best-effort for authentication: a profile
 * sync failure must not invalidate an otherwise valid login/session.
 */
// Declare syncCustomerProfile for use by the surrounding module or function.
export const syncCustomerProfile = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (req.user && String(req.user.role || "").trim().toLowerCase() === "cust) and run the matching branch.
    if (req.user && String(req.user.role || "").trim().toLowerCase() === "customer") {
      // Perform the side effect or state update expressed on the following line.
      await ensureCustomerProfile(req.user, { createdBy: req.user._id });
    }
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.error("CUSTOMER PROFILE SYNC ERROR:", error);
  }
  // Perform the side effect or state update expressed on the following line.
  next();
};
