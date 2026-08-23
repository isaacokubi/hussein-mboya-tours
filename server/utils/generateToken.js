import jwt from "jsonwebtoken";
import crypto from "crypto";
import env from "../config/env.js";
import { normalizeRole } from "./roleUtils.js";

const generateToken = (user) => {
  const secret = env.JWT_SECRET || process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured.");

  // Always emit canonical role names. Legacy `superadmin` values become
  // `super_admin`, matching authMiddleware and permissionMiddleware.
  const role = normalizeRole(
    user.roleId?.name || user.role || user.legacyRole || user.roleName || "customer"
  );

  const payload = {
    sub: String(user._id || user.id),
    id: String(user._id || user.id),
    role,
    roleId: user.roleId?._id || user.roleId || null,
    email: user.email,
    permissions: user.permissions || [],
    tenantId: user.tenantId || null,
  };

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
