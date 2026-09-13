import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { getSystemHealth } from "../../api/admin/systemHealthApi";
import { useSettings } from "../../context/SettingsContext";

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
};

const toneClasses = {
  emerald: {
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    icon: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500",
  },
  amber: {
    badge: "border-amber-200 bg-amber-50 text-amber-700",
    icon: "bg-amber-100 text-amber-700",
    dot: "bg-amber-500",
  },
  red: {
    badge: "border-red-200 bg-red-50 text-red-700",
    icon: "bg-red-100 text-red-700",
    dot: "bg-red-500",
  },
  slate: {
    badge: "border-slate-200 bg-slate-50 text-slate-700",
    icon: "bg-slate-100 text-slate-700",
    dot: "bg-slate-400",
  },
};

const SERVICE_CONFIG = [
  { key: "server", label: "Application server", description: "API runtime and request processing", icon: Server },
  { key: "database", label: "Database", description: "Primary application data store", icon: Database },
  { key: "cloudinary", label: "Cloudinary", description: "Media and image delivery", icon: HardDrive },
  { key: "mpesa", label: "M-Pesa", description: "Payment gateway connectivity", icon: Wifi },
];

const formatLabel = (value) => String(value || "").replace(/([A-Z])/g, " $1").replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();

const formatUptime = (value) => {
  const seconds = Number(value);
  if (!Number.isFinite(seconds) || seconds < 0) return "—";
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const parts = [];
  if (days) parts.push(`${days}d`);
  if (hours || days) parts.push(`${hours}h`);
  parts.push(`${minutes}m`);
  return parts.join(" ");
};

const formatMemory = (value) => {
  if (value == null) return "—";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    const rss = value.rss || value.residentSetSize;
    const heap = value.heapUsed || value.used;
    if (rss || heap) return [rss ? `RSS ${rss}` : null, heap ? `Heap ${heap}` : null].filter(Boolean).join(" · ");
    return "Available";
  }
  return String(value);
};

const normalizeService = (key, value) => {
  if (typeof value === "string") {
    const status = String(value).toLowerCase();
    return { status, message: "", environment: "" };
  }
  if (value && typeof value === "object") {
    return {
      status: String(value.status || value.state || (key === "server" ? "online" : "unknown")).toLowerCase(),
      message: value.message || value.details || "",
      environment: value.environment || "",
    };
  }
  return { status: key === "server" ? "online" : "unknown", message: "", environment: "" };
};

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || { label: status ? formatLabel(status) : "Unknown", tone: "slate", icon: AlertCircle };
  const tone = toneClasses[meta.tone];
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${tone.badge}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {meta.label}
    </span>
  );
}

export default function AdminSystemHealth() {
  const { settings = {} } = useSettings() || {};
  const primary = settings.primaryColor || "#047857";
  const secondary = settings.secondaryColor || "#064e3b";
  const accent = settings.accentColor || "#10b981";
  const { data, isLoading, isError, error, refetch, isFetching, dataUpdatedAt } = useQuery({
    queryKey: ["admin-system-health"],
    queryFn: getSystemHealth,
    staleTime: 30000,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  const system = data?.system || data?.data || data || {};
  const services = useMemo(
    () => SERVICE_CONFIG.map((service) => ({ ...service, ...normalizeService(service.key, system[service.key]) })),
    [system],
  );
  const healthyServices = services.filter((service) => ["connected", "online", "healthy", "ok", "operational"].includes(service.status)).length;
  const memory = system.memory || system.memoryUsage;
  const nodeVersion = system.nodeVersion || system.node_version || system.node || "—";
  const uptime = system.uptime ?? system.uptimeSeconds ?? system.uptime_seconds;

  const brandStyle = {
    "--admin-primary": primary,
    "--admin-secondary": secondary,
    "--admin-accent": accent,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-5 md:p-8" style={brandStyle}>
        <div className="mx-auto max-w-7xl animate-pulse space-y-6">
          <div className="h-36 rounded-3xl bg-slate-200" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => <div key={item} className="h-36 rounded-2xl bg-white shadow-sm" />)}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-slate-50 p-5 md:p-8" style={brandStyle}>
        <div className="mx-auto max-w-3xl rounded-3xl border border-red-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600"><AlertCircle className="h-6 w-6" /></div>
          <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-950">System health is unavailable</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">The health service could not be reached. No service is assumed healthy when the health endpoint is unavailable.</p>
          <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">{error?.response?.data?.message || error?.message || "Health request failed."}</p>
          <button type="button" onClick={() => void refetch()} disabled={isFetching} className="mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60" style={{ backgroundColor: primary }}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            Retry health check
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-5 text-slate-950 md:p-8" style={brandStyle}>
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="relative overflow-hidden rounded-3xl p-6 text-white shadow-xl md:p-8" style={{ background: `linear-gradient(135deg, ${secondary} 0%, ${primary} 58%, ${accent} 100%)` }}>
          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-white/75">
                <ShieldCheck className="h-4 w-4" /> Administration · Reliability
              </div>
              <h1 className="text-3xl font-black tracking-tight md:text-4xl">System Health</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">Monitor the availability of core services, runtime resources and payment connectivity for this tenant.</p>
            </div>
            <button type="button" onClick={() => void refetch()} disabled={isFetching} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/95 px-4 py-2.5 text-sm font-bold shadow-lg ring-1 ring-white/30 transition hover:-translate-y-0.5 hover:bg-white disabled:cursor-wait disabled:opacity-70" style={{ color: secondary }}>
              <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
              {isFetching ? "Checking…" : "Refresh status"}
            </button>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wider text-slate-500">Service availability</span><div className="rounded-xl bg-emerald-50 p-2 text-emerald-700"><Activity className="h-5 w-5" /></div></div>
            <p className="mt-4 text-3xl font-black tracking-tight text-slate-950">{healthyServices}/{services.length}</p>
            <p className="mt-1 text-sm text-slate-500">core services operational</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wider text-slate-500">Uptime</span><div className="rounded-xl bg-slate-100 p-2 text-slate-700"><Clock3 className="h-5 w-5" /></div></div>
            <p className="mt-4 text-3xl font-black tracking-tight text-slate-950">{formatUptime(uptime)}</p>
            <p className="mt-1 text-sm text-slate-500">application runtime</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wider text-slate-500">Node.js</span><div className="rounded-xl bg-slate-100 p-2 text-slate-700"><Cpu className="h-5 w-5" /></div></div>
            <p className="mt-4 text-2xl font-black tracking-tight text-slate-950">{nodeVersion}</p>
            <p className="mt-1 text-sm text-slate-500">server runtime version</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wider text-slate-500">Memory</span><div className="rounded-xl bg-slate-100 p-2 text-slate-700"><Gauge className="h-5 w-5" /></div></div>
            <p className="mt-4 break-words text-lg font-black tracking-tight text-slate-950">{formatMemory(memory)}</p>
            <p className="mt-1 text-sm text-slate-500">current process usage</p>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-col gap-2 border-b border-slate-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div><h2 className="text-xl font-black tracking-tight text-slate-950">Service status</h2><p className="mt-1 text-sm text-slate-500">Live connectivity reported by the platform health endpoint.</p></div>
            <div className="text-xs font-medium text-slate-400">{dataUpdatedAt ? `Last checked ${new Date(dataUpdatedAt).toLocaleTimeString()}` : "Live check"}</div>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {services.map((service) => {
              const meta = STATUS_META[service.status] || { tone: "slate", label: "Unknown" };
              const tone = toneClasses[meta.tone];
              const Icon = service.icon;
              return (
                <article key={service.key} className="group rounded-2xl border border-slate-200 bg-slate-50/70 p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-md">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3"><div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone.icon}`}><Icon className="h-5 w-5" /></div><div className="min-w-0"><h3 className="truncate font-bold text-slate-950">{service.label}</h3><p className="mt-0.5 text-xs text-slate-500">{service.description}</p></div></div>
                    <StatusBadge status={service.status} />
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm text-slate-600"><span className={`h-2 w-2 rounded-full ${tone.dot}`} />{service.message || "No additional service message reported."}</div>
                  {service.environment && <div className="mt-3 inline-flex rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-500">Environment: {service.environment}</div>}
                </article>
              );
            })}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="flex items-center gap-3"><div className="rounded-xl p-2 text-white" style={{ backgroundColor: primary }}><Gauge className="h-5 w-5" /></div><div><h2 className="text-lg font-black text-slate-950">Runtime details</h2><p className="text-sm text-slate-500">Operational values returned by the backend health service.</p></div></div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(system).filter(([key]) => !SERVICE_CONFIG.some((service) => service.key === key)).map(([key, value]) => (
              <div key={key} className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">{formatLabel(key)}</p><p className="mt-2 break-words text-sm font-bold text-slate-800">{typeof value === "object" ? JSON.stringify(value) : String(value ?? "—")}</p></div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
