/**
 * Purpose: Admin System Health page-level UI component. Main declarations: formatLabel, formatUptime, formatMemory, normalizeService, StatusBadge.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useMemo } from "react";
// Load @tanstack/react-query so this module can use its exported dependencies.
import { useQuery } from "@tanstack/react-query";
// Load lucide-react so this module can use its exported dependencies.
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock3,
  Cpu,
  Database,
  Gauge,
  HardDrive,
  RefreshCw,
  Server,
  ShieldCheck,
  Wifi,
  XCircle,
} from "lucide-react";
// Load ../../api/admin/systemHealthApi so this module can use its exported dependencies.
import { getSystemHealth } from "../../api/admin/systemHealthApi";
// Load ../../context/SettingsContext so this module can use its exported dependencies.
import { useSettings } from "../../context/SettingsContext";

// Declare STATUS_META for use by the surrounding module or function.
const STATUS_META = {
  connected: { label: "Connected", tone: "emerald", icon: CheckCircle2 },
  online: { label: "Online", tone: "emerald", icon: CheckCircle2 },
  healthy: { label: "Healthy", tone: "emerald", icon: CheckCircle2 },
  ok: { label: "Healthy", tone: "emerald", icon: CheckCircle2 },
  operational: { label: "Operational", tone: "emerald", icon: CheckCircle2 },
  degraded: { label: "Degraded", tone: "amber", icon: AlertCircle },
  disconnected: { label: "Disconnected", tone: "red", icon: XCircle },
  offline: { label: "Offline", tone: "red", icon: XCircle },
  error: { label: "Error", tone: "red", icon: XCircle },
  failed: { label: "Failed", tone: "red", icon: XCircle },
  unknown: { label: "Unknown", tone: "slate", icon: AlertCircle },
};

// Declare toneClasses for use by the surrounding module or function.
const toneClasses = {
  emerald: { badge: "border-emerald-200 bg-emerald-50 text-emerald-700", icon: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  amber: { badge: "border-amber-200 bg-amber-50 text-amber-700", icon: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  red: { badge: "border-red-200 bg-red-50 text-red-700", icon: "bg-red-100 text-red-700", dot: "bg-red-500" },
  slate: { badge: "border-slate-200 bg-slate-50 text-slate-700", icon: "bg-slate-100 text-slate-700", dot: "bg-slate-400" },
};

// Declare SERVICE_CONFIG for use by the surrounding module or function.
const SERVICE_CONFIG = [
  { key: "server", label: "Application server", description: "API runtime and request processing", icon: Server },
  { key: "database", label: "Database", description: "Primary application data store", icon: Database },
  { key: "cloudinary", label: "Cloudinary", description: "Media and image delivery", icon: HardDrive },
  { key: "mpesa", label: "M-Pesa", description: "Payment gateway connectivity", icon: Wifi },
];

// Declare HEALTHY_STATUSES for use by the surrounding module or function.
const HEALTHY_STATUSES = new Set(["connected", "online", "healthy", "ok", "operational"]);

// Declare formatLabel for use by the surrounding module or function.
const formatLabel = (value) => String(value || "").replace(/([A-Z])/g, " $1").replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();

// Declare formatUptime for use by the surrounding module or function.
const formatUptime = (value) => {
  // Check the condition (typeof value === "string") and run the matching branch.
  if (typeof value === "string") {
    // Declare match for use by the surrounding module or function.
    const match = value.match(/([0-9]+(?:\.[0-9]+)?)\s*(?:seconds?|secs?|s)\b/i);
    // Check the condition (match) and run the matching branch.
    if (match) value = Number(match[1]);
    else if (/^\d+(?:\.\d+)?$/.test(value.trim())) value = Number(value);
    else return value.trim() || "Not reported";
  }
  // Declare seconds for use by the surrounding module or function.
  const seconds = Number(value);
  // Check the condition (!Number.isFinite(seconds) || seconds < 0) and run the matching branch.
  if (!Number.isFinite(seconds) || seconds < 0) return "Not reported";
  // Declare days for use by the surrounding module or function.
  const days = Math.floor(seconds / 86400);
  // Declare hours for use by the surrounding module or function.
  const hours = Math.floor((seconds % 86400) / 3600);
  // Declare minutes for use by the surrounding module or function.
  const minutes = Math.floor((seconds % 3600) / 60);
  // Declare secs for use by the surrounding module or function.
  const secs = Math.floor(seconds % 60);
  // Declare parts for use by the surrounding module or function.
  const parts = [];
  // Check the condition (days) and run the matching branch.
  if (days) parts.push(`${days}d`);
  // Check the condition (hours || days) and run the matching branch.
  if (hours || days) parts.push(`${hours}h`);
  // Check the condition (minutes || hours || days) and run the matching branch.
  if (minutes || hours || days) parts.push(`${minutes}m`);
  // Check the condition (!parts.length || secs) and run the matching branch.
  if (!parts.length || secs) parts.push(`${secs}s`);
  // Return the result of parts.join() to the caller.
  return parts.join(" ");
};

// Declare formatMemory for use by the surrounding module or function.
const formatMemory = (value) => {
  // Check the condition (value == null || value === "") and run the matching branch.
  if (value == null || value === "") return "Not reported";
  // Check the condition (typeof value === "string") and run the matching branch.
  if (typeof value === "string") return value;
  // Check the condition (typeof value === "object") and run the matching branch.
  if (typeof value === "object") {
    // Declare rss for use by the surrounding module or function.
    const rss = value.rss ?? value.residentSetSize;
    // Declare heap for use by the surrounding module or function.
    const heap = value.heapUsed ?? value.used;
    // Declare parts for use by the surrounding module or function.
    const parts = [rss != null ? `RSS ${rss}` : null, heap != null ? `Heap ${heap}` : null].filter(Boolean);
    // Return the expression shown below to the caller.
    return parts.length ? parts.join(" · ") : "Not reported";
  }
  // Return the result of String() to the caller.
  return String(value);
};

// Declare normalizeService for use by the surrounding module or function.
const normalizeService = (key, value) => {
  // Check the condition (typeof value === "string") and run the matching branch.
  if (typeof value === "string") return { status: value.toLowerCase(), message: "", environment: "" };
  // Check the condition (value && typeof value === "object") and run the matching branch.
  if (value && typeof value === "object") {
    // Return the object assembled below to the caller.
    return {
      status: String(value.status || value.state || "unknown").toLowerCase(),
      message: value.message || value.details || "",
      environment: value.environment || "",
    };
  }
  // Return the object assembled below to the caller.
  return { status: "unknown", message: "", environment: "" };
};

// Define StatusBadge; its parameters and body implement this operation.
function StatusBadge({ status }) {
  // Declare meta for use by the surrounding module or function.
  const meta = STATUS_META[status] || { label: formatLabel(status) || "Unknown", tone: "slate", icon: AlertCircle };
  // Declare tone for use by the surrounding module or function.
  const tone = toneClasses[meta.tone];
  // Declare Icon for use by the surrounding module or function.
  const Icon = meta.icon;
  // Return the expression shown below to the caller.
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${tone.badge}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {meta.label}
    </span>
  );
}

// Define AdminSystemHealth; its parameters and body implement this operation.
export default function AdminSystemHealth() {
  // Declare { settings = {} } for use by the surrounding module or function.
  const { settings = {} } = useSettings() || {};
  // Declare primary for use by the surrounding module or function.
  const primary = settings.primaryColor || "#047857";
  // Declare secondary for use by the surrounding module or function.
  const secondary = settings.secondaryColor || "#064e3b";
  // Declare accent for use by the surrounding module or function.
  const accent = settings.accentColor || "#10b981";
  // Declare { data, isLoading, isError, error, refetch, isFetching, dataUpdatedAt } for use by the surrounding module or function.
  const { data, isLoading, isError, error, refetch, isFetching, dataUpdatedAt } = useQuery({
    queryKey: ["admin-system-health"],
    queryFn: getSystemHealth,
    staleTime: 30000,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  // Declare system for use by the surrounding module or function.
  const system = data?.system || data?.data?.system || data?.data || data || {};
  // Declare serviceSource for use by the surrounding module or function.
  const serviceSource = system.services || data?.services || {};
  // Declare services for use by the surrounding module or function.
  const services = useMemo(
    () => SERVICE_CONFIG.map((service) => ({
      ...service,
      ...normalizeService(service.key, serviceSource[service.key] ?? system[service.key]),
    })),
    [serviceSource, system],
  );
  // Declare healthyServices for use by the surrounding module or function.
  const healthyServices = services.filter((service) => HEALTHY_STATUSES.has(service.status)).length;
  // Declare memory for use by the surrounding module or function.
  const memory = system.memory ?? system.memoryUsage;
  // Declare nodeVersion for use by the surrounding module or function.
  const nodeVersion = system.nodeVersion ?? system.node_version ?? system.node ?? system["node Version"];
  // Declare uptime for use by the surrounding module or function.
  const uptime = system.uptime ?? system.uptimeSeconds ?? system.uptime_seconds;
  // Declare overallStatus for use by the surrounding module or function.
  const overallStatus = healthyServices === services.length ? "Operational" : healthyServices > 0 ? "Partial" : "Unavailable";

  // Declare runtimeRows for use by the surrounding module or function.
  const runtimeRows = [
    ["Uptime", formatUptime(uptime)],
    ["Node.js version", nodeVersion || "Not reported"],
    ["Memory", formatMemory(memory)],
  ];

  // Declare brandStyle for use by the surrounding module or function.
  const brandStyle = { "--admin-primary": primary, "--admin-secondary": secondary, "--admin-accent": accent };

  // Check the condition (isLoading) and run the matching branch.
  if (isLoading) {
    // Return the expression shown below to the caller.
    return <div className="min-h-screen bg-slate-50 p-5 md:p-8" style={brandStyle}><div className="mx-auto max-w-7xl animate-pulse space-y-6"><div className="h-36 rounded-3xl bg-slate-200" /><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{[1, 2, 3, 4].map((item) => <div key={item} className="h-36 rounded-2xl bg-white shadow-sm" />)}</div></div></div>;
  }

  // Check the condition (isError) and run the matching branch.
  if (isError) {
    // Return the expression shown below to the caller.
    return (
      <div className="min-h-screen bg-slate-50 p-5 md:p-8" style={brandStyle}>
        <div className="mx-auto max-w-3xl rounded-3xl border border-red-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600"><AlertCircle className="h-6 w-6" /></div>
          <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-950">System health is unavailable</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">The health service could not be reached. No service is assumed healthy when the health endpoint is unavailable.</p>
          <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">{error?.response?.data?.message || error?.message || "Health request failed."}</p>
          <button type="button" onClick={() => void refetch()} disabled={isFetching} className="mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-sm disabled:cursor-wait disabled:opacity-60" style={{ backgroundColor: primary }}><RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />Retry health check</button>
        </div>
      </div>
    );
  }

  // Return the expression shown below to the caller.
  return (
    <div className="min-h-screen bg-slate-50 p-5 text-slate-950 md:p-8" style={brandStyle}>
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="relative overflow-hidden rounded-3xl p-6 text-white shadow-xl md:p-8" style={{ background: `linear-gradient(135deg, ${secondary} 0%, ${primary} 58%, ${accent} 100%)` }}>
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div><div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-white/75"><ShieldCheck className="h-4 w-4" />Administration · Reliability</div><h1 className="text-3xl font-black tracking-tight md:text-4xl">System Health</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">Monitor core services, runtime resources and payment connectivity for this tenant.</p></div>
            <button type="button" onClick={() => void refetch()} disabled={isFetching} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/95 px-4 py-2.5 text-sm font-bold shadow-lg disabled:cursor-wait disabled:opacity-70" style={{ color: secondary }}><RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />{isFetching ? "Checking…" : "Refresh status"}</button>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wider text-slate-500">Service availability</span><div className="rounded-xl bg-emerald-50 p-2 text-emerald-700"><Activity className="h-5 w-5" /></div></div><p className="mt-4 text-3xl font-black">{healthyServices}/{services.length}</p><p className="mt-1 text-sm text-slate-500">{overallStatus}</p></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wider text-slate-500">Uptime</span><div className="rounded-xl bg-slate-100 p-2 text-slate-700"><Clock3 className="h-5 w-5" /></div></div><p className="mt-4 text-3xl font-black">{formatUptime(uptime)}</p><p className="mt-1 text-sm text-slate-500">application runtime</p></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wider text-slate-500">Node.js</span><div className="rounded-xl bg-slate-100 p-2 text-slate-700"><Cpu className="h-5 w-5" /></div></div><p className="mt-4 text-2xl font-black">{nodeVersion || "Not reported"}</p><p className="mt-1 text-sm text-slate-500">server runtime version</p></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wider text-slate-500">Memory</span><div className="rounded-xl bg-slate-100 p-2 text-slate-700"><Gauge className="h-5 w-5" /></div></div><p className="mt-4 break-words text-lg font-black">{formatMemory(memory)}</p><p className="mt-1 text-sm text-slate-500">current process usage</p></div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-col gap-2 border-b border-slate-100 pb-5 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="text-xl font-black">Service status</h2><p className="mt-1 text-sm text-slate-500">Live connectivity reported by the platform health endpoint.</p></div><div className="text-xs font-medium text-slate-400">{dataUpdatedAt ? `Last checked ${new Date(dataUpdatedAt).toLocaleTimeString()}` : "Live check"}</div></div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">{services.map((service) => { const meta = STATUS_META[service.status] || STATUS_META.unknown; const tone = toneClasses[meta.tone]; const Icon = service.icon; return <article key={service.key} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5"><div className="flex items-start justify-between gap-4"><div className="flex min-w-0 items-center gap-3"><div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone.icon}`}><Icon className="h-5 w-5" /></div><div className="min-w-0"><h3 className="font-bold text-slate-950">{service.label}</h3><p className="mt-0.5 text-xs text-slate-500">{service.description}</p></div></div><StatusBadge status={service.status} /></div><div className="mt-4 flex items-center gap-2 text-sm text-slate-600"><span className={`h-2 w-2 rounded-full ${tone.dot}`} />{service.message || "No additional service message reported."}</div>{service.environment && <div className="mt-3 inline-flex rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-500">Environment: {service.environment}</div>}</article>; })}</div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="flex items-center gap-3"><div className="rounded-xl p-2 text-white" style={{ backgroundColor: primary }}><Gauge className="h-5 w-5" /></div><div><h2 className="text-lg font-black">Runtime details</h2><p className="text-sm text-slate-500">Operational values returned by the backend health service.</p></div></div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{runtimeRows.map(([label, value]) => <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-2 break-words text-sm font-bold text-slate-800">{value}</p></div>)}</div>
          {services.some((service) => service.environment) && <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"><strong>Payment environment:</strong> {services.find((service) => service.key === "mpesa")?.environment || "Not reported"}. Connectivity is reported by the gateway health check and does not by itself confirm production payment readiness.</div>}
        </section>
      </div>
    </div>
  );
}
