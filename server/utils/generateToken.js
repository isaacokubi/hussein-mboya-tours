/**
 * Purpose: generate Token server application module. Main declarations: generateToken.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import jwt from "jsonwebtoken";
// Load crypto so this module can use its exported dependencies.
import crypto from "crypto";
// Load ../config/env.js so this module can use its exported dependencies.
import env from "../config/env.js";
// Load ./roleUtils.js so this module can use its exported dependencies.
import { normalizeRole } from "./roleUtils.js";

// Declare generateToken for use by the surrounding module or function.
const generateToken = (user) => {
  // Declare secret for use by the surrounding module or function.
  const secret = env.JWT_SECRET || process.env.JWT_SECRET;
  // Check the condition (!secret) and run the matching branch.
  if (!secret) throw new Error("JWT_SECRET is not configured.");

  // Always emit canonical role names. Legacy `superadmin` values become
  // `super_admin`, matching authMiddleware and permissionMiddleware.
  // Declare role for use by the surrounding module or function.
  const role = normalizeRole(
    user.roleId?.name || user.role || user.legacyRole || user.roleName || "customer"
  );

  // Declare payload for use by the surrounding module or function.
  const payload = {
    sub: String(user._id || user.id),
    id: String(user._id || user.id),
    role,
    roleId: user.roleId?._id || user.roleId || null,
    email: user.email,
    permissions: user.permissions || [],
    tenantId: user.tenantId || null,
  };

  // Return the result of jwt.sign() to the caller.
  return jwt.sign(payload, secret, {
    expiresIn:
      env.JWT_EXPIRE ||
      env.JWT_EXPIRES ||
      process.env.JWT_EXPIRE ||
      process.env.JWT_EXPIRES ||
      "7d",
    issuer: "husseinmboyatours",
    audience: "husseinmboyatours-client",
    jwtid: crypto.randomUUID(),
  });
};

export default generateToken;
