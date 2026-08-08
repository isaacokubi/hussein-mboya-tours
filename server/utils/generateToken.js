import jwt from "jsonwebtoken";
import crypto from "crypto";
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

const generateToken = (user) => {
  const secret = env.JWT_SECRET || process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured.");
  }

  const role = normalizeRole(
    user.roleId?.name ||
    user.role ||
    user.legacyRole
  );

  const payload = {
    sub: user._id?.toString() || user.id?.toString(),
    role,
    email: user.email,
    permissions: user.permissions || [],
  };

  return jwt.sign(payload, secret, {
    expiresIn:
      env.JWT_EXPIRES ||
      process.env.JWT_EXPIRES ||
      "7d",

    issuer: "husseinmboyatours",
    audience: "husseinmboyatours-client",
    jwtid: crypto.randomUUID(),
  });
};

export default generateToken;
