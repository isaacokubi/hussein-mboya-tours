import jwt from "jsonwebtoken";
import crypto from "crypto";
import env from "../config/env.js";

const normalizeRole = (role) => {
  if (!role) return "";
  if (typeof role === "object") role = role.name || role.role || "";
  return String(role).trim().toLowerCase().replace(/[\s_-]+/g, "");
};

const generateToken = (user) => {
  const secret = env.JWT_SECRET || process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured.");
  const role = normalizeRole(user.roleId?.name || user.role || user.legacyRole || user.roleName || "customer");
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
    expiresIn: env.JWT_EXPIRE || env.JWT_EXPIRES || process.env.JWT_EXPIRE || process.env.JWT_EXPIRES || "7d",
    issuer: "husseinmboyatours",
    audience: "husseinmboyatours-client",
    jwtid: crypto.randomUUID(),
  });
};

export default generateToken;
