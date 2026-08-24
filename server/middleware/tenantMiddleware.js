import mongoose from "mongoose";
import Organization from "../models/Organization.js";
import { runWithTenant } from "../tenancy/context.js";

const normalizeHost = (value = "") => String(value).split(",")[0].trim().toLowerCase().replace(/:\d+$/, "");
const getOriginHost = (value = "") => { try { return normalizeHost(new URL(String(value)).hostname); } catch { return ""; } };

const isLoginRequest = (req) => {
  // Express router middleware sees req.path as "/login" when this router is
  // mounted at /api/auth, while req.originalUrl remains "/api/auth/login".
  // Check both values so the unique-email tenant fallback actually runs.
  const paths = [req.path, req.originalUrl]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase().split("?")[0]);
  return req.method === "POST" && paths.some((path) => /(?:^|\/)auth\/login$/.test(path) || path === "/login");
};

/**
 * Resolve the tenant before public authentication. Host/header configuration is
 * authoritative. For local/shared deployments where the public tenant header
 * is missing, login may safely resolve an account's tenant by email only when
 * that email belongs to exactly one tenant. This avoids making a valid newly
 * registered account appear to have an invalid password while never selecting
 * an arbitrary tenant when the same email exists in multiple tenants.
 */
async function resolveLoginTenantByUniqueEmail(req) {
  if (!isLoginRequest(req)) return null;

  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  if (!email || !mongoose.connection.db) return null;

  const matches = await mongoose.connection.db
    .collection("users")
    .find({ email, tenantId: { $type: "objectId" } })
    .project({ tenantId: 1 })
    .limit(2)
    .toArray();

  if (matches.length !== 1 || !matches[0]?.tenantId) return null;

  return Organization.findOne({
    _id: matches[0].tenantId,
    status: { $in: ["active", "trial"] },
  });
}

export async function resolveTenant(req, res, next) {
  try {
    const user = req.user;
    const normalizedRole = String(user?.role || "").trim().toLowerCase();

    if (["super_admin", "superadmin"].includes(normalizedRole)) {
      return runWithTenant({ role: "super_admin", bypass: true }, () => next());
    }
    if (user?.tenantId) return runWithTenant({ tenantId: user.tenantId, role: user.role }, () => next());

    const requestedTenantSlug = String(req.get("X-Tenant-Slug") || "").trim().toLowerCase();
    const requestedTenantKey = String(req.get("X-Tenant-Key") || "").trim();
    const requestHost = normalizeHost(req.get("X-Forwarded-Host") || req.get("Host"));
    const originHost = getOriginHost(req.get("Origin"));
    const configuredPlatformHost = normalizeHost(process.env.PLATFORM_HOST || "globaltours.com");
    const platformHosts = new Set([configuredPlatformHost, `www.${configuredPlatformHost}`, "localhost", "127.0.0.1"]);
    const activeStatuses = { $in: ["active", "trial"] };
    let tenant = null;

    const resolveHost = async (host) => {
      if (!host || platformHosts.has(host)) return null;

      const platformSuffix = `.${configuredPlatformHost}`;
      if (host.endsWith(platformSuffix)) {
        const parts = host.slice(0, -platformSuffix.length).split(".").filter(Boolean);
        const slug = parts.length === 1 ? parts[0] : null;
        if (!slug || slug === "www") return null;
        return Organization.findOne({ slug, status: activeStatuses });
      }

      return Organization.findOne({ domain: host, status: activeStatuses });
    };

    // Explicit tenant identity and host/domain are authoritative.
    tenant = await resolveHost(requestHost);
    if (!tenant && originHost) tenant = await resolveHost(originHost);

    if (!tenant && originHost.endsWith(".vercel.app")) {
      const vercelSlug = originHost.slice(0, -".vercel.app".length).split(".").filter(Boolean).pop();
      if (vercelSlug) tenant = await Organization.findOne({ slug: vercelSlug, status: activeStatuses });
    }

    if (!tenant && requestedTenantSlug) {
      tenant = await Organization.findOne({ slug: requestedTenantSlug, status: activeStatuses });
    }

    if (!tenant && requestedTenantKey) {
      if (/^[a-fA-F0-9]{24}$/.test(requestedTenantKey)) {
        tenant = await Organization.findOne({ _id: requestedTenantKey, status: activeStatuses });
      }
      if (!tenant) tenant = await Organization.findOne({ slug: requestedTenantKey.toLowerCase(), status: activeStatuses });
    }

    // IMPORTANT: For a local/shared public login, resolve a uniquely-owned
    // account before applying any default tenant. Otherwise a default public
    // tenant can capture the request and make a valid tenant-admin password
    // look invalid because the user is queried inside the wrong tenant.
    if (!tenant) tenant = await resolveLoginTenantByUniqueEmail(req);

    const fallbackSlug = String(process.env.DEFAULT_PUBLIC_TENANT_SLUG || "").trim().toLowerCase();
    if (!tenant && fallbackSlug) tenant = await Organization.findOne({ slug: fallbackSlug, status: activeStatuses });

    const allowSingleTenantDevFallback =
      String(process.env.ALLOW_SINGLE_TENANT_DEV_FALLBACK || "").toLowerCase() === "true" ||
      (process.env.NODE_ENV || "development") !== "production";

    if (!tenant && allowSingleTenantDevFallback) {
      const tenants = await Organization.find({ status: activeStatuses }).select("_id slug name domain").limit(2).lean();
      if (tenants.length === 1) tenant = tenants[0];
    }

    if (!tenant) return next();

    req.tenantId = tenant._id;
    req.tenant = tenant;
    return runWithTenant({ tenantId: tenant._id, tenant, role: "public", bypass: false }, () => next());
  } catch (error) {
    return next(error);
  }
}
