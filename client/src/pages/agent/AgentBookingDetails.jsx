import { useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAgentBooking,
  updateBookingStatus,
} from "../../api/agentBookingApi";

const BOOKING_STATUSES = [
  "pending",
  "failed",
  "confirmed",
  "assigned",
  "ongoing",
  "completed",
  "cancelled",
];

const unwrapBooking = (response) =>
  response?.booking || response?.data?.booking || response?.data || null;

const formatLabel = (value) =>
  String(value || "—")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
};

export default function AgentBookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const mode = searchParams.get("mode") === "edit" ? "edit" : "details";

  const [status, setStatus] = useState("");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["agent-booking", id],
    queryFn: () => getAgentBooking(id),
    enabled: Boolean(id),
  });

  const booking = useMemo(() => unwrapBooking(data), [data]);
  const currentStatus = booking?.status || booking?.bookingStatus || "pending";

  const statusMutation = useMutation({
    mutationFn: (nextStatus) => updateBookingStatus(id, nextStatus),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["agent-booking", id] });
      await queryClient.invalidateQueries({ queryKey: ["agent-bookings"] });
      setStatus("");
    },
  });

  if (isLoading) {
    return <div className="p-6">Loading booking details...</div>;
  }

  if (isError || !booking) {
    return (
      <div className="p-6 space-y-4">
        <Link to="/agent/bookings" className="text-blue-600 hover:underline">
          ← Back to bookings
        </Link>
        <div className="rounded-xl bg-red-50 p-4 text-red-700">
          {error?.response?.data?.message || "Booking could not be loaded."}
        </div>
      </div>
    );
  }

  const customer = booking.customer || {};
  const customerName =
    customer.name ||
    [customer.firstName, customer.lastName].filter(Boolean).join(" ") ||
    booking.customerSnapshot?.name ||
    "Unknown customer";
  const tour = booking.tourPackage || booking.tour || {};
  const tourTitle = tour.title || "Tour unavailable";
  const travelers = Array.isArray(booking.travelers) ? booking.travelers : [];
  const displayStatus = status || currentStatus;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <button
            type="button"
            onClick={() => navigate("/agent/bookings")}
            className="text-sm text-blue-600 hover:underline"
          >
            ← Back to bookings
          </button>
          <h1 className="mt-2 text-2xl font-bold">Booking Details</h1>
          <p className="text-sm text-gray-500">
            {booking.bookingNumber || booking._id}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to={`/agent/bookings/${id}?mode=details`}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
          >
            Details
          </Link>
          <Link
            to={`/agent/bookings/${id}?mode=edit`}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            Edit
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl bg-white p-5 shadow">
          <h2 className="mb-4 text-lg font-semibold">Booking Information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><p className="text-xs text-gray-500">Booking Number</p><p className="font-medium">{booking.bookingNumber || booking._id}</p></div>
            <div><p className="text-xs text-gray-500">Status</p><p className="font-medium">{formatLabel(currentStatus)}</p></div>
            <div><p className="text-xs text-gray-500">Payment Status</p><p className="font-medium">{formatLabel(booking.paymentStatus)}</p></div>
            <div><p className="text-xs text-gray-500">Payment Method</p><p className="font-medium">{formatLabel(booking.paymentMethod)}</p></div>
            <div><p className="text-xs text-gray-500">Travel Date</p><p className="font-medium">{formatDate(booking.travelDate)}</p></div>
            <div><p className="text-xs text-gray-500">Created</p><p className="font-medium">{formatDate(booking.createdAt)}</p></div>
            <div><p className="text-xs text-gray-500">Total Amount</p><p className="font-medium">KES {Number(booking.totalAmount || booking.amount || 0).toLocaleString()}</p></div>
            <div><p className="text-xs text-gray-500">Guests</p><p className="font-medium">{booking.numberOfGuests || travelers.length || 0}</p></div>
          </div>
        </section>

        <section className="rounded-xl bg-white p-5 shadow">
          <h2 className="mb-4 text-lg font-semibold">Customer & Tour</h2>
          <div className="space-y-4">
            <div><p className="text-xs text-gray-500">Customer</p><p className="font-medium">{customerName}</p></div>
            <div><p className="text-xs text-gray-500">Email</p><p className="font-medium">{customer.email || booking.customerSnapshot?.email || "—"}</p></div>
            <div><p className="text-xs text-gray-500">Phone</p><p className="font-medium">{customer.phone || booking.customerSnapshot?.phone || "—"}</p></div>
            <div><p className="text-xs text-gray-500">Tour</p><p className="font-medium">{tourTitle}</p></div>
            <div><p className="text-xs text-gray-500">Pickup</p><p className="font-medium">{booking.pickupLocation || "—"}</p></div>
            <div><p className="text-xs text-gray-500">Special Requests</p><p className="font-medium">{Array.isArray(booking.specialRequests) && booking.specialRequests.length ? booking.specialRequests.join(", ") : "—"}</p></div>
          </div>
        </section>
      </div>

      {mode === "edit" && (
        <section className="rounded-xl bg-white p-5 shadow">
          <h2 className="mb-4 text-lg font-semibold">Edit Booking Status</h2>
          <div className="flex flex-wrap items-end gap-3">
            <label className="min-w-64">
              <span className="mb-1 block text-sm font-medium">Booking status</span>
              <select
                value={displayStatus}
                onChange={(event) => setStatus(event.target.value)}
                disabled={statusMutation.isPending}
                className="w-full rounded-lg border px-3 py-2"
              >
                {BOOKING_STATUSES.map((item) => (
                  <option key={item} value={item}>{formatLabel(item)}</option>
                ))}
              </select>
            </label>
            <button
              type="button"
              disabled={statusMutation.isPending || displayStatus === currentStatus}
              onClick={() => statusMutation.mutate(displayStatus)}
              className="rounded-lg bg-green-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {statusMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
          {statusMutation.isError && (
            <p className="mt-3 text-sm text-red-600">
              {statusMutation.error?.response?.data?.message || "Failed to update booking."}
            </p>
          )}
          {statusMutation.isSuccess && (
            <p className="mt-3 text-sm text-green-600">Booking status updated successfully.</p>
          )}
        </section>
      )}

      {mode === "details" && (
        <section className="rounded-xl bg-white p-5 shadow">
          <h2 className="mb-4 text-lg font-semibold">Traveler Details</h2>
          {travelers.length === 0 ? (
            <p className="text-gray-500">No traveler details recorded.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left">#</th>
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Type</th>
                    <th className="p-3 text-left">Age</th>
                  </tr>
                </thead>
                <tbody>
                  {travelers.map((traveler, index) => (
                    <tr key={`${traveler._id || traveler.id || index}`} className="border-b">
                      <td className="p-3">{index + 1}</td>
                      <td className="p-3">{traveler.name || [traveler.firstName, traveler.lastName].filter(Boolean).join(" ") || "—"}</td>
                      <td className="p-3">{formatLabel(traveler.type || traveler.category)}</td>
                      <td className="p-3">{traveler.age || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
