// Import the JSON Web Token library used to sign authentication tokens.
import jwt from "jsonwebtoken";
// Import cryptographic helpers for generating a unique token identifier.
import crypto from "crypto";
// Import validated application environment settings.
import env from "../config/env.js";
// Import the helper that maps role aliases to canonical role names.
import { normalizeRole } from "./roleUtils.js";

// Define the function that creates a signed token for a user.
const generateToken = (user) => {
  // Prefer the validated environment configuration, with process.env as a fallback.
  const secret = env.JWT_SECRET || process.env.JWT_SECRET;
  // Stop token creation if no signing secret is configured.
  if (!secret) throw new Error("JWT_SECRET is not configured.");

  // Always emit canonical role names. Legacy role labels are normalized first.
  const role = normalizeRole(
    // Use the most specific role information available on the user record.
    user.roleId?.name || user.role || user.legacyRole || user.roleName || "customer"
  );

  // Build the claims that downstream middleware uses to identify and authorize the user.
  const payload = {
    // Store the user database identifier as the standard JWT subject claim.
    sub: String(user._id || user.id),
    // Keep an explicit id claim for clients or older middleware that expect it.
    id: String(user._id || user.id),
    // Include the normalized role used for role-based authorization.
    role,
    // Include the role record identifier when one is available.
    roleId: user.roleId?._id || user.roleId || null,
    // Include the user's email for application identity workflows.
    email: user.email,
    // Include assigned permissions, defaulting to an empty list.
    permissions: user.permissions || [],
    // Bind the token to the user's tenant when tenant context exists.
    tenantId: user.tenantId || null,
  };

  // Sign the payload and return the resulting compact JWT string.
  return jwt.sign(payload, secret, {
    // Use the first configured token lifetime, falling back to seven days.
    expiresIn:
      env.JWT_EXPIRE ||
      env.JWT_EXPIRES ||
      process.env.JWT_EXPIRE ||
      process.env.JWT_EXPIRES ||
      "7d",
    // Restrict accepted tokens to this application's issuer identifier.
    issuer: "husseinmboyatours",
    // Restrict accepted tokens to this application's client audience.
    audience: "husseinmboyatours-client",
    // Add a cryptographically unique ID so individual tokens can be distinguished.
    jwtid: crypto.randomUUID(),
  });
};

// Export the token generator as the module's default function.
export default generateToken;
