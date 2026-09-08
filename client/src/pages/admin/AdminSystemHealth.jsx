import { useQuery } from "@tanstack/react-query";
import { getSystemHealth } from "../../api/admin/systemHealthApi";

export default function AdminSystemHealth() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-system-health"],
    queryFn: getSystemHealth,
    staleTime: 30000,
  });

  const system = data?.system || data?.data || data || {};
  if (isLoading) return <div className="p-6">Checking system health...</div>;
  if (isError) return <div className="p-6 text-red-600">System health endpoint could not be reached.</div>;

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-3xl font-bold">System Health</h1>
      <div className="grid md:grid-cols-3 gap-5">
        {Object.entries(system).map(([key, value]) => (
          <div key={key} className="bg-white rounded-xl shadow p-5">
            <p className="text-sm text-gray-500 capitalize">{key.replace(/([A-Z])/g, " $1")}</p>
            <p className="mt-2 font-semibold break-words">
              {typeof value === "object" ? JSON.stringify(value) : String(value)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
