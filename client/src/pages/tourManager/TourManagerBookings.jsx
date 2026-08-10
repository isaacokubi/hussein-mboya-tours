import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getBookings, completeBooking } from "../../api/tourManagerApi";

export default function TourManagerBookings() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["tour-manager-bookings"],
    queryFn: () => getBookings(),
  });
  const bookings = Array.isArray(data) ? data : data?.bookings || data?.data || [];

  const completeMutation = useMutation({
    mutationFn: completeBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tour-manager-bookings"],
      });
    },
  });

  if (isLoading) return <div className="p-6">Loading bookings...</div>;
  if (isError) return <div className="p-6 text-red-600">Failed to load bookings.</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Tour Manager Bookings</h1>
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100"><tr>
            <th className="p-3 text-left">Booking</th><th className="p-3 text-left">Customer</th>
            <th className="p-3 text-left">Tour</th><th className="p-3 text-left">Status</th>
          </tr></thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking._id} className="border-t">
                <td className="p-3">{booking.bookingNumber || booking._id}</td>
                <td className="p-3">{booking.customer?.name || booking.user?.name || booking.fullName || "-"}</td>
                <td className="p-3">{booking.tour?.title || "-"}</td>
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <span className="capitalize">{booking.status || "-"}</span>
                    {booking.status !== "completed" &&
                      booking.status !== "cancelled" &&
                      booking.status !== "refunded" &&
                      booking.paymentStatus === "paid" && (
                        <button
                          type="button"
                          onClick={() => completeMutation.mutate(booking._id)}
                          disabled={completeMutation.isPending}
                          className="rounded bg-green-600 px-3 py-1 text-sm text-white disabled:opacity-50"
                        >
                          Mark Completed
                        </button>
                      )}
                  </div>
                </td>
              </tr>
            ))}
            {!bookings.length && <tr><td colSpan="4" className="p-6 text-center text-gray-500">No bookings found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
