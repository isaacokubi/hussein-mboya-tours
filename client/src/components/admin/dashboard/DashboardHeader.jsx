/**
 * Purpose: Dashboard Header reusable UI component. Main declarations: DashboardHeader.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useSettings } from "../../../context/SettingsContext";
// Load ../../../context/TenantContext so this module can use its exported dependencies.
import { useTenant } from "../../../context/TenantContext";

// Define DashboardHeader; its parameters and body implement this operation.
export default function DashboardHeader() {
  // Declare { settings = {} } for use by the surrounding module or function.
  const { settings = {} } = useSettings() || {};
  // Declare { tenant = {} } for use by the surrounding module or function.
  const { tenant = {} } = useTenant() || {};
  // Declare companyName for use by the surrounding module or function.
  const companyName = String(
    settings.companyName || tenant.name || tenant.companyName || ""
  ).trim();

  // Return the expression shown below to the caller.
  return (
    <header className="admin-dashboard-header rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-6">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Administration</p>
      <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
        {companyName ? `${companyName} Admin Control Center` : "Admin Control Center"}
      </h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
        {companyName
          ? `Complete business intelligence and management dashboard for ${companyName}.`
          : "Complete business intelligence and management dashboard"}
      </p>
    </header>
  );
}
