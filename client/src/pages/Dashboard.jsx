import { useSettings } from "../context/SettingsContext";
import { useQuery } from "@tanstack/react-query";

import { Link, Navigate } from "react-router-dom";

import { getMyBookings } from "../api/bookingApi";

import { useAuth } from "../context/AuthContext";
import MobileDashboardNav from "../components/common/MobileDashboardNav";
import AssignmentNotifications from "../components/notifications/AssignmentNotifications";

export default function Dashboard(
) {
  const { user } = useAuth();
  const { settings } = useSettings();

  const role = (user?.role?.name || user?.roleId?.name || user?.role || user?.legacyRole || "customer")
    .toString()
    .toLowerCase()
    .replace(/[\s_-]/g, "");

  

const { data, isLoading, error } = useQuery({
    queryKey: ["my-bookings", user?._id],

    queryFn: () => getMyBookings(),

    enabled: !!user,
  });
/*
  |--------------------------------------------------------------------------
  | ROLE REDIRECTS
  |--------------------------------------------------------------------------
  */

  if (role === "guide" || role === "tourguide") {
    return <Navigate to="/guide/dashboard" replace />;
  }

  if (role === "manager" || role === "tourmanager") {
    return <Navigate to="/tour-manager/dashboard" replace />;
  }

  if (role === "agent") {
    return <Navigate to="/agent" replace />;
  }

  if (role === "driver") {
    return <Navigate to="/driver/dashboard" replace />;
  }

  if (role === "superadmin") {
    return <Navigate to="/superadmin/dashboard" replace />;
  }

  if (role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  /*
  |--------------------------------------------------------------------------
  | CUSTOMER BOOKINGS
  |--------------------------------------------------------------------------
  */
if (isLoading) {
    return (
      <div
        className="customer-ops"
      >
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    console.error("BOOKINGS ERROR:", error);

    return (
      <div
        className="customer-ops"
      >
        Unable to load dashboard.
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | NORMALIZE API RESPONSE
  |--------------------------------------------------------------------------
  */

  const bookings = (() => {
    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.bookings)) {
      return data.bookings;
    }

    if (Array.isArray(data?.data)) {
      return data.data;
    }

    if (Array.isArray(data?.data?.bookings)) {
      return data.data.bookings;
    }

    if (Array.isArray(data?.results)) {
      return data.results;
    }

    console.warn("Unexpected bookings response:", data);

    return [];
  })();

  

  const today = new Date();

  const upcomingTrips = bookings.filter((booking) => {
    if (!booking.travelDate) return false;

    const date = new Date(booking.travelDate);

    return (
      date >= today &&
      (booking.bookingStatus || booking.status || "").toLowerCase() !== "cancelled"
    );
  });

  const completedTrips = bookings.filter(
    (booking) =>
      (booking.bookingStatus || booking.status || "").toLowerCase() === "completed",
  );

  const cancelledTrips = bookings.filter(
    (booking) =>
      (booking.bookingStatus || booking.status || "").toLowerCase() === "cancelled",
  );

  const totalSpent = bookings.reduce((total, booking) => {
    const bookingStatus = String(
      booking.status || booking.bookingStatus || ""
    ).toLowerCase();

    const paymentStatus = String(
      typeof booking.paymentStatus === "object"
        ? booking.paymentStatus?.paymentStatus ||
          booking.paymentStatus?.status ||
          "pending"
        : booking.paymentStatus || "pending"
    ).toLowerCase();

    if (
      !(
        [
          "confirmed",
          "completed",
          "assigned",
          "ongoing"
        ].includes(bookingStatus)
        &&
        [
          "paid",
          "completed",
          "success"
        ].includes(paymentStatus)
      )
    ) {
      return total;
    }

    const paidAmount =
      Number(booking.depositAmount || 0) ||
      Number(booking.totalAmount || booking.amount || 0);

    return total + Math.max(
      0,
      paidAmount - Number(booking.refundAmount || 0)
    );
  }, 0);

  const nextTrip = upcomingTrips[0];

  return (
    <>
      <MobileDashboardNav role="customer" title="Customer Dashboard" />
      <div
      className="
    min-h-screen
    bg-gray-100
    p-6
    "
    >
      <div
        className="
      bg-gradient-to-r
      from-yellow-600
      via-green-700
      to-green-900
      rounded-3xl
      text-white
      p-8
      shadow-xl
      mb-8
      "
      >
        <h1
          className="
        text-4xl
        font-bold
        "
        >
          Welcome back, {user?.name || "Traveller"}
        </h1>

        <p
          className="
        mt-3
        text-lg
        "
        >
          Manage your adventures with {settings?.companyName || "Company"}.
        </p>

        <div
          className="
        flex
        gap-4
        mt-6
        flex-wrap
        "
        >
          <Link
            to="/tours"
            className="
          bg-white
          text-green-700
          px-6
          py-3
          rounded-xl
          font-bold
          "
          >
            Explore Tours
          </Link>

          <Link
            to="/my-bookings"
            className="
          bg-black/40
          px-6
          py-3
          rounded-xl
          font-bold
          "
          >
            My Bookings
          </Link>

          <Link
            to="/custom-tour"
            className="
          bg-emerald-600
          text-white
          px-6
          py-3
          rounded-xl
          font-bold
          "
          >
            Create Custom Tour
          </Link>
        </div>
      </div>

      <div className="mb-6 mt-6 md:mt-0"><AssignmentNotifications /></div>

      <div
        className="
      grid
      md:grid-cols-4
      gap-6
      "
      >
        <Card title="Total Trips" value={bookings.length} />

        <Card title="Upcoming Adventures" value={upcomingTrips.length} />

        <Card title="Completed Trips" value={completedTrips.length} />

        <Card title="Cancelled Trips" value={cancelledTrips.length} />
      </div>

      <div
        className="
      bg-white
      rounded-2xl
      shadow
      p-6
      mt-6
      "
      >
        <p
          className="
        text-gray-500
        "
        >
          Total Spent
        </p>

        <h2
          className="
        text-3xl
        font-bold
        "
        >
          KES {totalSpent.toLocaleString()}
        </h2>
      </div>

      {nextTrip && (
        <div
          className="
        bg-white
        rounded-2xl
        shadow
        p-8
        mt-8
        "
        >
          <h2
            className="
          text-3xl
          font-bold
          mb-5
          "
          >
            Next Adventure
          </h2>

          <div
            className="
          bg-green-50
          rounded-xl
          p-6
          "
          >
            <h3
              className="
            text-2xl
            font-bold
            "
            >
              {nextTrip.tour?.title || "Tour Package"}
            </h3>

            <p>Travel Date: {new Date(nextTrip.travelDate).toDateString()}</p>
          </div>
        </div>
      )}

      <div
        className="
      bg-white
      rounded-2xl
      shadow
      p-8
      mt-10
      "
      >
        <div
          className="
        flex
        justify-between
        mb-6
        "
        >
          <h2
            className="
          text-3xl
          font-bold
          "
          >
            Recent Bookings
          </h2>

          <Link
            to="/my-bookings"
            className="
          text-green-700
          font-bold
          "
          >
            View All
          </Link>
        </div>

        {bookings.length === 0 ? (
          <p
            className="
          text-center
          p-10
          "
          >
            No bookings available.
          </p>
        ) : (
          <div
            className="
          space-y-5
          "
          >
            {bookings.slice(0, 5).map((booking) => (
              <div
                key={booking._id}
                className="
              border
              rounded-xl
              p-5
              flex
              justify-between
              "
              >
                <div>
                  <h3
                    className="
                  font-bold
                  text-xl
                  "
                  >
                    {booking.tour?.title || "Tour"}
                  </h3>

                  <p>Status: {booking.bookingStatus || "pending"}</p>
                </div>

                <Link
                  to={`/bookings/${booking._id}`}
                  className="
                bg-green-700
                text-white
                px-5
                py-2
                rounded-lg
                "
                >
                  View
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
}

function Card({ title, value }) {
  return (
    <div
      className="
bg-white
rounded-2xl
shadow
p-6
"
    >
      <p
        className="
text-gray-500
"
      >
        {title}
      </p>

      <h2
        className="
text-4xl
font-bold
mt-2
"
      >
        {value}
      </h2>
    </div>
  );
}
