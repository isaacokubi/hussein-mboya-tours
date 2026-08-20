import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useDebouncedValue from "../../hooks/useDebouncedValue";
import { requestRefund } from "../../api/financeApi";
import { exportBookingsCSV } from "../../utils/exportBookings";
import { getStaff } from "../../api/staffApi";
import { getVehicles } from "../../api/vehicleApi";
import {
  getBookings,
  updateBookingStatus,
  updateBookingPayment,
  assignBookingResources,
  sendBookingNotification,
} from "../../api/adminBookingApi";

const paymentStatusOf = (booking) =>
  String(
    booking?.effectivePaymentStatus ||
      (typeof booking?.paymentStatus === "string"
        ? booking.paymentStatus
        : booking?.paymentStatus?.status) ||
      "pending"
  ).toLowerCase();

const customerOf = (booking) => {
  const customer = booking?.customer;
  const snapshot = booking?.customerSnapshot;
  const contact = booking?.contact;
  const user = booking?.user;

  const firstName = user?.firstName || customer?.firstName || "";
  const lastName = user?.lastName || customer?.lastName || "";
  const composed = `${firstName} ${lastName}`.trim();

  return (
    booking?.customerDisplayName ||
    customer?.name ||
    snapshot?.name ||
    contact?.name ||
    user?.name ||
    composed ||
    "Customer"
  );
};

const tourOf = (booking) =>
  booking?.tour?.title || booking?.tour?.name || "Custom Tour Package";

export default function BookingManagement() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const debouncedSearch = useDebouncedValue(search, 350);

  const { data: staffResponse } = useQuery({
    queryKey: ["staff"],
    queryFn: getStaff,
    staleTime: 30_000,
  });

  const { data: vehicleResponse } = useQuery({
    queryKey: ["vehicles"],
    queryFn: getVehicles,
    staleTime: 30_000,
  });

  const staff = Array.isArray(staffResponse)
    ? staffResponse
    : Array.isArray(staffResponse?.data)
      ? staffResponse.data
      : Array.isArray(staffResponse?.data?.data)
        ? staffResponse.data.data
        : [];

  const guides = staff.filter(
    (member) =>
      String(member.position || member.role || "").toLowerCase() === "guide" ||
      member.isGuide === true
  );

  const drivers = staff.filter(
    (member) =>
      String(member.position || member.role || "").toLowerCase() === "driver"
  );

  const vehicles = Array.isArray(vehicleResponse)
    ? vehicleResponse
    : Array.isArray(vehicleResponse?.data)
      ? vehicleResponse.data
      : Array.isArray(vehicleResponse?.data?.data)
        ? vehicleResponse.data.data
        : Array.isArray(vehicleResponse?.vehicles)
          ? vehicleResponse.vehicles
          : [];

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: [
      "admin-bookings",
      debouncedSearch,
      statusFilter,
      paymentFilter,
    ],
    queryFn: () =>
      getBookings({
        search: debouncedSearch.trim(),
        status: statusFilter === "all" ? undefined : statusFilter,
        paymentStatus:
          paymentFilter === "all" ? undefined : paymentFilter,
        page: 1,
        limit: 100,
      }),
    placeholderData: (previous) => previous,
    staleTime: 15_000,
  });

  const bookings = Array.isArray(data)
    ? data
    : Array.isArray(data?.bookings)
      ? data.bookings
      : Array.isArray(data?.data?.bookings)
        ? data.data.bookings
        : Array.isArray(data?.data)
          ? data.data
          : [];

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => updateBookingStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
    },
  });

  const paymentMutation = useMutation({
    mutationFn: ({ id, status }) => updateBookingPayment(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
    },
  });

  const assignMutation = useMutation({
    mutationFn: ({ id, payload }) => assignBookingResources(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
    },
  });

  const refundMutation = useMutation({
    mutationFn: ({ id, payload }) => requestRefund(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
    },
  });

  const notificationMutation = useMutation({
    mutationFn: ({ id, payload }) => sendBookingNotification(id, payload),
  });

  const filteredBookings = useMemo(() => {
    const term = search.trim().toLowerCase();

    return bookings.filter((booking) => {
      const customer = customerOf(booking).toLowerCase();
      const email = String(
        booking?.customer?.email ||
          booking?.customerSnapshot?.email ||
          booking?.contact?.email ||
          booking?.user?.email ||
          ""
      ).toLowerCase();
      const phone = String(
        booking?.customer?.phone ||
          booking?.customerSnapshot?.phone ||
          booking?.contact?.phone ||
          booking?.user?.phone ||
          ""
      ).toLowerCase();
      const id = String(booking?._id || "").toLowerCase();
      const number = String(booking?.bookingNumber || "").toLowerCase();
      const tour = tourOf(booking).toLowerCase();
      const payment = paymentStatusOf(booking);

      return (
        (!term ||
          id.includes(term) ||
          number.includes(term) ||
          customer.includes(term) ||
          email.includes(term) ||
          phone.includes(term) ||
          tour.includes(term)) &&
        (statusFilter === "all" || booking?.status === statusFilter) &&
        (paymentFilter === "all" || payment === paymentFilter)
      );
    });
  }, [bookings, search, statusFilter, paymentFilter]);

  if (isLoading) {
    return <div className="p-6">Loading bookings...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">Failed loading bookings.</div>;
  }

  const total = bookings.length;
  const cancelled = bookings.filter((b) => b.status === "cancelled").length;
  const paidBookings = bookings.filter((b) => paymentStatusOf(b) === "paid");
  const paid = paidBookings.length;
  const revenue = paidBookings.reduce(
    (sum, booking) =>
      sum +
      Math.max(
        0,
        Number(
          booking.paidAmount ||
            booking.depositAmount ||
            booking.totalAmount ||
            booking.amount ||
            0
        )
      ),
    0
  );
  const pendingPayments = bookings.filter(
    (b) => paymentStatusOf(b) === "pending"
  ).length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const departuresOn = (date) =>
    bookings.filter((booking) => {
      const travelDate = new Date(booking.travelDate);
      travelDate.setHours(0, 0, 0, 0);
      return travelDate.getTime() === date.getTime();
    }).length;

  const upcoming = bookings.filter((booking) => {
    const travelDate = new Date(booking.travelDate);
    return (
      !Number.isNaN(travelDate.getTime()) &&
      travelDate >= new Date() &&
      !["cancelled", "refunded", "completed"].includes(
        String(booking.status || "").toLowerCase()
      )
    );
  }).length;

  const unassignedPaid = paidBookings.filter(
    (booking) => !booking.assignedGuide && !booking.assignedVehicle
  ).length;

  const vehicleCounts = {};
  bookings.forEach((booking) => {
    const id = booking.assignedVehicle?._id;
    if (id) vehicleCounts[id] = (vehicleCounts[id] || 0) + 1;
  });

  const vehicleConflicts = Object.values(vehicleCounts).filter(
    (count) => count > 1
  ).length;

  const guideCounts = {};
  bookings.forEach((booking) => {
    const guide =
      booking.assignedGuide?.name ||
      booking.assignedGuide?.firstName ||
      booking.guide?.name;
    if (guide) guideCounts[guide] = (guideCounts[guide] || 0) + 1;
  });

  const tourCounts = {};
  bookings.forEach((booking) => {
    const name = tourOf(booking);
    tourCounts[name] = (tourCounts[name] || 0) + 1;
  });
  const mostBooked =
    Object.entries(tourCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    "None";

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">
            Administration
          </p>
          <h1 className="text-3xl font-bold text-slate-900">
            Booking Management
          </h1>
        </div>
        <button
          type="button"
          onClick={() => exportBookingsCSV(bookings)}
          className="rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white"
        >
          Export CSV
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-7">
        {[
          ["Total Bookings", total],
          ["Pending Payments", pendingPayments],
          ["Paid", paid],
          ["Cancelled", cancelled],
          ["Revenue", `KES ${revenue.toLocaleString()}`],
          ["Upcoming Departures", upcoming],
          ["Most Booked", mostBooked],
        ].map(([title, value]) => (
          <div key={title} className="min-w-0 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="whitespace-nowrap text-sm text-slate-500">{title}</p>
            <p className="mt-2 break-words text-2xl font-bold text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <input
          type="search"
          autoComplete="off"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search customer, email, phone, tour or booking ID..."
          className="min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        />
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2"
        >
          <option value="all">All Status</option>
          {[
            "pending",
            "confirmed",
            "assigned",
            "ongoing",
            "completed",
            "cancelled",
            "refunded",
          ].map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
        <select
          value={paymentFilter}
          onChange={(event) => setPaymentFilter(event.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2"
        >
          <option value="all">All Payments</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="partial">Partial</option>
          <option value="cancelled">Cancelled</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {isFetching && (
        <p className="text-sm text-slate-500" aria-live="polite">
          Updating results…
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          ["Today's Departures", departuresOn(today)],
          ["Tomorrow", departuresOn(tomorrow)],
          ["Unassigned Paid", unassignedPaid],
          ["Vehicle Conflicts", vehicleConflicts],
          ["Guide Load", Object.keys(guideCounts).length],
        ].map(([title, value]) => (
          <div key={title} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <p className="whitespace-nowrap text-sm text-slate-500">{title}</p>
            <p className="mt-1 text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="min-w-[1500px] w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              {[
                "Booking",
                "Customer",
                "Tour",
                "Amount",
                "Payment",
                "Status",
                "Guide",
                "Driver",
                "Vehicle",
                "Workflow",
                "Actions",
              ].map((heading) => (
                <th key={heading} className="whitespace-nowrap p-3 text-left font-semibold">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((booking) => (
              <tr key={booking._id} className="border-t align-top hover:bg-slate-50">
                <td className="whitespace-nowrap p-3 font-mono">#{String(booking._id || "").slice(-6)}</td>
                <td className="whitespace-nowrap p-3 font-medium">{customerOf(booking)}</td>
                <td className="whitespace-nowrap p-3">{tourOf(booking)}</td>
                <td className="whitespace-nowrap p-3">KES {Number(booking.totalAmount || booking.amount || 0).toLocaleString()}</td>
                <td className="whitespace-nowrap p-3 capitalize font-medium">{paymentStatusOf(booking)}</td>
                <td className="whitespace-nowrap p-3 capitalize">{booking.status || "pending"}</td>
                <td className="whitespace-nowrap p-3">{booking.assignedGuide?.name || booking.assignedGuide?.firstName || "Not assigned"}</td>
                <td className="whitespace-nowrap p-3">{booking.assignedDriver?.name || "Not assigned"}</td>
                <td className="whitespace-nowrap p-3">{booking.assignedVehicle?.registrationNumber || booking.assignedVehicle?.plateNumber || "Not assigned"}</td>
                <td className="whitespace-nowrap p-3">
                  <select
                    defaultValue=""
                    onChange={(event) => {
                      const action = event.target.value;
                      if (!action) return;
                      if (["confirmed", "assigned", "ongoing", "completed", "cancelled"].includes(action)) {
                        statusMutation.mutate({ id: booking._id, status: action });
                      }
                      if (action === "refund") {
                        refundMutation.mutate({ id: booking._id, payload: { reason: "Admin refund request" } });
                      }
                      if (action === "sms") {
                        notificationMutation.mutate({ id: booking._id, payload: { type: "confirmation", channel: "sms" } });
                      }
                      if (action === "payment-reminder") {
                        notificationMutation.mutate({ id: booking._id, payload: { type: "payment_reminder", channel: "whatsapp" } });
                      }
                      if (action === "trip-reminder") {
                        notificationMutation.mutate({ id: booking._id, payload: { type: "trip_reminder", channel: "email" } });
                      }
                      event.target.value = "";
                    }}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 font-medium"
                  >
                    <option value="">Choose action...</option>
                    <option value="confirmed">Confirm booking</option>
                    <option value="assigned">Mark assigned</option>
                    <option value="ongoing">Start / ongoing</option>
                    <option value="completed">Mark completed</option>
                    <option value="cancelled">Cancel booking</option>
                    <option value="refund">Request refund</option>
                    <option value="sms">Send confirmation SMS</option>
                    <option value="payment-reminder">Payment reminder</option>
                    <option value="trip-reminder">Trip reminder</option>
                  </select>
                </td>
                <td className="whitespace-nowrap p-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedBooking(booking)}
                      className="rounded-lg bg-slate-900 px-3 py-2 font-semibold text-white"
                    >
                      View
                    </button>
                    <select
                      value={booking.status || "pending"}
                      onChange={(event) => statusMutation.mutate({ id: booking._id, status: event.target.value })}
                      className="rounded-lg border px-2 py-2"
                    >
                      {[
                        "pending",
                        "confirmed",
                        "assigned",
                        "ongoing",
                        "completed",
                        "cancelled",
                        "refunded",
                      ].map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                    <select
                      value={booking.assignedGuide?._id || ""}
                      onChange={(event) => {
                        if (!event.target.value) return;
                        assignMutation.mutate({
                          id: booking._id,
                          payload: {
                            guide: event.target.value,
                            driver: booking.assignedDriver?._id || null,
                            vehicle: booking.assignedVehicle?._id || null,
                          },
                        });
                      }}
                      className="rounded-lg border px-2 py-2"
                    >
                      <option value="">Guide</option>
                      {guides.map((guide) => (
                        <option key={guide._id} value={guide._id}>{guide.name || `${guide.firstName || ""} ${guide.lastName || ""}`.trim() || guide.email}</option>
                      ))}
                    </select>
                    <select
                      value={booking.assignedDriver?._id || ""}
                      onChange={(event) => {
                        if (!event.target.value) return;
                        assignMutation.mutate({
                          id: booking._id,
                          payload: {
                            guide: booking.assignedGuide?._id || null,
                            driver: event.target.value,
                            vehicle: booking.assignedVehicle?._id || null,
                          },
                        });
                      }}
                      className="rounded-lg border px-2 py-2"
                    >
                      <option value="">Driver</option>
                      {drivers.map((driver) => (
                        <option key={driver._id} value={driver._id}>{driver.name || driver.email}</option>
                      ))}
                    </select>
                    <select
                      value={booking.assignedVehicle?._id || ""}
                      onChange={(event) => {
                        if (!event.target.value) return;
                        assignMutation.mutate({
                          id: booking._id,
                          payload: {
                            guide: booking.assignedGuide?._id || null,
                            driver: booking.assignedDriver?._id || null,
                            vehicle: event.target.value,
                          },
                        });
                      }}
                      className="rounded-lg border px-2 py-2"
                    >
                      <option value="">Vehicle</option>
                      {vehicles.map((vehicle) => (
                        <option key={vehicle._id} value={vehicle._id}>{vehicle.name || vehicle.registrationNumber || vehicle.plateNumber || "Vehicle"}</option>
                      ))}
                    </select>
                    <select
                      value={paymentStatusOf(booking)}
                      onChange={(event) => paymentMutation.mutate({ id: booking._id, status: event.target.value })}
                      className="rounded-lg border px-2 py-2"
                    >
                      {["pending", "partial", "paid", "failed", "cancelled", "refunded"].map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </td>
              </tr>
            ))}
            {!filteredBookings.length && (
              <tr>
                <td colSpan="11" className="p-10 text-center text-slate-500">No bookings match your filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedBooking && (
        <div className="fixed inset-0 z-[100] flex justify-end bg-black/40" role="dialog" aria-modal="true">
          <div className="h-full w-full max-w-lg overflow-y-auto bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Booking Details</h2>
              <button type="button" onClick={() => setSelectedBooking(null)} className="rounded-lg border px-3 py-1">Close</button>
            </div>
            <dl className="mt-6 space-y-3 text-sm">
              <div><dt className="font-semibold">Booking</dt><dd>{selectedBooking.bookingNumber || selectedBooking._id}</dd></div>
              <div><dt className="font-semibold">Customer</dt><dd>{customerOf(selectedBooking)}</dd></div>
              <div><dt className="font-semibold">Tour</dt><dd>{tourOf(selectedBooking)}</dd></div>
              <div><dt className="font-semibold">Amount</dt><dd>KES {Number(selectedBooking.totalAmount || selectedBooking.amount || 0).toLocaleString()}</dd></div>
              <div><dt className="font-semibold">Payment</dt><dd className="capitalize">{paymentStatusOf(selectedBooking)}</dd></div>
              <div><dt className="font-semibold">Paid Amount</dt><dd>KES {Number(selectedBooking.paidAmount || selectedBooking.depositAmount || 0).toLocaleString()}</dd></div>
              <div><dt className="font-semibold">M-Pesa Receipt</dt><dd>{selectedBooking.mpesaReceiptNumber || "Pending"}</dd></div>
              <div><dt className="font-semibold">Payment Date</dt><dd>{selectedBooking.paymentDate ? new Date(selectedBooking.paymentDate).toLocaleString() : "Pending"}</dd></div>
              <div><dt className="font-semibold">Status</dt><dd className="capitalize">{selectedBooking.status || "pending"}</dd></div>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}
