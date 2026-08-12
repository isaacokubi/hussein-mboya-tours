import jwt from "jsonwebtoken";
import User from "../models/User.js";
import env from "../config/env.js";

const normalizeRole = (role) => {
  if (!role) return "";

  if (typeof role === "object") {
    role =
      role.name ||
      role.role ||
      role._id ||
      "";
  }

  return String(role)
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
};

const getUserRole = (user) => {
  return normalizeRole(
    user?.roleId?.name ||
    user?.role ||
    user?.legacyRole
  );
};

/*
|--------------------------------------------------------------------------
| AUTHENTICATION
|--------------------------------------------------------------------------
*/

export const protect = async (req, res, next) => {
  try {
    let token = null;

    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.substring(7).trim();
    }

    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const secret = env.JWT_SECRET || process.env.JWT_SECRET;

    if (!secret) {
      console.error("JWT_SECRET is not configured.");

      return res.status(500).json({
        success: false,
        message: "Authentication configuration error.",
      });
    }

    const decoded = jwt.verify(token, secret, {
      issuer: "husseinmboyatours",
      audience: "husseinmboyatours-client",
    });

    const userId = decoded.sub || decoded.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
      });
    }

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
      return res.status(401).json({
        success: false,
        message: "User no longer exists.",
      });
    }

    if (
      user.status !== "active" ||
      user.isActive === false
    ) {
      return res.status(403).json({
        success: false,
        message: "Account is inactive.",
      });
    }

    req.user = user;

    console.log("AUTH SUCCESS:", {
      userId: user._id.toString(),
      email: user.email,
      role: getUserRole(user),
      tokenRole: decoded.role,
    });

    next();
  } catch (error) {
    console.error("AUTH ERROR:", error.message);

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

  const role = getUserRole(req.user);

  if (
    ![
      "admin",
      "superadmin",
      "administrator",
      "super_admin",
    ].map(normalizeRole).includes(role)
  ) {
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

    const userRole = normalizeRole(
      getUserRole(req.user)
    );

    const allowed = allowedRoles.map(normalizeRole);

    if (!allowed.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to access this resource.",
        role: userRole,
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
        (permission) => {
          const name =
            typeof permission === "object"
              ? permission.name
              : permission;

          return (
            String(name)
              .trim()
              .toLowerCase() ===
            String(permissionName)
              .trim()
              .toLowerCase()
          );
        }
      );

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message:
            "You do not have permission to perform this action.",
        });
      }

      next();
    } catch (error) {
      console.error(
        "PERMISSION CHECK ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Permission verification failed.",
      });
    }
  };
};
