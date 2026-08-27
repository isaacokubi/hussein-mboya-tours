import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getSuperAdminDashboardMetrics } from "../../api/superAdminApi";
import SuperAdminTenants from "./SuperAdminTenants";

const number = (value) => Number(value ?? 0).toLocaleString();
const unwrapMetrics = (payload) => {
  let current = payload?.data ?? payload ?? {};
  if (current?.data && typeof current.data === "object" && !Array.isArray(current.data)) {
    const nested = current.data;
    if (
      nested.users !== undefined ||
      nested.customers !== undefined ||
      nested.customerProfiles !== undefined ||
      nested.customerAccounts !== undefined ||
      nested.vehicles !== undefined ||
      nested.bookings !== undefined ||
      nested.tours !== undefined ||
      nested.destinations !== undefined ||
      nested.payments !== undefined
    ) {
      current = nested;
    }
  }
  return current;
};

const unwrapScope = (payload) =>
  payload?.scope || payload?.data?.scope || payload?.data?.data?.scope || {};

const cards = [
  ["users", "All Platform User Accounts"],
  ["customerProfiles", "Customer Profiles"],
  ["customerAccounts", "Customer Accounts"],
  ["staff", "Staff"],
  ["agents", "Agents"],
  ["vehicles", "Vehicles"],
  ["availableVehicles", "Available Vehicles"],
  ["bookings", "Bookings"],
  ["admins", "Tenant Administrators"],
  ["tours", "Tours"],
  ["destinations", "Destinations"],
  ["payments", "Payments"],
  ["completedPayments", "Completed Payments"],
];

export default function SuperAdminDashboard() {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["superadmin-dashboard-metrics"],
    queryFn: getSuperAdminDashboardMetrics,
    retry: 1,
    staleTime: 30_000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const stats = unwrapMetrics(data);
  const scope = unwrapScope(data);
  const status = error?.response?.status;
  const message = error?.response?.data?.message;
  const currency = String(stats.revenueCurrency || "KES").toUpperCase();
  const activeTenantCount = Number(scope.activeTenantCount ?? 0);
  const trialTenantCount = Number(scope.trialTenantCount ?? 0);
  const totalOperationalTenants = Number(
    scope.tenantCount ?? activeTenantCount + trialTenantCount
  );

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
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Platform Governance
          </p>
          <h1 className="mt-2 text-2xl font-bold">Super Admin Control Center</h1>
          <p className="mt-3 text-gray-600">
            {sessionExpired
              ? "Your authentication session is no longer valid. Sign in again to continue."
              : forbidden
                ? "Your account is not authorized for platform governance."
                : message || "Unable to load platform metrics."}
          </p>
          <div className="mt-5 flex gap-3">
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
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">
            Platform Governance
          </p>
          <h1 className="mt-1 text-3xl font-bold">Global Tours Platform Control Center</h1>
          <p className="mt-2 text-gray-600">
            Live platform-wide metrics across {number(totalOperationalTenants)} operational
            tenants ({number(activeTenantCount)} active, {number(trialTenantCount)} trial).
          </p>
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

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(([key, label]) => (
          <article key={key} className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">{label}</p>
            <h2 className="mt-2 text-4xl font-bold">{number(stats[key])}</h2>
            <p className="mt-2 text-xs text-gray-400">Live platform count</p>
          </article>
        ))}
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Net revenue</p>
          <h2 className="mt-2 text-3xl font-bold">
            {currency} {number(stats.revenue)}
          </h2>
          <p className="mt-2 text-xs text-gray-400">
            Gross {currency} {number(stats.grossRevenue)} − refunds {currency}{" "}
            {number(stats.refundedRevenue)}
          </p>
        </article>
        <article className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Agent approvals</p>
          <div className="mt-2 flex gap-8">
            <div>
              <p className="text-2xl font-bold">{number(stats.approvedAgents)}</p>
              <p className="text-xs text-gray-500">Approved</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{number(stats.pendingAgents)}</p>
              <p className="text-xs text-gray-500">Pending</p>
            </div>
          </div>
        </article>
      </section>

      <section className="rounded-2xl border bg-white p-5 text-sm text-gray-500 shadow-sm">
        Customer Profiles are profile records, while Customer Accounts are active user accounts
        with the customer role. Staff, agents, vehicles, tours, destinations, bookings, and
        payments are restricted to operational tenant data. The global platform owner account is
        excluded from tenant-level totals.
      </section>

      <section className="rounded-2xl border bg-white p-1 shadow-sm">
        <SuperAdminTenants />
      </section>
    </main>
  );
}
