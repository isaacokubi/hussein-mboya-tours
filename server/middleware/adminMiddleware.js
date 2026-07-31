// server/middleware/adminMiddleware.js

import User from "../models/User.js";

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
      .populate("role");

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

    let roleName = "";

    // Role stored as populated document
    if (
      user.role &&
      typeof user.role === "object" &&
      user.role.name
    ) {
      roleName = user.role.name.toLowerCase();
    }

    // Legacy string role support
    else if (typeof user.role === "string") {
      roleName = user.role.toLowerCase();
    }

    // Legacy legacyRole field support
    else if (user.legacyRole) {
      roleName = user.legacyRole.toLowerCase();
    }

    /*
    |--------------------------------------------------------------------------
    | ADMIN CHECK
    |--------------------------------------------------------------------------
    */

    const allowedRoles = [
      "admin",
      "super_admin",
    ];

    if (!allowedRoles.includes(roleName)) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
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