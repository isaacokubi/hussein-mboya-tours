import Organization from "../models/Organization.js";
import { runWithTenant } from "../tenancy/context.js";

const normalizeHost = (value = "") => String(value).split(",")[0].trim().toLowerCase().replace(/:\d+$/, "");
const getOriginHost = (value = "") => { try { return normalizeHost(new URL(String(value)).hostname); } catch { return ""; } };

export async function resolveTenant(req, res, next) {
  try {
    const user = req.user;
    if (user?.role === "super_admin") return runWithTenant({ role: "super_admin", bypass: true }, () => next());
    if (user?.tenantId) return runWithTenant({ tenantId: user.tenantId, role: user.role }, () => next());

    // Public requests must be anchored to the site that the visitor actually
    // opened. A client-provided slug is only a fallback; it must never be able
    // to override a trusted Host/Origin and accidentally select another tenant.
    const requestedTenantSlug = String(req.get("X-Tenant-Slug") || "").trim().toLowerCase();
    const requestHost = normalizeHost(req.get("X-Forwarded-Host") || req.get("Host"));
    const originHost = getOriginHost(req.get("Origin"));
    const activeStatuses = { $in: ["active", "trial"] };
    let tenant = null;

    // Custom domains take precedence over any client-supplied tenant slug.
    if (requestHost) tenant = await Organization.findOne({ domain: requestHost, status: activeStatuses });

    // For Vercel frontends, the Origin identifies the public tenant while the
    // API Host normally points at the shared Render backend.
    if (!tenant && originHost.endsWith(".vercel.app")) {
      const vercelSlug = originHost.slice(0, -".vercel.app".length).split(".").filter(Boolean).pop();
      if (vercelSlug) tenant = await Organization.findOne({ slug: vercelSlug, status: activeStatuses });
    }

    // Explicit slug is retained for controlled/custom deployments where no
    // trusted domain mapping exists. It can no longer override a trusted host.
    if (!tenant && requestedTenantSlug) {
      tenant = await Organization.findOne({ slug: requestedTenantSlug, status: activeStatuses });
    }

    const fallbackSlug = String(process.env.DEFAULT_PUBLIC_TENANT_SLUG || "hussein-mboya-tours").trim().toLowerCase();
    if (!tenant && fallbackSlug) tenant = await Organization.findOne({ slug: fallbackSlug, status: activeStatuses });
    if (!tenant) tenant = await Organization.findOne({ name: /^Hussein Mboya Tours$/i, status: activeStatuses });

    if (!tenant) return next();
    req.tenantId = tenant._id;
    req.tenant = tenant;
    return runWithTenant({ tenantId: tenant._id, tenant, role: "public", bypass: false }, () => next());
  } catch (error) {
    return next(error);
  }
}
