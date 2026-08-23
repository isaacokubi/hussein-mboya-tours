import User from "../models/User.js";
import { getUserRole } from "../utils/roleUtils.js";

/**
 * Homepage content management is intentionally narrower than full admin access.
 * Only admin/super-admin and tour-manager/manager roles may mutate gallery and
 * travel-experience content, and all writes remain tenant-scoped downstream.
 */
export default async function contentManagerMiddleware(req, res, next) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const user = await User.findById(req.user._id)
      .select("-password")
      .populate({ path: "roleId", populate: { path: "permissions" } })
      .populate("permissionsOverride");

    if (!user) return res.status(401).json({ success: false, message: "User not found" });

    if (
      user.isActive === false ||
      ["inactive", "disabled", "blocked", "suspended"].includes(String(user.status || "").toLowerCase())
    ) {
      return res.status(403).json({ success: false, message: "Your account is inactive" });
    }

    const role = getUserRole(user);
    const allowed = ["admin", "super_admin", "manager", "tour_manager", "tourmanager"];

    if (!allowed.includes(role)) {
      return res.status(403).json({ success: false, message: "Homepage content management access required", role });
    }

    req.user = user;
    req.userRole = role;
    next();
  } catch (error) {
    console.error("Content Manager Middleware Error:", error);
    return res.status(500).json({ success: false, message: "Server error while authorizing content manager" });
  }
}
