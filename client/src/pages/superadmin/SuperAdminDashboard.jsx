import { useQuery } from "@tanstack/react-query";
import { getSuperAdminDashboard } from "../../api/superAdminApi";

const labels = {
  users: "Total Users",
  staff: "Staff Members",
  agents: "Agents",
  vehicles: "Vehicles",
  bookings: "Bookings",
  admins: "Administrators",
};

export default function SuperAdminDashboard() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["superadmin-dashboard"],
    queryFn: getSuperAdminDashboard,
    retry: 2,
  });

  const stats = data?.stats || {};

  if (isLoading) return <div className="p-8">Loading system control center...</div>;

  if (isError) {
    return (
      <div className="p-8 rounded-xl bg-red-50 text-red-700">
        Unable to load superadmin dashboard: {error?.message || "Server error"}
      </div>
    );
  }

  return (
    <section className="p-6 space-y-8 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold">Super Admin Control Center</h1>
        <p className="text-gray-600 mt-2">
          Platform monitoring, security oversight and business intelligence.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(labels).map(([key, title]) => (
          <div key={key} className="bg-white rounded-2xl shadow p-6 border">
            <p className="text-gray-500">{title}</p>
            <p className="text-4xl font-bold mt-3">{stats[key] ?? 0}</p>
            <p className="text-sm text-gray-400 mt-2">Live database metric</p>
          </div>
        ))}
      </div>
    </section>
  );
}
