import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import Organization from "../models/Organization.js";
import env from "../config/env.js";
import { runWithTenant } from "../tenancy/context.js";

const PLATFORM_ROLES = new Set(["super_admin", "superadmin"]);
const normalizeHost = (value = "") => String(value).split(",")[0].trim().toLowerCase().replace(/:\d+$/, "");
const getOriginHost = (value = "") => { try { return normalizeHost(new URL(String(value)).hostname); } catch { return ""; } };
const normalizeRole = (value = "") => String(value || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
const JWT_ISSUER = "husseinmboyatours";
const JWT_AUDIENCE = "husseinmboyatours-client";
const isLoginRequest = (req) => { const paths = [req.path, req.originalUrl].filter(Boolean).map((value) => String(value).toLowerCase().split("?")[0]); return req.method === "POST" && paths.some((path) => /(?:^|\/)auth\/login$/.test(path) || path === "/login"); };
const verifyAccessToken = (token, secret) => { try { return jwt.verify(token, secret, { issuer: JWT_ISSUER, audience: JWT_AUDIENCE }); } catch (error) { if (error?.name === "JsonWebTokenError" && /issuer|audience/i.test(error.message || "")) return jwt.verify(token, secret); throw error; } };
const getVerifiedTokenClaims = (req) => { const secret = env.JWT_SECRET || process.env.JWT_SECRET; if (!secret) return null; const bearer = req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.substring(7).trim() : ""; const cookie = String(req.cookies?.token || "").trim(); for (const token of [bearer, cookie].filter(Boolean)) { try { return verifyAccessToken(token, secret); } catch {} } return null; };

async function resolveLoginTenantByUniqueEmail(req) {
  if (!isLoginRequest(req)) return null;
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  if (!email || !mongoose.connection.db) return null;
  const matches = await mongoose.connection.db.collection("users").find({ email, tenantId: { $exists: true, $ne: null } }).project({ tenantId: 1 }).limit(2).toArray();
  if (matches.length !== 1 || !matches[0]?.tenantId) return null;
  return Organization.findOne({ _id: matches[0].tenantId, status: { $in: ["active", "trial"] } });
}

export async function resolveTenant(req, res, next) {
  try {
    // Resolve a verified token before anonymous host discovery. SuperAdmins
    // intentionally have tenantId=null; they must enter the platform bypass
    // context instead of falling through to a tenant-required public context.
    const claims = getVerifiedTokenClaims(req);
    const tokenRole = normalizeRole(claims?.role);
    const tokenTenantId = claims?.tenantId ? String(claims.tenantId) : "";
    if (claims && PLATFORM_ROLES.has(tokenRole)) return runWithTenant({ role: "super_admin", tenantId: null, tenant: null, bypass: true }, () => next());
    if (claims && tokenTenantId && mongoose.Types.ObjectId.isValid(tokenTenantId)) {
      const tokenTenant = await Organization.findOne({ _id: tokenTenantId, status: { $in: ["active", "trial"] } });
      if (tokenTenant) { req.tenantId = tokenTenant._id; req.tenant = tokenTenant; return runWithTenant({ tenantId: tokenTenant._id, tenant: tokenTenant, role: tokenRole || "authenticated", bypass: false }, () => next()); }
      return next();
    }

    const user = req.user;
    const normalizedRole = normalizeRole(user?.role);
    if (PLATFORM_ROLES.has(normalizedRole)) return runWithTenant({ role: "super_admin", bypass: true }, () => next());
    if (user?.tenantId) return runWithTenant({ tenantId: user.tenantId, role: user.role }, () => next());

    const requestedTenantSlug = String(req.get("X-Tenant-Slug") || "").trim().toLowerCase();
    const requestedTenantKey = String(req.get("X-Tenant-Key") || "").trim();
    const requestHost = normalizeHost(req.get("X-Forwarded-Host") || req.get("Host"));
    const originHost = getOriginHost(req.get("Origin"));
    const configuredPlatformHost = normalizeHost(process.env.PLATFORM_HOST || "globaltours.com");
    const platformHosts = new Set([configuredPlatformHost, `www.${configuredPlatformHost}`, "localhost", "127.0.0.1", "[::1]"]);
    const activeStatuses = { $in: ["active", "trial"] };
    let tenant = null;
    const resolveHost = async (host) => { if (!host || platformHosts.has(host)) return null; const platformSuffix = `.${configuredPlatformHost}`; if (host.endsWith(platformSuffix)) { const parts = host.slice(0, -platformSuffix.length).split(".").filter(Boolean); const slug = parts.length === 1 ? parts[0] : null; if (!slug || slug === "www") return null; return Organization.findOne({ slug, status: activeStatuses }); } return Organization.findOne({ domain: host, status: activeStatuses }); };
    tenant = await resolveHost(requestHost);
    if (!tenant && originHost) tenant = await resolveHost(originHost);
    if (!tenant && originHost.endsWith(".vercel.app")) { const vercelSlug = originHost.slice(0, -".vercel.app".length).split(".").filter(Boolean).pop(); if (vercelSlug) tenant = await Organization.findOne({ slug: vercelSlug, status: activeStatuses }); }
    if (!tenant && requestedTenantSlug) tenant = await Organization.findOne({ slug: requestedTenantSlug, status: activeStatuses });
    if (!tenant && requestedTenantKey) { if (/^[a-fA-F0-9]{24}$/.test(requestedTenantKey)) tenant = await Organization.findOne({ _id: requestedTenantKey, status: activeStatuses }); if (!tenant) tenant = await Organization.findOne({ slug: requestedTenantKey.toLowerCase(), status: activeStatuses }); }
    if (!tenant) tenant = await resolveLoginTenantByUniqueEmail(req);
    const fallbackSlug = String(process.env.DEFAULT_PUBLIC_TENANT_SLUG || "").trim().toLowerCase();
    if (!tenant && fallbackSlug) tenant = await Organization.findOne({ slug: fallbackSlug, status: activeStatuses });
    const allowSingleTenantDevFallback = String(process.env.ALLOW_SINGLE_TENANT_DEV_FALLBACK || "").toLowerCase() === "true" || (process.env.NODE_ENV || "development") !== "production";
    if (!tenant && allowSingleTenantDevFallback) { const tenants = await Organization.find({ status: activeStatuses }).select("_id slug name domain").limit(2).lean(); if (tenants.length === 1) tenant = tenants[0]; }
    if (!tenant) return next();
    req.tenantId = tenant._id; req.tenant = tenant;
    return runWithTenant({ tenantId: tenant._id, tenant, role: "public", bypass: false }, () => next());
  } catch (error) { return next(error); }
}
