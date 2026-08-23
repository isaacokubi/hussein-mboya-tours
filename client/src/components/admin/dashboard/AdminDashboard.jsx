import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "../../../api/adminApi";
import DashboardHeader from "./DashboardHeader";
import StatsGrid from "./StatsGrid";
import PopularTours from "./PopularTours";
import RecentBookings from "./RecentBookings";
import PaymentAnalytics from "./PaymentAnalytics";
import QuickActions from "./QuickActions";
import SystemHealth from "./SystemHealth";

const unwrap = (payload) => payload?.data || payload || {};

export default function AdminDashboard() {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: getDashboard,
    staleTime: 30000,
    refetchInterval: 60000,
    refetchIntervalInBackground: false,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    retry: 1,
  });

  useEffect(() => {
    const refresh = () => refetch();
    window.addEventListener("dashboard:data-changed", refresh);
    return () => window.removeEventListener("dashboard:data-changed", refresh);
  }, [refetch]);

  if (isLoading) return <div className="min-h-screen bg-gray-50 p-8">Loading admin dashboard...</div>;

  if (isError) {
    const status = error?.response?.status;
    const message = error?.response?.data?.message || error?.message || "Dashboard request failed.";
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="font-semibold">Unable to load Admin Dashboard</h2>
          <p className="mt-2 text-gray-600">
            {status === 401 ? "Your session has expired. Please sign in again." :
              status === 403 ? "Your account is authenticated but is not authorized to use the Admin Dashboard." : message}
          </p>
          <button type="button" onClick={() => refetch()} disabled={isFetching} className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-white disabled:opacity-60">
            {isFetching ? "Retrying..." : "Retry"}
          </button>
        </div>
      </div>
    );
  }

  const dashboard = unwrap(data);
  const summary = dashboard.summary || {};

  return (
    <div className="min-h-screen space-y-8 bg-gray-50 p-6">
      <DashboardHeader />
      <div className="flex justify-end">
        <button type="button" onClick={() => refetch()} disabled={isFetching} className="rounded-lg border bg-white px-4 py-2 text-sm font-medium shadow-sm disabled:opacity-60">
          {isFetching ? "Refreshing..." : "Refresh Dashboard"}
        </button>
      </div>
      <StatsGrid stats={dashboard} summary={summary} />
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2"><RecentBookings bookings={dashboard.recentBookings || []} /></div>
        <PaymentAnalytics payments={dashboard.paymentStats || dashboard.payments || { completed: 0, pending: 0, failed: 0 }} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <PopularTours tours={dashboard.popularTours || []} />
        <SystemHealth />
      </div>
      <QuickActions />
    </div>
  );
}
