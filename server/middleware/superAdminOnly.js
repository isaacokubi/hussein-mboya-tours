import { isSuperAdmin } from "../utils/roleUtils.js";

export const superAdminOnly = (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: "Authentication required" });
  if (!isSuperAdmin(req.user)) {
    return res.status(403).json({ success: false, message: "Super administrator access required." });
  }
  return next();
};

export default superAdminOnly;
