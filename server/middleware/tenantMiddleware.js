import Organization from "../models/Organization.js";
import { runWithTenant } from "../tenancy/context.js";

const normalizeHost = (value = "") =>
  String(value)
    .split(",")[0]
    .trim()
    .toLowerCase()
    .replace(/:\d+$/, "");

const getOriginHost = (value = "") => {
  try {
    return normalizeHost(new URL(String(value)).hostname);
  } catch {
    return "";
  }
};

export async function resolveTenant(req, res, next) {
  try {
    const user = req.user;

    if (user?.role === "super_admin") {
      return runWithTenant(
        { role: "super_admin", bypass: true },
        () => next()
      );
    }

    // Authenticated users are always bound to their own tenant.
    if (user?.tenantId) {
      return runWithTenant(
        { tenantId: user.tenantId, role: user.role },
        () => next()
      );
    }

    // Public websites may select a tenant explicitly or by custom domain.
    const requestedTenantId = String(req.get("X-Tenant-ID") || "").trim();
    const requestedTenantSlug = String(req.get("X-Tenant-Slug") || "").trim().toLowerCase();
    const requestHost = normalizeHost(req.get("X-Forwarded-Host") || req.get("Host"));
    const originHost = getOriginHost(req.get("Origin"));

    let tenant = null;
    const activeStatuses = { $in: ["active", "trial"] };

    if (requestedTenantId) {
      tenant = await Organization.findOne({ _id: requestedTenantId, status: activeStatuses });
    }

    if (!tenant && requestedTenantSlug) {
      tenant = await Organization.findOne({ slug: requestedTenantSlug, status: activeStatuses });
    }

    if (!tenant && requestHost) {
      tenant = await Organization.findOne({ domain: requestHost, status: activeStatuses });
    }

    // Vercel deployments use a shared API domain, so the API Host header
    // cannot identify the frontend tenant. Derive the tenant slug from a
    // tenant-named *.vercel.app frontend when available.
    if (!tenant && originHost.endsWith(".vercel.app")) {
      const vercelSlug = originHost.slice(0, -".vercel.app".length).split(".").pop();
      if (vercelSlug) {
        tenant = await Organization.findOne({
          slug: vercelSlug,
          status: activeStatuses,
        });
      }
    }

    // Preserve the existing public deployment while allowing the default
    // tenant to be changed without modifying application code.
    if (!tenant) {
      const fallbackSlug = String(
        process.env.DEFAULT_PUBLIC_TENANT_SLUG || "hussein-mboya-tours"
      ).trim().toLowerCase();

      if (fallbackSlug) {
        tenant = await Organization.findOne({ slug: fallbackSlug, status: activeStatuses });
      }
    }

    if (!tenant) return next();

    req.tenantId = tenant._id;
    req.tenant = tenant;

    return runWithTenant(
      {
        tenantId: tenant._id,
        tenant,
        role: "public",
        bypass: false,
      },
      () => next()
    );
  } catch (error) {
    return next(error);
  }
}
