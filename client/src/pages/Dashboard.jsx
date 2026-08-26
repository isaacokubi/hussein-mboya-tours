import { useSettings } from "../context/SettingsContext";
import { useQuery } from "@tanstack/react-query";
import { Link, Navigate } from "react-router-dom";
import { getMyBookings } from "../api/bookingApi";
import { useAuth } from "../context/AuthContext";
import { dashboardPath, getUserRole } from "../utils/roleUtils";
import MobileDashboardNav from "../components/common/MobileDashboardNav";
import AssignmentNotifications from "../components/notifications/AssignmentNotifications";
import { firstNumeric, unwrapData } from "../utils/dashboardData";

const normalizeBookings = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.bookings)) return data.bookings;
  if (Array.isArray(data?.data?.bookings)) return data.data.bookings;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

const statusOf = (booking) =>
  String(booking?.bookingStatus || booking?.status || "pending").trim().toLowerCase();

const paymentStatusOf = (booking) =>
  String(
    typeof booking?.paymentStatus === "object"
      ? booking.paymentStatus?.paymentStatus || booking.paymentStatus?.status || "pending"
      : booking?.paymentStatus || "pending"
  )
    .trim()
    .toLowerCase();

export default function Dashboard() {
  const { user } = useAuth();
  const { settings } = useSettings();
  const role = getUserRole(user);

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["my-bookings", user?._id],
    queryFn: getMyBookings,
    enabled: !!user && role === "customer",
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    retry: 1,
  });

  if (role !== "customer") return <Navigate to={dashboardPath(user)} replace />;
  if (isLoading) return <div className="customer-ops">Loading dashboard...</div>;
  if (error) return <div className="customer-ops">Unable to load dashboard.</div>;

  const payload = unwrapData(data);
  const bookings = normalizeBookings(data);
  const serverStats = payload?.stats || data?.stats || {};
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const upcomingTrips = bookings
    .filter((booking) => {
      if (!booking.travelDate) return false;
      return new Date(booking.travelDate) >= startOfToday && statusOf(booking) !== "cancelled";
    })
    .sort((a, b) => new Date(a.travelDate) - new Date(b.travelDate));
  const completedTrips = bookings.filter((booking) => statusOf(booking) === "completed");
  const cancelledTrips = bookings.filter((booking) => statusOf(booking) === "cancelled");

  const localTotalSpent = bookings.reduce((total, booking) => {
    const status = statusOf(booking);
    const paymentStatus = paymentStatusOf(booking);
    if (!["confirmed", "completed", "assigned", "ongoing"].includes(status)) return total;
    if (!["paid", "completed", "success"].includes(paymentStatus)) return total;
    const paid = Number(
      booking.amountPaid ?? booking.paidAmount ?? booking.depositAmount ?? booking.totalAmount ?? booking.amount ?? 0
    );
    return total + Math.max(0, paid - Number(booking.refundAmount || 0));
  }, 0);

  const displayedTotal = firstNumeric(serverStats.totalTrips, data?.total, bookings.length);
  const displayedUpcoming = firstNumeric(serverStats.upcomingTrips, upcomingTrips.length);
  const displayedCompleted = firstNumeric(serverStats.completedTrips, completedTrips.length);
  const displayedCancelled = firstNumeric(serverStats.cancelledTrips, cancelledTrips.length);
  const displayedSpent = firstNumeric(serverStats.totalSpent, localTotalSpent);
  const nextTrip = upcomingTrips[0];

  return (
    <>
      <MobileDashboardNav role="customer" title="Customer Dashboard" />
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="bg-gradient-to-r from-yellow-600 via-green-700 to-green-900 rounded-3xl text-white p-8 shadow-xl mb-8">
          <h1 className="text-4xl font-bold">Welcome back, {user?.name || "Traveller"}</h1>
          <p className="mt-3 text-lg">Manage your adventures with {settings?.companyName || "Company"}.</p>
          <div className="flex gap-4 mt-6 flex-wrap">
            <Link to="/tours" className="bg-white text-green-700 px-6 py-3 rounded-xl font-bold">Explore Tours</Link>
            <Link to="/my-bookings" className="bg-black/40 px-6 py-3 rounded-xl font-bold">My Bookings</Link>
            <Link to="/custom-tour" className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold">Create Custom Tour</Link>
            <Link to="/my-custom-tours" className="bg-white text-emerald-700 px-6 py-3 rounded-xl font-bold border border-white/30 hover:bg-emerald-50 transition">My Custom Tours</Link>
          </div>
        </div>

        <div className="mb-6 mt-6 md:mt-0"><AssignmentNotifications /></div>

        <div className="grid md:grid-cols-4 gap-6">
          <Card title="Total Trips" value={displayedTotal} />
          <Card title="Upcoming Adventures" value={displayedUpcoming} />
          <Card title="Completed Trips" value={displayedCompleted} />
          <Card title="Cancelled Trips" value={displayedCancelled} />
        </div>

        <div className="bg-white rounded-2xl shadow p-6 mt-6">
          <p className="text-gray-500">Total Spent</p>
          <h2 className="text-3xl font-bold">KES {Number(displayedSpent).toLocaleString()}</h2>
        </div>

        <div className="mt-6 flex justify-end">
          <button type="button" onClick={() => void refetch()} disabled={isFetching} className="rounded-lg border bg-white px-4 py-2 text-sm font-medium shadow-sm disabled:opacity-60">
            {isFetching ? "Refreshing..." : "Refresh Dashboard"}
          </button>
        </div>

        {nextTrip && (
          <div className="bg-white rounded-2xl shadow p-8 mt-8">
            <h2 className="text-3xl font-bold mb-5">Next Adventure</h2>
            <div className="bg-green-50 rounded-xl p-6">
              <h3 className="text-2xl font-bold">{nextTrip.tour?.title || "Tour Package"}</h3>
              <p>Travel Date: {new Date(nextTrip.travelDate).toDateString()}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow p-8 mt-10">
          <div className="flex justify-between mb-6">
            <h2 className="text-3xl font-bold">Recent Bookings</h2>
            <Link to="/my-bookings" className="text-green-700 font-bold">View All</Link>
          </div>
          {bookings.length === 0 ? <p className="text-center p-10">No bookings available.</p> :
            <div className="space-y-5">{bookings.slice(0, 5).map((booking) => (
              <div key={booking._id} className="border rounded-xl p-5 flex justify-between">
                <div><h3 className="font-bold text-xl">{booking.tour?.title || "Tour"}</h3><p>Status: {booking.bookingStatus || booking.status || "pending"}</p></div>
                <Link to={`/bookings/${booking._id}`} className="bg-green-700 text-white px-5 py-2 rounded-lg">View</Link>
              </div>
            ))}</div>}
        </div>
      </div>
    </>
  );
}

function Card({ title, value }) {
  return <div className="bg-white rounded-2xl shadow p-6"><p className="text-gray-500">{title}</p><h2 className="text-4xl font-bold mt-2">{value}</h2></div>;
}
