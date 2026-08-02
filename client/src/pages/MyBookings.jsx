import { useQuery } from "@tanstack/react-query";

import { Link } from "react-router-dom";

import { getMyBookings } from "../api/bookingApi";

export default function MyBookings() {
  const {
    data,

    isLoading,

    error,
  } = useQuery({
    queryKey: ["my-bookings"],

    queryFn: getMyBookings,

    staleTime: 1000 * 60 * 5,
  });

  const bookings = Array.isArray(data)
    ? data
    : data?.data?.bookings || data?.bookings || [];

  if (isLoading) {
    return (
      <div
        className="
        min-h-screen
        flex
        items-center
        justify-center
        "
      >
        <div
          className="
          text-center
          "
        >
          <div
            className="
            animate-spin
            h-10
            w-10
            border-4
            border-green-600
            border-t-transparent
            rounded-full
            mx-auto
            mb-4
            "
          />

          <p
            className="
            text-xl
            font-semibold
            "
          >
            Loading your adventures...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="
        p-10
        text-center
        text-red-600
        font-semibold
        "
      >
        Unable to load your bookings.
      </div>
    );
  }

  const upcomingTrips = bookings.filter(
    (booking) =>
      booking.travelDate && new Date(booking.travelDate) >= new Date(),
  );

  const paidTrips = bookings.filter(
    (booking) =>
      booking.paymentStatus === "paid" || booking.paymentStatus === "completed",
  );

  return (
    <div
      className="
      min-h-screen
      bg-gray-100
      p-6
      "
    >
      <div
        className="
        max-w-7xl
        mx-auto
        "
      >
        <div
          className="
          bg-gradient-to-r
          from-green-900
          to-yellow-600
          rounded-3xl
          p-8
          text-white
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
            My Adventures
          </h1>

          <p
            className="
            mt-3
            "
          >
            Manage your Coherent Tours bookings, payments and trips.
          </p>
        </div>

        <div
          className="
          grid
          md:grid-cols-3
          gap-6
          mb-10
          "
        >
          <SummaryCard title="Total Bookings" value={bookings.length} />

          <SummaryCard title="Upcoming Trips" value={upcomingTrips.length} />

          <SummaryCard title="Paid Trips" value={paidTrips.length} />
        </div>

        {bookings.length === 0 ? (
          <div
            className="
              bg-white
              rounded-2xl
              shadow
              p-10
              text-center
              "
          >
            <h2
              className="
                text-3xl
                font-bold
                mb-4
                "
            >
              No Adventures Yet
            </h2>

            <p
              className="
                text-gray-600
                mb-6
                "
            >
              Start exploring Kenya's best destinations.
            </p>

            <Link
              to="/tours"
              className="
                bg-green-700
                text-white
                px-8
                py-3
                rounded-xl
                font-bold
                "
            >
              Explore Tours
            </Link>
          </div>
        ) : (
          <div
            className="
              space-y-6
              "
          >
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="
                    bg-white
                    rounded-2xl
                    shadow
                    p-6
                    "
              >
                <div
                  className="
                      flex
                      justify-between
                      flex-wrap
                      gap-5
                      "
                >
                  <div>
                    <h2
                      className="
                          text-2xl
                          font-bold
                          text-green-800
                          "
                    >
                      {booking.tour?.title || "Tour Package"}
                    </h2>

                    <p className="text-gray-600 mt-2">
                      Booking Number:
                      <b> {booking.bookingNumber || booking._id.slice(-8)}</b>
                    </p>

                    <p className="text-gray-600">
                      Travel Date:{" "}
                      {booking.travelDate
                        ? new Date(booking.travelDate).toDateString()
                        : "N/A"}
                    </p>

                    <p className="text-gray-600">
                      Travellers: {booking.travelers?.length || 1}
                    </p>
                  </div>

                  <div
                    className="
                        flex
                        flex-col
                        gap-3
                        "
                  >
                    <StatusBadge value={booking.bookingStatus || "pending"} />

                    <StatusBadge
                      value={booking.paymentStatus || "pending"}
                      payment
                    />
                  </div>
                </div>

                <hr
                  className="
                      my-6
                      "
                />

                <div
                  className="
                      flex
                      justify-between
                      flex-wrap
                      gap-5
                      "
                >
                  <div>
                    <p className="text-gray-500">Amount</p>

                    <h3 className="text-xl font-bold">
                      KES {Number(booking.amount || 0).toLocaleString()}
                    </h3>
                  </div>

                  <div
                    className="
                        flex
                        gap-3
                        flex-wrap
                        "
                  >
                    <Link
                      to={`/bookings/${booking._id}`}
                      className="
                          bg-green-700
                          text-white
                          px-5
                          py-2
                          rounded-xl
                          "
                    >
                      View Trip
                    </Link>

                    {booking.paymentStatus !== "paid" &&
                      booking.paymentStatus !== "completed" && (
                        <Link
                          to={`/payment-status/${booking._id}`}
                          className="
                              bg-black
                              text-white
                              px-5
                              py-2
                              rounded-xl
                              "
                        >
                          Pay Now
                        </Link>
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  title,

  value,
}) {
  return (
    <div
      className="
      bg-white
      rounded-2xl
      shadow
      p-6
      "
    >
      <p className="text-gray-500">{title}</p>

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

function StatusBadge({
  value,

  payment,
}) {
  const status = value.toLowerCase();

  const styles =
    status === "completed" || status === "paid"
      ? "bg-green-100 text-green-700"
      : status === "cancelled" || status === "failed"
        ? "bg-red-100 text-red-700"
        : "bg-yellow-100 text-yellow-700";

  return (
    <span
      className={`
      px-4
      py-2
      rounded-full
      font-bold
      capitalize
      ${styles}
      `}
    >
      {payment && "Payment: "}

      {value}
    </span>
  );
}
