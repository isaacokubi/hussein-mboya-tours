// Canonical administrator authorization.
import User from "../models/User.js";
import { getUserRole } from "../utils/roleUtils.js";

const adminMiddleware = async (req, res, next) => {
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

    const roleName = getUserRole(user);
    if (!["admin", "superadmin"].includes(roleName)) {
      return res.status(403).json({ success: false, message: "Admin access required", role: roleName });
    }

    req.user = user;
    req.userRole = roleName;
    next();
  } catch (error) {
    console.error("Admin Middleware Error:", error);
    return res.status(500).json({ success: false, message: "Server error while authorizing user" });
  }
};

export default adminMiddleware;
