import Organization from "../models/Organization.js";
import { runWithTenant } from "../tenancy/context.js";

const normalizeHost = (value = "") => String(value).split(",")[0].trim().toLowerCase().replace(/:\d+$/, "");
const getOriginHost = (value = "") => { try { return normalizeHost(new URL(String(value)).hostname); } catch { return ""; } };

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

    // Platform subdomains: <tenant-slug>.<PLATFORM_HOST>.
    // The hostname is authoritative; do not accept a client-supplied slug when
    // the request already identifies a tenant by its host.
    const platformSuffix = `.${configuredPlatformHost}`;
    if (requestHost.endsWith(platformSuffix)) {
      const subdomain = requestHost.slice(0, -platformSuffix.length).split(".").filter(Boolean);
      const tenantSlug = subdomain.length === 1 ? subdomain[0] : null;
      if (tenantSlug && tenantSlug !== "www") {
        tenant = await Organization.findOne({ slug: tenantSlug, status: activeStatuses });
      }
      if (!tenant) return res.status(404).json({ success: false, message: "Tenant not found for this hostname" });
    }

    // Custom domains take precedence over client-supplied tenant identifiers.
    if (!tenant && requestHost && !platformHosts.has(requestHost)) {
      tenant = await Organization.findOne({ domain: requestHost, status: activeStatuses });
    }

    // For shared Vercel frontends, Origin can identify the tenant when the API
    // host is shared. Prefer a tenant-specific Vercel deployment only when it
    // exactly matches a stored tenant slug.
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
