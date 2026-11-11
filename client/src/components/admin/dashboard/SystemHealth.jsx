/**
 * Purpose: System Health reusable UI component. Main declarations: statusTone, displayStatus, normalizeHealth, SystemHealth.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useQuery } from "@tanstack/react-query";
// Load ../../../api/adminApi so this module can use its exported dependencies.
import { getSystemHealth } from "../../../api/adminApi";

// Declare statusTone for use by the surrounding module or function.
const statusTone = (status) => {
  // Declare value for use by the surrounding module or function.
  const value = String(status || "").toLowerCase();
  // Check the condition (["online", "connected", "active", "healthy", "ok"].includes(value)) and run the matching branch.
  if (["online", "connected", "active", "healthy", "ok"].includes(value)) return "healthy";
  // Check the condition (["checking", "unknown"].includes(value)) and run the matching branch.
  if (["checking", "unknown"].includes(value)) return "checking";
  // Check the condition (["not_configured", "not configured"].includes(value)) and run the matching branch.
  if (["not_configured", "not configured"].includes(value)) return "neutral";
  // Return a configured text value to the caller.
  return "degraded";
};

// Declare displayStatus for use by the surrounding module or function.
const displayStatus = (status) => {
  // Declare value for use by the surrounding module or function.
  const value = String(status || "").toLowerCase();
  // Check the condition (value === "not_configured" || value === "not configured") and run the matching branch.
  if (value === "not_configured" || value === "not configured") return "Not configured";
  // Check the condition (value === "connected") and run the matching branch.
  if (value === "connected") return "Online";
  // Check the condition (value === "disconnected") and run the matching branch.
  if (value === "disconnected") return "Offline";
  // Return the expression shown below to the caller.
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : "Unknown";
};

// Declare normalizeHealth for use by the surrounding module or function.
const normalizeHealth = (payload) => payload?.system || payload?.data?.system || payload?.data || payload || {};

// Define SystemHealth; its parameters and body implement this operation.
export default function SystemHealth() {
  // Declare { data, isLoading, isError, dataUpdatedAt, refetch, isFetching } for use by the surrounding module or function.
  const { data, isLoading, isError, dataUpdatedAt, refetch, isFetching } = useQuery({
    queryKey: ["admin-system-health"],
    queryFn: getSystemHealth,
    staleTime: 15000,
    refetchInterval: 30000,
    retry: 1,
  });

  // Declare health for use by the surrounding module or function.
  const health = normalizeHealth(data);
  // Declare databaseStatus for use by the surrounding module or function.
  const databaseStatus = isLoading ? "Checking" : isError ? "Unavailable" : health.database === "connected" ? "Online" : "Offline";
  // Declare apiStatus for use by the surrounding module or function.
  const apiStatus = isError ? "Unavailable" : "Online";
  // Declare cloudinaryStatus for use by the surrounding module or function.
  const cloudinaryStatus = isLoading ? "Checking" : isError ? "Unavailable" : displayStatus(health.cloudinary);
  // Declare mpesaStatus for use by the surrounding module or function.
  const mpesaStatus = isLoading ? "Checking" : isError ? "Unavailable" : displayStatus(health.mpesa);
  // Declare systems for use by the surrounding module or function.
  const systems = [
    { name: "Database", status: databaseStatus },
    { name: "API Server", status: apiStatus },
    { name: "Cloudinary", status: cloudinaryStatus },
    { name: "M-Pesa Gateway", status: mpesaStatus },
  ];
  // Declare coreSystemsHealthy for use by the surrounding module or function.
  const coreSystemsHealthy = !isLoading && !isError && databaseStatus === "Online" && apiStatus === "Online";
  // Declare integrationAttention for use by the surrounding module or function.
  const integrationAttention = [cloudinaryStatus, mpesaStatus].some((status) => ["Unavailable", "Offline"].includes(status));

  // Return the expression shown below to the caller.
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
