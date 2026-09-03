import { useSettings } from "../../../context/SettingsContext";

export default function DashboardHeader() {
  const { settings = {} } = useSettings() || {};
  const companyName = String(settings.companyName || "").trim();

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
