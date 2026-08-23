import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "../../../api/adminApi";
import DashboardHeader from "./DashboardHeader";
import StatsGrid from "./StatsGrid";
import PopularTours from "./PopularTours";
import RecentBookings from "./RecentBookings";
import PaymentAnalytics from "./PaymentAnalytics";
import QuickActions from "./QuickActions";
import SystemHealth from "./SystemHealth";

const unwrap = (payload) => payload?.data ?? payload ?? {};
const asArray = (value) => (Array.isArray(value) ? value : []);

export default function AdminDashboard() {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: getDashboard,
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    retry: 1,
  });

  useEffect(() => {
    const refresh = () => void refetch();
    window.addEventListener("dashboard:data-changed", refresh);
    return () => window.removeEventListener("dashboard:data-changed", refresh);
  }, [refetch]);

  const dashboard = useMemo(() => unwrap(data), [data]);
  const summary = dashboard.summary ?? {};
  const paymentStats = dashboard.paymentStats ?? {};
  const recentBookings = asArray(dashboard.recentBookings);
  const popularTours = asArray(dashboard.popularTours);
  const monthlyRevenue = asArray(dashboard.monthlyRevenue);
  const bookingStatus = asArray(dashboard.status);

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 p-8 text-gray-600">Loading admin dashboard...</div>;
  }

  if (isError) {
    const status = error?.response?.status;
    const message = error?.response?.data?.message || error?.message || "Dashboard request failed.";
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl rounded-xl border border-red-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-red-700">Unable to load Admin Dashboard</h2>
          <p className="mt-2 text-gray-600">
            {status === 401 ? "Your session has expired. Please sign in again." : status === 403 ? "Your account is not authorized to use the Admin Dashboard." : message}
          </p>
          <button type="button" onClick={() => void refetch()} disabled={isFetching} className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-white disabled:opacity-60">
            {isFetching ? "Retrying..." : "Retry"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-8 bg-gray-50 p-6 lg:p-8">
      <DashboardHeader />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Business Overview</h2>
          <p className="text-sm text-slate-500">Live tenant-scoped operational, booking and payment metrics.</p>
        </div>
        <button type="button" onClick={() => void refetch()} disabled={isFetching} className="rounded-lg border bg-white px-4 py-2 text-sm font-medium shadow-sm disabled:opacity-60">
          {isFetching ? "Refreshing..." : "Refresh Dashboard"}
        </button>
      </div>

      <StatsGrid stats={dashboard} summary={summary} />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2"><RecentBookings bookings={recentBookings} /></div>
        <PaymentAnalytics payments={paymentStats} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PopularTours tours={popularTours} />
        <SystemHealth />
      </div>

      {(monthlyRevenue.length > 0 || bookingStatus.length > 0) && (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl bg-white p-6 shadow">
            <h2 className="mb-5 text-xl font-bold">Revenue Trend</h2>
            {monthlyRevenue.length === 0 ? <p className="text-gray-500">No completed payment revenue yet.</p> : (
              <div className="space-y-3">
                {monthlyRevenue.slice(-6).map((item) => (
                  <div key={item.month} className="flex items-center justify-between border-b pb-2">
                    <span className="text-gray-600">{item.month}</span>
                    <strong>Ksh {Number(item.amount || 0).toLocaleString()}</strong>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-xl bg-white p-6 shadow">
            <h2 className="mb-5 text-xl font-bold">Booking Status</h2>
            {bookingStatus.length === 0 ? <p className="text-gray-500">No bookings available.</p> : (
              <div className="space-y-3">
                {bookingStatus.map((item) => (
                  <div key={item._id || "unknown"} className="flex items-center justify-between border-b pb-2">
                    <span className="capitalize text-gray-600">{String(item._id || "unknown").replace(/[_-]/g, " ")}</span>
                    <strong>{Number(item.count || 0).toLocaleString()}</strong>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      <QuickActions />
    </div>
  );
}
