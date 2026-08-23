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
    const activeStatuses = { $in: ["active", "trial"] };
    let tenant = null;

    // Custom domains take precedence over client-supplied tenant identifiers.
    if (requestHost) tenant = await Organization.findOne({ domain: requestHost, status: activeStatuses });

    // For Vercel frontends, Origin identifies the public tenant while the API
    // Host points at the shared backend.
    if (!tenant && originHost.endsWith(".vercel.app")) {
      const vercelSlug = originHost.slice(0, -".vercel.app".length).split(".").filter(Boolean).pop();
      if (vercelSlug) tenant = await Organization.findOne({ slug: vercelSlug, status: activeStatuses });
    }

    // Explicit slug/key is a controlled fallback for custom deployments.
    if (!tenant && requestedTenantSlug) {
      tenant = await Organization.findOne({ slug: requestedTenantSlug, status: activeStatuses });
    }

    if (!tenant && requestedTenantKey) {
      if (/^[a-fA-F0-9]{24}$/.test(requestedTenantKey)) {
        tenant = await Organization.findOne({ _id: requestedTenantKey, status: activeStatuses });
      }
      if (!tenant) {
        tenant = await Organization.findOne({ slug: requestedTenantKey.toLowerCase(), status: activeStatuses });
      }
    }

    const fallbackSlug = String(process.env.DEFAULT_PUBLIC_TENANT_SLUG || "").trim().toLowerCase();
    if (!tenant && fallbackSlug) {
      tenant = await Organization.findOne({ slug: fallbackSlug, status: activeStatuses });
    }

    // Local development must remain usable when VITE_TENANT_SLUG is not set.
    // Only allow this fallback when there is exactly one active/trial tenant;
    // never guess between multiple tenants and never enable this behavior in
    // production. This preserves tenant isolation while fixing the common
    // single-company localhost setup.
    const allowSingleTenantDevFallback =
      String(process.env.ALLOW_SINGLE_TENANT_DEV_FALLBACK || "").toLowerCase() === "true" ||
      (process.env.NODE_ENV || "development") !== "production";

    if (!tenant && allowSingleTenantDevFallback) {
      const tenants = await Organization.find({ status: activeStatuses }).select("_id slug name domain").limit(2).lean();
      if (tenants.length === 1) tenant = tenants[0];
    }

    // Never invent or select a tenant by a hard-coded company name. If no
    // trusted tenant can be resolved, leave the request unscoped and let the
    // endpoint decide whether an unresolved tenant is acceptable.
    if (!tenant) return next();

    req.tenantId = tenant._id;
    req.tenant = tenant;
    return runWithTenant({ tenantId: tenant._id, tenant, role: "public", bypass: false }, () => next());
  } catch (error) {
    return next(error);
  }
}
