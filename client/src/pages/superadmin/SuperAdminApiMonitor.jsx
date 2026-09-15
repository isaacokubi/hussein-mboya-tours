import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Activity, AlertTriangle, CheckCircle2, Clock3, Database, Gauge, RefreshCw, Server, ShieldCheck, Wifi } from "lucide-react";
import { getApiMonitor } from "../../api/superAdminApi";

const toneMap = {
  healthy: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  danger: "border-rose-200 bg-rose-50 text-rose-700",
  neutral: "border-slate-200 bg-slate-50 text-slate-700",
};

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function statusTone(value) {
  const status = normalize(value);
  if (["online", "connected", "normal", "active", "healthy"].includes(status)) return "healthy";
  if (["degraded", "warning", "development"].includes(status)) return "warning";
  if (["offline", "disconnected", "failed", "error"].includes(status)) return "danger";
  return "neutral";
}

function StatusPill({ value, fallback = "Unknown" }) {
  const display = value === undefined || value === null || value === "" ? fallback : String(value);
  const tone = statusTone(display);
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${toneMap[tone]}`}>
      {tone === "healthy" ? <CheckCircle2 size={13} /> : tone === "danger" ? <AlertTriangle size={13} /> : <Activity size={13} />}
      {display}
    </span>
  );
}

function MetricCard({ icon: Icon, label, value, helper, tone = "neutral" }) {
  const styles = {
    healthy: "border-emerald-200 bg-gradient-to-br from-white to-emerald-50",
    warning: "border-amber-200 bg-gradient-to-br from-white to-amber-50",
    danger: "border-rose-200 bg-gradient-to-br from-white to-rose-50",
    neutral: "border-slate-200 bg-white",
  };

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

function formatCheckedAt(timestamp, fallback) {
  if (!timestamp) return fallback;
  const parsed = new Date(timestamp);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed.toLocaleTimeString();
}

export default function SuperAdminApiMonitor() {
  const [lastRefresh, setLastRefresh] = useState(null);

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["superadmin-api-monitor"],
    queryFn: getApiMonitor,
    refetchInterval: 30000,
    staleTime: 10000,
    retry: 1,
  });

  const monitor = data?.data || data || {};
  const endpoints = Array.isArray(monitor.endpoints) ? monitor.endpoints : [];
  const healthScore = Number.isFinite(Number(monitor.healthScore)) ? Number(monitor.healthScore) : null;
  const environment = monitor.server?.environment || "Unknown";
  const databaseStatus = monitor.database?.status || "Unknown";
  const endpointSummary = useMemo(() => {
    const registered = endpoints.filter((endpoint) => normalize(endpoint.status) === "registered").length;
    const degraded = endpoints.filter((endpoint) => normalize(endpoint.status) === "degraded").length;
    return { registered, degraded, total: endpoints.length };
  }, [endpoints]);

  const handleRefresh = async () => {
    await refetch();
    setLastRefresh(new Date().toISOString());
  };

  if (isLoading) {
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

  if (isError) {
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

  const healthTone = healthScore === null ? "neutral" : healthScore >= 90 ? "healthy" : healthScore >= 60 ? "warning" : "danger";
  const environmentTone = normalize(environment) === "production" ? "healthy" : "warning";

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

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
        <Icon size={14} /> {label}
      </div>
      <p className="mt-2 break-words text-sm font-black text-slate-900">{value}</p>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <span className="text-sm font-black text-slate-950">{value}</span>
    </div>
  );
}
