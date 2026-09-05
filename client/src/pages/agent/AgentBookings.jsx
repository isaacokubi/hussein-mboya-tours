import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBookingStatus } from "../../api/agentBookingApi";
import useAgentBookings from "../../hooks/useAgentBookings";

const BOOKING_STATUSES = [
  "pending",
  "failed",
  "confirmed",
  "assigned",
  "ongoing",
  "completed",
  "cancelled",
];

const formatLabel = (value) =>
  String(value || "—")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
};

export default function AgentBookings() {
  const { data = [], isLoading, isError } = useAgentBookings();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [action, setAction] = useState(null);
  const [editStatus, setEditStatus] = useState("");

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => updateBookingStatus(id, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["agent-bookings"] });
      setSelectedBooking(null);
      setAction(null);
      setEditStatus("");
      navigate(location.pathname, { replace: true });
    },
  });

  const bookings = Array.isArray(data) ? data : [];

  const openBooking = (booking, nextAction) => {
    setSelectedBooking(booking);
    setAction(nextAction);
    setEditStatus(booking.bookingStatus || booking.status || "pending");
  };

  // Dashboard row actions arrive here as /agent/bookings?bookingId=<id>&action=<view|edit|details>.
  // Resolve the ID against the already-fetched database records so the action opens the exact booking.
  useEffect(() => {
    if (!bookings.length) return;

    const params = new URLSearchParams(location.search);
    const bookingId = params.get("bookingId");
    const requestedAction = params.get("action");

    if (!bookingId) return;

    const booking = bookings.find((item) => String(item?._id) === String(bookingId));
    if (!booking) return;

    const nextAction = ["view", "edit", "details"].includes(requestedAction)
      ? requestedAction
      : "view";

    setSelectedBooking(booking);
    setAction(nextAction);
    setEditStatus(booking.bookingStatus || booking.status || "pending");
  }, [bookings, location.search]);

  if (isLoading) {
    return <div className="p-6">Loading bookings...</div>;
  }

  if (isError) {
    return <div className="p-6 text-red-600">Failed to load bookings</div>;
  }

  const closeBooking = () => {
    setSelectedBooking(null);
    setAction(null);
    setEditStatus("");
    statusMutation.reset();
    navigate(location.pathname, { replace: true });
  };

  const saveStatus = () => {
    if (!selectedBooking?._id || !editStatus) return;
    statusMutation.mutate({ id: selectedBooking._id, status: editStatus });
  };

  const customerName = selectedBooking
    ? selectedBooking.customer?.name ||
      [selectedBooking.customer?.firstName, selectedBooking.customer?.lastName].filter(Boolean).join(" ") ||
      selectedBooking.customerSnapshot?.name ||
      "Unknown customer"
    : "";
  const selectedTour = selectedBooking?.tourPackage || selectedBooking?.tour || {};
  const travelers = Array.isArray(selectedBooking?.travelers) ? selectedBooking.travelers : [];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">My Bookings</h1>
        <p className="mt-1 text-sm text-gray-500">View, inspect and manage bookings created by you.</p>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
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
                  const name =
                    booking.customer?.name ||
                    [booking.customer?.firstName, booking.customer?.lastName].filter(Boolean).join(" ") ||
                    booking.customerSnapshot?.name ||
                    "Unknown";
                  const tourTitle = booking.tourPackage?.title || booking.tour?.title || "Tour unavailable";
                  const bookingStatus = booking.bookingStatus || booking.status || "pending";

                  return (
                    <tr key={id} className="border-b align-middle">
                      <td className="p-4">{name}</td>
                      <td className="p-4">{tourTitle}</td>
                      <td className="p-4">
                        KES {Number(booking.totalAmount || booking.amount || 0).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span className="rounded-full bg-green-100 px-3 py-1 text-sm">
                          {formatLabel(bookingStatus)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => openBooking(booking, "view")}
                            className="rounded-lg border border-blue-200 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => openBooking(booking, "edit")}
                            className="rounded-lg border border-green-200 px-3 py-1.5 text-sm font-medium text-green-600 hover:bg-green-50"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => openBooking(booking, "details")}
                            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                          >
                            Details
                          </button>
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

      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h2 className="text-xl font-bold">
                  {action === "edit" ? "Edit Booking" : action === "details" ? "Booking Details" : "View Booking"}
                </h2>
                <p className="text-sm text-gray-500">
                  {selectedBooking.bookingNumber || selectedBooking._id}
                </p>
              </div>
              <button type="button" onClick={closeBooking} className="rounded-lg px-3 py-2 text-gray-500 hover:bg-gray-100" aria-label="Close">
                ✕
              </button>
            </div>

            <div className="grid gap-6 p-5 md:grid-cols-2">
              <section>
                <h3 className="mb-3 font-semibold">Booking Information</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-500">Status:</span> {formatLabel(selectedBooking.status || selectedBooking.bookingStatus)}</p>
                  <p><span className="text-gray-500">Payment:</span> {formatLabel(selectedBooking.paymentStatus)}</p>
                  <p><span className="text-gray-500">Payment Method:</span> {formatLabel(selectedBooking.paymentMethod)}</p>
                  <p><span className="text-gray-500">Travel Date:</span> {formatDate(selectedBooking.travelDate)}</p>
                  <p><span className="text-gray-500">Guests:</span> {selectedBooking.numberOfGuests || travelers.length || 0}</p>
                  <p><span className="text-gray-500">Amount:</span> KES {Number(selectedBooking.totalAmount || selectedBooking.amount || 0).toLocaleString()}</p>
                  <p><span className="text-gray-500">Created:</span> {formatDate(selectedBooking.createdAt)}</p>
                </div>
              </section>

              <section>
                <h3 className="mb-3 font-semibold">Customer & Tour</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-500">Customer:</span> {customerName}</p>
                  <p><span className="text-gray-500">Email:</span> {selectedBooking.customer?.email || selectedBooking.customerSnapshot?.email || "—"}</p>
                  <p><span className="text-gray-500">Phone:</span> {selectedBooking.customer?.phone || selectedBooking.customerSnapshot?.phone || "—"}</p>
                  <p><span className="text-gray-500">Tour:</span> {selectedTour.title || "Tour unavailable"}</p>
                  <p><span className="text-gray-500">Pickup:</span> {selectedBooking.pickupLocation || "—"}</p>
                  <p><span className="text-gray-500">Hotel:</span> {selectedBooking.hotelName || "—"}</p>
                </div>
              </section>
            </div>

            {action === "details" && (
              <section className="border-t p-5">
                <h3 className="mb-3 font-semibold">Traveler Details</h3>
                {travelers.length === 0 ? (
                  <p className="text-sm text-gray-500">No traveler details recorded.</p>
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

            {action === "edit" && (
              <section className="border-t p-5">
                <h3 className="mb-3 font-semibold">Update Booking Status</h3>
                <div className="flex flex-wrap items-end gap-3">
                  <label className="min-w-64 flex-1">
                    <span className="mb-1 block text-sm font-medium">Status</span>
                    <select
                      value={editStatus}
                      onChange={(event) => setEditStatus(event.target.value)}
                      disabled={statusMutation.isPending}
                      className="w-full rounded-lg border px-3 py-2"
                    >
                      {BOOKING_STATUSES.map((status) => (
                        <option key={status} value={status}>{formatLabel(status)}</option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="button"
                    onClick={saveStatus}
                    disabled={statusMutation.isPending || editStatus === (selectedBooking.status || selectedBooking.bookingStatus)}
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
              </section>
            )}

            <div className="flex justify-end gap-2 border-t p-5">
              <button type="button" onClick={closeBooking} className="rounded-lg border px-4 py-2 hover:bg-gray-50">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
