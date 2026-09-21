import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useDebouncedValue from "../../hooks/useDebouncedValue";
import { exportBookingsCSV } from "../../utils/exportBookings";
import { getStaff } from "../../api/staffApi";
import { getVehicles } from "../../api/vehicleApi";
import {
  getBookings,
  getBookingDetails,
  getBookingTimeline,
  downloadInvoice,
  updateBookingStatus,
  assignBookingResources,
  sendBookingNotification,
} from "../../api/adminBookingApi";
import Pagination from "../../components/admin/Pagination";

const PAGE_SIZE = 10;

const BOOKING_STATUS_TRANSITIONS = {
  pending: ["confirmed", "failed", "cancelled"],
  failed: ["pending", "confirmed", "cancelled"],
  confirmed: ["assigned", "cancelled", "refunded"],
  assigned: ["ongoing", "completed", "cancelled", "refunded"],
  ongoing: ["completed", "cancelled", "refunded"],
  completed: [],
  cancelled: [],
  refunded: [],
};


const cleanText = (value) => {
  if (value === null || value === undefined) return "";
  const text = String(value).trim();
  return !text || /^(undefined|null)(\s+undefined|\s+null)*$/i.test(text) ? "" : text;
};

const nameOf = (value) => {
  if (!value) return "";
  if (typeof value === "string") return cleanText(value);
  const direct = cleanText(value.name || value.fullName || value.displayName);
  if (direct) return direct;
  return `${cleanText(value.firstName || value.givenName)} ${cleanText(
    value.lastName || value.familyName || value.surname
  )}`.trim();
};

const paymentStatusOf = (booking) =>
  String(
    booking?.effectivePaymentStatus ||
      (typeof booking?.paymentStatus === "string"
        ? booking.paymentStatus
        : booking?.paymentStatus?.status) ||
      "pending"
  ).toLowerCase();

const customerOf = (booking) => {
  for (const candidate of [
    booking?.customerDisplayName,
    booking?.customer,
    booking?.customerSnapshot,
    booking?.contact,
    booking?.user,
    booking?.guestContact,
  ]) {
    const name = nameOf(candidate);
    if (name) return name;
  }
  return "Customer";
};

const emailOf = (booking) =>
  cleanText(
    booking?.customer?.email ||
      booking?.customerSnapshot?.email ||
      booking?.contact?.email ||
      booking?.guestContact?.email ||
      booking?.user?.email
  );

const phoneOf = (booking) =>
  cleanText(
    booking?.customer?.phone ||
      booking?.customerSnapshot?.phone ||
      booking?.contact?.phone ||
      booking?.guestContact?.phone ||
      booking?.user?.phone
  );

const tourOf = (booking) =>
  cleanText(
    booking?.tour?.title ||
      booking?.tour?.name ||
      booking?.customTourRequest?.title ||
      booking?.customTourRequest?.name ||
      booking?.destination?.name
  ) || "Custom Tour Package";

const resourceId = (value) => {
  if (!value) return "";
  return String(value?._id || value?.id || value);
};

const formatMoney = (value) =>
  `KES ${Math.max(0, Number(value || 0)).toLocaleString("en-KE")}`;

const bookingAmount = (booking) =>
  booking?.totalAmount ??
  booking?.amount ??
  booking?.grandTotal ??
  booking?.price ??
  0;

export default function BookingManagement() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [page, setPage] = useState(1);
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [guideId, setGuideId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const debouncedSearch = useDebouncedValue(search, 350);

  const { data: staffResponse } = useQuery({
    queryKey: ["staff"],
    queryFn: getStaff,
    staleTime: 30000,
  });

  const { data: vehicleResponse } = useQuery({
    queryKey: ["vehicles"],
    queryFn: getVehicles,
    staleTime: 30000,
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
      ["guide", "tour_guide"].includes(
        String(member.position || member.role || "").toLowerCase()
      ) || member.isGuide === true
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

  const bookingsQuery = useQuery({
    queryKey: [
      "admin-bookings",
      debouncedSearch,
      statusFilter,
      paymentFilter,
      page,
    ],
    queryFn: () =>
      getBookings({
        search: debouncedSearch.trim(),
        status: statusFilter === "all" ? undefined : statusFilter,
        paymentStatus:
          paymentFilter === "all" ? undefined : paymentFilter,
        page,
        limit: PAGE_SIZE,
      }),
    placeholderData: (previous) => previous,
    staleTime: 15000,
  });

  const { data, isLoading, isFetching, error } = bookingsQuery;

  const bookings = Array.isArray(data)
    ? data
    : Array.isArray(data?.bookings)
      ? data.bookings
      : Array.isArray(data?.data?.bookings)
        ? data.data.bookings
        : Array.isArray(data?.data)
          ? data.data
          : [];

  const pagination = data?.pagination || data?.data?.pagination || {};
  const total = Number(pagination.total || bookings.length);
  const pages = Math.max(
    1,
    Number(pagination.pages || Math.ceil(total / PAGE_SIZE) || 1)
  );

  const invalidateBookings = () =>
    queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });

  // Booking/payment mutations affect every dashboard that consumes revenue,
  // booking counts, analytics, reports or finance metrics.
  const invalidateFinancialDashboards = () =>
    queryClient.invalidateQueries({
      predicate: (query) => {
        const key = query.queryKey?.map((part) => String(part).toLowerCase()).join("/");
        return /(dashboard|analytics|revenue|finance|report|payment)/.test(key);
      },
    });

  const invalidateSelectedBooking = () => {
    if (!selectedBooking?._id) return;
    queryClient.invalidateQueries({
      queryKey: ["admin-booking-detail", selectedBooking._id],
    });
    queryClient.invalidateQueries({
      queryKey: ["admin-booking-timeline", selectedBooking._id],
    });
  };

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => updateBookingStatus(id, status),
    onSuccess: () => {
      setActionError("");
      setActionMessage("Booking status updated successfully.");
      invalidateBookings();
      invalidateFinancialDashboards();
      invalidateSelectedBooking();
    },
    onError: (mutationError) =>
      setActionError(
        mutationError?.response?.data?.message ||
          mutationError.message ||
          "Unable to update booking status."
      ),
  });

  const assignMutation = useMutation({
    mutationFn: ({ id, payload }) => assignBookingResources(id, payload),
    onSuccess: () => {
      setActionError("");
      setActionMessage("Resources assigned successfully.");
      invalidateBookings();
      invalidateSelectedBooking();
    },
    onError: (mutationError) =>
      setActionError(
        mutationError?.response?.data?.message ||
          mutationError.message ||
          "Unable to assign resources."
      ),
  });

  const notificationMutation = useMutation({
    mutationFn: ({ id, payload }) => sendBookingNotification(id, payload),
    onSuccess: () => {
      setActionError("");
      setActionMessage("Notification queued successfully.");
    },
    onError: (mutationError) =>
      setActionError(
        mutationError?.response?.data?.message ||
          mutationError.message ||
          "Unable to send notification."
      ),
  });

  const bookingDetailsQuery = useQuery({
    queryKey: ["admin-booking-detail", selectedBooking?._id],
    queryFn: () => getBookingDetails(selectedBooking._id),
    enabled: Boolean(selectedBooking?._id),
    staleTime: 10000,
  });

  const timelineQuery = useQuery({
    queryKey: ["admin-booking-timeline", selectedBooking?._id],
    queryFn: () => getBookingTimeline(selectedBooking._id),
    enabled: Boolean(selectedBooking?._id),
    staleTime: 10000,
  });

  const detail = useMemo(() => {
    const response = bookingDetailsQuery.data;
    const candidate =
      response?.data?.data ||
      response?.data?.booking ||
      (response?.data?._id ? response.data : null) ||
      response?.booking ||
      (response?._id ? response : null);
    return candidate || selectedBooking;
  }, [bookingDetailsQuery.data, selectedBooking]);

  const filteredBookings = useMemo(() => {
    const term = search.trim().toLowerCase();

    return bookings.filter((booking) => {
      const customer = customerOf(booking).toLowerCase();
      const email = emailOf(booking).toLowerCase();
      const phone = phoneOf(booking).toLowerCase();
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

  const openBooking = (booking) => {
    setSelectedBooking(booking);
    setActionError("");
    setActionMessage("");
    setGuideId(resourceId(booking?.assignedGuide));
    setDriverId(resourceId(booking?.assignedDriver));
    setVehicleId(resourceId(booking?.assignedVehicle));
  };

  const closeBooking = () => {
    setSelectedBooking(null);
    setActionError("");
    setActionMessage("");
    setGuideId("");
    setDriverId("");
    setVehicleId("");
  };

  const saveAssignment = () => {
    if (!detail?._id) return;
    setActionError("");
    setActionMessage("");

    assignMutation.mutate({
      id: detail._id,
      payload: {
        guide: guideId || null,
        driver: driverId || null,
        vehicle: vehicleId || null,
      },
    });
  };

  const downloadBookingInvoice = async () => {
    if (!detail?._id) return;

    try {
      setActionError("");
      const response = await downloadInvoice(detail._id);
      const blob =
        response?.data instanceof Blob
          ? response.data
          : new Blob([response?.data || ""], { type: "text/plain" });

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${detail.bookingNumber || detail._id}-invoice.txt`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setActionMessage("Invoice downloaded.");
    } catch (downloadError) {
      setActionError(
        downloadError?.response?.data?.message ||
          "Unable to download invoice."
      );
    }
  };

  const notifyCustomer = () => {
    if (!detail?._id) return;

    const message = window.prompt(
      "Message to customer",
      `Your booking is currently ${detail.status || "being processed"}.`
    );

    if (!message?.trim()) return;

    setActionError("");
    setActionMessage("");
    notificationMutation.mutate({
      id: detail._id,
      payload: { message: message.trim() },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] bg-slate-50 p-6">
        <div className="animate-pulse rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          Loading bookings...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] bg-slate-50 p-6">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
          <p className="font-bold">Unable to load bookings</p>
          <p className="mt-1 text-sm">{error.message || "Please try again."}</p>
          <button
            type="button"
            onClick={invalidateBookings}
            className="mt-4 rounded-lg bg-rose-700 px-4 py-2 font-semibold text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // KPI metrics come from the complete server-side filtered dataset,
  // rather than the currently visible pagination page.
  const metrics = data?.metrics || data?.data?.metrics || {};
  const cancelled = Number(metrics.cancelled ?? bookings.filter((booking) => booking.status === "cancelled").length);
  const paid = Number(metrics.paid ?? bookings.filter((booking) => paymentStatusOf(booking) === "paid").length);
  const pendingPayments = Number(metrics.pendingPayments ?? bookings.filter((booking) => paymentStatusOf(booking) === "pending").length);

  const primaryCards = [
    ["Total Bookings", total, "text-sky-800"],
    ["Pending Payments", pendingPayments, "text-amber-800"],
    ["Paid", paid, "text-emerald-800"],
    ["Cancelled", cancelled, "text-rose-800"],
  ];

  return (
    <div className="min-h-full space-y-6 bg-slate-50 p-4 sm:p-6">
      <section className="rounded-2xl bg-gradient-to-r from-sky-700 via-indigo-700 to-violet-700 p-5 text-white shadow-lg sm:p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-100">
              Administration
            </p>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
              Booking Management
            </h1>
            <p className="mt-1 text-sm text-indigo-100">
              Monitor bookings, payments and operational assignments.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={invalidateBookings}
              disabled={isFetching}
              className="rounded-lg bg-white/15 px-4 py-2 text-sm font-semibold ring-1 ring-white/30 transition hover:bg-white/20 disabled:opacity-60"
            >
              {isFetching ? "Refreshing..." : "Refresh"}
            </button>
            <button
              type="button"
              onClick={() => exportBookingsCSV(bookings)}
              className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-indigo-700 transition hover:bg-slate-100"
            >
              Export visible CSV
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {primaryCards.map(([title, value, valueColor]) => (
          <div
            key={title}
            className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {title}
            </p>
            <p className={`mt-1 text-lg font-bold ${valueColor}`}>{value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-slate-900">Find bookings</h2>
            <p className="text-xs text-slate-500">
              Search and filter the operational queue.
            </p>
          </div>
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
            {total} results
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Customer, email, phone, tour or ID..."
            className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />

          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
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
            onChange={(event) => {
              setPaymentFilter(event.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="all">All Payments</option>
            {["paid", "pending", "failed", "partial", "cancelled", "refunded"].map(
              (status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              )
            )}
          </select>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px]">
            <thead className="bg-slate-50">
              <tr>
                {["Customer", "Tour", "Status", "Payment", "Travel date", "Action"].map(
                  (heading) => (
                    <th
                      key={heading}
                      className="p-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500"
                    >
                      {heading}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody>
              {filteredBookings.map((booking) => (
                <tr
                  key={booking._id}
                  className="border-t border-slate-100 hover:bg-slate-50"
                >
                  <td className="p-4">
                    <div className="font-bold text-slate-900">
                      {customerOf(booking)}
                    </div>
                    <div className="text-xs text-slate-500">
                      {emailOf(booking) || phoneOf(booking) || "—"}
                    </div>
                  </td>

                  <td className="p-4 text-sm text-slate-700">
                    {tourOf(booking)}
                  </td>

                  <td className="p-4 text-sm font-semibold text-slate-700">
                    {booking.status || "—"}
                  </td>

                  <td className="p-4 text-sm font-semibold text-slate-700">
                    {paymentStatusOf(booking)}
                  </td>

                  <td className="p-4 text-sm text-slate-700">
                    {booking.travelDate
                      ? new Date(booking.travelDate).toLocaleDateString("en-KE")
                      : "—"}
                  </td>

                  <td className="p-4 text-sm">
                    <button
                      type="button"
                      onClick={() => openBooking(booking)}
                      className="rounded-lg bg-indigo-700 px-3 py-2 font-semibold text-white shadow-sm transition hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}

              {!filteredBookings.length && (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-slate-500">
                    No bookings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          pages={pages}
          total={total}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      </section>

      {selectedBooking && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeBooking();
          }}
        >
          <aside
            className="ml-auto h-full w-full max-w-2xl overflow-y-auto bg-white shadow-2xl"
            aria-label="Booking management"
          >
            <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                    Booking management
                  </p>
                  <h2 className="mt-1 truncate text-xl font-black text-slate-950">
                    {detail?.bookingNumber ||
                      selectedBooking.bookingNumber ||
                      "Booking"}
                  </h2>
                  <p className="mt-1 break-all text-xs text-slate-500">
                    {detail?._id || selectedBooking._id}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeBooking}
                  className="shrink-0 rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              {actionError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-800">
                  {actionError}
                </div>
              )}

              {actionMessage && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
                  {actionMessage}
                </div>
              )}

              {bookingDetailsQuery.isLoading ? (
                <div className="animate-pulse rounded-2xl bg-slate-100 p-6 text-sm font-semibold text-slate-500">
                  Loading booking details...
                </div>
              ) : bookingDetailsQuery.isError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800">
                  Unable to load the full booking details. The booking summary
                  remains available below.
                  <button
                    type="button"
                    onClick={() => bookingDetailsQuery.refetch()}
                    className="mt-3 block rounded-lg bg-rose-700 px-3 py-2 font-bold text-white"
                  >
                    Retry details
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                        Customer
                      </p>
                      <p className="mt-1 font-black text-slate-900">
                        {customerOf(detail)}
                      </p>
                      <p className="break-all text-xs text-slate-600">
                        {emailOf(detail) ||
                          phoneOf(detail) ||
                          "No contact details"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                        Trip
                      </p>
                      <p className="mt-1 font-black text-slate-900">
                        {tourOf(detail)}
                      </p>
                      <p className="text-xs text-slate-600">
                        {detail?.travelDate
                          ? new Date(detail.travelDate).toLocaleDateString(
                              "en-KE",
                              { dateStyle: "medium" }
                            )
                          : "No travel date"}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-slate-500">
                        Booking status
                      </label>
                      <select
                        value={detail?.status || "pending"}
                        onChange={(event) => {
                          setActionError("");
                          setActionMessage("");
                          statusMutation.mutate({
                            id: detail._id,
                            status: event.target.value,
                          });
                        }}
                        disabled={statusMutation.isPending}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-bold outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      >
                        {[
                          detail?.status,
                          ...(BOOKING_STATUS_TRANSITIONS[detail?.status] || []),
                        ]
                          .filter(Boolean)
                          .filter((status, index, list) => list.indexOf(status) === index)
                          .map((status) => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="rounded-xl border border-violet-200 bg-violet-50 px-3 py-2.5">
                      <p className="text-[10px] font-black uppercase tracking-wider text-violet-700">
                        Total
                      </p>
                      <p className="mt-1 font-black text-violet-950">
                        {formatMoney(bookingAmount(detail))}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-4">
                    <h3 className="text-sm font-black text-slate-900">
                      Operational assignment
                    </h3>

                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <select
                        value={guideId}
                        onChange={(event) => setGuideId(event.target.value)}
                        className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-semibold outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      >
                        <option value="">Guide — Unassigned</option>
                        {guides.map((member) => (
                          <option key={member._id} value={member._id}>
                            {nameOf(member) || member.email || "Guide"}
                          </option>
                        ))}
                      </select>

                      <select
                        value={driverId}
                        onChange={(event) => setDriverId(event.target.value)}
                        className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-semibold outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      >
                        <option value="">Driver — Unassigned</option>
                        {drivers.map((member) => (
                          <option key={member._id} value={member._id}>
                            {nameOf(member) || member.email || "Driver"}
                          </option>
                        ))}
                      </select>

                      <select
                        value={vehicleId}
                        onChange={(event) => setVehicleId(event.target.value)}
                        className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-semibold outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      >
                        <option value="">Vehicle — Unassigned</option>
                        {vehicles.map((vehicle) => (
                          <option key={vehicle._id} value={vehicle._id}>
                            {nameOf(vehicle) ||
                              vehicle.registrationNumber ||
                              vehicle.plateNumber ||
                              "Vehicle"}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={saveAssignment}
                        disabled={
                          assignMutation.isPending ||
                          paymentStatusOf(detail) !== "paid"
                        }
                        className="rounded-xl bg-indigo-700 px-4 py-2.5 text-sm font-black text-white transition hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {assignMutation.isPending
                          ? "Saving..."
                          : "Save assignment"}
                      </button>
                    </div>

                    <p className="mt-2 text-xs text-slate-500">
                      Assignments are validated by the server and only paid
                      bookings can be assigned.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={downloadBookingInvoice}
                      className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-black text-slate-800 transition hover:bg-slate-50"
                    >
                      Download invoice
                    </button>

                    <button
                      type="button"
                      onClick={notifyCustomer}
                      disabled={notificationMutation.isPending}
                      className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white transition hover:bg-slate-800 disabled:opacity-60"
                    >
                      {notificationMutation.isPending
                        ? "Sending..."
                        : "Send customer notification"}
                    </button>
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-sm font-black text-slate-900">
                        Booking timeline
                      </h3>
                      {timelineQuery.isFetching && (
                        <span className="text-xs text-slate-500">
                          Loading...
                        </span>
                      )}
                    </div>

                    <div className="mt-3 space-y-3">
                      {(timelineQuery.data?.timeline || []).map(
                        (event, index) => (
                          <div key={`${event.date || "event"}-${index}`} className="flex gap-3">
                            <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-indigo-600" />
                            <div>
                              <p className="text-sm font-bold text-slate-800">
                                {event.event || "Booking event"}
                              </p>
                              <p className="text-xs text-slate-500">
                                {event.date
                                  ? new Date(event.date).toLocaleString("en-KE", {
                                      dateStyle: "medium",
                                      timeStyle: "short",
                                    })
                                  : "Date not recorded"}
                              </p>
                              {event.event?.toLowerCase().startsWith("payment") &&
                                event.paymentReference && (
                                  <p className="mt-1 text-[11px] font-medium text-slate-400">
                                    Reference: {event.paymentReference}
                                  </p>
                                )}
                            </div>
                          </div>
                        )
                      )}

                      {!timelineQuery.isLoading &&
                        !timelineQuery.data?.timeline?.length && (
                          <p className="text-sm text-slate-500">
                            No timeline events available.
                          </p>
                        )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
