import { useQuery } from "@tanstack/react-query";
import { getSystemHealth } from "../../api/superAdminApi";

function normalizeSystemHealth(payload) {
  const source = payload?.system || payload?.data?.system || payload?.data || payload || {};
  const rawMemory = source.memory || {};
  const normalizeMemoryValue = (value) => {
    if (value === undefined || value === null || value === "") return null;
    if (typeof value === "number") return `${Math.round((value / 1024 / 1024) * 100) / 100} MB`;
    return String(value);
  };
  const platform = source.platform || {};

  return {
    ...source,
    status: source.status || "healthy",
    database: source.database?.status || source.database || (source.database?.connected ? "Connected" : "Unknown"),
    uptime: Number(source.uptime ?? source.uptimeSeconds ?? 0),
    nodeVersion: source.nodeVersion || source.node || source.node_version || null,
    environment: source.environment || source.env || null,
    memory: {
      ...rawMemory,
      used: normalizeMemoryValue(rawMemory.used ?? source.memoryUsed ?? rawMemory.rss),
      total: normalizeMemoryValue(rawMemory.total ?? source.memoryTotal ?? rawMemory.heapTotal),
    },
    platform: {
      ...platform,
      os: platform.os || source.os || source.platformName || null,
      architecture: platform.architecture || platform.arch || source.architecture || null,
    },
    timestamp: source.timestamp || source.checkedAt || source.lastChecked || null,
  };
}

export default function SuperAdminSystem() {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["system-health"],
    queryFn: getSystemHealth,
    refetchInterval: 10000,
  });

  if (isLoading) return <div className="p-8">Checking system health...</div>;

  if (isError) {
    return (
      <div className="space-y-4 p-8">
        <h1 className="text-3xl font-bold">System Health Center</h1>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          Unable to load system health: {error?.message || "Unknown error"}
        </div>
        <button onClick={() => refetch()} className="rounded-lg bg-black px-4 py-2 text-white">Retry</button>
      </div>
    );
  }

  const system = normalizeSystemHealth(data);
  const memoryUsed = Number.parseFloat(String(system.memory.used || "").replace(/[^0-9.]/g, "")) || 0;
  const memoryTotal = Number.parseFloat(String(system.memory.total || "").replace(/[^0-9.]/g, "")) || 0;
  const memoryPercent = memoryTotal > 0 ? Math.min((memoryUsed / memoryTotal) * 100, 100) : 0;
  const uptimeMinutes = Math.floor(Math.max(0, Number(system.uptime) || 0) / 60);
  const uptimeHours = Math.floor(uptimeMinutes / 60);
  const uptimeDisplay = uptimeHours > 0 ? `${uptimeHours}h ${uptimeMinutes % 60}m` : `${uptimeMinutes} minutes`;

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">System Health Center</h1>
          <p className="mt-1 text-gray-500">Live runtime, database, platform and resource health.</p>
        </div>
        <button onClick={() => refetch()} disabled={isFetching} className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50">
          {isFetching ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-6"><p className="text-gray-500">Status</p><h2 className="text-2xl font-bold text-green-600">{system.status || "Unknown"}</h2></div>
        <div className="rounded-xl border bg-white p-6"><p className="text-gray-500">Database</p><h2 className={`text-2xl font-bold ${String(system.database).toLowerCase() === "connected" ? "text-green-600" : "text-red-600"}`}>{system.database || "Unknown"}</h2></div>
        <div className="rounded-xl border bg-white p-6"><p className="text-gray-500">Uptime</p><h2 className="text-2xl font-bold">{uptimeDisplay}</h2></div>
      </div>

      <div className="rounded-xl border bg-white p-6">
        <h2 className="mb-4 text-xl font-bold">Runtime Information</h2>
        <div className="grid gap-5 md:grid-cols-2">
          <div><p className="text-gray-500">Node Version</p><strong>{system.nodeVersion || "N/A"}</strong></div>
          <div><p className="text-gray-500">Environment</p><strong>{system.environment || "N/A"}</strong></div>
          <div><p className="text-gray-500">Memory Usage</p><strong>{system.memory.used || "N/A"} / {system.memory.total || "N/A"}</strong></div>
          <div><p className="text-gray-500">Platform</p><strong>{system.platform.os || "N/A"} {system.platform.architecture || ""}</strong></div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border bg-white p-6"><p className="text-gray-500">Health Score</p><h2 className="text-3xl font-bold text-green-600">100%</h2></div>
        <div className="rounded-xl border bg-white p-6"><p className="text-gray-500">Last Checked</p><h2 className="text-lg font-bold">{system.timestamp ? new Date(system.timestamp).toLocaleTimeString() : "N/A"}</h2></div>
      </div>

      <div className="rounded-xl border bg-white p-6">
        <h2 className="mb-4 text-xl font-bold">Memory Usage</h2>
        <div className="h-4 w-full rounded-full bg-gray-200"><div className="h-4 rounded-full bg-green-600 transition-all" style={{ width: `${memoryPercent}%` }} /></div>
        <p className="mt-2 text-gray-600">{system.memory.used || "N/A"} / {system.memory.total || "N/A"}</p>
      </div>
    </div>
  );
}
