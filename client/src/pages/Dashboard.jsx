import { useSettings } from "../context/SettingsContext";
import { useQuery } from "@tanstack/react-query";
import { Link, Navigate } from "react-router-dom";
import { getMyBookings } from "../api/bookingApi";
import { useAuth } from "../context/AuthContext";
import { dashboardPath, getUserRole } from "../utils/roleUtils";
import MobileDashboardNav from "../components/common/MobileDashboardNav";
import AssignmentNotifications from "../components/notifications/AssignmentNotifications";
import { firstNumeric, unwrapData } from "../utils/dashboardData";
import { formatCurrency, getCurrency, getCurrencySymbol } from "../utils/currency";

const normalizeBookings = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.bookings)) return data.bookings;
  if (Array.isArray(data?.data?.bookings)) return data.data.bookings;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

const statusOf = (booking) => String(booking?.bookingStatus || booking?.status || "pending").trim().toLowerCase();
const paymentStatusOf = (booking) => String(typeof booking?.paymentStatus === "object" ? booking.paymentStatus?.paymentStatus || booking.paymentStatus?.status || "pending" : booking?.paymentStatus || "pending").trim().toLowerCase();
const canPostpone = (booking) => Boolean(booking?.travelDate) && !["cancelled", "completed", "refunded"].includes(statusOf(booking));

export default function Dashboard() {
  const { user } = useAuth();
  const { settings } = useSettings();
  const role = getUserRole(user);
  const currency = getCurrency(settings);
  const currencySymbol = getCurrencySymbol(settings);

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["my-bookings", user?._id], queryFn: getMyBookings, enabled: !!user && role === "customer",
    staleTime: 30_000, refetchOnWindowFocus: true, refetchOnMount: "always", retry: 1,
  });

  if (role !== "customer") return <Navigate to={dashboardPath(user)} replace />;
  if (isLoading) return <div className="dashboard-responsive customer-ops p-4 text-sm">Loading dashboard...</div>;
  if (error) return <div className="dashboard-responsive customer-ops p-4 text-sm">Unable to load dashboard.</div>;

  const payload = unwrapData(data);
  const bookings = normalizeBookings(data);
  const serverStats = payload?.stats || data?.stats || {};
  const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
  const upcomingTrips = bookings.filter((booking) => booking.travelDate && new Date(booking.travelDate) >= startOfToday && statusOf(booking) !== "cancelled").sort((a, b) => new Date(a.travelDate) - new Date(b.travelDate));
  const completedTrips = bookings.filter((booking) => statusOf(booking) === "completed");
  const cancelledTrips = bookings.filter((booking) => statusOf(booking) === "cancelled");
  const localTotalSpent = bookings.reduce((total, booking) => {
    if (!["confirmed", "completed", "assigned", "ongoing"].includes(statusOf(booking)) || !["paid", "completed", "success"].includes(paymentStatusOf(booking))) return total;
    const paid = Number(booking.amountPaid ?? booking.paidAmount ?? booking.depositAmount ?? booking.totalAmount ?? booking.amount ?? 0);
    return total + Math.max(0, paid - Number(booking.refundAmount || 0));
  }, 0);
  const displayedTotal = firstNumeric(serverStats.totalTrips, data?.total, bookings.length);
  const displayedUpcoming = firstNumeric(serverStats.upcomingTrips, upcomingTrips.length);
  const displayedCompleted = firstNumeric(serverStats.completedTrips, completedTrips.length);
  const displayedCancelled = firstNumeric(serverStats.cancelledTrips, cancelledTrips.length);
  const displayedSpent = firstNumeric(serverStats.totalSpent, localTotalSpent);
  const nextTrip = upcomingTrips[0];

  return (
    <div className="dashboard-responsive min-h-screen bg-gray-100 p-3 sm:p-4 md:p-6">
      <MobileDashboardNav role="customer" title="Customer Dashboard" />
      <div className="mb-5 rounded-2xl bg-gradient-to-r from-yellow-600 via-green-700 to-green-900 p-4 text-white shadow-xl sm:mb-6 sm:rounded-3xl sm:p-6 md:p-8">
        <h1 className="text-2xl font-bold sm:text-3xl md:text-4xl">Welcome back, {user?.name || "Traveller"}</h1>
        <p className="mt-2 text-sm text-white/90 sm:mt-3 sm:text-base md:text-lg">Manage your adventures with {settings?.companyName || "Company"}.</p>
        <div className="mt-4 flex flex-wrap gap-2 sm:mt-6 sm:gap-3">
          <Link to="/tours" className="rounded-lg bg-white px-4 py-2 text-xs font-bold text-green-700 sm:px-5 sm:py-2.5 sm:text-sm">Explore Tours</Link>
          <Link to="/my-bookings" className="rounded-lg bg-black/40 px-4 py-2 text-xs font-bold sm:px-5 sm:py-2.5 sm:text-sm">My Bookings</Link>
          <Link to="/custom-tour" className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white sm:px-5 sm:py-2.5 sm:text-sm">Create Custom Tour</Link>
          <Link to="/my-custom-tours" className="rounded-lg border border-white/30 bg-white px-4 py-2 text-xs font-bold text-emerald-700 sm:px-5 sm:py-2.5 sm:text-sm">My Custom Tours</Link>
        </div>
      </div>
      <div className="mb-5"><AssignmentNotifications /></div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"><Card title="Total Trips" value={displayedTotal} /><Card title="Upcoming Adventures" value={displayedUpcoming} /><Card title="Completed Trips" value={displayedCompleted} /><Card title="Cancelled Trips" value={displayedCancelled} /></div>
      <div className="mt-4 rounded-xl bg-white p-4 shadow sm:mt-5 sm:rounded-2xl sm:p-5"><p className="text-xs text-gray-500 sm:text-sm">Total Spent</p><h2 className="dashboard-value mt-1 font-bold">{formatCurrency(displayedSpent, currency, currencySymbol)}</h2></div>
      <div className="mt-4 flex justify-end"><button type="button" onClick={() => void refetch()} disabled={isFetching} className="rounded-lg border bg-white px-3 py-2 text-xs font-medium shadow-sm disabled:opacity-60 sm:px-4 sm:text-sm">{isFetching ? "Refreshing..." : "Refresh Dashboard"}</button></div>

      {nextTrip && (
        <div className="mt-5 rounded-xl bg-white p-4 shadow sm:rounded-2xl sm:p-6 md:p-8">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><h2 className="text-xl font-bold sm:text-2xl">Next Adventure</h2>{canPostpone(nextTrip) && <Link to={`/bookings/${nextTrip._id}`} className="w-fit rounded-lg bg-sky-700 px-4 py-2 text-xs font-bold text-white hover:bg-sky-800 sm:text-sm">Postpone / Change Date</Link>}</div>
          <div className="rounded-xl bg-green-50 p-4 sm:p-5"><h3 className="text-lg font-bold sm:text-xl">{nextTrip.tour?.title || "Tour Package"}</h3><p className="mt-1 text-xs sm:text-sm">Travel Date: {new Date(nextTrip.travelDate).toDateString()}</p><p className="mt-3 text-sm font-medium text-slate-600">Need to postpone? Choose a new date and provide your reason.</p></div>
        </div>
      )}

      <div className="mt-5 rounded-xl bg-white p-4 shadow sm:rounded-2xl sm:p-6 md:p-8">
        <div className="mb-4 flex items-center justify-between gap-3 sm:mb-5"><h2 className="text-xl font-bold sm:text-2xl">Recent Bookings</h2><Link to="/my-bookings" className="shrink-0 text-xs font-bold text-green-700 sm:text-sm">View All</Link></div>
        {bookings.length === 0 ? <p className="p-6 text-center text-sm">No bookings available.</p> : <div className="space-y-3 sm:space-y-4">{bookings.slice(0, 5).map((booking) => (
          <div key={booking._id} className="flex min-w-0 flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
            <div className="min-w-0"><h3 className="truncate text-sm font-bold sm:text-base">{booking.tour?.title || "Tour"}</h3><p className="truncate text-xs">Status: {booking.bookingStatus || booking.status || "pending"}{booking.travelDate ? ` • ${new Date(booking.travelDate).toLocaleDateString()}` : ""}</p></div>
            <div className="flex flex-wrap gap-2"><Link to={`/bookings/${booking._id}`} className="rounded-lg bg-green-700 px-3 py-1.5 text-xs font-semibold text-white sm:px-4 sm:py-2">View Booking</Link>{canPostpone(booking) && <Link to={`/bookings/${booking._id}`} className="rounded-lg bg-sky-700 px-3 py-1.5 text-xs font-semibold text-white sm:px-4 sm:py-2">Postpone</Link>}</div>
          </div>
        ))}</div>}
      </div>
    </div>
  );
}

function Card({ title, value }) { return <div className="dashboard-card min-w-0 rounded-xl bg-white p-3 shadow sm:rounded-2xl sm:p-5"><p className="truncate text-[10px] text-gray-500 sm:text-xs">{title}</p><h2 className="dashboard-value mt-1 font-bold">{value}</h2></div>; }
