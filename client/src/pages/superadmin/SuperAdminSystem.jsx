import { useQuery } from "@tanstack/react-query";
import { getSystemHealth } from "../../api/superAdminApi";

export default function SuperAdminSystem() {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["system-health"],
    queryFn: getSystemHealth,
    refetchInterval: 10000,
  });

  if (isLoading) {
    return <div className="p-8">Checking system health...</div>;
  }

  if (isError) {
    return (
      <div className="p-8 space-y-4">
        <h1 className="text-3xl font-bold">System Health Center</h1>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          Unable to load system health: {error?.message || "Unknown error"}
        </div>
        <button
          onClick={() => refetch()}
          className="rounded-lg bg-black px-4 py-2 text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  const system = data?.system || {};
  const memoryUsed = Number(system.memory?.used?.replace(" MB", "")) || 0;
  const memoryTotal = Number(system.memory?.total?.replace(" MB", "")) || 0;
  const memoryPercent =
    memoryTotal > 0 ? Math.min((memoryUsed / memoryTotal) * 100, 100) : 0;

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">System Health Center</h1>
          <p className="mt-1 text-gray-500">
            Live runtime, database, platform and resource health.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {isFetching ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-6">
          <p className="text-gray-500">Status</p>
          <h2 className="text-2xl font-bold text-green-600">
            {system.status || "Unknown"}
          </h2>
        </div>

        <div className="rounded-xl border bg-white p-6">
          <p className="text-gray-500">Database</p>
          <h2
            className={`text-2xl font-bold ${
              system.database === "Connected"
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {system.database || "Unknown"}
          </h2>
        </div>

        <div className="rounded-xl border bg-white p-6">
          <p className="text-gray-500">Uptime</p>
          <h2 className="text-2xl font-bold">
            {Math.floor(Number(system.uptime || 0) / 60)} minutes
          </h2>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-6">
        <h2 className="mb-4 text-xl font-bold">Runtime Information</h2>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <p className="text-gray-500">Node Version</p>
            <strong>{system.nodeVersion || "N/A"}</strong>
          </div>

          <div>
            <p className="text-gray-500">Environment</p>
            <strong>{system.environment || "N/A"}</strong>
          </div>

          <div>
            <p className="text-gray-500">Memory Usage</p>
            <strong>
              {system.memory?.used || "N/A"} / {system.memory?.total || "N/A"}
            </strong>
          </div>

          <div>
            <p className="text-gray-500">Platform</p>
            <strong>
              {system.platform?.os || "N/A"} {system.platform?.architecture || ""}
            </strong>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border bg-white p-6">
          <p className="text-gray-500">Health Score</p>
          <h2 className="text-3xl font-bold text-green-600">100%</h2>
        </div>

        <div className="rounded-xl border bg-white p-6">
          <p className="text-gray-500">Last Checked</p>
          <h2 className="text-lg font-bold">
            {system.timestamp
              ? new Date(system.timestamp).toLocaleTimeString()
              : "N/A"}
          </h2>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-6">
        <h2 className="mb-4 text-xl font-bold">Memory Usage</h2>

        <div className="h-4 w-full rounded-full bg-gray-200">
          <div
            className="h-4 rounded-full bg-green-600 transition-all"
            style={{ width: `${memoryPercent}%` }}
          />
        </div>

        <p className="mt-2 text-gray-600">
          {system.memory?.used || "N/A"} / {system.memory?.total || "N/A"}
        </p>
      </div>
    </div>
  );
}
