import { useQuery } from "@tanstack/react-query";
import { getSystemHealth } from "../../api/admin/systemHealthApi";

const statusTone = (status) => {
  const value = String(status || "").toLowerCase();
  if (["online", "connected", "active", "healthy", "ok"].includes(value)) return "healthy";
  if (["checking", "unknown"].includes(value)) return "checking";
  return "degraded";
};

const statusLabel = (status) => {
  const tone = statusTone(status);
  return tone === "healthy" ? "Online" : tone === "checking" ? "Checking" : "Degraded";
};

export default function AdminSystemHealth() {
  const { data, isLoading, isError, refetch, isFetching, dataUpdatedAt } = useQuery({
    queryKey: ["admin-system-health-page"],
    queryFn: getSystemHealth,
    staleTime: 15000,
    refetchInterval: 30000,
    retry: 1,
  });

  const services = data?.services || {};
  const systems = [
    { name: "Database", key: "database", status: services.database?.status || (data?.database === "connected" ? "online" : "degraded"), message: services.database?.message },
    { name: "API Server", key: "api", status: services.api?.status || (isError ? "degraded" : "online"), message: services.api?.message },
    { name: "Cloudinary", key: "cloudinary", status: services.cloudinary?.status || "checking", message: services.cloudinary?.message },
    { name: "M-Pesa Gateway", key: "mpesa", status: services.mpesa?.status || "checking", message: services.mpesa?.message, environment: services.mpesa?.environment },
  ];

  const allHealthy = !isLoading && !isError && systems.every((system) => statusTone(system.status) === "healthy");

  if (isLoading) return <div className="p-6">Checking database, API, Cloudinary and M-Pesa gateway...</div>;
  if (isError) return <div className="p-6 text-red-600">System health endpoint could not be reached.</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">System Health</h1>
          <p className="mt-1 text-slate-500">Live checks of the core services used by the platform.</p>
        </div>
        <button type="button" onClick={() => refetch()} disabled={isFetching} className="rounded-xl border px-4 py-2 font-semibold disabled:opacity-50">
          {isFetching ? "Checking..." : "Refresh Checks"}
        </button>
      </div>

      <div className={`rounded-2xl border p-4 ${allHealthy ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
        <p className="font-bold">{allHealthy ? "All core services are operational." : "One or more services require attention."}</p>
        <p className="mt-1 text-sm">The checks test real connectivity rather than displaying a static configuration value.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {systems.map((system) => {
          const tone = statusTone(system.status);
          return (
            <article key={system.key} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-bold text-slate-900">{system.name}</h2>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${tone === "healthy" ? "bg-emerald-100 text-emerald-700" : tone === "checking" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{statusLabel(system.status)}</span>
              </div>
              <p className="mt-3 text-sm text-slate-600">{system.message || "No additional status message."}</p>
              {system.environment && <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Environment: {system.environment}</p>}
            </article>
          );
        })}
      </div>

      <p className="text-xs text-slate-400">{dataUpdatedAt ? `Last checked ${new Date(dataUpdatedAt).toLocaleTimeString()}.` : "Health check has not completed yet."}</p>
    </div>
  );
}
