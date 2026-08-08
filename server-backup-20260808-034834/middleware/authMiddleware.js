// server/middleware/authMiddleware.js

import jwt from "jsonwebtoken";
import User from "../models/User.js";
import env from "../config/env.js";

/*
|--------------------------------------------------------------------------
| AUTHENTICATION MIDDLEWARE
|--------------------------------------------------------------------------
*/

export const protect = async (req, res, next) => {
  try {
    let token = null;

    /*
    |--------------------------------------------------------------------------
    | GET TOKEN FROM AUTH HEADER
    |--------------------------------------------------------------------------
    */

    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    /*
    |--------------------------------------------------------------------------
    | COOKIE SUPPORT
    |--------------------------------------------------------------------------
    */

    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    /*
    |--------------------------------------------------------------------------
    | TOKEN REQUIRED
    |--------------------------------------------------------------------------
    */

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | VERIFY JWT
    |--------------------------------------------------------------------------
    */

    const decoded = jwt.verify(token, env.JWT_SECRET);

    // DEBUG LOGS
    console.log("JWT DECODED:", decoded);

    /*
    |--------------------------------------------------------------------------
    | LOAD USER
    |--------------------------------------------------------------------------
    */

    const userId = decoded.sub || decoded.id;

    console.log("LOOKING FOR USER:", userId);

    const user = await User.findById(userId)
      .select("-password")
      .populate({
        path: "roleId",
        populate: {
          path: "permissions",
        },
      })
      .populate("permissionsOverride");

    if (!user) {
      console.error("USER NOT FOUND:", userId);

      return res.status(401).json({
        success: false,
        message: "User no longer exists.",
      });
    }

    console.log("USER FOUND:", {
      id: user._id,
      email: user.email,
      role: user.role,
      roleId: user.roleId?.name,
    });

    /*
    |--------------------------------------------------------------------------
    | ACCOUNT STATUS
    |--------------------------------------------------------------------------
    */

    if (user.status !== "active" || user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Account is inactive.",
      });
    }

    console.log("AUTH USER DEBUG:", {
      id: user._id,
      email: user.email,
      role: user.role,
      roleId: user.roleId,
      roleName: user.roleId?.name
    });

    req.user = user;

    next();
  } catch (error) {
    console.error("AUTH ERROR:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| ADMIN ONLY
|--------------------------------------------------------------------------
*/

export const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  const roleName =
    req.user.roleId?.name?.toLowerCase() ||
    req.user.role?.toLowerCase() ||
    req.user.legacyRole?.toLowerCase();

  if (!["admin", "super_admin"].includes(roleName)) {
    return res.status(403).json({
      success: false,
      message: "Admin access required.",
    });
  }

  next();
};

/*
|--------------------------------------------------------------------------
| ROLE AUTHORIZATION
|--------------------------------------------------------------------------
*/

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const roleName =
      req.user.roleId?.name?.toLowerCase() ||
      req.user.role?.toLowerCase() ||
      req.user.legacyRole?.toLowerCase();

    const allowed = allowedRoles.map((role) =>
      role.toLowerCase()
    );

    if (!allowed.includes(roleName)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this resource.",
      });
    }

    next();
  };
};

/*
|--------------------------------------------------------------------------
    | PERMISSION CHECK
|--------------------------------------------------------------------------
*/

export const checkPermission = (permissionName) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
      }

      const rolePermissions =
        req.user.roleId?.permissions || [];

      const overridePermissions =
        req.user.permissionsOverride || [];

      const permissions = [
        ...rolePermissions,
        ...overridePermissions,
      ];

      const hasPermission = permissions.some(
        (permission) => permission.name === permissionName
      );

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: `Missing permission: ${permissionName}`,
        });
      }

      next();
    } catch (error) {
      console.error("PERMISSION ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Permission verification failed.",
      });
    }
  };
};

export default protect;