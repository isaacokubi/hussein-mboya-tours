/**
 * Purpose: Booking Management page-level UI component. Main declarations: cleanText, nameOf, paymentStatusOf, customerOf, emailOf.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useMemo, useState } from "react";
// Load @tanstack/react-query so this module can use its exported dependencies.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// Load ../../hooks/useDebouncedValue so this module can use its exported dependencies.
import useDebouncedValue from "../../hooks/useDebouncedValue";
// Load ../../utils/exportBookings so this module can use its exported dependencies.
import { exportBookingsCSV } from "../../utils/exportBookings";
// Load ../../api/staffApi so this module can use its exported dependencies.
import { getStaff } from "../../api/staffApi";
// Load ../../api/vehicleApi so this module can use its exported dependencies.
import { getVehicles } from "../../api/vehicleApi";
// Load ../../api/adminBookingApi so this module can use its exported dependencies.
import {
  getBookings,
  getBookingDetails,
  getBookingTimeline,
  downloadInvoice,
  updateBookingStatus,
  assignBookingResources,
  sendBookingNotification,
} from "../../api/adminBookingApi";
// Load ../../components/admin/Pagination so this module can use its exported dependencies.
import Pagination from "../../components/admin/Pagination";

// Declare PAGE_SIZE for use by the surrounding module or function.
const PAGE_SIZE = 10;

// Declare BOOKING_STATUS_TRANSITIONS for use by the surrounding module or function.
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


// Declare cleanText for use by the surrounding module or function.
const cleanText = (value) => {
  // Check the condition (value === null || value === undefined) and run the matching branch.
  if (value === null || value === undefined) return "";
  // Declare text for use by the surrounding module or function.
  const text = String(value).trim();
  // Return the expression shown below to the caller.
  return !text || /^(undefined|null)(\s+undefined|\s+null)*$/i.test(text) ? "" : text;
};

// Declare nameOf for use by the surrounding module or function.
const nameOf = (value) => {
  // Check the condition (!value) and run the matching branch.
  if (!value) return "";
  // Check the condition (typeof value === "string") and run the matching branch.
  if (typeof value === "string") return cleanText(value);
  // Declare direct for use by the surrounding module or function.
  const direct = cleanText(value.name || value.fullName || value.displayName);
  // Check the condition (direct) and run the matching branch.
  if (direct) return direct;
  // Return the result of `${cleanText(value.firstName || value.givenName)} ${cleanText(     value.lastName || value.familyName || value.surname   )}`.trim() to the caller.
  return `${cleanText(value.firstName || value.givenName)} ${cleanText(
    value.lastName || value.familyName || value.surname
  )}`.trim();
};

// Declare paymentStatusOf for use by the surrounding module or function.
const paymentStatusOf = (booking) =>
  String(
    booking?.effectivePaymentStatus ||
      (typeof booking?.paymentStatus === "string"
        ? booking.paymentStatus
        : booking?.paymentStatus?.status) ||
      "pending"
  ).toLowerCase();

// Declare customerOf for use by the surrounding module or function.
const customerOf = (booking) => {
  // Repeat the enclosed work for each required iteration.
  for (const candidate of [
    booking?.customerDisplayName,
    booking?.customer,
    booking?.customerSnapshot,
    booking?.contact,
    booking?.user,
    booking?.guestContact,
  ]) {
    // Declare name for use by the surrounding module or function.
    const name = nameOf(candidate);
    // Check the condition (name) and run the matching branch.
    if (name) return name;
  }
  // Return a configured text value to the caller.
  return "Customer";
};

// Declare emailOf for use by the surrounding module or function.
const emailOf = (booking) =>
  cleanText(
    booking?.customer?.email ||
      booking?.customerSnapshot?.email ||
      booking?.contact?.email ||
      booking?.guestContact?.email ||
      booking?.user?.email
  );

// Declare phoneOf for use by the surrounding module or function.
const phoneOf = (booking) =>
  cleanText(
    booking?.customer?.phone ||
      booking?.customerSnapshot?.phone ||
      booking?.contact?.phone ||
      booking?.guestContact?.phone ||
      booking?.user?.phone
  );

// Declare tourOf for use by the surrounding module or function.
const tourOf = (booking) =>
  cleanText(
    booking?.tour?.title ||
      booking?.tour?.name ||
      booking?.customTourRequest?.title ||
      booking?.customTourRequest?.name ||
      booking?.destination?.name
  ) || "Custom Tour Package";

// Declare resourceId for use by the surrounding module or function.
const resourceId = (value) => {
  // Check the condition (!value) and run the matching branch.
  if (!value) return "";
  // Return the result of String() to the caller.
  return String(value?._id || value?.id || value);
};

// Declare formatMoney for use by the surrounding module or function.
const formatMoney = (value) =>
  `KES ${Math.max(0, Number(value || 0)).toLocaleString("en-KE")}`;

// Declare bookingAmount for use by the surrounding module or function.
const bookingAmount = (booking) =>
  booking?.totalAmount ??
  booking?.amount ??
  booking?.grandTotal ??
  booking?.price ??
  0;

// Define BookingManagement; its parameters and body implement this operation.
export default function BookingManagement() {
  // Declare queryClient for use by the surrounding module or function.
  const queryClient = useQueryClient();
  // Declare [search, setSearch] for use by the surrounding module or function.
  const [search, setSearch] = useState("");
  // Declare [statusFilter, setStatusFilter] for use by the surrounding module or function.
  const [statusFilter, setStatusFilter] = useState("all");
  // Declare [paymentFilter, setPaymentFilter] for use by the surrounding module or function.
  const [paymentFilter, setPaymentFilter] = useState("all");
  // Declare [selectedBooking, setSelectedBooking] for use by the surrounding module or function.
  const [selectedBooking, setSelectedBooking] = useState(null);
  // Declare [page, setPage] for use by the surrounding module or function.
  const [page, setPage] = useState(1);
  // Declare [actionMessage, setActionMessage] for use by the surrounding module or function.
  const [actionMessage, setActionMessage] = useState("");
  // Declare [actionError, setActionError] for use by the surrounding module or function.
  const [actionError, setActionError] = useState("");
  // Declare [guideId, setGuideId] for use by the surrounding module or function.
  const [guideId, setGuideId] = useState("");
  // Declare [driverId, setDriverId] for use by the surrounding module or function.
  const [driverId, setDriverId] = useState("");
  // Declare [vehicleId, setVehicleId] for use by the surrounding module or function.
  const [vehicleId, setVehicleId] = useState("");
  // Declare debouncedSearch for use by the surrounding module or function.
  const debouncedSearch = useDebouncedValue(search, 350);

  // Declare { data: staffResponse } for use by the surrounding module or function.
  const { data: staffResponse } = useQuery({
    queryKey: ["staff"],
    queryFn: getStaff,
    staleTime: 30000,
  });

  // Declare { data: vehicleResponse } for use by the surrounding module or function.
  const { data: vehicleResponse } = useQuery({
    queryKey: ["vehicles"],
    queryFn: getVehicles,
    staleTime: 30000,
  });

  // Declare staff for use by the surrounding module or function.
  const staff = Array.isArray(staffResponse)
    ? staffResponse
    : Array.isArray(staffResponse?.data)
      ? staffResponse.data
      : Array.isArray(staffResponse?.data?.data)
        ? staffResponse.data.data
        : [];

  // Declare guides for use by the surrounding module or function.
  const guides = staff.filter(
    (member) =>
      ["guide", "tour_guide"].includes(
        String(member.position || member.role || "").toLowerCase()
      ) || member.isGuide === true
  );

  // Declare drivers for use by the surrounding module or function.
  const drivers = staff.filter(
    (member) =>
      String(member.position || member.role || "").toLowerCase() === "driver"
  );

  // Declare vehicles for use by the surrounding module or function.
  const vehicles = Array.isArray(vehicleResponse)
    ? vehicleResponse
    : Array.isArray(vehicleResponse?.data)
      ? vehicleResponse.data
      : Array.isArray(vehicleResponse?.data?.data)
        ? vehicleResponse.data.data
        : Array.isArray(vehicleResponse?.vehicles)
          ? vehicleResponse.vehicles
          : [];

  // Declare bookingsQuery for use by the surrounding module or function.
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

  // Declare { data, isLoading, isFetching, error } for use by the surrounding module or function.
  const { data, isLoading, isFetching, error } = bookingsQuery;

  // Declare bookings for use by the surrounding module or function.
  const bookings = Array.isArray(data)
    ? data
    : Array.isArray(data?.bookings)
      ? data.bookings
      : Array.isArray(data?.data?.bookings)
        ? data.data.bookings
        : Array.isArray(data?.data)
          ? data.data
          : [];

  // Declare pagination for use by the surrounding module or function.
  const pagination = data?.pagination || data?.data?.pagination || {};
  // Declare total for use by the surrounding module or function.
  const total = Number(pagination.total || bookings.length);
  // Declare pages for use by the surrounding module or function.
  const pages = Math.max(
    1,
    Number(pagination.pages || Math.ceil(total / PAGE_SIZE) || 1)
  );

  // Declare invalidateBookings for use by the surrounding module or function.
  const invalidateBookings = () =>
    queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });

  // Booking/payment mutations affect every dashboard that consumes revenue,
  // booking counts, analytics, reports or finance metrics.
  // Declare invalidateFinancialDashboards for use by the surrounding module or function.
  const invalidateFinancialDashboards = () =>
    queryClient.invalidateQueries({
      predicate: (query) => {
        // Declare key for use by the surrounding module or function.
        const key = query.queryKey?.map((part) => String(part).toLowerCase()).join("/");
        // Return the result of /(dashboard|analytics|revenue|finance|report|payment)/.test() to the caller.
        return /(dashboard|analytics|revenue|finance|report|payment)/.test(key);
      },
    });

  // Declare invalidateSelectedBooking for use by the surrounding module or function.
  const invalidateSelectedBooking = () => {
    // Check the condition (!selectedBooking?._id) and run the matching branch.
    if (!selectedBooking?._id) return;
    // Perform the side effect or state update expressed on the following line.
    queryClient.invalidateQueries({
      queryKey: ["admin-booking-detail", selectedBooking._id],
    });
    // Perform the side effect or state update expressed on the following line.
    queryClient.invalidateQueries({
      queryKey: ["admin-booking-timeline", selectedBooking._id],
    });
  };

  // Declare statusMutation for use by the surrounding module or function.
  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => updateBookingStatus(id, status),
    onSuccess: () => {
      // Perform the side effect or state update expressed on the following line.
      setActionError("");
      // Perform the side effect or state update expressed on the following line.
      setActionMessage("Booking status updated successfully.");
      // Perform the side effect or state update expressed on the following line.
      invalidateBookings();
      // Perform the side effect or state update expressed on the following line.
      invalidateFinancialDashboards();
      // Perform the side effect or state update expressed on the following line.
      invalidateSelectedBooking();
    },
    onError: (mutationError) =>
      setActionError(
        mutationError?.response?.data?.message ||
          mutationError.message ||
          "Unable to update booking status."
      ),
  });

  // Declare assignMutation for use by the surrounding module or function.
  const assignMutation = useMutation({
    mutationFn: ({ id, payload }) => assignBookingResources(id, payload),
    onSuccess: () => {
      // Perform the side effect or state update expressed on the following line.
      setActionError("");
      // Perform the side effect or state update expressed on the following line.
      setActionMessage("Resources assigned successfully.");
      // Perform the side effect or state update expressed on the following line.
      invalidateBookings();
      // Perform the side effect or state update expressed on the following line.
      invalidateSelectedBooking();
    },
    onError: (mutationError) =>
      setActionError(
        mutationError?.response?.data?.message ||
          mutationError.message ||
          "Unable to assign resources."
      ),
  });

  // Declare notificationMutation for use by the surrounding module or function.
  const notificationMutation = useMutation({
    mutationFn: ({ id, payload }) => sendBookingNotification(id, payload),
    onSuccess: () => {
      // Perform the side effect or state update expressed on the following line.
      setActionError("");
      // Perform the side effect or state update expressed on the following line.
      setActionMessage("Notification queued successfully.");
    },
    onError: (mutationError) =>
      setActionError(
        mutationError?.response?.data?.message ||
          mutationError.message ||
          "Unable to send notification."
      ),
  });

  // Declare bookingDetailsQuery for use by the surrounding module or function.
  const bookingDetailsQuery = useQuery({
    queryKey: ["admin-booking-detail", selectedBooking?._id],
    queryFn: () => getBookingDetails(selectedBooking._id),
    enabled: Boolean(selectedBooking?._id),
    staleTime: 10000,
  });

  // Declare timelineQuery for use by the surrounding module or function.
  const timelineQuery = useQuery({
    queryKey: ["admin-booking-timeline", selectedBooking?._id],
    queryFn: () => getBookingTimeline(selectedBooking._id),
    enabled: Boolean(selectedBooking?._id),
    staleTime: 10000,
  });

  // Declare detail for use by the surrounding module or function.
  const detail = useMemo(() => {
    // Declare response for use by the surrounding module or function.
    const response = bookingDetailsQuery.data;
    // Declare candidate for use by the surrounding module or function.
    const candidate =
      response?.data?.data ||
      response?.data?.booking ||
      (response?.data?._id ? response.data : null) ||
      response?.booking ||
      (response?._id ? response : null);
    // Return the expression shown below to the caller.
    return candidate || selectedBooking;
  }, [bookingDetailsQuery.data, selectedBooking]);

  // Declare filteredBookings for use by the surrounding module or function.
  const filteredBookings = useMemo(() => {
    // Declare term for use by the surrounding module or function.
    const term = search.trim().toLowerCase();

    // Return the result of bookings.filter() to the caller.
    return bookings.filter((booking) => {
      // Declare customer for use by the surrounding module or function.
      const customer = customerOf(booking).toLowerCase();
      // Declare email for use by the surrounding module or function.
      const email = emailOf(booking).toLowerCase();
      // Declare phone for use by the surrounding module or function.
      const phone = phoneOf(booking).toLowerCase();
      // Declare id for use by the surrounding module or function.
      const id = String(booking?._id || "").toLowerCase();
      // Declare number for use by the surrounding module or function.
      const number = String(booking?.bookingNumber || "").toLowerCase();
      // Declare tour for use by the surrounding module or function.
      const tour = tourOf(booking).toLowerCase();
      // Declare payment for use by the surrounding module or function.
      const payment = paymentStatusOf(booking);

      // Return the expression shown below to the caller.
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

  // Declare openBooking for use by the surrounding module or function.
  const openBooking = (booking) => {
    // Perform the side effect or state update expressed on the following line.
    setSelectedBooking(booking);
    // Perform the side effect or state update expressed on the following line.
    setActionError("");
    // Perform the side effect or state update expressed on the following line.
    setActionMessage("");
    // Perform the side effect or state update expressed on the following line.
    setGuideId(resourceId(booking?.assignedGuide));
    // Perform the side effect or state update expressed on the following line.
    setDriverId(resourceId(booking?.assignedDriver));
    // Perform the side effect or state update expressed on the following line.
    setVehicleId(resourceId(booking?.assignedVehicle));
  };

  // Declare closeBooking for use by the surrounding module or function.
  const closeBooking = () => {
    // Perform the side effect or state update expressed on the following line.
    setSelectedBooking(null);
    // Perform the side effect or state update expressed on the following line.
    setActionError("");
    // Perform the side effect or state update expressed on the following line.
    setActionMessage("");
    // Perform the side effect or state update expressed on the following line.
    setGuideId("");
    // Perform the side effect or state update expressed on the following line.
    setDriverId("");
    // Perform the side effect or state update expressed on the following line.
    setVehicleId("");
  };

  // Declare saveAssignment for use by the surrounding module or function.
  const saveAssignment = () => {
    // Check the condition (!detail?._id) and run the matching branch.
    if (!detail?._id) return;
    // Perform the side effect or state update expressed on the following line.
    setActionError("");
    // Perform the side effect or state update expressed on the following line.
    setActionMessage("");

    // Perform the side effect or state update expressed on the following line.
    assignMutation.mutate({
      id: detail._id,
      payload: {
        guide: guideId || null,
        driver: driverId || null,
        vehicle: vehicleId || null,
      },
    });
  };

  // Declare downloadBookingInvoice for use by the surrounding module or function.
  const downloadBookingInvoice = async () => {
    // Check the condition (!detail?._id) and run the matching branch.
    if (!detail?._id) return;

    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Perform the side effect or state update expressed on the following line.
      setActionError("");
      // Declare response for use by the surrounding module or function.
      const response = await downloadInvoice(detail._id);
      // Declare blob for use by the surrounding module or function.
      const blob =
        response?.data instanceof Blob
          ? response.data
          : new Blob([response?.data || ""], { type: "text/plain" });

      // Declare url for use by the surrounding module or function.
      const url = URL.createObjectURL(blob);
      // Declare anchor for use by the surrounding module or function.
      const anchor = document.createElement("a");
      // Perform the side effect or state update expressed on the following line.
      anchor.href = url;
      // Perform the side effect or state update expressed on the following line.
      anchor.download = `${detail.bookingNumber || detail._id}-invoice.txt`;
      // Perform the side effect or state update expressed on the following line.
      document.body.appendChild(anchor);
      // Perform the side effect or state update expressed on the following line.
      anchor.click();
      // Perform the side effect or state update expressed on the following line.
      anchor.remove();
      // Perform the side effect or state update expressed on the following line.
      URL.revokeObjectURL(url);
      // Perform the side effect or state update expressed on the following line.
      setActionMessage("Invoice downloaded.");
    } catch (downloadError) {
      // Perform the side effect or state update expressed on the following line.
      setActionError(
        downloadError?.response?.data?.message ||
          "Unable to download invoice."
      );
    }
  };

  // Declare notifyCustomer for use by the surrounding module or function.
  const notifyCustomer = () => {
    // Check the condition (!detail?._id) and run the matching branch.
    if (!detail?._id) return;

    // Declare message for use by the surrounding module or function.
    const message = window.prompt(
      "Message to customer",
      `Your booking is currently ${detail.status || "being processed"}.`
    );

    // Check the condition (!message?.trim()) and run the matching branch.
    if (!message?.trim()) return;

    // Perform the side effect or state update expressed on the following line.
    setActionError("");
    // Perform the side effect or state update expressed on the following line.
    setActionMessage("");
    // Perform the side effect or state update expressed on the following line.
    notificationMutation.mutate({
      id: detail._id,
      payload: { message: message.trim() },
    });
  };

  // Check the condition (isLoading) and run the matching branch.
  if (isLoading) {
    // Return the expression shown below to the caller.
    return (
      <div className="min-h-[60vh] bg-slate-50 p-6">
        <div className="animate-pulse rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          Loading bookings...
        </div>
      </div>
    );
  }

  // Check the condition (error) and run the matching branch.
  if (error) {
    // Return the expression shown below to the caller.
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
  // Declare metrics for use by the surrounding module or function.
  const metrics = data?.metrics || data?.data?.metrics || {};
  // Declare cancelled for use by the surrounding module or function.
  const cancelled = Number(metrics.cancelled ?? bookings.filter((booking) => booking.status === "cancelled").length);
  // Declare paid for use by the surrounding module or function.
  const paid = Number(metrics.paid ?? bookings.filter((booking) => paymentStatusOf(booking) === "paid").length);
  // Declare pendingPayments for use by the surrounding module or function.
  const pendingPayments = Number(metrics.pendingPayments ?? bookings.filter((booking) => paymentStatusOf(booking) === "pending").length);

  // Declare primaryCards for use by the surrounding module or function.
  const primaryCards = [
    ["Total Bookings", total, "text-sky-800"],
    ["Pending Payments", pendingPayments, "text-amber-800"],
    ["Paid", paid, "text-emerald-800"],
    ["Cancelled", cancelled, "text-rose-800"],
  ];

  // Return the expression shown below to the caller.
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
