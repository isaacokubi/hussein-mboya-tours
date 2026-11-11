/**
 * Purpose: Plan Feature Gate reusable UI component. Main declarations: labelFor, resolveFeature, PlanFeatureGate, Info.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useEffect, useMemo, useState } from "react";
// Load lucide-react so this module can use its exported dependencies.
import { LockKeyhole, RefreshCw, ShieldCheck, Sparkles } from "lucide-react";
// Load react-router-dom so this module can use its exported dependencies.
import { Link, useLocation } from "react-router-dom";
// Load ../../context/AuthContext so this module can use its exported dependencies.
import { useAuth } from "../../context/AuthContext";
// Load ../../utils/roleUtils so this module can use its exported dependencies.
import { getUserRole } from "../../utils/roleUtils";
// Load ../../api/axios so this module can use its exported dependencies.
import api from "../../api/axios";

// Declare PATH_FEATURES for use by the surrounding module or function.
const PATH_FEATURES = [
  [/^\/admin\/?$/, "dashboard"], [/^\/admin\/users(?:\/|$)/, "users"], [/^\/admin\/staff(?:\/|$)/, "staff"],
  [/^\/admin\/destinations(?:\/|$)/, "destinations"], [/^\/admin\/bookings(?:\/|$)/, "bookings"], [/^\/admin\/custom-tour-requests(?:\/|$)/, "custom_tours"],
  [/^\/admin\/operations(?:\/|$)/, "operations"], [/^\/admin\/hospitality\/reservation-operations(?:\/|$)/, "hospitality_operations"],
  [/^\/admin\/hospitality\/commercial(?:\/|$)/, "hospitality_commercial"], [/^\/admin\/hospitality(?:\/|$)/, "hospitality_reservations"],
  [/^\/admin\/payments(?:\/|$)/, "payments"], [/^\/admin\/agents(?:\/|$)/, "agents"], [/^\/admin\/commissions(?:\/|$)/, "commissions"],
  [/^\/admin\/customers(?:\/|$)/, "crm"], [/^\/admin\/vehicles(?:\/|$)/, "fleet"], [/^\/admin\/coupons(?:\/|$)/, "coupons"],
  [/^\/admin\/reviews(?:\/|$)/, "reviews"], [/^\/admin\/gallery(?:\/|$)/, "gallery"], [/^\/admin\/reports(?:\/|$)/, "reports"], [/^\/admin\/analytics(?:\/|$)/, "analytics"],
  [/^\/admin\/finance\/transactions(?:\/|$)/, "mpesa_transactions"], [/^\/admin\/finance\/reports(?:\/|$)/, "finance_reports"], [/^\/admin\/finance\/management(?:\/|$)/, "management_accounting"],
  [/^\/admin\/finance\/accounting\/completion(?:\/|$)/, "complete_accounting"], [/^\/admin\/finance\/accounting\/control-reports(?:\/|$)/, "accounting_control_reports"],
  [/^\/admin\/finance\/accounting\/subledgers(?:\/|$)/, "accounting_subledgers"], [/^\/admin\/finance\/withholding-tax(?:\/|$)/, "withholding_tax"],
  [/^\/admin\/finance\/reconciliation(?:\/|$)/, "reconciliation"], [/^\/admin\/finance(?:\/|$)/, "finance"], [/^\/admin\/compliance(?:\/|$)/, "etims"],
  [/^\/admin\/ai(?:\/|$)/, "ai"], [/^\/admin\/notifications(?:\/|$)/, "notifications"], [/^\/admin\/rbac(?:\/|$)/, "rbac"],
  [/^\/admin\/system-health(?:\/|$)/, "system_health"], [/^\/admin\/billing(?:\/|$)/, "billing"], [/^\/admin\/platform-architecture(?:\/|$)/, "developer_platform"],
  [/^\/admin\/settings(?:\/|$)/, "settings"], [/^\/admin\/credit-debit-notes(?:\/|$)/, "credit_debit_notes"], [/^\/admin\/tax(?:\/|$)/, "tax"], [/^\/admin\/payment-links(?:\/|$)/, "payment_links"],
  [/^\/agent(?:\/|$)/, "agents"], [/^\/agents(?:\/|$)/, "agents"], [/^\/(?:tourmanager|tour-manager|tour-assignments|tour-reports)(?:\/|$)/, "operations"],
  [/^\/guide(?:\/|$)/, "operations"], [/^\/driver(?:\/|$)/, "fleet"], [/^\/notifications(?:\/|$)/, "notifications"], [/^\/analytics(?:\/|$)/, "analytics"],
  [/^\/crm(?:\/|$)/, "crm"], [/^\/vehicles(?:\/|$)/, "fleet"], [/^\/staff(?:\/|$)/, "staff"], [/^\/users(?:\/|$)/, "users"],
  [/^\/commissions(?:\/|$)/, "commissions"], [/^\/ai(?:\/|$)/, "ai"], [/^\/operations(?:\/|$)/, "operations"], [/^\/hospitality-payments(?:\/|$)/, "hospitality_reservations"],
  [/^\/custom-tour-requests\/admin(?:\/|$)/, "custom_tours"], [/^\/my-bookings(?:\/|$)/, "bookings"], [/^\/checkout(?:\/|$)/, "payments"],
];

// Declare labelFor for use by the surrounding module or function.
const labelFor = (feature = "") => feature.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

// Define resolveFeature; its parameters and body implement this operation.
function resolveFeature(pathname, search) {
  // Check the condition (/^\/admin\/hospitality(?:\/|$)/.test(pathname)) and run the matching branch.
  if (/^\/admin\/hospitality(?:\/|$)/.test(pathname)) {
    // Declare tab for use by the surrounding module or function.
    const tab = new URLSearchParams(search).get("tab");
    // Check the condition (tab === "hotels") and run the matching branch.
    if (tab === "hotels") return "hotels";
    // Check the condition (tab === "transfers") and run the matching branch.
    if (tab === "transfers") return "airport_transfers";
  }
  // Return the expression shown below to the caller.
  return PATH_FEATURES.find(([pattern]) => pattern.test(pathname))?.[1] || null;
}

// Define PlanFeatureGate; its parameters and body implement this operation.
export default function PlanFeatureGate({ children }) {
  // Declare { user, token, loading: authLoading } for use by the surrounding module or function.
  const { user, token, loading: authLoading } = useAuth();
  // Declare location for use by the surrounding module or function.
  const location = useLocation();
  // Declare [state, setState] for use by the surrounding module or function.
  const [state, setState] = useState({ loading: false, plan: "", features: null, error: null });
  // Declare role for use by the surrounding module or function.
  const role = getUserRole(user);
  // Declare isSuperAdmin for use by the surrounding module or function.
  const isSuperAdmin = ["super_admin", "superadmin"].includes(String(role || "").toLowerCase());
  // Declare feature for use by the surrounding module or function.
  const feature = useMemo(() => resolveFeature(location.pathname, location.search), [location.pathname, location.search]);

  // Perform the side effect or state update expressed on the following line.
  useEffect(() => {
    // Check the condition (authLoading || !token || !user || isSuperAdmin || !feature) and run the matching branch.
    if (authLoading || !token || !user || isSuperAdmin || !feature) return undefined;
    // Declare active for use by the surrounding module or function.
    let active = true;
    // Perform the side effect or state update expressed on the following line.
    setState({ loading: true, plan: "", features: null, error: null });
    // Entitlement checks must not leave the entire dashboard behind an
    // indefinite spinner when a tenant API is slow or waking from idle. The
    // API enforces these entitlements independently, so a timed-out UI check
    // can fail open and let the dashboard render while its data requests retry.
    // Perform the side effect or state update expressed on the following line.
    api.get("/subscription", { timeout: 12_000 }).then(({ data }) => {
      // Check the condition (!active) and run the matching branch.
      if (!active) return;
      // Perform the side effect or state update expressed on the following line.
      setState({ loading: false, plan: String(data?.plan || "starter").toLowerCase(), features: Array.isArray(data?.features) ? data.features : [], error: null });
    }).catch((error) => {
      // Check the condition (!active) and run the matching branch.
      if (!active) return;
      // Perform the side effect or state update expressed on the following line.
      console.error("[PlanFeatureGate] Subscription check failed:", error);
      // Release the gate on transient API failures. The backend remains
      // responsible for enforcing subscription and role permissions.
      // Perform the side effect or state update expressed on the following line.
      setState({ loading: false, plan: "", features: [], error });
    });
    // Return the expression shown below to the caller.
    return () => { active = false; };
  }, [authLoading, token, user, isSuperAdmin, feature]);

  // Check the condition (!feature || !token || !user || isSuperAdmin || authLoading) and run the matching branch.
  if (!feature || !token || !user || isSuperAdmin || authLoading) return children;

  // Keep the application shell visible. The gate occupies only the module content area.
  // Check the condition (state.loading || state.features === null) and run the matching branch.
  if (state.loading || state.features === null) {
    // Return the expression shown below to the caller.
    return (
      <div className="w-full px-4 py-6 md:px-6 md:py-8">
        <div className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <RefreshCw size={20} className="animate-spin" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900">Checking workspace access</h1>
              <p className="mt-1 text-sm text-slate-500">Verifying your subscription entitlement for this module.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // API errors fail open so a temporary subscription-service outage never masquerades as a plan lock.
  // Check the condition (state.error || state.features.includes(feature)) and run the matching branch.
  if (state.error || state.features.includes(feature)) return children;

  // Declare featureLabel for use by the surrounding module or function.
  const featureLabel = labelFor(feature);
  // Declare planLabel for use by the surrounding module or function.
  const planLabel = labelFor(state.plan || "starter");

  // Return the expression shown below to the caller.
  return (
    <div className="w-full px-4 py-6 md:px-6 md:py-8">
      <div className="mx-auto w-full max-w-4xl">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 px-6 py-7 text-white md:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                <LockKeyhole size={23} />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-amber-300">Subscription feature lock</p>
                <h1 className="mt-1 text-2xl font-black tracking-tight md:text-3xl">{featureLabel}</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                  This module is not included in the <strong className="text-white">{planLabel}</strong> workspace plan. Upgrade the subscription to unlock this feature.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="grid gap-3 sm:grid-cols-3">
              <Info icon={ShieldCheck} label="Current plan" value={planLabel} />
              <Info icon={LockKeyhole} label="Required access" value={featureLabel} />
              <Info icon={Sparkles} label="Access status" value="Locked" />
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Link
                to="/admin/billing"
                className="inline-flex items-center justify-center rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                Review subscription
              </Link>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                <RefreshCw size={16} />
                Recheck access
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

// Define Info; its parameters and body implement this operation.
function Info({ icon: Icon, label, value }) {
  // Return the expression shown below to the caller.
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">
        <Icon size={14} />
        {label}
      </div>
      <p className="mt-2 text-sm font-black capitalize text-slate-900">{value}</p>
    </div>
  );
}
