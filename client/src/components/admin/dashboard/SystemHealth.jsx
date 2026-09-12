import { useQuery } from "@tanstack/react-query";
import { getSystemHealth } from "../../../api/adminApi";

const statusTone = (status) => {
  const value = String(status || "").toLowerCase();
  if (["online", "connected", "active", "healthy", "ok"].includes(value)) return "healthy";
  if (["checking", "unknown"].includes(value)) return "checking";
  if (["not_configured", "not configured"].includes(value)) return "neutral";
  return "degraded";
};

const displayStatus = (status) => {
  const value = String(status || "").toLowerCase();
  if (value === "not_configured" || value === "not configured") return "Not configured";
  if (value === "connected") return "Online";
  if (value === "disconnected") return "Offline";
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : "Unknown";
};

const normalizeHealth = (payload) => payload?.system || payload?.data?.system || payload?.data || payload || {};

export default function SystemHealth() {
  const { data, isLoading, isError, dataUpdatedAt, refetch, isFetching } = useQuery({
    queryKey: ["admin-system-health"],
    queryFn: getSystemHealth,
    staleTime: 15000,
    refetchInterval: 30000,
    retry: 1,
  });

  const health = normalizeHealth(data);
  const databaseStatus = isLoading ? "Checking" : isError ? "Unavailable" : health.database === "connected" ? "Online" : "Offline";
  const apiStatus = isError ? "Unavailable" : "Online";
  const cloudinaryStatus = isLoading ? "Checking" : isError ? "Unavailable" : displayStatus(health.cloudinary);
  const mpesaStatus = isLoading ? "Checking" : isError ? "Unavailable" : displayStatus(health.mpesa);
  const systems = [
    { name: "Database", status: databaseStatus },
    { name: "API Server", status: apiStatus },
    { name: "Cloudinary", status: cloudinaryStatus },
    { name: "M-Pesa Gateway", status: mpesaStatus },
  ];
  const coreSystemsHealthy = !isLoading && !isError && databaseStatus === "Online" && apiStatus === "Online";
  const integrationAttention = [cloudinaryStatus, mpesaStatus].some((status) => ["Unavailable", "Offline"].includes(status));

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">System Health</h2>
          <p className="mt-1 text-sm text-slate-500">Live connectivity checks for core platform services and integrations.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${coreSystemsHealthy && !integrationAttention ? "bg-emerald-50 text-emerald-700" : coreSystemsHealthy ? "bg-amber-50 text-amber-700" : "bg-amber-50 text-amber-700"}`}>
            {isLoading ? "Checking systems" : !coreSystemsHealthy ? "Attention required" : integrationAttention ? "Integration attention required" : "Core systems operational"}
          </span>
          <button type="button" disabled={isFetching} onClick={() => refetch()} className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50">
            {isFetching ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {systems.map((system) => {
          const tone = statusTone(system.status);
          const healthy = tone === "healthy";
          const neutral = tone === "neutral";
          return (
            <div key={system.name} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-slate-800">{system.name}</p>
                <span className={`relative flex h-3 w-3 ${healthy ? "" : "opacity-60"}`} aria-label={`${system.name} ${system.status}`}>
                  <span className={`relative inline-flex h-3 w-3 rounded-full ${healthy ? "bg-emerald-500" : tone === "checking" ? "bg-amber-400" : neutral ? "bg-slate-400" : "bg-slate-400"}`} />
                </span>
              </div>
              <p className={`mt-2 text-sm font-medium ${healthy ? "text-emerald-700" : tone === "checking" ? "text-amber-700" : neutral ? "text-slate-500" : "text-slate-500"}`}>{system.status}</p>
              {system.name === "M-Pesa Gateway" && health.services?.mpesa?.environment && <p className="mt-1 text-xs text-slate-400">Environment: {health.services.mpesa.environment}</p>}
              {(system.name === "M-Pesa Gateway" || system.name === "Cloudinary") && health.services?.[system.name === "M-Pesa Gateway" ? "mpesa" : "cloudinary"]?.message && <p className="mt-1 text-xs text-slate-400">{health.services[system.name === "M-Pesa Gateway" ? "mpesa" : "cloudinary"].message}</p>}
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
