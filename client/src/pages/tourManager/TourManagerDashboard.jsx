import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Map, Users, Wallet } from "lucide-react";
import { getBookings, getDashboardStats } from "../../api/tourManagerApi";
import StatCard from "../../components/tours/tourManager/StatCard";
import UpcomingTours from "../../components/tours/tourManager/UpcomingTours";
import BookingTable from "../../components/tours/tourManager/BookingTable";

export default function TourManagerDashboard() {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["tour-manager-dashboard"],
    queryFn: getDashboardStats,
    staleTime: 30_000,
  });

  const {
    data: bookingsData,
    isFetching: isFetchingBookings,
    refetch: refetchBookings,
  } = useQuery({
    queryKey: ["tour-manager-dashboard-bookings"],
    queryFn: () => getBookings({ page: 1, limit: 6 }),
    staleTime: 30_000,
  });

  const dashboard = data?.data || {};
  const stats = dashboard.stats || {};
  const upcomingTours = Array.isArray(dashboard.upcomingTours) ? dashboard.upcomingTours : [];

  const canonicalBookings = Array.isArray(bookingsData?.data)
    ? bookingsData.data
    : Array.isArray(bookingsData?.bookings)
      ? bookingsData.bookings
      : [];

  const recentBookings = canonicalBookings.length
    ? canonicalBookings
    : (Array.isArray(dashboard.recentBookings) ? dashboard.recentBookings : []);

  const refreshAll = () => {
    refetch();
    refetchBookings();
  };

  if (isLoading) {
    return <section className="p-6"><div className="rounded-xl bg-white p-8 shadow">Loading Tour Manager dashboard...</div></section>;
  }

  if (isError) {
    return (
      <section className="p-6">
        <div className="rounded-xl bg-white p-8 shadow">
          <h1 className="text-xl font-bold">Unable to load dashboard</h1>
          <p className="mt-2 text-red-600">{error?.message || "Dashboard request failed."}</p>
          <button onClick={refreshAll} className="mt-4 rounded-lg border px-4 py-2" disabled={isFetching || isFetchingBookings}>
            {isFetching || isFetchingBookings ? "Retrying..." : "Retry"}
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
          <p className="text-gray-600">Manage tours, bookings, guides and vehicles</p>
        </div>
        <button onClick={refreshAll} className="rounded-lg border px-4 py-2" disabled={isFetching || isFetchingBookings}>
          {isFetching || isFetchingBookings ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <StatCard title="Tours" value={stats.totalTours || 0} subtitle="Total tours" icon={<Map />} />
        <StatCard title="Upcoming Tours" value={stats.upcomingTours || 0} subtitle="Scheduled tours" icon={<CalendarDays />} />
        <StatCard title="Customers" value={stats.totalCustomers || 0} subtitle="Registered customers" icon={<Users />} />
        <StatCard title="Revenue" value={`KES ${Number(stats.revenue || 0).toLocaleString()}`} subtitle="Completed payments" icon={<Wallet />} />
      </div>

      <UpcomingTours tours={upcomingTours} />
      <BookingTable bookings={recentBookings} />
    </section>
  );
}
