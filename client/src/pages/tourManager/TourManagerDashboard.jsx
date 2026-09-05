import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Map, Users, Wallet, RefreshCw } from "lucide-react";
import { getDashboardStats } from "../../api/tourManagerApi";
import StatCard from "../../components/tours/tourManager/StatCard";
import UpcomingTours from "../../components/tours/tourManager/UpcomingTours";
import BookingTable from "../../components/tours/tourManager/BookingTable";
import TourManagerCommissions from "./TourManagerCommissions";
import { asArray, firstNumeric, unwrapData } from "../../utils/dashboardData";
import { useSettings } from "../../context/SettingsContext";

const QUICK_ACTIONS = [
  { label: "Create Tour", to: "/tour-manager/create-tour" },
  { label: "Manage Tours", to: "/tour-manager/tours" },
  { label: "Bookings", to: "/tour-manager/bookings" },
  { label: "Assignments", to: "/tour-manager/assignments" },
  { label: "Customers", to: "/tour-manager/customers" },
  { label: "Analytics", to: "/tour-manager/analytics" },
];

export default function TourManagerDashboard() {
  const { settings } = useSettings();
  const currencySymbol = settings?.currencySymbol || settings?.currency || "KSh";

  const dashboardQuery = useQuery({
    queryKey: ["tour-manager-dashboard"],
    queryFn: getDashboardStats,
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    retry: 1,
  });

  const dashboard = unwrapData(dashboardQuery.data);
  const stats = dashboard.stats || dashboard.summary || {};
  const upcomingTours = asArray(dashboard.upcomingTours ?? dashboard.tours);
  const recentBookings = asArray(dashboard.recentBookings ?? dashboard.bookings);

  const isLoading = dashboardQuery.isLoading;
  const isFetching = dashboardQuery.isFetching;
  const isError = dashboardQuery.isError;
  const error = dashboardQuery.error;

  const totalTours = firstNumeric(stats.totalTours, dashboard.totalTours, upcomingTours.length);
  const upcomingCount = firstNumeric(stats.upcomingTours, dashboard.upcomingToursCount, upcomingTours.length);
  const totalCustomers = firstNumeric(stats.totalCustomers, dashboard.totalCustomers, dashboard.customerCount);
  const revenue = firstNumeric(stats.revenue, dashboard.revenue);

  const refreshAll = () => void dashboardQuery.refetch();

  if (isLoading) {
    return <section className="p-6"><div className="rounded-xl bg-white p-8 shadow">Loading Tour Manager dashboard...</div></section>;
  }

  if (isError) {
    const status = error?.response?.status;
    const message = error?.response?.data?.message;
    return (
      <section className="p-6">
        <div className="rounded-xl bg-white p-8 shadow">
          <h1 className="text-xl font-bold">Unable to load Tour Manager dashboard</h1>
          <p className="mt-2 text-gray-600">
            {status === 401 ? "Your session has expired. Please sign in again." : status === 403 ? "Your account is not authorized for Tour Manager operations." : message || error?.message || "Dashboard request failed."}
          </p>
          <button onClick={refreshAll} className="mt-4 inline-flex items-center gap-2 rounded-lg border px-4 py-2" disabled={isFetching}>
            <RefreshCw size={15} className={isFetching ? "animate-spin" : ""} />
            {isFetching ? "Retrying..." : "Retry"}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="p-6 space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tour Manager Dashboard</h1>
          <p className="text-gray-600">Live tenant-scoped tours, bookings, customers and completed payment revenue.</p>
        </div>
        <button onClick={refreshAll} className="inline-flex items-center gap-2 rounded-lg border px-4 py-2" disabled={isFetching}>
          <RefreshCw size={15} className={isFetching ? "animate-spin" : ""} />
          {isFetching ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900">Quick Actions</h2>
          <p className="mt-1 text-sm text-slate-500">Open the Tour Manager workflows directly from your dashboard.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {QUICK_ACTIONS.map((action) => (
            <a key={action.to} href={action.to} className="rounded-xl border bg-slate-50 px-4 py-3 text-center text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm">
              {action.label}
            </a>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <StatCard title="Tours" value={totalTours} subtitle="Live tenant tours" icon={<Map />} />
        <StatCard title="Upcoming Tours" value={upcomingCount} subtitle="Scheduled tours" icon={<CalendarDays />} />
        <StatCard title="Customers" value={totalCustomers} subtitle="Tenant customers" icon={<Users />} />
        <StatCard title="Revenue" value={`${currencySymbol} ${Number(revenue).toLocaleString()}`} subtitle="Completed payments less completed refunds" icon={<Wallet />} />
      </div>

      <UpcomingTours tours={upcomingTours} />
      <BookingTable bookings={recentBookings} />
      <TourManagerCommissions />
    </section>
  );
}
