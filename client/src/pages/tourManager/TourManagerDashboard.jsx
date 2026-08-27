import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Map, Users, Wallet, RefreshCw } from "lucide-react";
import { getBookings, getDashboardStats } from "../../api/tourManagerApi";
import StatCard from "../../components/tours/tourManager/StatCard";
import UpcomingTours from "../../components/tours/tourManager/UpcomingTours";
import BookingTable from "../../components/tours/tourManager/BookingTable";
import { asArray, firstNumeric, unwrapData } from "../../utils/dashboardData";

export default function TourManagerDashboard() {
  const dashboardQuery = useQuery({
    queryKey: ["tour-manager-dashboard"],
    queryFn: getDashboardStats,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    retry: 1,
  });

  const bookingsQuery = useQuery({
    queryKey: ["tour-manager-dashboard-bookings"],
    queryFn: () => getBookings({ page: 1, limit: 6 }),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    retry: 1,
  });

  const dashboard = unwrapData(dashboardQuery.data);
  const stats = dashboard.stats || dashboard.summary || {};
  const upcomingTours = asArray(dashboard.upcomingTours ?? dashboard.tours);
  const bookingsPayload = unwrapData(bookingsQuery.data);
  const recentBookings = asArray(bookingsPayload.data ?? bookingsPayload.bookings ?? dashboard.recentBookings);

  const isLoading = dashboardQuery.isLoading || bookingsQuery.isLoading;
  const isFetching = dashboardQuery.isFetching || bookingsQuery.isFetching;
  const isError = dashboardQuery.isError || bookingsQuery.isError;
  const error = dashboardQuery.error || bookingsQuery.error;

  const totalTours = firstNumeric(stats.totalTours, dashboard.totalTours, upcomingTours.length);
  const upcomingCount = firstNumeric(stats.upcomingTours, dashboard.upcomingToursCount, upcomingTours.length);
  const totalCustomers = firstNumeric(stats.totalCustomers, dashboard.totalCustomers, dashboard.customerCount);
  const revenue = firstNumeric(stats.revenue, dashboard.revenue);

  const refreshAll = () => {
    void dashboardQuery.refetch();
    void bookingsQuery.refetch();
  };

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

      <div className="grid gap-6 md:grid-cols-4">
        <StatCard title="Tours" value={totalTours} subtitle="Live tenant tours" icon={<Map />} />
        <StatCard title="Upcoming Tours" value={upcomingCount} subtitle="Scheduled tours" icon={<CalendarDays />} />
        <StatCard title="Customers" value={totalCustomers} subtitle="Tenant customers" icon={<Users />} />
        <StatCard title="Revenue" value={`KES ${Number(revenue).toLocaleString()}`} subtitle="Completed payments less completed refunds" icon={<Wallet />} />
      </div>

      <UpcomingTours tours={upcomingTours} />
      <BookingTable bookings={recentBookings} />
    </section>
  );
}
