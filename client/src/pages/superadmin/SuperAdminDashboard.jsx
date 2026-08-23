import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getSuperAdminDashboard } from "../../api/superAdminApi";

const cards = [
  ["users", "Users"],
  ["staff", "Staff"],
  ["agents", "Agents"],
  ["vehicles", "Vehicles"],
  ["bookings", "Bookings"],
  ["admins", "Administrators"],
  ["tours", "Tours"],
  ["destinations", "Destinations"],
  ["payments", "Payments"],
  ["revenue", "Revenue"],
];

const normalizePayload = (payload) => payload?.data || payload || {};

export default function SuperAdminDashboard() {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["superadmin-dashboard"],
    queryFn: getSuperAdminDashboard,
    retry: false,
    staleTime: 30000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const payload = normalizePayload(data);
  const stats = payload?.stats || {};
  const status = error?.response?.status;
  const message = error?.response?.data?.message;

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          Loading Super Admin Control Center...
        </div>
      </main>
    );
  }

  if (isError) {
    const sessionExpired = status === 401;
    const forbidden = status === 403;

    return (
      <main className="min-h-screen bg-gray-50 p-6 md:p-8">
        <div className="mx-auto max-w-3xl rounded-2xl border bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Platform Governance</p>
          <h1 className="mt-2 text-2xl font-bold">Super Admin Control Center</h1>
          <p className="mt-3 text-gray-600">
            {sessionExpired
              ? "Your authentication session is no longer valid. Sign in again to continue."
              : forbidden
                ? "Your account is authenticated but is not authorized for platform governance."
                : message || "Unable to load platform metrics. Check the API and try again."}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-lg bg-gray-900 px-4 py-2 font-medium text-white disabled:opacity-60"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              {isFetching ? "Retrying..." : "Retry"}
            </button>
            {sessionExpired && (
              <Link to="/login" className="rounded-lg border px-4 py-2 font-medium">
                Sign in again
              </Link>
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen space-y-8 bg-gray-50 p-6 md:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">Platform Governance</p>
          <h1 className="mt-1 text-3xl font-bold">Global Tours Platform Control Center</h1>
          <p className="mt-2 text-gray-600">Live platform operations, security and business monitoring.</p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="rounded-lg border bg-white px-4 py-2 text-sm font-medium shadow-sm disabled:opacity-60"
        >
          {isFetching ? "Refreshing..." : "Refresh"}
        </button>
      </header>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {cards.map(([key, label]) => (
          <article key={key} className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-gray-500">{label}</p>
            <h2 className="mt-3 text-4xl font-bold">
              {key === "revenue"
                ? `KES ${Number(stats[key] || 0).toLocaleString()}`
                : Number(stats[key] || 0).toLocaleString()}
            </h2>
            <p className="mt-2 text-xs text-gray-400">Live database count</p>
          </article>
        ))}
      </div>
    </main>
  );
}
