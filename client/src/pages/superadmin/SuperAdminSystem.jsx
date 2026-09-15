import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, AlertTriangle, CheckCircle2, Clock3, Cpu, Database, HardDrive, RefreshCw, Server, ShieldCheck, XCircle } from "lucide-react";
import { getSystemHealth } from "../../api/superAdminApi";

function normalizeSystemHealth(payload) {
  const source = payload?.system || payload?.data?.system || payload?.data || payload || {};
  const rawMemory = source.memory || {};
  const database = typeof source.database === "object" ? source.database : { status: source.database };
  return {
    ...source,
    status: source.status || "unknown",
    checks: source.checks || {},
    uptimeSeconds: Number(source.uptimeSeconds ?? source.uptime ?? 0),
    nodeVersion: source.nodeVersion || source.node || null,
    environment: source.environment || source.env || null,
    memory: {
      rssMb: rawMemory.rssMb ?? null,
      heapUsedMb: rawMemory.heapUsedMb ?? null,
      heapTotalMb: rawMemory.heapTotalMb ?? null,
      externalMb: rawMemory.externalMb ?? null,
      heapPercent: rawMemory.heapPercent ?? null,
    },
    platform: source.platform || {},
    database,
    timestamp: source.timestamp || source.checkedAt || source.lastChecked || null,
  };
}

const statusMeta = {
  healthy: { label: "Healthy", icon: CheckCircle2, classes: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  warning: { label: "Warning", icon: AlertTriangle, classes: "bg-amber-50 text-amber-700 border-amber-200" },
  degraded: { label: "Degraded", icon: AlertTriangle, classes: "bg-amber-50 text-amber-700 border-amber-200" },
  unhealthy: { label: "Unhealthy", icon: XCircle, classes: "bg-rose-50 text-rose-700 border-rose-200" },
  unknown: { label: "Unknown", icon: AlertTriangle, classes: "bg-slate-100 text-slate-600 border-slate-200" },
};

function StatusBadge({ value }) {
  const meta = statusMeta[String(value || "unknown").toLowerCase()] || statusMeta.unknown;
  const Icon = meta.icon;
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${meta.classes}`}><Icon className="h-3.5 w-3.5" />{meta.label}</span>;
}

function formatUptime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "—";
  const total = Math.floor(seconds);
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  if (days) return `${days}d ${hours}h ${minutes}m`;
  if (hours) return `${hours}h ${minutes}m`;
  return `${minutes}m ${total % 60}s`;
}

function formatTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-KE", { timeZone: "Africa/Nairobi", dateStyle: "medium", timeStyle: "medium" }).format(date);
}

function MetricCard({ icon: Icon, label, value, detail, tone = "slate" }) {
  const tones = {
    emerald: "border-emerald-200 bg-emerald-50/70 text-emerald-700",
    blue: "border-blue-200 bg-blue-50/70 text-blue-700",
    amber: "border-amber-200 bg-amber-50/70 text-amber-700",
    slate: "border-slate-200 bg-slate-50 text-slate-700",
  };
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p><p className="mt-2 text-2xl font-black tracking-tight text-slate-950">{value}</p>{detail && <p className="mt-1 text-xs text-slate-500">{detail}</p>}</div><div className={`rounded-xl border p-3 ${tones[tone]}`}><Icon className="h-5 w-5" /></div></div></div>;
}

function DetailRow({ label, value }) {
  return <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-3 last:border-0"><span className="text-sm text-slate-500">{label}</span><strong className="max-w-[65%] break-words text-right text-sm font-semibold text-slate-900">{value ?? "—"}</strong></div>;
}

export default function SuperAdminSystem() {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({ queryKey: ["system-health"], queryFn: getSystemHealth, refetchInterval: 10000 });

  const system = useMemo(() => normalizeSystemHealth(data), [data]);
  const databaseHealthy = String(system.database?.status || "").toLowerCase() === "connected" || system.database?.connected === true;
  const overallHealthy = String(system.status).toLowerCase() === "healthy";
  const heapPercent = Number(system.memory.heapPercent);
  const memoryKnown = Number.isFinite(heapPercent);
  const healthScore = overallHealthy ? (databaseHealthy && (!memoryKnown || heapPercent < 90) ? 100 : 90) : databaseHealthy ? 70 : 25;

  if (isLoading) return <div className="min-h-full bg-slate-50 p-6 lg:p-8"><div className="mx-auto max-w-[1600px] animate-pulse space-y-6"><div className="h-32 rounded-3xl bg-slate-200" /><div className="grid gap-4 md:grid-cols-3"><div className="h-28 rounded-2xl bg-slate-200" /><div className="h-28 rounded-2xl bg-slate-200" /><div className="h-28 rounded-2xl bg-slate-200" /></div><div className="h-72 rounded-2xl bg-slate-200" /></div></div>;

  if (isError) return <div className="min-h-full bg-slate-50 p-6 lg:p-8"><div className="mx-auto max-w-[1600px] rounded-3xl border border-rose-200 bg-white p-8 shadow-sm"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600"><XCircle className="h-6 w-6" /></div><h1 className="mt-5 text-2xl font-black text-slate-950">System health is unavailable</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">The health service could not be reached. No service is assumed healthy when the health endpoint fails.</p><p className="mt-2 text-xs text-rose-600">{error?.message || "Unknown error"}</p><button onClick={() => refetch()} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800"><RefreshCw className="h-4 w-4" />Retry</button></div></div>;

  return <div className="min-h-full bg-slate-50 p-6 lg:p-8">
    <div className="mx-auto max-w-[1600px] space-y-6">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-6 text-white shadow-xl lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div><div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-emerald-200"><Activity className="h-3.5 w-3.5" />Platform observability</div><h1 className="text-3xl font-black tracking-tight lg:text-4xl">System Health Center</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">Live runtime, database, platform and resource health for Global Tours. Values are sourced from the platform health service and are not substituted with optimistic defaults.</p></div>
          <div className="flex shrink-0 items-center gap-3"><StatusBadge value={system.status} /><button onClick={() => refetch()} disabled={isFetching} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"><RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />{isFetching ? "Refreshing..." : "Refresh"}</button></div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard icon={Activity} label="Platform status" value={overallHealthy ? "Healthy" : "Degraded"} detail={overallHealthy ? "Runtime checks passing" : "One or more checks need attention"} tone={overallHealthy ? "emerald" : "amber"} />
        <MetricCard icon={Database} label="Database" value={databaseHealthy ? "Connected" : "Disconnected"} detail={databaseHealthy ? "MongoDB connection ready" : "Database connectivity requires attention"} tone={databaseHealthy ? "blue" : "amber"} />
        <MetricCard icon={Clock3} label="Process uptime" value={formatUptime(system.uptimeSeconds)} detail="Since the current Node.js process started" tone="slate" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="text-lg font-black text-slate-950">Runtime information</h2><p className="mt-1 text-sm text-slate-500">Current application process and host details.</p></div><Server className="h-5 w-5 text-slate-400" /></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Node version</p><p className="mt-1 font-bold text-slate-950">{system.nodeVersion || "—"}</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Environment</p><p className="mt-1 font-bold capitalize text-slate-950">{system.environment || "—"}</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Operating system</p><p className="mt-1 font-bold text-slate-950">{system.platform.os || "—"}</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Architecture</p><p className="mt-1 font-bold text-slate-950">{system.platform.architecture || "—"}</p></div></div></section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="text-lg font-black text-slate-950">Health score</h2><p className="mt-1 text-sm text-slate-500">Derived only from authoritative checks.</p></div><ShieldCheck className={`h-6 w-6 ${healthScore >= 90 ? "text-emerald-600" : healthScore >= 60 ? "text-amber-600" : "text-rose-600"}`} /></div><div className="mt-6 flex items-end gap-2"><span className="text-5xl font-black tracking-tight text-slate-950">{healthScore}%</span><span className="mb-2 text-sm font-semibold text-slate-500">current</span></div><div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full transition-all ${healthScore >= 90 ? "bg-emerald-500" : healthScore >= 60 ? "bg-amber-500" : "bg-rose-500"}`} style={{ width: `${healthScore}%` }} /></div><p className="mt-3 text-xs leading-5 text-slate-500">A disconnected database or unavailable health response lowers the score; the UI never presents an unavailable service as 100% healthy.</p></section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center gap-3"><div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700"><HardDrive className="h-5 w-5" /></div><div><h2 className="text-lg font-black text-slate-950">Memory usage</h2><p className="text-sm text-slate-500">Node.js process memory metrics.</p></div></div><div className="mt-6"><div className="flex items-center justify-between text-sm"><span className="font-semibold text-slate-600">Heap utilization</span><strong className="text-slate-950">{memoryKnown ? `${heapPercent}%` : "—"}</strong></div><div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full transition-all ${heapPercent >= 90 ? "bg-rose-500" : heapPercent >= 75 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${memoryKnown ? Math.min(heapPercent, 100) : 0}%` }} /></div></div><div className="mt-5 grid gap-2 sm:grid-cols-2"><DetailRow label="Heap used" value={system.memory.heapUsedMb != null ? `${system.memory.heapUsedMb} MB` : "—"} /><DetailRow label="Heap allocated" value={system.memory.heapTotalMb != null ? `${system.memory.heapTotalMb} MB` : "—"} /><DetailRow label="RSS" value={system.memory.rssMb != null ? `${system.memory.rssMb} MB` : "—"} /><DetailRow label="External" value={system.memory.externalMb != null ? `${system.memory.externalMb} MB` : "—"} /></div></section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center gap-3"><div className="rounded-xl bg-blue-50 p-2.5 text-blue-700"><Cpu className="h-5 w-5" /></div><div><h2 className="text-lg font-black text-slate-950">Service checks</h2><p className="text-sm text-slate-500">Individual signals behind the platform status.</p></div></div><div className="mt-4 divide-y divide-slate-100"><div className="flex items-center justify-between py-4"><div><p className="font-semibold text-slate-900">Runtime</p><p className="text-xs text-slate-500">Node.js process responding</p></div><StatusBadge value={system.checks.runtime || "unknown"} /></div><div className="flex items-center justify-between py-4"><div><p className="font-semibold text-slate-900">Database</p><p className="text-xs text-slate-500">MongoDB connection state</p></div><StatusBadge value={system.checks.database || (databaseHealthy ? "healthy" : "unhealthy")} /></div><div className="flex items-center justify-between py-4"><div><p className="font-semibold text-slate-900">Memory</p><p className="text-xs text-slate-500">Heap pressure threshold</p></div><StatusBadge value={system.checks.memory || "unknown"} /></div></div></section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-lg font-black text-slate-950">Database connection</h2><p className="mt-1 text-sm text-slate-500">Authoritative connection state returned by the backend.</p></div><StatusBadge value={databaseHealthy ? "healthy" : "unhealthy"} /></div><div className="mt-4 grid gap-3 md:grid-cols-3"><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Status</p><p className="mt-1 font-bold text-slate-950">{system.database?.status || "—"}</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Ready state</p><p className="mt-1 font-bold text-slate-950">{system.database?.readyState ?? "—"}</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Last checked</p><p className="mt-1 font-bold text-slate-950">{formatTime(system.timestamp)}</p></div></div></section>
    </div>
  </div>;
}
