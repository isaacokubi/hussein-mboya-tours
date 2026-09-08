import { useQuery } from "@tanstack/react-query";
import { getSystemHealth } from "../../../api/adminApi";

const statusTone = (status) => {
  const value = String(status || "").toLowerCase();
  if (["online", "connected", "active", "healthy", "ok"].includes(value)) return "healthy";
  if (["checking", "unknown"].includes(value)) return "checking";
  return "degraded";
};

export default function SystemHealth() {
  const { data, isLoading, isError, dataUpdatedAt, refetch } = useQuery({
    queryKey: ["admin-system-health"],
    queryFn: getSystemHealth,
    staleTime: 15000,
    refetchInterval: 30000,
    retry: 1,
  });

  const databaseStatus = isLoading ? "Checking" : isError ? "Unavailable" : data?.database === "connected" ? "Online" : "Offline";
  const apiStatus = isError ? "Unavailable" : "Online";
  const systems = [
    { name: "Database", status: databaseStatus },
    { name: "API Server", status: apiStatus },
    { name: "Cloudinary", status: "Not checked" },
    { name: "M-Pesa Gateway", status: "Not checked" },
  ];
  const allCoreHealthy = !isLoading && !isError && databaseStatus === "Online";

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">System Health</h2>
          <p className="mt-1 text-sm text-slate-500">Live connectivity checks for core platform services.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${allCoreHealthy ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
            {isLoading ? "Checking systems" : allCoreHealthy ? "Core systems operational" : "Attention required"}
          </span>
          <button type="button" onClick={() => refetch()} className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50">
            Refresh
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {systems.map((system) => {
          const tone = statusTone(system.status);
          const healthy = tone === "healthy";
          return (
            <div key={system.name} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-slate-800">{system.name}</p>
                <span className={`relative flex h-3 w-3 ${healthy ? "" : "opacity-60"}`} aria-label={`${system.name} ${system.status}`}>
                  <span className={`relative inline-flex h-3 w-3 rounded-full ${healthy ? "bg-emerald-500" : tone === "checking" ? "bg-amber-400" : "bg-slate-400"}`} />
                </span>
              </div>
              <p className={`mt-2 text-sm font-medium ${healthy ? "text-emerald-700" : tone === "checking" ? "text-amber-700" : "text-slate-500"}`}>{system.status}</p>
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
