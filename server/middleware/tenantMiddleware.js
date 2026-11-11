/**
 * Purpose: tenant Middleware request middleware. Main declarations: normalizeHost, getOriginHost, normalizeRole, isLoginRequest, isSubscriptionRequest.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load jsonwebtoken so this module can use its exported dependencies.
import jwt from "jsonwebtoken";
// Load ../models/Organization.js so this module can use its exported dependencies.
import Organization from "../models/Organization.js";
// Load ../config/env.js so this module can use its exported dependencies.
import env from "../config/env.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { runWithTenant } from "../tenancy/context.js";
// Load ../utils/tenantHost.js so this module can use its exported dependencies.
import { isTenantSubdomainHost } from "../utils/tenantHost.js";
// Load ../config/corsPolicy.js so this module can use its exported dependencies.
import { getConfiguredOrigins } from "../config/corsPolicy.js";
// Expose the selected declarations or re-exported members to other parts of the application.
export { isTenantSubdomainHost } from "../utils/tenantHost.js";
// Declare PLATFORM_ROLES for use by the surrounding module or function.
const PLATFORM_ROLES = new Set(["super_admin", "superadmin"]);
// Declare normalizeHost for use by the surrounding module or function.
const normalizeHost = (value = "") => String(value).split(",")[0].trim().toLowerCase().replace(/:\d+$/, "");
// Declare getOriginHost for use by the surrounding module or function.
const getOriginHost = (value = "") => { try { return normalizeHost(new URL(String(value)).hostname); } catch { return ""; } };
// Declare normalizeRole for use by the surrounding module or function.
const normalizeRole = (value = "") => String(value || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
// Declare JWT_ISSUER for use by the surrounding module or function.
const JWT_ISSUER = "husseinmboyatours"; const JWT_AUDIENCE = "husseinmboyatours-client";
// Declare isLoginRequest for use by the surrounding module or function.
const isLoginRequest = (req) => { const paths = [req.path, req.originalUrl].filter(Boolean).map((value) => String(value).toLowerCase().split("?")[0]); return req.method === "POST" && paths.some((path) => /(?:^|\/)auth\/login$/.test(path) || path === "/login"); };
// Declare isSubscriptionRequest for use by the surrounding module or function.
const isSubscriptionRequest = (req) => String(req.originalUrl || req.path || "").toLowerCase().includes("/subscription");
// Declare verifyAccessToken for use by the surrounding module or function.
const verifyAccessToken = (token, secret) => jwt.verify(token, secret, { issuer: JWT_ISSUER, audience: JWT_AUDIENCE });
// Declare getVerifiedTokenClaims for use by the surrounding module or function.
const getVerifiedTokenClaims = (req) => { const secret = env.JWT_SECRET || process.env.JWT_SECRET; if (!secret) return null; const bearer = req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.substring(7).trim() : ""; const cookie = String(req.cookies?.token || "").trim(); for (const token of [bearer, cookie].filter(Boolean)) { try { return verifyAccessToken(token, secret); } catch {} } return null; };
// Define resolveLoginTenantByUniqueEmail; its parameters and body implement this operation.
async function resolveLoginTenantByUniqueEmail(req) { if (!isLoginRequest(req)) return null; const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : ""; if (!email || !mongoose.connection.db) return null; const matches = await mongoose.connection.db.collection("users").find({ email, tenantId: { $exists: true, $ne: null } }).project({ tenantId: 1 }).limit(2).toArray(); if (matches.length !== 1 || !matches[0]?.tenantId) return null; return Organization.findOne({ _id: matches[0].tenantId, status: { $in: ["active", "trial", "suspended"] } }); }
// Define resolveTenant; its parameters and body implement this operation.
export async function resolveTenant(req, res, next) { try {
  // Login must be tenant-neutral: ignore any stale/previous HttpOnly session
  // when resolving the tenant. The submitted credentials determine the account.
  // Reusing an old session here can make the first login attempt resolve against
  // the wrong tenant and appear to succeed only on a second attempt.
  // Declare claims for use by the surrounding module or function.
  const claims = isLoginRequest(req) ? null : getVerifiedTokenClaims(req); const tokenRole = normalizeRole(claims?.role); const tokenTenantId = claims?.tenantId ? String(claims.tenantId) : "";
  // Check the condition (claims && PLATFORM_ROLES.has(tokenRole)) and run the matching branch.
  if (claims && PLATFORM_ROLES.has(tokenRole)) return runWithTenant({ role: "super_admin", tenantId: null, tenant: null, bypass: true }, () => next());
  // Check the condition (claims && tokenTenantId && mongoose.Types.ObjectId.isValid(tokenTenant) and run the matching branch.
  if (claims && tokenTenantId && mongoose.Types.ObjectId.isValid(tokenTenantId)) { const allowedStatuses = isSubscriptionRequest(req) || isLoginRequest(req) ? ["active", "trial", "suspended"] : ["active", "trial"]; const tokenTenant = await Organization.findOne({ _id: tokenTenantId, status: { $in: allowedStatuses } }); if (tokenTenant) { const requestedTenantId = String(req.get("X-Tenant-ID") || "").trim(); const requestedTenantSlug = String(req.get("X-Tenant-Slug") || "").trim().toLowerCase(); const requestedTenantKey = String(req.get("X-Tenant-Key") || "").trim(); if ((requestedTenantId && requestedTenantId !== String(tokenTenant._id)) || (requestedTenantSlug && requestedTenantSlug !== String(tokenTenant.slug || "").toLowerCase()) || (requestedTenantKey && requestedTenantKey !== String(tokenTenant._id) && requestedTenantKey.toLowerCase() !== String(tokenTenant.slug || "").toLowerCase())) return res.status(404).json({ success: false, message: "Tenant not found." }); req.tenantId = tokenTenant._id; req.tenant = tokenTenant; return runWithTenant({ tenantId: tokenTenant._id, tenant: tokenTenant, role: tokenRole || "authenticated", bypass: false }, () => next()); } return next(); }
  // Declare user for use by the surrounding module or function.
  const user = req.user; const normalizedRole = normalizeRole(user?.role); if (PLATFORM_ROLES.has(normalizedRole)) return runWithTenant({ role: "super_admin", bypass: true }, () => next()); if (user?.tenantId) return runWithTenant({ tenantId: user.tenantId, role: user.role }, () => next());
  // Declare requestedTenantId for use by the surrounding module or function.
  const requestedTenantId = String(req.get("X-Tenant-ID") || "").trim(); const requestedTenantSlug = String(req.get("X-Tenant-Slug") || "").trim().toLowerCase(); const requestedTenantKey = String(req.get("X-Tenant-Key") || "").trim(); const explicitTenantRequested = Boolean(requestedTenantId || requestedTenantSlug || requestedTenantKey); const requestHost = normalizeHost(req.get("X-Forwarded-Host") || req.get("Host")); const originHost = getOriginHost(req.get("Origin")); const configuredPlatformHost = normalizeHost(process.env.PLATFORM_HOST || "globaltours.com"); const platformHosts = new Set([configuredPlatformHost, `www.${configuredPlatformHost}`, `api.${configuredPlatformHost}`, `app.${configuredPlatformHost}`, `admin.${configuredPlatformHost}`, "localhost", "127.0.0.1", "[::1]"]); const activeStatuses = { $in: ["active", "trial"] }; let tenant = null;
  // Declare resolveHost for use by the surrounding module or function.
  const resolveHost = async (host) => { if (!host || platformHosts.has(host)) return null; const platformSuffix = `.${configuredPlatformHost}`; if (host.endsWith(platformSuffix)) { const parts = host.slice(0, -platformSuffix.length).split(".").filter(Boolean); const slug = parts.length === 1 ? parts[0] : null; if (!slug || slug === "www") return null; return Organization.findOne({ slug, status: activeStatuses }); } return Organization.findOne({ domain: host, status: activeStatuses }); };
  // Perform the side effect or state update expressed on the following line.
  tenant = await resolveHost(requestHost); if (!tenant && originHost) tenant = await resolveHost(originHost); if (!tenant && originHost.endsWith(".vercel.app")) { const vercelSlug = originHost.slice(0, -".vercel.app".length).split(".").filter(Boolean).pop(); if (vercelSlug) tenant = await Organization.findOne({ slug: vercelSlug, status: activeStatuses }); } if (!tenant && requestedTenantId && mongoose.Types.ObjectId.isValid(requestedTenantId)) tenant = await Organization.findOne({ _id: requestedTenantId, status: activeStatuses }); if (!tenant && requestedTenantSlug) tenant = await Organization.findOne({ slug: requestedTenantSlug, status: activeStatuses }); if (!tenant && requestedTenantKey) { if (/^[a-fA-F0-9]{24}$/.test(requestedTenantKey)) tenant = await Organization.findOne({ _id: requestedTenantKey, status: activeStatuses }); if (!tenant) tenant = await Organization.findOne({ slug: requestedTenantKey.toLowerCase(), status: activeStatuses }); }
  // Check the condition (tenant && requestedTenantId && String(tenant._id) !== requestedTenantI) and run the matching branch.
  if (tenant && requestedTenantId && String(tenant._id) !== requestedTenantId) return res.status(404).json({ success: false, message: "Tenant not found." });
  // Check the condition (tenant && requestedTenantSlug && String(tenant.slug || "").toLowerCase) and run the matching branch.
  if (tenant && requestedTenantSlug && String(tenant.slug || "").toLowerCase() !== requestedTenantSlug) {
    // Return the result of res.status(404).json() to the caller.
    return res.status(404).json({ success: false, message: "Tenant not found." });
  }
  // Check the condition (tenant && requestedTenantKey && String(tenant._id) !== requestedTenant) and run the matching branch.
  if (tenant && requestedTenantKey && String(tenant._id) !== requestedTenantKey && String(tenant.slug || "").toLowerCase() !== requestedTenantKey.toLowerCase()) {
    // Return the result of res.status(404).json() to the caller.
    return res.status(404).json({ success: false, message: "Tenant not found." });
  }
  // Check the condition (!tenant && explicitTenantRequested) and run the matching branch.
  if (!tenant && explicitTenantRequested) return res.status(404).json({ success: false, message: "Tenant not found." });
  // Check the condition (!tenant) and run the matching branch.
  if (!tenant) tenant = await resolveLoginTenantByUniqueEmail(req);
  // Declare integrationRequest for use by the surrounding module or function.
  const integrationRequest = String(req.originalUrl || req.path || "").toLowerCase().startsWith("/api/integrations/v1/");
  // Declare platformSuffix for use by the surrounding module or function.
  const platformSuffix = `.${configuredPlatformHost}`;
  // Declare tenantHostRequested for use by the surrounding module or function.
  const tenantHostRequested = !platformHosts.has(requestHost) && isTenantSubdomainHost(requestHost, configuredPlatformHost)
    || !platformHosts.has(originHost) && isTenantSubdomainHost(originHost, configuredPlatformHost);
  // Exact configured frontend origins may host the platform login page. They
  // still do not establish tenant context: tenant users are resolved only by
  // their unique account tenant or an explicit/host tenant selector above.
  // Declare configuredFrontendOrigin for use by the surrounding module or function.
  const configuredFrontendOrigin = getConfiguredOrigins(env).includes(String(req.get("Origin") || ""));
  // Declare customOriginRequested for use by the surrounding module or function.
  const customOriginRequested = Boolean(originHost && !platformHosts.has(originHost) && !originHost.endsWith(platformSuffix) && !integrationRequest && !configuredFrontendOrigin);
  // Check the condition (!tenant && (explicitTenantRequested || tenantHostRequested || customOr) and run the matching branch.
  if (!tenant && (explicitTenantRequested || tenantHostRequested || customOriginRequested)) {
    // Return the result of res.status(404).json() to the caller.
    return res.status(404).json({ success: false, message: "Tenant not found." });
  }
  // Declare fallbackSlug for use by the surrounding module or function.
  const fallbackSlug = String(process.env.DEFAULT_PUBLIC_TENANT_SLUG || process.env.PUBLIC_TENANT_SLUG || "").trim().toLowerCase();
  // Login tenant context comes only from the submitted tenant account (handled
  // above) or an explicit tenant host/selector. A public-site default must not
  // silently attach platform logins to a tenant.
  // Check the condition (!tenant && !isLoginRequest(req) && fallbackSlug) and run the matching branch.
  if (!tenant && !isLoginRequest(req) && fallbackSlug) tenant = await Organization.findOne({ slug: fallbackSlug, status: activeStatuses });
  // Declare allowSingleTenantDevFallback for use by the surrounding module or function.
  const allowSingleTenantDevFallback = String(process.env.ALLOW_SINGLE_TENANT_DEV_FALLBACK || "").toLowerCase() === "true"; if (!tenant && allowSingleTenantDevFallback) { const tenants = await Organization.find({ status: activeStatuses }).select("_id slug name domain").limit(2).lean(); if (tenants.length === 1) tenant = tenants[0]; }
  // Check the condition (!tenant) and run the matching branch.
  if (!tenant) return next(); req.tenantId = tenant._id; req.tenant = tenant; return runWithTenant({ tenantId: tenant._id, tenant, role: "public", bypass: false }, () => next());
} catch (error) { return next(error); } }
