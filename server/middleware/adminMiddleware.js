// server/middleware/adminMiddleware.js

import User from "../models/User.js";

const normalizeRole = (role) => {
  if (!role) return "";
  if (typeof role === "object") {
    role = role.name || role.role || "";
  }
  return String(role).trim().toLowerCase().replace(/[\s_-]+/g, "");
};

/*
|--------------------------------------------------------------------------
| ADMIN AUTHORIZATION MIDDLEWARE
|--------------------------------------------------------------------------
|
| Verifies:
| - User exists
| - Account is active
| - User has Admin or Super Admin role
|
|--------------------------------------------------------------------------
*/

const adminMiddleware = async (req, res, next) => {
  try {
    /*
    |--------------------------------------------------------------------------
    | AUTHENTICATED USER
    |--------------------------------------------------------------------------
    */

    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | LOAD USER WITH ROLE
    |--------------------------------------------------------------------------
    */

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
    |--------------------------------------------------------------------------
    | ACCOUNT STATUS
    |--------------------------------------------------------------------------
    */

    if (
      user.isActive === false ||
      user.status === "inactive" ||
      user.status === "blocked" ||
      user.status === "suspended"
    ) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | ROLE NAME
    |--------------------------------------------------------------------------
    */

    const roleName = normalizeRole(
      user.roleId?.name ||
      user.role ||
      user.legacyRole
    );

    /*
    |--------------------------------------------------------------------------
    | ADMIN CHECK
    |--------------------------------------------------------------------------
    */

    const allowedRoles = new Set([
      "admin",
      "superadmin",
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
    |--------------------------------------------------------------------------
    | MAKE FULL USER AVAILABLE
    |--------------------------------------------------------------------------
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