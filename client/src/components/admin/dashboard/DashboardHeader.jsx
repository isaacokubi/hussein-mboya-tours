import { useSettings } from "../../../context/SettingsContext";
import { useTenant } from "../../../context/TenantContext";

export default function DashboardHeader() {
  const { settings = {} } = useSettings() || {};
  const { tenant = {} } = useTenant() || {};
  const companyName = String(
    settings.companyName || tenant.name || tenant.companyName || ""
  ).trim();

  return (
    <div>
      <h1 className="text-3xl font-bold">
        {companyName ? `${companyName} Admin Control Center` : "Admin Control Center"}
      </h1>
      <p className="mt-2 text-gray-500">
        {companyName
          ? `Complete business intelligence and management dashboard for ${companyName}.`
          : "Complete business intelligence and management dashboard"}
      </p>
    </div>
  );
}
