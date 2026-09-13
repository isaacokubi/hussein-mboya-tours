import { useQuery } from "@tanstack/react-query";
import { getSystemHealth } from "../../../api/admin/systemHealthApi";

const normalizeHealth = (payload) => payload?.system || payload?.data?.system || payload?.data || payload || {};

const serviceDefinitions = [
  { key: "server", label: "Application server", description: "API runtime and request processing" },
  { key: "database", label: "Database", description: "Primary application data store" },
  { key: "cloudinary", label: "Cloudinary", description: "Media and image delivery" },
  { key: "mpesa", label: "M-Pesa", description: "Payment gateway connectivity" },
];

const statusMeta = {
  online: { label: "Online", tone: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  connected: { label: "Connected", tone: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  unavailable: { label: "Unavailable", tone: "text-red-700 bg-red-50 border-red-200" },
  disconnected: { label: "Disconnected", tone: "text-red-700 bg-red-50 border-red-200" },
  not_configured: { label: "Not configured", tone: "text-amber-700 bg-amber-50 border-amber-200" },
};

function getStatus(status) {
  return statusMeta[status] || { label: status ? String(status) : "Unknown", tone: "text-slate-700 bg-slate-50 border-slate-200" };
}

function formatUptime(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    const total = Math.max(0, Math.floor(value));
    const days = Math.floor(total / 86400);
    const hours = Math.floor((total % 86400) / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;
    if (days) return `${days}d ${hours}h ${minutes}m`;
    if (hours) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  }
  if (typeof value === "string") {
    const match = value.match(/^(\d+)\s*seconds?$/i);
    if (match) return formatUptime(Number(match[1]));
    return value || "Unknown";
  }
  return "Unknown";
}

function ServiceCard({ label, description, status, message, environment }) {
  const meta = getStatus(status);
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-slate-900">{label}</h3>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${meta.tone}`}>{meta.label}</span>
      </div>
      <p className="mt-4 text-sm text-slate-600">{message || "No additional service message reported."}</p>
      {environment && <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-500">Environment: {environment}</p>}
    </div>
  );
}

export default function SystemHealth() {
  const { data, isLoading, isError, error, dataUpdatedAt, refetch, isFetching } = useQuery({
    queryKey: ["systemHealth"],
    queryFn: getSystemHealth,
    refetchInterval: 60000,
  });

  if (isLoading) return <div className="p-6 text-slate-600">Checking system health...</div>;

  if (isError) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">
          <h1 className="text-xl font-bold">System Health</h1>
          <p className="mt-2">Unable to retrieve the health status from the server.</p>
          {error?.message && <p className="mt-1 text-sm">{error.message}</p>}
          <button onClick={() => refetch()} className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white">Retry</button>
        </div>
      </div>
    );
  }

  const health = normalizeHealth(data);
  const services = health.services || {};
  const serviceStatuses = {
    server: health.server || health.status,
    database: health.database,
    cloudinary: services.cloudinary?.status || health.cloudinary,
    mpesa: services.mpesa?.status || health.mpesa,
  };
  const operationalCount = Object.values(serviceStatuses).filter((status) => ["online", "connected"].includes(status)).length;
  const degraded = Object.values(serviceStatuses).some((status) => ["unavailable", "disconnected", "not_configured"].includes(status));
  const overallLabel = degraded ? "Degraded" : operationalCount === serviceDefinitions.length ? "Operational" : "Partial";
  const overallTone = degraded ? "text-amber-700 bg-amber-50 border-amber-200" : operationalCount === serviceDefinitions.length ? "text-emerald-700 bg-emerald-50 border-emerald-200" : "text-slate-700 bg-slate-50 border-slate-200";
  const mpesaEnvironment = services.mpesa?.environment;
  const checkedAt = dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : "Not available";

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Administration · Reliability</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">System Health</h1>
          <p className="mt-2 max-w-3xl text-slate-600">Monitor the availability of core services, runtime resources and payment connectivity for this tenant.</p>
        </div>
        <button onClick={() => refetch()} disabled={isFetching} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm disabled:opacity-50">
          {isFetching ? "Refreshing..." : "Refresh status"}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-medium text-slate-500">Service availability</p><p className="mt-2 text-3xl font-bold text-slate-900">{operationalCount}/{serviceDefinitions.length}</p><p className="mt-1 text-sm text-slate-500">{overallLabel.toLowerCase()} core services</p></div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-medium text-slate-500">Overall status</p><span className={`mt-3 inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${overallTone}`}>{overallLabel}</span><p className="mt-2 text-xs text-slate-500">Based on the latest health checks</p></div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-medium text-slate-500">Uptime</p><p className="mt-2 text-2xl font-bold text-slate-900">{formatUptime(health.uptime)}</p><p className="mt-1 text-sm text-slate-500">application runtime</p></div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-medium text-slate-500">Node.js</p><p className="mt-2 text-2xl font-bold text-slate-900">{health.nodeVersion || "Unknown"}</p><p className="mt-1 text-sm text-slate-500">server runtime version</p></div>
      </div>

      <section>
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div><h2 className="text-xl font-bold text-slate-900">Service status</h2><p className="text-sm text-slate-500">Live connectivity reported by the platform health endpoint.</p></div>
          <span className="text-xs text-slate-500">Last checked {checkedAt}</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {serviceDefinitions.map(({ key, label, description }) => (
            <ServiceCard key={key} label={label} description={description} status={serviceStatuses[key]} message={services[key]?.message} environment={key === "mpesa" ? mpesaEnvironment : undefined} />
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Runtime details</h2>
        <p className="mt-1 text-sm text-slate-500">Operational values returned by the backend health service.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Uptime</p><p className="mt-1 text-lg font-bold text-slate-900">{formatUptime(health.uptime)}</p></div>
          <div className="rounded-lg bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">RSS memory</p><p className="mt-1 text-lg font-bold text-slate-900">{health.memory?.rss || "Unknown"}</p></div>
          <div className="rounded-lg bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Heap used</p><p className="mt-1 text-lg font-bold text-slate-900">{health.memory?.heapUsed || "Unknown"}</p></div>
          <div className="rounded-lg bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Node.js version</p><p className="mt-1 text-lg font-bold text-slate-900">{health.nodeVersion || "Unknown"}</p></div>
          {mpesaEnvironment && <div className="rounded-lg bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">M-Pesa environment</p><p className="mt-1 text-lg font-bold capitalize text-slate-900">{mpesaEnvironment}</p></div>}
        </div>
        {String(mpesaEnvironment).toLowerCase() === "sandbox" && <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">M-Pesa connectivity is verified against the sandbox gateway. This confirms connectivity and credentials, but it does not mean production M-Pesa payments are enabled.</div>}
      </section>
    </div>
  );
}
