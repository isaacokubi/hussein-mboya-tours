/**
 * Purpose: super Admin Only request middleware. Main declarations: superAdminOnly.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { isSuperAdmin } from "../utils/roleUtils.js";

// Declare superAdminOnly for use by the surrounding module or function.
export const superAdminOnly = (req, res, next) => {
  // Check the condition (!req.user) and run the matching branch.
  if (!req.user) return res.status(401).json({ success: false, message: "Authentication required" });
  // Check the condition (!isSuperAdmin(req.user)) and run the matching branch.
  if (!isSuperAdmin(req.user)) {
    // Return the result of res.status(403).json() to the caller.
    return res.status(403).json({ success: false, message: "Super administrator access required." });
  }
  // Return the result of next() to the caller.
  return next();
};

export default superAdminOnly;
