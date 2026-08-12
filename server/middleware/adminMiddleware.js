// server/middleware/adminMiddleware.js

import User from "../models/User.js";

const normalizeRole = (role) => {
  if (!role) return "";

  if (typeof role === "object") {
    role = role.name || role.role || "";
  }

  return String(role)
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
};

const adminMiddleware = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const user = await User.findById(req.user._id)
      .select("-password")
      .populate({
        path: "roleId",
        populate: {
          path: "permissions",
        },
      })
      .populate("permissionsOverride");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    /*
     * Account status.
     */
    if (
      user.isActive === false ||
      ["inactive", "disabled", "blocked", "suspended"].includes(
        user.status
      )
    ) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive",
      });
    }

    /*
     * roleId is authoritative when available.
     * Legacy role fields remain compatibility fallbacks.
     */
    const roleName = normalizeRole(
      user.roleId?.name ||
      user.role ||
      user.legacyRole
    );

    const allowedRoles = new Set([
      "admin",
      "superadmin",
      "super_admin",
      "administrator",
    ]);

    if (!allowedRoles.has(roleName)) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
        role: roleName,
      });
    }

    /*
     * Make fully populated user available downstream.
     */
    req.user = user;

    next();
  } catch (error) {
    console.error("Admin Middleware Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while authorizing user",
    });
  }
};

export default adminMiddleware;
