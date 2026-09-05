import { useQuery } from "@tanstack/react-query";
import { getSystemHealth } from "../../../api/adminApi";

const statusTone = (status) => {
  const value = String(status || "").toLowerCase();
  if (["online", "connected", "active", "healthy", "ok"].includes(value)) return "healthy";
  if (["checking", "unknown"].includes(value)) return "checking";
  return "degraded";
};

const labelForStatus = (status) => {
  const value = String(status || "").toLowerCase();
  if (["online", "connected", "active", "healthy", "ok"].includes(value)) return "Online";
  if (["checking", "unknown"].includes(value)) return "Checking";
  return "Degraded";
};

export default function SystemHealth() {
  const { data, isLoading, isError, dataUpdatedAt, refetch, isFetching } = useQuery({
    queryKey: ["admin-system-health"],
    queryFn: getSystemHealth,
    staleTime: 15000,
    refetchInterval: 30000,
    retry: 1,
  });

  const services = data?.services || {};
  const fallbackDatabase = isLoading ? "checking" : isError ? "degraded" : data?.database === "connected" ? "online" : "degraded";
  const systems = [
    { name: "Database", key: "database", status: services.database?.status || fallbackDatabase, message: services.database?.message },
    { name: "API Server", key: "api", status: services.api?.status || (isError ? "degraded" : "online"), message: services.api?.message },
    { name: "Cloudinary", key: "cloudinary", status: services.cloudinary?.status || "checking", message: services.cloudinary?.message },
    { name: "M-Pesa Gateway", key: "mpesa", status: services.mpesa?.status || "checking", message: services.mpesa?.message },
  ];
  const allCoreHealthy = !isLoading && !isError && systems.every((system) => statusTone(system.status) === "healthy");

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">System Health</h2>
          <p className="mt-1 text-sm text-slate-500">Live connectivity checks for the database, API, Cloudinary and M-Pesa gateway.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${allCoreHealthy ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
            {isLoading ? "Checking systems" : allCoreHealthy ? "All systems operational" : "Attention required"}
          </span>
          <button type="button" onClick={() => refetch()} disabled={isFetching} className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
            {isFetching ? "Checking..." : "Refresh"}
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {systems.map((system) => {
          const tone = statusTone(system.status);
          const healthy = tone === "healthy";
          const checking = tone === "checking";
          return (
            <div key={system.key} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-slate-800">{system.name}</p>
                <span className={`inline-flex h-3 w-3 rounded-full ${healthy ? "bg-emerald-500" : checking ? "bg-amber-400" : "bg-red-400"}`} aria-label={`${system.name} ${labelForStatus(system.status)}`} />
              </div>
              <p className={`mt-2 text-sm font-medium ${healthy ? "text-emerald-700" : checking ? "text-amber-700" : "text-red-600"}`}>{labelForStatus(system.status)}</p>
              {system.message && <p className="mt-1 line-clamp-2 text-xs text-slate-500">{system.message}</p>}
              {system.key === "mpesa" && services.mpesa?.environment && <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">Environment: {services.mpesa.environment}</p>}
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-xs text-slate-400">
        {dataUpdatedAt ? `Last checked ${new Date(dataUpdatedAt).toLocaleTimeString()}.` : "Health check has not completed yet."}
      </p>
    </section>
  );
}
