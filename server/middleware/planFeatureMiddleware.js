import Organization from "../models/Organization.js";
import { getTenantPlanFeatures } from "../services/planFeatureService.js";

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

export const resolveFeatureForPath = (path) => {
  const normalized = String(path || "").split("?")[0].replace(/^\/api/, "") || "/";
  return FEATURE_ROUTES.find(([pattern]) => pattern.test(normalized))?.[1] || null;
};

export const getPlanFeaturesForTenant = async (tenantId) => {
  const organization = await Organization.findById(tenantId).select("subscription.plan status").lean();
  if (!organization) return { plan: null, features: [] };
  const plan = String(organization.subscription?.plan || "starter").toLowerCase();
  return { plan, features: await getTenantPlanFeatures(plan) };
};

export const enforcePlanFeature = async (req, res, next) => {
  try {
    const role = String(req.user?.role || req.user?.legacyRole || req.userRole || "").toLowerCase();
    if (["super_admin", "superadmin"].includes(role)) return next();
    const feature = resolveFeatureForPath(req.originalUrl || req.baseUrl || req.path);
    if (!feature) return next();
    const tenantId = req.tenantId || req.user?.tenantId;
    if (!tenantId) return next();
    const { plan, features } = await getPlanFeaturesForTenant(tenantId);
    if (features.includes(feature)) {
      req.tenantPlan = plan;
      req.tenantFeatures = features;
      return next();
    }
    return res.status(403).json({ success: false, code: "PLAN_FEATURE_LOCKED", message: `The ${feature.replace(/_/g, " ")} feature is not included in the ${plan} plan. Upgrade the workspace subscription to unlock it.`, feature, plan });
  } catch (error) {
    console.error("Plan feature middleware error:", error);
    return res.status(500).json({ success: false, message: "Unable to verify subscription feature access." });
  }
};
