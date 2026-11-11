/**
 * Purpose: System Health page-level UI component. Main declarations: normalizeHealth, getStatus, formatUptime, ServiceCard, SystemHealth.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useQuery } from "@tanstack/react-query";
// Load ../../../api/admin/systemHealthApi so this module can use its exported dependencies.
import { getSystemHealth } from "../../../api/admin/systemHealthApi";

// Declare normalizeHealth for use by the surrounding module or function.
const normalizeHealth = (payload) => payload?.system || payload?.data?.system || payload?.data || payload || {};

// Declare serviceDefinitions for use by the surrounding module or function.
const serviceDefinitions = [
  { key: "server", label: "Application server", description: "API runtime and request processing" },
  { key: "database", label: "Database", description: "Primary application data store" },
  { key: "cloudinary", label: "Cloudinary", description: "Media and image delivery" },
  { key: "mpesa", label: "M-Pesa", description: "Payment gateway connectivity" },
];

// Declare statusMeta for use by the surrounding module or function.
const statusMeta = {
  online: { label: "Online", tone: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  connected: { label: "Connected", tone: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  unavailable: { label: "Unavailable", tone: "text-red-700 bg-red-50 border-red-200" },
  disconnected: { label: "Disconnected", tone: "text-red-700 bg-red-50 border-red-200" },
  not_configured: { label: "Not configured", tone: "text-amber-700 bg-amber-50 border-amber-200" },
};

// Define getStatus; its parameters and body implement this operation.
function getStatus(status) {
  // Return the expression shown below to the caller.
  return statusMeta[status] || { label: status ? String(status) : "Unknown", tone: "text-slate-700 bg-slate-50 border-slate-200" };
}

// Define formatUptime; its parameters and body implement this operation.
function formatUptime(value) {
  // Check the condition (typeof value === "number" && Number.isFinite(value)) and run the matching branch.
  if (typeof value === "number" && Number.isFinite(value)) {
    // Declare total for use by the surrounding module or function.
    const total = Math.max(0, Math.floor(value));
    // Declare days for use by the surrounding module or function.
    const days = Math.floor(total / 86400);
    // Declare hours for use by the surrounding module or function.
    const hours = Math.floor((total % 86400) / 3600);
    // Declare minutes for use by the surrounding module or function.
    const minutes = Math.floor((total % 3600) / 60);
    // Declare seconds for use by the surrounding module or function.
    const seconds = total % 60;
    // Check the condition (days) and run the matching branch.
    if (days) return `${days}d ${hours}h ${minutes}m`;
    // Check the condition (hours) and run the matching branch.
    if (hours) return `${hours}h ${minutes}m ${seconds}s`;
    // Check the condition (minutes) and run the matching branch.
    if (minutes) return `${minutes}m ${seconds}s`;
    // Return the expression shown below to the caller.
    return `${seconds}s`;
  }
  // Check the condition (typeof value === "string") and run the matching branch.
  if (typeof value === "string") {
    // Declare match for use by the surrounding module or function.
    const match = value.match(/^(\d+)\s*seconds?$/i);
    // Check the condition (match) and run the matching branch.
    if (match) return formatUptime(Number(match[1]));
    // Return the expression shown below to the caller.
    return value || "Unknown";
  }
  // Return a configured text value to the caller.
  return "Unknown";
}

// Define ServiceCard; its parameters and body implement this operation.
function ServiceCard({ label, description, status, message, environment }) {
  // Declare meta for use by the surrounding module or function.
  const meta = getStatus(status);
  // Return the expression shown below to the caller.
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

// Define SystemHealth; its parameters and body implement this operation.
export default function SystemHealth() {
  // Declare { data, isLoading, isError, error, dataUpdatedAt, refetch, isFetching } for use by the surrounding module or function.
  const { data, isLoading, isError, error, dataUpdatedAt, refetch, isFetching } = useQuery({
    queryKey: ["systemHealth"],
    queryFn: getSystemHealth,
    refetchInterval: 60000,
  });

  // Check the condition (isLoading) and run the matching branch.
  if (isLoading) return <div className="p-6 text-slate-600">Checking system health...</div>;

  // Check the condition (isError) and run the matching branch.
  if (isError) {
    // Return the expression shown below to the caller.
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

  // Declare health for use by the surrounding module or function.
  const health = normalizeHealth(data);
  // Declare services for use by the surrounding module or function.
  const services = health.services || {};
  // Declare serviceStatuses for use by the surrounding module or function.
  const serviceStatuses = {
    server: health.server || health.status,
    database: health.database,
    cloudinary: services.cloudinary?.status || health.cloudinary,
    mpesa: services.mpesa?.status || health.mpesa,
  };
  // Declare operationalCount for use by the surrounding module or function.
  const operationalCount = Object.values(serviceStatuses).filter((status) => ["online", "connected"].includes(status)).length;
  // Declare degraded for use by the surrounding module or function.
  const degraded = Object.values(serviceStatuses).some((status) => ["unavailable", "disconnected", "not_configured"].includes(status));
  // Declare overallLabel for use by the surrounding module or function.
  const overallLabel = degraded ? "Degraded" : operationalCount === serviceDefinitions.length ? "Operational" : "Partial";
  // Declare overallTone for use by the surrounding module or function.
  const overallTone = degraded ? "text-amber-700 bg-amber-50 border-amber-200" : operationalCount === serviceDefinitions.length ? "text-emerald-700 bg-emerald-50 border-emerald-200" : "text-slate-700 bg-slate-50 border-slate-200";
  // Declare mpesaEnvironment for use by the surrounding module or function.
  const mpesaEnvironment = services.mpesa?.environment;
  // Declare checkedAt for use by the surrounding module or function.
  const checkedAt = dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : "Not available";

  // Return the expression shown below to the caller.
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
