/**
 * Purpose: integration Auth request middleware. Main declarations: hashKey, normalizeOrigin, requestOrigin, getApiKeyFromRequest, getPublicKeyFromRequest.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import crypto from "crypto";
// Load ../models/WebsiteIntegrationKey.js so this module can use its exported dependencies.
import WebsiteIntegrationKey from "../models/WebsiteIntegrationKey.js";
// Load ../models/Organization.js so this module can use its exported dependencies.
import Organization from "../models/Organization.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { runWithTenant } from "../tenancy/context.js";

// Declare hashKey for use by the surrounding module or function.
const hashKey = (value) => crypto.createHash("sha256").update(String(value)).digest("hex");

// Declare normalizeOrigin for use by the surrounding module or function.
const normalizeOrigin = (value = "") => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare url for use by the surrounding module or function.
    const url = new URL(String(value).trim());
    // Check the condition (!["http:", "https:"].includes(url.protocol)) and run the matching branch.
    if (!["http:", "https:"].includes(url.protocol)) return "";
    // Return the result of url.origin.toLowerCase() to the caller.
    return url.origin.toLowerCase();
  } catch {
    // Return the result of String(value).trim().toLowerCase().replace() to the caller.
    return String(value).trim().toLowerCase().replace(/\/$/, "");
  }
};

// Declare requestOrigin for use by the surrounding module or function.
const requestOrigin = (req) => normalizeOrigin(req.get("Origin") || "");

// Declare getApiKeyFromRequest for use by the surrounding module or function.
export const getApiKeyFromRequest = (req) =>
  String(req.get("X-API-Key") || req.get("X-Integration-Key") || "").trim();

// Declare getPublicKeyFromRequest for use by the surrounding module or function.
export const getPublicKeyFromRequest = (req) =>
  String(req.get("X-Public-Integration-Key") || req.query?.siteKey || "").trim();

// Define establishIntegrationTenant; its parameters and body implement this operation.
async function establishIntegrationTenant(req, key, { publicRequest = false } = {}) {
  // Declare tenant for use by the surrounding module or function.
  const tenant = await Organization.findOne({
    _id: key.tenantId,
    status: { $in: ["active", "trial"] },
  }).lean();
  // Check the condition (!tenant) and run the matching branch.
  if (!tenant) return { error: { status: 403, message: "The connected company is not active." } };

  // Declare origin for use by the surrounding module or function.
  const origin = requestOrigin(req);
  // Declare allowed for use by the surrounding module or function.
  const allowed = (key.allowedOrigins || []).map(normalizeOrigin).filter(Boolean);

  // Browser/public connectors must always present a browser Origin and it must
  // exactly match a configured origin. This prevents a leaked publishable key
  // from being used by an arbitrary website.
  // Check the condition (publicRequest) and run the matching branch.
  if (publicRequest) {
    // Check the condition (!origin) and run the matching branch.
    if (!origin) {
      // Return the object assembled below to the caller.
      return { error: { status: 403, message: "A browser Origin is required for the public website connector." } };
    }
    // Check the condition (!allowed.length || !allowed.includes(origin)) and run the matching branch.
    if (!allowed.length || !allowed.includes(origin)) {
      // Return the object assembled below to the caller.
      return { error: { status: 403, message: "This website origin is not authorized for this integration key." } };
    }
  } else if (origin && allowed.length && !allowed.includes(origin)) {
    // Return the object assembled below to the caller.
    return { error: { status: 403, message: "This website origin is not authorized for this integration key." } };
  }

  // Perform the side effect or state update expressed on the following line.
  req.integration = {
    keyId: key._id,
    tenantId: key.tenantId,
    permissions: new Set(key.permissions || []),
    environment: key.environment,
    allowedOrigins: allowed,
    origin,
    public: publicRequest,
  };
  // Perform the side effect or state update expressed on the following line.
  req.tenantId = key.tenantId;
  // Perform the side effect or state update expressed on the following line.
  req.tenant = tenant;
  // Return the object assembled below to the caller.
  return { tenant };
}

// Declare requireIntegrationKey for use by the surrounding module or function.
export const requireIntegrationKey = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare rawKey for use by the surrounding module or function.
    const rawKey = getApiKeyFromRequest(req);
    // Check the condition (!rawKey || rawKey.length < 32) and run the matching branch.
    if (!rawKey || rawKey.length < 32) {
      // Return the result of res.status(401).json() to the caller.
      return res.status(401).json({ success: false, message: "Integration API key is required." });
    }
    // Declare key for use by the surrounding module or function.
    const key = await WebsiteIntegrationKey.findOne({
      keyHash: hashKey(rawKey),
      active: true,
      revokedAt: null,
    }).lean();
    // Check the condition (!key) and run the matching branch.
    if (!key) {
      // Return the result of res.status(401).json() to the caller.
      return res.status(401).json({ success: false, message: "Invalid or revoked integration API key." });
    }
    // Declare result for use by the surrounding module or function.
    const result = await establishIntegrationTenant(req, key, { publicRequest: false });
    // Check the condition (result.error) and run the matching branch.
    if (result.error) return res.status(result.error.status).json({ success: false, message: result.error.message });
    // Perform the side effect or state update expressed on the following line.
    await WebsiteIntegrationKey.updateOne(
      { _id: key._id },
      { $set: { lastUsedAt: new Date() }, $inc: { usageCount: 1 } },
    );
    // Return the result of runWithTenant() to the caller.
    return runWithTenant(
      { tenantId: key.tenantId, tenant: result.tenant, role: "integration", bypass: false },
      () => next(),
    );
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

// Declare requirePublicIntegrationKey for use by the surrounding module or function.
export const requirePublicIntegrationKey = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare publicKey for use by the surrounding module or function.
    const publicKey = getPublicKeyFromRequest(req);
    // Check the condition (!publicKey || publicKey.length < 20) and run the matching branch.
    if (!publicKey || publicKey.length < 20) {
      // Return the result of res.status(401).json() to the caller.
      return res.status(401).json({ success: false, message: "Public integration site key is required." });
    }
    // Declare key for use by the surrounding module or function.
    const key = await WebsiteIntegrationKey.findOne({
      publicKeyHash: hashKey(publicKey),
      active: true,
      revokedAt: null,
    }).lean();
    // Check the condition (!key) and run the matching branch.
    if (!key) {
      // Return the result of res.status(401).json() to the caller.
      return res.status(401).json({ success: false, message: "Invalid or revoked integration site key." });
    }
    // Declare result for use by the surrounding module or function.
    const result = await establishIntegrationTenant(req, key, { publicRequest: true });
    // Check the condition (result.error) and run the matching branch.
    if (result.error) return res.status(result.error.status).json({ success: false, message: result.error.message });
    // Perform the side effect or state update expressed on the following line.
    await WebsiteIntegrationKey.updateOne(
      { _id: key._id },
      { $set: { lastUsedAt: new Date() }, $inc: { usageCount: 1 } },
    );
    // Return the result of runWithTenant() to the caller.
    return runWithTenant(
      { tenantId: key.tenantId, tenant: result.tenant, role: "integration", bypass: false },
      () => next(),
    );
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

// Declare requireIntegrationPermission for use by the surrounding module or function.
export const requireIntegrationPermission = (permission) => (req, res, next) => {
  // Check the condition (!req.integration?.permissions?.has(permission)) and run the matching branch.
  if (!req.integration?.permissions?.has(permission)) {
    // Return the result of res.status(403).json() to the caller.
    return res.status(403).json({
      success: false,
      message: `Integration key lacks ${permission} permission.`,
    });
  }
  // Perform the side effect or state update expressed on the following line.
  next();
};

// Declare hashIntegrationKey for use by the surrounding module or function.
export const hashIntegrationKey = hashKey;
