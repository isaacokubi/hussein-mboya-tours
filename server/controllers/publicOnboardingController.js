import buildPermissions from "../utils/buildPermissions.js";
import generateToken from "../utils/generateToken.js";
import { createAuditLog } from "../services/auditService.js";
import { registerTenant } from "../services/publicOnboardingService.js";
import { runWithTenant } from "../tenancy/context.js";

export async function registerTenantPublic(req, res, next) {
  try {
    const result = await registerTenant({ company: req.body?.company || {}, admin: req.body?.admin || {}, plan: req.body?.plan || "starter", request: req });
    const adminUser = await result.adminUser.populate({ path: "roleId", populate: { path: "permissions" } });
    const permissions = buildPermissions(adminUser);
    const token = generateToken({ _id: adminUser._id, role: "admin", roleId: adminUser.roleId, email: adminUser.email, permissions, tenantId: adminUser.tenantId });

    await runWithTenant({ tenantId: result.organization._id, tenant: result.organization, bypass: false }, () => createAuditLog({
      user: adminUser._id,
      action: "tenant_registered",
      resource: "Organization",
      resourceId: result.organization._id,
      description: "Tenant registered through the public SaaS onboarding flow.",
      severity: "medium",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      endpoint: req.originalUrl,
      metadata: { plan: result.subscription.plan, trialEndsAt: result.subscription.trialEndsAt, firstSuperAdminProvisioned: result.createdFirstSuperAdmin },
    }));

    return res.status(201).json({
      success: true,
      message: "Company registered successfully. Your 14-day trial is active.",
      token,
      tenant: { id: result.organization._id, name: result.organization.name, slug: result.organization.slug, status: result.organization.status },
      subscription: { plan: result.subscription.plan, status: result.subscription.status, seats: result.subscription.seats, trialStartsAt: result.subscription.trialStartsAt, trialEndsAt: result.subscription.trialEndsAt },
      user: { _id: adminUser._id, name: adminUser.name, email: adminUser.email, phone: adminUser.phone, role: "admin", tenantId: adminUser.tenantId, permissions },
      platform: { firstSuperAdminProvisioned: result.createdFirstSuperAdmin },
    });
  } catch (error) {
    if (/already in use|already registered|Invalid subscription|not configured|Missing:/.test(error.message)) return res.status(409).json({ success: false, message: error.message });
    next(error);
  }
}
