import { Link } from "react-router-dom";
import useAgentBookings from "../../hooks/useAgentBookings";

export default function AgentBookings() {
  const { data = [], isLoading, isError } = useAgentBookings();

  if (isLoading) {
    return <div className="p-6">Loading bookings...</div>;
  }

  if (isError) {
    return <div className="p-6 text-red-600">Failed to load bookings</div>;
  }

  const bookings = Array.isArray(data) ? data : [];

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">My Bookings</h1>
          <p className="mt-1 text-sm text-gray-500">View and manage bookings created by you.</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-gray-100">
              <tr className="border-b">
                <th className="p-4 text-left">Customer</th>
                <th className="p-4 text-left">Tour</th>
                <th className="p-4 text-left">Amount</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-gray-500">
                    No bookings found
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => {
                  const id = booking._id;
                  const customerName =
                    booking.customer?.name ||
                    [booking.customer?.firstName, booking.customer?.lastName].filter(Boolean).join(" ") ||
                    booking.customerSnapshot?.name ||
                    "Unknown";
                  const tourTitle =
                    booking.tourPackage?.title ||
                    booking.tour?.title ||
                    "Tour unavailable";
                  const bookingStatus = booking.bookingStatus || booking.status || "pending";

                  return (
                    <tr key={id} className="border-b align-middle">
                      <td className="p-4">{customerName}</td>
                      <td className="p-4">{tourTitle}</td>
                      <td className="p-4">
                        KES {Number(booking.totalAmount || booking.amount || 0).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span className="rounded-full bg-green-100 px-3 py-1 text-sm">
                          {bookingStatus}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            to={`/agent/bookings/${id}`}
                            className="rounded-lg border border-blue-200 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50"
                          >
                            View
                          </Link>
                          <Link
                            to={`/agent/bookings/${id}?mode=edit`}
                            className="rounded-lg border border-green-200 px-3 py-1.5 text-sm font-medium text-green-600 hover:bg-green-50"
                          >
                            Edit
                          </Link>
                          <Link
                            to={`/agent/bookings/${id}?mode=details`}
                            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                          >
                            Details
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
