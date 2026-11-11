/**
 * Purpose: Dashboard page-level UI component. Main declarations: normalizeBookings, statusOf, paymentStatusOf, Dashboard, Card.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useSettings } from "../context/SettingsContext";
// Load @tanstack/react-query so this module can use its exported dependencies.
import { useQuery } from "@tanstack/react-query";
// Load react-router-dom so this module can use its exported dependencies.
import { Link, Navigate } from "react-router-dom";
// Load ../api/bookingApi so this module can use its exported dependencies.
import { getMyBookings } from "../api/bookingApi";
// Load ../context/AuthContext so this module can use its exported dependencies.
import { useAuth } from "../context/AuthContext";
// Load ../utils/roleUtils so this module can use its exported dependencies.
import { dashboardPath, getUserRole } from "../utils/roleUtils";
// Load ../components/common/MobileDashboardNav so this module can use its exported dependencies.
import MobileDashboardNav from "../components/common/MobileDashboardNav";
// Load ../components/notifications/AssignmentNotifications so this module can use its exported dependencies.
import AssignmentNotifications from "../components/notifications/AssignmentNotifications";
// Load ../utils/dashboardData so this module can use its exported dependencies.
import { firstNumeric, unwrapData } from "../utils/dashboardData";
// Load ../utils/currency so this module can use its exported dependencies.
import { formatCurrency, getCurrency, getCurrencySymbol } from "../utils/currency";

// Declare normalizeBookings for use by the surrounding module or function.
const normalizeBookings = (data) => {
  // Check the condition (Array.isArray(data)) and run the matching branch.
  if (Array.isArray(data)) return data;
  // Check the condition (Array.isArray(data?.bookings)) and run the matching branch.
  if (Array.isArray(data?.bookings)) return data.bookings;
  // Check the condition (Array.isArray(data?.data?.bookings)) and run the matching branch.
  if (Array.isArray(data?.data?.bookings)) return data.data.bookings;
  // Check the condition (Array.isArray(data?.data)) and run the matching branch.
  if (Array.isArray(data?.data)) return data.data;
  // Check the condition (Array.isArray(data?.results)) and run the matching branch.
  if (Array.isArray(data?.results)) return data.results;
  // Return the collection assembled below to the caller.
  return [];
};

// Declare statusOf for use by the surrounding module or function.
const statusOf = (booking) =>
  String(booking?.bookingStatus || booking?.status || "pending").trim().toLowerCase();

// Declare paymentStatusOf for use by the surrounding module or function.
const paymentStatusOf = (booking) =>
  String(
    typeof booking?.paymentStatus === "object"
      ? booking.paymentStatus?.paymentStatus || booking.paymentStatus?.status || "pending"
      : booking?.paymentStatus || "pending"
  )
    .trim()
    .toLowerCase();

// Define Dashboard; its parameters and body implement this operation.
export default function Dashboard() {
  // Declare { user } for use by the surrounding module or function.
  const { user } = useAuth();
  // Declare { settings } for use by the surrounding module or function.
  const { settings } = useSettings();
  // Declare role for use by the surrounding module or function.
  const role = getUserRole(user);
  // Declare currency for use by the surrounding module or function.
  const currency = getCurrency(settings);
  // Declare currencySymbol for use by the surrounding module or function.
  const currencySymbol = getCurrencySymbol(settings);

  // Declare { data, isLoading, error, refetch, isFetching } for use by the surrounding module or function.
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["my-bookings", user?._id],
    queryFn: getMyBookings,
    enabled: !!user && role === "customer",
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    retry: 1,
  });

  // Check the condition (role !== "customer") and run the matching branch.
  if (role !== "customer") return <Navigate to={dashboardPath(user)} replace />;
  // Check the condition (isLoading) and run the matching branch.
  if (isLoading)
    // Return the expression shown below to the caller.
    return <div className="dashboard-responsive customer-ops p-4 text-sm">Loading dashboard...</div>;
  // Check the condition (error) and run the matching branch.
  if (error)
    // Return the expression shown below to the caller.
    return (
      <div className="dashboard-responsive customer-ops min-h-[50vh] p-4 sm:p-6">
        <div className="mx-auto max-w-2xl rounded-2xl border border-rose-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-rose-600">Customer dashboard unavailable</p>
          <h1 className="mt-2 text-xl font-bold text-slate-900">Unable to load your dashboard</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {error?.response?.status === 401
              ? "Your session has expired. Please sign in again."
              : error?.response?.status === 403
                ? "Your account is not authorized to view this dashboard."
                : error?.response?.data?.message || error?.message || "The dashboard request failed. No figures are being shown as zero."}
          </p>
          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="mt-5 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-60"
          >
            {isFetching ? "Retrying..." : "Retry dashboard"}
          </button>
        </div>
      </div>
    );

  // Declare payload for use by the surrounding module or function.
  const payload = unwrapData(data);
  // Declare bookings for use by the surrounding module or function.
  const bookings = normalizeBookings(data);
  // Declare serverStats for use by the surrounding module or function.
  const serverStats = payload?.stats || data?.stats || {};
  // Declare startOfToday for use by the surrounding module or function.
  const startOfToday = new Date();
  // Perform the side effect or state update expressed on the following line.
  startOfToday.setHours(0, 0, 0, 0);

  // Declare upcomingTrips for use by the surrounding module or function.
  const upcomingTrips = bookings
    .filter(
      (booking) =>
        booking.travelDate &&
        new Date(booking.travelDate) >= startOfToday &&
        statusOf(booking) !== "cancelled"
    )
    .sort((a, b) => new Date(a.travelDate) - new Date(b.travelDate));

  // Declare completedTrips for use by the surrounding module or function.
  const completedTrips = bookings.filter((booking) => statusOf(booking) === "completed");
  // Declare cancelledTrips for use by the surrounding module or function.
  const cancelledTrips = bookings.filter((booking) => statusOf(booking) === "cancelled");

  // Declare localTotalSpent for use by the surrounding module or function.
  const localTotalSpent = bookings.reduce((total, booking) => {
    // Declare status for use by the surrounding module or function.
    const status = statusOf(booking);
    // Declare paymentStatus for use by the surrounding module or function.
    const paymentStatus = paymentStatusOf(booking);
    // Check the condition (!["confirmed", "completed", "assigned", "ongoing"].includes(status) ||) and run the matching branch.
    if (
      !["confirmed", "completed", "assigned", "ongoing"].includes(status) ||
      !["paid", "completed", "success"].includes(paymentStatus)
    ) {
      // Return the value of total to the caller.
      return total;
    }

    // Declare paid for use by the surrounding module or function.
    const paid = Number(
      booking.amountPaid ??
        booking.paidAmount ??
        booking.depositAmount ??
        booking.totalAmount ??
        booking.amount ??
        0
    );
    // Return the expression shown below to the caller.
    return total + Math.max(0, paid - Number(booking.refundAmount || 0));
  }, 0);

  // Declare displayedTotal for use by the surrounding module or function.
  const displayedTotal = firstNumeric(serverStats.totalTrips, data?.total, bookings.length);
  // Declare displayedUpcoming for use by the surrounding module or function.
  const displayedUpcoming = firstNumeric(serverStats.upcomingTrips, upcomingTrips.length);
  // Declare displayedCompleted for use by the surrounding module or function.
  const displayedCompleted = firstNumeric(serverStats.completedTrips, completedTrips.length);
  // Declare displayedCancelled for use by the surrounding module or function.
  const displayedCancelled = firstNumeric(serverStats.cancelledTrips, cancelledTrips.length);
  // Declare displayedSpent for use by the surrounding module or function.
  const displayedSpent = firstNumeric(serverStats.totalSpent, localTotalSpent);
  // Declare nextTrip for use by the surrounding module or function.
  const nextTrip = upcomingTrips[0];

  // Return the expression shown below to the caller.
  return (
    <div className="dashboard-responsive min-h-screen bg-gray-100 p-3 sm:p-4 md:p-6">
      <MobileDashboardNav role="customer" title="Customer Dashboard" />

      <div className="mb-5 rounded-2xl bg-gradient-to-r from-yellow-600 via-green-700 to-green-900 p-4 text-white shadow-xl sm:mb-6 sm:rounded-3xl sm:p-6 md:p-8">
        <h1 className="text-2xl font-bold sm:text-3xl md:text-4xl">
          Welcome back, {user?.name || "Traveller"}
        </h1>
        <p className="mt-2 text-sm text-white/90 sm:mt-3 sm:text-base md:text-lg">
          Manage your adventures with {settings?.companyName || "Company"}.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 sm:mt-6 sm:gap-3">
          <Link to="/tours" className="rounded-lg bg-white px-4 py-2 text-xs font-bold text-green-700 sm:px-5 sm:py-2.5 sm:text-sm">
            Explore Tours
          </Link>
          <Link to="/my-bookings" className="rounded-lg bg-black/40 px-4 py-2 text-xs font-bold sm:px-5 sm:py-2.5 sm:text-sm">
            My Bookings
          </Link>
          <Link to="/custom-tour" className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white sm:px-5 sm:py-2.5 sm:text-sm">
            Create Custom Tour
          </Link>
          <Link to="/my-custom-tours" className="rounded-lg border border-white/30 bg-white px-4 py-2 text-xs font-bold text-emerald-700 sm:px-5 sm:py-2.5 sm:text-sm">
            My Custom Tours
          </Link>
        </div>
      </div>

      <div className="mb-5">
        <AssignmentNotifications />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Card title="Total Trips" value={displayedTotal} />
        <Card title="Upcoming Adventures" value={displayedUpcoming} />
        <Card title="Completed Trips" value={displayedCompleted} />
        <Card title="Cancelled Trips" value={displayedCancelled} />
      </div>

      <div className="mt-4 rounded-xl bg-white p-4 shadow sm:mt-5 sm:rounded-2xl sm:p-5">
        <p className="text-xs text-gray-500 sm:text-sm">Total Spent</p>
        <h2 className="dashboard-value mt-1 font-bold">
          {formatCurrency(displayedSpent, currency, currencySymbol)}
        </h2>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={() => void refetch()}
          disabled={isFetching}
          className="rounded-lg border bg-white px-3 py-2 text-xs font-medium shadow-sm disabled:opacity-60 sm:px-4 sm:text-sm"
        >
          {isFetching ? "Refreshing..." : "Refresh Dashboard"}
        </button>
      </div>

      {nextTrip && (
        <div className="mt-5 rounded-xl bg-white p-4 shadow sm:rounded-2xl sm:p-6 md:p-8">
          <h2 className="mb-4 text-xl font-bold sm:text-2xl">Next Adventure</h2>
          <div className="rounded-xl bg-green-50 p-4 sm:p-5">
            <h3 className="text-lg font-bold sm:text-xl">{nextTrip.tour?.title || "Tour Package"}</h3>
            <p className="mt-1 text-xs sm:text-sm">
              Travel Date: {new Date(nextTrip.travelDate).toDateString()}
            </p>
          </div>
        </div>
      )}

      <div className="mt-5 rounded-xl bg-white p-4 shadow sm:rounded-2xl sm:p-6 md:p-8">
        <div className="mb-4 flex items-center justify-between gap-3 sm:mb-5">
          <h2 className="text-xl font-bold sm:text-2xl">Recent Bookings</h2>
          <Link to="/my-bookings" className="shrink-0 text-xs font-bold text-green-700 sm:text-sm">
            View All
          </Link>
        </div>
        {bookings.length === 0 ? (
          <p className="p-6 text-center text-sm">No bookings available.</p>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {bookings.slice(0, 5).map((booking) => (
              <div
                key={booking._id}
                className="flex min-w-0 items-center justify-between gap-3 rounded-xl border p-3 sm:p-4"
              >
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-bold sm:text-base">
                    {booking.tour?.title || "Tour"}
                  </h3>
                  <p className="truncate text-xs">
                    Status: {booking.bookingStatus || booking.status || "pending"}
                  </p>
                </div>
                <Link
                  to={`/bookings/${booking._id}`}
                  className="shrink-0 rounded-lg bg-green-700 px-3 py-1.5 text-xs text-white sm:px-4 sm:py-2"
                >
                  View
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Define Card; its parameters and body implement this operation.
function Card({ title, value }) {
  // Return the expression shown below to the caller.
  return (
    <div className="dashboard-card min-w-0 rounded-xl bg-white p-3 shadow sm:rounded-2xl sm:p-5">
      <p className="truncate text-[10px] text-gray-500 sm:text-xs">{title}</p>
      <h2 className="dashboard-value mt-1 font-bold">{value}</h2>
    </div>
  );
}
