/**
 * Purpose: plan Feature Middleware request middleware. Main declarations: resolveFeatureForPath, getPlanFeaturesForTenant, enforcePlanFeature.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import Organization from "../models/Organization.js";
// Load ../services/planFeatureService.js so this module can use its exported dependencies.
import { getTenantPlanFeatures } from "../services/planFeatureService.js";

// Declare FEATURE_ROUTES for use by the surrounding module or function.
const FEATURE_ROUTES = [
  [/^\/admin\/?$/, "dashboard"], [/^\/admin\/users(?:\/|$)/, "users"], [/^\/admin\/staff(?:\/|$)/, "staff"], [/^\/admin\/destinations(?:\/|$)/, "destinations"],
  [/^\/admin\/tours(?:\/|$)/, "tours"], [/^\/admin\/bookings(?:\/|$)/, "bookings"], [/^\/admin\/custom-tour-requests(?:\/|$)/, "custom_tours"], [/^\/admin\/operations(?:\/|$)/, "operations"],
  [/^\/admin\/hospitality\/reservation-operations(?:\/|$)/, "hospitality_operations"], [/^\/admin\/hospitality\/commercial(?:\/|$)/, "hospitality_commercial"], [/^\/admin\/hospitality(?:\/|$)/, "hospitality_reservations"],
  [/^\/admin\/payments(?:\/|$)/, "payments"], [/^\/admin\/agents(?:\/|$)/, "agents"], [/^\/admin\/commissions(?:\/|$)/, "commissions"], [/^\/admin\/customers(?:\/|$)/, "crm"],
  [/^\/admin\/vehicles(?:\/|$)/, "fleet"], [/^\/admin\/coupons(?:\/|$)/, "coupons"], [/^\/admin\/reviews(?:\/|$)/, "reviews"], [/^\/admin\/gallery(?:\/|$)/, "gallery"], [/^\/admin\/reports(?:\/|$)/, "reports"],
  [/^\/admin\/analytics(?:\/|$)/, "analytics"], [/^\/admin\/finance\/transactions(?:\/|$)/, "mpesa_transactions"], [/^\/admin\/finance\/reports(?:\/|$)/, "finance_reports"], [/^\/admin\/finance\/management(?:\/|$)/, "management_accounting"],
  [/^\/admin\/finance\/accounting\/completion(?:\/|$)/, "complete_accounting"], [/^\/admin\/finance\/accounting\/control-reports(?:\/|$)/, "accounting_control_reports"], [/^\/admin\/finance\/accounting\/subledgers(?:\/|$)/, "accounting_subledgers"],
  [/^\/admin\/finance\/withholding-tax(?:\/|$)/, "withholding_tax"], [/^\/admin\/finance\/reconciliation(?:\/|$)/, "reconciliation"], [/^\/admin\/finance(?:\/|$)/, "finance"], [/^\/admin\/compliance(?:\/|$)/, "etims"],
  [/^\/admin\/ai(?:\/|$)/, "ai"], [/^\/admin\/notifications(?:\/|$)/, "notifications"], [/^\/admin\/rbac(?:\/|$)/, "rbac"], [/^\/admin\/system-health(?:\/|$)/, "system_health"],
  [/^\/admin\/billing(?:\/|$)/, "billing"], [/^\/admin\/platform-architecture(?:\/|$)/, "developer_platform"], [/^\/admin\/settings(?:\/|$)/, "settings"], [/^\/admin\/payment-gateways(?:\/|$)/, "payments"],
  [/^\/admin\/credit-debit-notes(?:\/|$)/, "credit_debit_notes"], [/^\/admin\/developer(?:\/|$)/, "developer_platform"], [/^\/admin\/tax(?:\/|$)/, "tax"], [/^\/admin\/payment-links(?:\/|$)/, "payment_links"],
  [/^\/analytics(?:\/|$)/, "analytics"], [/^\/(?:tourmanager|tour-manager|tour-assignments|tour-reports)(?:\/|$)/, "operations"], [/^\/agents(?:\/|$)/, "agents"], [/^\/agent(?:\/|$)/, "agents"],
  [/^\/crm(?:\/|$)/, "crm"], [/^\/invoices(?:\/|$)/, "finance"], [/^\/documents(?:\/|$)/, "finance"], [/^\/notifications(?:\/|$)/, "notifications"], [/^\/vehicles(?:\/|$)/, "fleet"],
  [/^\/staff(?:\/|$)/, "staff"], [/^\/users(?:\/|$)/, "users"], [/^\/commissions(?:\/|$)/, "commissions"], [/^\/ai(?:\/|$)/, "ai"], [/^\/admin-ai(?:\/|$)/, "ai"],
  [/^\/operations(?:\/|$)/, "operations"], [/^\/guide(?:\/|$)/, "operations"], [/^\/driver(?:\/|$)/, "fleet"], [/^\/hospitality-payments(?:\/|$)/, "hospitality_reservations"],
  [/^\/custom-tour-requests\/admin(?:\/|$)/, "custom_tours"],
];

// Declare DAY_MS for use by the surrounding module or function.
const DAY_MS = 86400000;
// Declare GRACE_DAYS for use by the surrounding module or function.
const GRACE_DAYS = Math.max(0, Math.min(Number(process.env.SUBSCRIPTION_GRACE_PERIOD_DAYS || 3), 30));

// Declare resolveFeatureForPath for use by the surrounding module or function.
export const resolveFeatureForPath = (path, search = "") => {
  // Declare normalized for use by the surrounding module or function.
  const normalized = String(path || "").split("?")[0].replace(/^\/api/, "") || "/";
  // Check the condition (/^\/admin\/hospitality(?:\/|$)/.test(normalized)) and run the matching branch.
  if (/^\/admin\/hospitality(?:\/|$)/.test(normalized)) {
    // Declare tab for use by the surrounding module or function.
    const tab = new URLSearchParams(String(search || "")).get("tab");
    // Check the condition (tab === "hotels") and run the matching branch.
    if (tab === "hotels") return "hotels";
    // Check the condition (tab === "transfers") and run the matching branch.
    if (tab === "transfers") return "airport_transfers";
  }
  // Return the expression shown below to the caller.
  return FEATURE_ROUTES.find(([pattern]) => pattern.test(normalized))?.[1] || null;
};

// Declare getPlanFeaturesForTenant for use by the surrounding module or function.
export const getPlanFeaturesForTenant = async (tenantId) => {
  // Declare organization for use by the surrounding module or function.
  const organization = await Organization.findById(tenantId).select("subscription.plan status").lean();
  // Check the condition (!organization) and run the matching branch.
  if (!organization) return { plan: null, features: [] };
  // Declare plan for use by the surrounding module or function.
  const plan = String(organization.subscription?.plan || "starter").toLowerCase();
  // Return the object assembled below to the caller.
  return { plan, features: await getTenantPlanFeatures(plan) };
};

// Declare enforcePlanFeature for use by the surrounding module or function.
export const enforcePlanFeature = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare role for use by the surrounding module or function.
    const role = String(req.user?.role || req.user?.legacyRole || req.userRole || "").toLowerCase();
    // Check the condition (["super_admin", "superadmin"].includes(role)) and run the matching branch.
    if (["super_admin", "superadmin"].includes(role)) return next();
    // Declare feature for use by the surrounding module or function.
    const feature = resolveFeatureForPath(req.path, req.originalUrl?.includes("?") ? req.originalUrl.slice(req.originalUrl.indexOf("?")) : "");
    // Check the condition (!feature) and run the matching branch.
    if (!feature) return next();
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = req.tenantId || req.user?.tenantId;
    // Check the condition (!tenantId) and run the matching branch.
    if (!tenantId) return next();

    // Declare organization for use by the surrounding module or function.
    const organization = await Organization.findById(tenantId).select("status subscription.plan subscription.trialEndsAt subscription.renewsAt").lean();
    // Check the condition (!organization) and run the matching branch.
    if (!organization) return res.status(403).json({ success: false, code: "TENANT_NOT_FOUND", message: "The company workspace could not be resolved." });

    // Declare plan for use by the surrounding module or function.
    const plan = String(organization.subscription?.plan || "starter").toLowerCase();
    // Declare now for use by the surrounding module or function.
    const now = Date.now();
    // Declare trialEndsAt for use by the surrounding module or function.
    const trialEndsAt = organization.subscription?.trialEndsAt ? new Date(organization.subscription.trialEndsAt).getTime() : null;
    // Declare renewsAt for use by the surrounding module or function.
    const renewsAt = organization.subscription?.renewsAt ? new Date(organization.subscription.renewsAt).getTime() : null;
    // Declare graceEndsAt for use by the surrounding module or function.
    const graceEndsAt = renewsAt ? renewsAt + GRACE_DAYS * DAY_MS : null;
    // Declare billingFeature for use by the surrounding module or function.
    const billingFeature = feature === "billing";
    // Declare trialExpired for use by the surrounding module or function.
    const trialExpired = organization.status === "trial" && trialEndsAt && now > trialEndsAt;
    // Declare paidExpired for use by the surrounding module or function.
    const paidExpired = organization.status === "active" && renewsAt && now > renewsAt;
    // Declare withinGrace for use by the surrounding module or function.
    const withinGrace = paidExpired && graceEndsAt && now <= graceEndsAt;
    // Declare hardSuspended for use by the surrounding module or function.
    const hardSuspended = ["suspended", "cancelled"].includes(String(organization.status || "").toLowerCase());

    // Billing remains available after expiry so a tenant can self-recover.
    // Check the condition (!billingFeature && (hardSuspended || trialExpired || (paidExpired && !) and run the matching branch.
    if (!billingFeature && (hardSuspended || trialExpired || (paidExpired && !withinGrace))) {
      // Return the result of res.status(402).json() to the caller.
      return res.status(402).json({
        success: false,
        code: "SUBSCRIPTION_REQUIRED",
        message: "This workspace subscription has expired. Open Billing to renew the subscription and restore access.",
        plan,
        status: organization.status,
        renewsAt: organization.subscription?.renewsAt || null,
        trialEndsAt: organization.subscription?.trialEndsAt || null,
      });
    }

    // Declare features for use by the surrounding module or function.
    const features = await getTenantPlanFeatures(plan);
    // Perform the side effect or state update expressed on the following line.
    req.tenantPlan = plan;
    // Perform the side effect or state update expressed on the following line.
    req.tenantFeatures = features;
    // Perform the side effect or state update expressed on the following line.
    req.subscriptionState = withinGrace ? "grace" : trialExpired ? "expired" : hardSuspended ? "suspended" : "active";

    // Check the condition (features.includes(feature)) and run the matching branch.
    if (features.includes(feature)) return next();
    // Return the result of res.status(403).json() to the caller.
    return res.status(403).json({ success: false, code: "PLAN_FEATURE_LOCKED", message: `The ${feature.replace(/_/g, " ")} feature is not included in the ${plan} plan. Upgrade the workspace subscription to unlock it.`, feature, plan });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.error("Plan feature middleware error:", error);
    // Return the result of res.status(500).json() to the caller.
    return res.status(500).json({ success: false, message: "Unable to verify subscription feature access." });
  }
};
