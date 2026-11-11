/**
 * Purpose: Super Admin Api Monitor page-level UI component. Main declarations: normalize, statusTone, StatusPill, MetricCard, formatCheckedAt.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useQuery } from "@tanstack/react-query";
// Load react so this module can use its exported dependencies.
import { useMemo, useState } from "react";
// Load lucide-react so this module can use its exported dependencies.
import { Activity, AlertTriangle, CheckCircle2, Clock3, Database, Gauge, RefreshCw, Server, ShieldCheck, Wifi } from "lucide-react";
// Load ../../api/superAdminApi so this module can use its exported dependencies.
import { getApiMonitor } from "../../api/superAdminApi";

// Declare toneMap for use by the surrounding module or function.
const toneMap = {
  healthy: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  danger: "border-rose-200 bg-rose-50 text-rose-700",
  neutral: "border-slate-200 bg-slate-50 text-slate-700",
};

// Define normalize; its parameters and body implement this operation.
function normalize(value) {
  // Return the result of String(value || "").trim().toLowerCase() to the caller.
  return String(value || "").trim().toLowerCase();
}

// Define statusTone; its parameters and body implement this operation.
function statusTone(value) {
  // Declare status for use by the surrounding module or function.
  const status = normalize(value);
  // Check the condition (["online", "connected", "normal", "active", "healthy"].includes(status) and run the matching branch.
  if (["online", "connected", "normal", "active", "healthy"].includes(status)) return "healthy";
  // Check the condition (["degraded", "warning", "development"].includes(status)) and run the matching branch.
  if (["degraded", "warning", "development"].includes(status)) return "warning";
  // Check the condition (["offline", "disconnected", "failed", "error"].includes(status)) and run the matching branch.
  if (["offline", "disconnected", "failed", "error"].includes(status)) return "danger";
  // Return a configured text value to the caller.
  return "neutral";
}

// Define StatusPill; its parameters and body implement this operation.
function StatusPill({ value, fallback = "Unknown" }) {
  // Declare display for use by the surrounding module or function.
  const display = value === undefined || value === null || value === "" ? fallback : String(value);
  // Declare tone for use by the surrounding module or function.
  const tone = statusTone(display);
  // Return the expression shown below to the caller.
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${toneMap[tone]}`}>
      {tone === "healthy" ? <CheckCircle2 size={13} /> : tone === "danger" ? <AlertTriangle size={13} /> : <Activity size={13} />}
      {display}
    </span>
  );
}

// Define MetricCard; its parameters and body implement this operation.
function MetricCard({ icon: Icon, label, value, helper, tone = "neutral" }) {
  // Declare styles for use by the surrounding module or function.
  const styles = {
    healthy: "border-emerald-200 bg-gradient-to-br from-white to-emerald-50",
    warning: "border-amber-200 bg-gradient-to-br from-white to-amber-50",
    danger: "border-rose-200 bg-gradient-to-br from-white to-rose-50",
    neutral: "border-slate-200 bg-white",
  };

  // Return the expression shown below to the caller.
  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${styles[tone] || styles.neutral}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-black tracking-tight text-slate-950">{value}</p>
          {helper && <p className="mt-1 text-xs font-medium text-slate-500">{helper}</p>}
        </div>
        <div className="rounded-xl bg-slate-950 p-2.5 text-white shadow-sm">
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

// Define formatCheckedAt; its parameters and body implement this operation.
function formatCheckedAt(timestamp, fallback) {
  // Check the condition (!timestamp) and run the matching branch.
  if (!timestamp) return fallback;
  // Declare parsed for use by the surrounding module or function.
  const parsed = new Date(timestamp);
  // Return the expression shown below to the caller.
  return Number.isNaN(parsed.getTime()) ? fallback : parsed.toLocaleTimeString();
}

// Define SuperAdminApiMonitor; its parameters and body implement this operation.
export default function SuperAdminApiMonitor() {
  // Declare [lastRefresh, setLastRefresh] for use by the surrounding module or function.
  const [lastRefresh, setLastRefresh] = useState(null);

  // Declare { data, isLoading, isError, error, refetch, isFetching } for use by the surrounding module or function.
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["superadmin-api-monitor"],
    queryFn: getApiMonitor,
    refetchInterval: 30000,
    staleTime: 10000,
    retry: 1,
  });

  // Declare monitor for use by the surrounding module or function.
  const monitor = data?.data || data || {};
  // Declare endpoints for use by the surrounding module or function.
  const endpoints = Array.isArray(monitor.endpoints) ? monitor.endpoints : [];
  // Declare healthScore for use by the surrounding module or function.
  const healthScore = Number.isFinite(Number(monitor.healthScore)) ? Number(monitor.healthScore) : null;
  // Declare environment for use by the surrounding module or function.
  const environment = monitor.server?.environment || "Unknown";
  // Declare databaseStatus for use by the surrounding module or function.
  const databaseStatus = monitor.database?.status || "Unknown";
  // Declare endpointSummary for use by the surrounding module or function.
  const endpointSummary = useMemo(() => {
    // Declare registered for use by the surrounding module or function.
    const registered = endpoints.filter((endpoint) => normalize(endpoint.status) === "registered").length;
    // Declare degraded for use by the surrounding module or function.
    const degraded = endpoints.filter((endpoint) => normalize(endpoint.status) === "degraded").length;
    // Return the object assembled below to the caller.
    return { registered, degraded, total: endpoints.length };
  }, [endpoints]);

  // Declare handleRefresh for use by the surrounding module or function.
  const handleRefresh = async () => {
    // Perform the side effect or state update expressed on the following line.
    await refetch();
    // Perform the side effect or state update expressed on the following line.
    setLastRefresh(new Date().toISOString());
  };

  // Check the condition (isLoading) and run the matching branch.
  if (isLoading) {
    // Return the expression shown below to the caller.
    return (
      <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6 animate-pulse">
          <div className="h-28 rounded-3xl bg-slate-200" />
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((item) => <div key={item} className="h-32 rounded-2xl bg-slate-200" />)}
          </div>
          <div className="h-72 rounded-2xl bg-slate-200" />
        </div>
      </div>
    );
  }

  // Check the condition (isError) and run the matching branch.
  if (isError) {
    // Return the expression shown below to the caller.
    return (
      <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-4xl rounded-3xl border border-rose-200 bg-white p-8 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-700">
            <AlertTriangle size={24} />
          </div>
          <h1 className="mt-5 text-2xl font-black text-slate-950">API Monitor unavailable</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            The monitoring service did not return a usable status response. No health score or endpoint state is being fabricated.
          </p>
          <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs font-medium text-slate-600">
            {error?.response?.data?.message || error?.message || "The API monitoring service is unavailable."}
          </p>
          <button
            type="button"
            onClick={handleRefresh}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      </div>
    );
  }

  // Declare healthTone for use by the surrounding module or function.
  const healthTone = healthScore === null ? "neutral" : healthScore >= 90 ? "healthy" : healthScore >= 60 ? "warning" : "danger";
  // Declare environmentTone for use by the surrounding module or function.
  const environmentTone = normalize(environment) === "production" ? "healthy" : "warning";

  // Return the expression shown below to the caller.
  return (
    <div className="min-h-full bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-indigo-100">
                <Wifi size={14} /> Platform observability
              </div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">API Monitor</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Platform-level API availability, database connectivity and server runtime telemetry.
              </p>
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isFetching}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
              {isFetching ? "Refreshing…" : "Refresh status"}
            </button>
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard icon={Activity} label="API status" value={monitor.status || "—"} helper="Overall service state" tone={statusTone(monitor.status)} />
          <MetricCard icon={Gauge} label="Health score" value={healthScore === null ? "—" : `${healthScore}%`} helper={healthScore === null ? "Telemetry unavailable" : "Backend-reported score"} tone={healthTone} />
          <MetricCard icon={Database} label="Database" value={databaseStatus} helper="Connection state" tone={statusTone(databaseStatus)} />
          <MetricCard icon={Clock3} label="Response state" value={monitor.response || "—"} helper="Backend-reported state" tone={statusTone(monitor.response)} />
        </div>

        {environmentTone === "warning" && (
          <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900 sm:flex-row sm:items-center">
            <AlertTriangle className="shrink-0" size={20} />
            <div>
              <p className="font-bold">Non-production runtime detected</p>
              <p className="text-sm">The API reports <strong>{environment}</strong>. A healthy monitor response does not mean the deployment is production-certified.</p>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">Runtime</p>
                <h2 className="mt-1 text-xl font-black text-slate-950">Server information</h2>
              </div>
              <StatusPill value={environment} />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <InfoRow icon={Server} label="Node.js" value={monitor.server?.nodeVersion || "—"} />
              <InfoRow icon={Activity} label="Uptime" value={monitor.server?.uptime || "—"} />
              <InfoRow icon={Gauge} label="Heap usage" value={monitor.server?.memory ? `${monitor.server.memory.used || "—"} / ${monitor.server.memory.total || "—"}` : "—"} />
              <InfoRow icon={Clock3} label="Last checked" value={formatCheckedAt(monitor.timestamp || lastRefresh, "—")} />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">Coverage</p>
            <h2 className="mt-1 text-xl font-black text-slate-950">Monitoring scope</h2>
            <div className="mt-5 space-y-3">
              <SummaryRow label="Routes registered" value={endpointSummary.total || "—"} />
              <SummaryRow label="Healthy registration state" value={endpointSummary.registered || 0} />
              <SummaryRow label="Degraded registration state" value={endpointSummary.degraded || 0} />
              <SummaryRow label="Live latency probes" value="Not reported" />
            </div>
            <div className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50 p-3 text-xs leading-5 text-indigo-900">
              Endpoint entries currently report route registration state. A <strong>registered</strong> route is not the same as a successful live request, and <strong>n/a</strong> response time is intentionally shown as unavailable rather than zero.
            </div>
          </section>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-slate-100 p-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">Route inventory</p>
              <h2 className="mt-1 text-xl font-black text-slate-950">Endpoint health</h2>
              <p className="mt-1 text-sm text-slate-500">Current backend telemetry for monitored platform routes.</p>
            </div>
            <StatusPill value={`${endpointSummary.total} monitored`} />
          </div>

          <div className="divide-y divide-slate-100">
            {endpoints.length > 0 ? endpoints.map((endpoint, index) => {
              const tone = statusTone(endpoint.status);
              return (
                <div key={`${endpoint.endpoint || "endpoint"}-${index}`} className="flex flex-col gap-3 p-5 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className={`mt-0.5 rounded-lg p-2 ${tone === "healthy" ? "bg-emerald-100 text-emerald-700" : tone === "warning" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
                      <ShieldCheck size={17} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900">{endpoint.name || "API endpoint"}</p>
                      <p className="mt-0.5 truncate font-mono text-xs text-slate-500">{endpoint.endpoint || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:shrink-0">
                    <StatusPill value={endpoint.status} />
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-600">
                      {endpoint.responseTime || "Unavailable"}
                    </span>
                  </div>
                </div>
              );
            }) : (
              <div className="p-8 text-center">
                <Activity className="mx-auto text-slate-400" size={28} />
                <p className="mt-3 font-bold text-slate-700">No monitored endpoints returned</p>
                <p className="mt-1 text-sm text-slate-500">Endpoint telemetry is unavailable from the monitoring service.</p>
              </div>
            )}
          </div>
        </section>

        <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-xs text-slate-500 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <span>Auto-refresh: every 30 seconds</span>
          <span>Last server timestamp: {formatCheckedAt(monitor.timestamp, "Unavailable")}</span>
        </div>
      </div>
    </div>
  );
}

// Define InfoRow; its parameters and body implement this operation.
function InfoRow({ icon: Icon, label, value }) {
  // Return the expression shown below to the caller.
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
        <Icon size={14} /> {label}
      </div>
      <p className="mt-2 break-words text-sm font-black text-slate-900">{value}</p>
    </div>
  );
}

// Define SummaryRow; its parameters and body implement this operation.
function SummaryRow({ label, value }) {
  // Return the expression shown below to the caller.
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <span className="text-sm font-black text-slate-950">{value}</span>
    </div>
  );
}
