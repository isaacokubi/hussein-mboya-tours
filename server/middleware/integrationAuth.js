import crypto from "crypto";
import WebsiteIntegrationKey from "../models/WebsiteIntegrationKey.js";
import Organization from "../models/Organization.js";
import { runWithTenant } from "../tenancy/context.js";

const hashKey = (value) => crypto.createHash("sha256").update(String(value)).digest("hex");
const normalizeOrigin = (value = "") => {
  try { return new URL(String(value)).origin.toLowerCase(); } catch { return String(value).trim().toLowerCase().replace(/\/$/, ""); }
};

export const getApiKeyFromRequest = (req) => String(req.get("X-API-Key") || req.get("X-Integration-Key") || "").trim();
export const getPublicKeyFromRequest = (req) => String(req.get("X-Public-Integration-Key") || req.query?.siteKey || "").trim();

async function establishIntegrationTenant(req, key) {
  const tenant = await Organization.findOne({ _id: key.tenantId, status: { $in: ["active", "trial"] } }).lean();
  if (!tenant) return { error: { status: 403, message: "The connected company is not active." } };

  const origin = normalizeOrigin(req.get("Origin") || req.get("Referer") || "");
  const allowed = (key.allowedOrigins || []).map(normalizeOrigin).filter(Boolean);
  if (allowed.length && origin && !allowed.includes(origin)) return { error: { status: 403, message: "This website origin is not authorized for this integration key." } };

  req.integration = { keyId: key._id, tenantId: key.tenantId, permissions: new Set(key.permissions || []), environment: key.environment, allowedOrigins: allowed, public: false };
  req.tenantId = key.tenantId;
  req.tenant = tenant;
  return { tenant };
}

export const requireIntegrationKey = async (req, res, next) => {
  try {
    const rawKey = getApiKeyFromRequest(req);
    if (!rawKey || rawKey.length < 32) return res.status(401).json({ success: false, message: "Integration API key is required." });
    const key = await WebsiteIntegrationKey.findOne({ keyHash: hashKey(rawKey), active: true, revokedAt: null }).lean();
    if (!key) return res.status(401).json({ success: false, message: "Invalid or revoked integration API key." });
    const result = await establishIntegrationTenant(req, key);
    if (result.error) return res.status(result.error.status).json({ success: false, message: result.error.message });
    await WebsiteIntegrationKey.updateOne({ _id: key._id }, { $set: { lastUsedAt: new Date() }, $inc: { usageCount: 1 } });
    return runWithTenant({ tenantId: key.tenantId, tenant: result.tenant, role: "integration", bypass: false }, () => next());
  } catch (error) { next(error); }
};

export const requirePublicIntegrationKey = async (req, res, next) => {
  try {
    const publicKey = getPublicKeyFromRequest(req);
    if (!publicKey || publicKey.length < 20) return res.status(401).json({ success: false, message: "Public integration site key is required." });
    const key = await WebsiteIntegrationKey.findOne({ publicKeyHash: hashKey(publicKey), active: true, revokedAt: null }).lean();
    if (!key) return res.status(401).json({ success: false, message: "Invalid or revoked integration site key." });
    const result = await establishIntegrationTenant(req, key);
    if (result.error) return res.status(result.error.status).json({ success: false, message: result.error.message });
    req.integration.public = true;
    await WebsiteIntegrationKey.updateOne({ _id: key._id }, { $set: { lastUsedAt: new Date() }, $inc: { usageCount: 1 } });
    return runWithTenant({ tenantId: key.tenantId, tenant: result.tenant, role: "integration", bypass: false }, () => next());
  } catch (error) { next(error); }
};

export const requireIntegrationPermission = (permission) => (req, res, next) => {
  if (!req.integration?.permissions?.has(permission)) return res.status(403).json({ success: false, message: `Integration key lacks ${permission} permission.` });
  next();
};

export const hashIntegrationKey = hashKey;