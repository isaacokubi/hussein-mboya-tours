import Organization from "../models/Organization.js";
import { runWithTenant } from "../tenancy/context.js";

const normalizeHost = (value = "") => String(value).split(",")[0].trim().toLowerCase().replace(/:\d+$/, "");
const getOriginHost = (value = "") => { try { return normalizeHost(new URL(String(value)).hostname); } catch { return ""; } };

export async function resolveTenant(req, res, next) {
  try {
    const user = req.user;
    if (user?.role === "super_admin") return runWithTenant({ role: "super_admin", bypass: true }, () => next());
    if (user?.tenantId) return runWithTenant({ tenantId: user.tenantId, role: user.role }, () => next());

    // Unauthenticated public requests resolve tenants by a public slug or
    // trusted host/origin. Never accept a raw tenant ObjectId from the client.
    const requestedTenantSlug = String(req.get("X-Tenant-Slug") || "").trim().toLowerCase();
    const requestHost = normalizeHost(req.get("X-Forwarded-Host") || req.get("Host"));
    const originHost = getOriginHost(req.get("Origin"));
    const activeStatuses = { $in: ["active", "trial"] };
    let tenant = null;

    if (requestedTenantSlug) tenant = await Organization.findOne({ slug: requestedTenantSlug, status: activeStatuses });
    if (!tenant && requestHost) tenant = await Organization.findOne({ domain: requestHost, status: activeStatuses });

    if (!tenant && originHost.endsWith(".vercel.app")) {
      const vercelSlug = originHost.slice(0, -".vercel.app".length).split(".").pop();
      if (vercelSlug) tenant = await Organization.findOne({ slug: vercelSlug, status: activeStatuses });
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
