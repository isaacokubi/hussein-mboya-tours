import { useQuery } from "@tanstack/react-query";

import { getBookings } from "../../../api/bookingApi";

export default function BookingTable() {
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["recentBookings"],

    queryFn: () =>
      getBookings({
        page: 1,
        limit: 10,
      }),
  });

  /*
  |--------------------------------------------------------------------------
  | HANDLE API RESPONSE
  |--------------------------------------------------------------------------
  */

  const bookings =
    data?.bookings ||
    data?.data ||
    [];

  /*
  |--------------------------------------------------------------------------
  | STATUS COLORS
  |--------------------------------------------------------------------------
  */

  const statusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-700";

      case "confirmed":
        return "bg-blue-100 text-blue-700";

      case "pending":
        return "bg-yellow-100 text-yellow-700";

      case "cancelled":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        Loading recent bookings...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-xl shadow p-6 text-red-600">
        {error?.message || "Failed to load bookings."}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-6 overflow-x-auto">
      <h2 className="text-xl font-bold mb-6">
        Recent Bookings
      </h2>

      <table className="w-full">
        <thead>
          <tr className="border-b text-left text-gray-500">
            <th className="py-3">Booking</th>

            <th>Customer</th>

            <th>Tour</th>

            <th>Date</th>

            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {bookings.length > 0 ? (
            bookings.map((booking) => (
              <tr
                key={booking._id}
                className="border-b hover:bg-gray-50"
              >
                <td className="py-4">
                  {booking.bookingNumber ||
                    booking._id.slice(-6).toUpperCase()}
                </td>

                <td>
                  {booking.user?.name ||
                    booking.customer?.name ||
                    "Unknown"}
                </td>

                <td>
                  {booking.tour?.title ||
                    booking.tour?.name ||
                    "Tour"}
                </td>

                <td>
                  {booking.createdAt
                    ? new Date(
                        booking.createdAt
                      ).toLocaleDateString()
                    : "-"}
                </td>

                <td>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${statusClass(
                      booking.status
                    )}`}
                  >
                    {
    typeof booking.status === "object"
    ?
    (
        booking.status.status ||
        booking.status.bookingStatus ||
        "pending"
    )
    :
    booking.status ||
    "pending"
}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="5"
                className="py-8 text-center text-gray-500"
              >
                No bookings found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}