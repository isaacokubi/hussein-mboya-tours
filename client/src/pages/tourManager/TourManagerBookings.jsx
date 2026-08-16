import { useMemo, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  Search,
  CalendarDays,
  Users,
  UserRound,
  Mail,
  Phone,
  MapPin,
  Wallet,
  CreditCard,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Clock3,
  CircleDollarSign,
  Car,
  UserCheck,
  ReceiptText,
  Eye,
} from "lucide-react";

import {
  getBookings,
  completeBooking,
  cancelBooking,
} from "../../api/tourManagerApi";



const normalizeBookingStatus = (booking) => {
  return String(
    booking?.status ||
    booking?.bookingStatus ||
    "pending"
  )
    .trim()
    .toLowerCase();
};

const normalizePaymentStatus = (booking) => {
  return String(
    booking?.paymentStatus ||
    booking?.payment?.status ||
    "pending"
  )
    .trim()
    .toLowerCase();
};

const isBookingConfirmed = (booking) => {
  const status = normalizeBookingStatus(booking);
  const paymentStatus = normalizePaymentStatus(booking);

  /*
   * A successful payment automatically confirms a booking.
   *
   * This covers:
   * paymentStatus: "paid"
   * status: "confirmed"
   *
   * It also keeps already-confirmed bookings working.
   */
  return (
    paymentStatus === "paid" ||
    status === "confirmed"
  );
};

const getDisplayValue = (value, fallback = "") => {
  if (value === null || value === undefined) {
    return fallback;
  }

  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => getDisplayValue(item))
      .filter(Boolean)
      .join(", ");
  }

  if (typeof value === "object") {
    return (
      value?.name ||
      value?.title ||
      value?.label ||
      value?.email ||
      value?._id ||
      fallback
    );
  }

  return fallback;
};

const getTravelerCount = (travelers) => {
  if (Array.isArray(travelers)) {
    return travelers.length;
  }

  if (typeof travelers === "number") {
    return travelers;
  }

  if (typeof travelers === "string") {
    const parsed = Number(travelers);

    if (Number.isFinite(parsed)) {
      return parsed;
    }

    return 0;
  }

  if (travelers && typeof travelers === "object") {
    /*
     * Some older/custom bookings may contain a traveler object
     * instead of an array. Never render that object directly.
     */
    if (Array.isArray(travelers.travelers)) {
      return travelers.travelers.length;
    }

    if (Array.isArray(travelers.items)) {
      return travelers.items.length;
    }

    if (typeof travelers.numberOfGuests === "number") {
      return travelers.numberOfGuests;
    }

    if (typeof travelers.count === "number") {
      return travelers.count;
    }

    return 1;
  }

  return 0;
};

export default function TourManagerBookings() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["manager-bookings"],
    queryFn: getBookings,
  });

  const completeMutation = useMutation({
    mutationFn: completeBooking,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["manager-bookings"],
      });

      queryClient.invalidateQueries({
        queryKey: ["tour-manager-dashboard"],
      });

      setSelectedBooking(null);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }) =>
      cancelBooking(id, reason),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["manager-bookings"],
      });

      queryClient.invalidateQueries({
        queryKey: ["tour-manager-dashboard"],
      });

      setSelectedBooking(null);
    },
  });

  const bookings = useMemo(() => {
    const result =
      data?.bookings ||
      data?.data?.bookings ||
      data?.data ||
      data ||
      [];

    return Array.isArray(result) ? result : [];
  }, [data]);

  const normalizeBooking = (booking) => {
    const customer =
      booking?.customer ||
      booking?.user ||
      {};

    const customerSnapshot =
      booking?.customerSnapshot ||
      booking?.customerDetails ||
      booking?.customerInfo ||
      {};

    const tour =
      booking?.tour ||
      booking?.tourSnapshot ||
      booking?.tourDetails ||
      {};

    const travelerSnapshot =
      booking?.travelerSnapshot ||
      booking?.travelerDetails ||
      {};

    const customerName =
      customer?.name ||
      customerSnapshot?.name ||
      travelerSnapshot?.name ||
      booking?.name ||
      booking?.fullName ||
      "Unknown Customer";

    const customerEmail =
      customer?.email ||
      customerSnapshot?.email ||
      travelerSnapshot?.email ||
      booking?.email ||
      "";

    const customerPhone =
      customer?.phone ||
      customerSnapshot?.phone ||
      travelerSnapshot?.phone ||
      booking?.phone ||
      "";

    const tourTitle =
      tour?.title ||
      tour?.name ||
      tour?.tourName ||
      booking?.tourName ||
      booking?.packageName ||
      booking?.customTourName ||
      "Custom Tour Package";

    const destination =
      tour?.destination?.name ||
      tour?.destination ||
      booking?.destination?.name ||
      booking?.destination ||
      "";

    const travelers =
      booking?.travelers ||
      booking?.numberOfTravelers ||
      booking?.guestCount ||
      booking?.guests ||
      booking?.pax ||
      0;

    const totalAmount =
      booking?.totalAmount ??
      booking?.amount ??
      booking?.total ??
      booking?.price ??
      0;

    const assignedGuide =
      booking?.assignedGuide ||
      booking?.guide ||
      {};

    const assignedDriver =
      booking?.assignedDriver ||
      booking?.driver ||
      {};

    const assignedVehicle =
      booking?.assignedVehicle ||
      booking?.vehicle ||
      {};

    return {
      ...booking,
      customerName,
      customerEmail,
      customerPhone,
      tourTitle,
      destination,
      travelers,
      totalAmount,
      assignedGuide,
      assignedDriver,
      assignedVehicle,
    };
  };

  const normalizedBookings = useMemo(() => {
    return bookings.map(normalizeBooking);
  }, [bookings]);

  const getStatus = (booking) => {
    return String(
      booking?.status || "pending"
    )
      .trim()
      .toLowerCase();
  };

  const getPaymentStatus = (booking) => {
    return String(
      booking?.paymentStatus || "pending"
    )
      .trim()
      .toLowerCase();
  };

  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase();

    return normalizedBookings.filter((booking) => {
      const searchableText = [
        booking?.bookingNumber,
        booking?.customerName,
        booking?.customerEmail,
        booking?.customerPhone,
        booking?.tourTitle,
        booking?.destination,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query ||
        searchableText.includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        getStatus(booking) === statusFilter;

      const matchesPayment =
        paymentFilter === "all" ||
        getPaymentStatus(booking) === paymentFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPayment
      );
    });
  }, [
    normalizedBookings,
    search,
    statusFilter,
    paymentFilter,
  ]);

  const stats = useMemo(() => {
    const total = normalizedBookings.length;

    const pending = normalizedBookings.filter((booking) => {
      const status = normalizeBookingStatus(booking);
      const paymentStatus = normalizePaymentStatus(booking);

      return (
        status === "pending" &&
        paymentStatus !== "paid"
      );
    }).length;

    /*
     * IMPORTANT:
     * A booking with a successful payment is confirmed,
     * even if an old record has not yet synchronized its
     * status field.
     */
    const confirmed = normalizedBookings.filter((booking) => {
      const status = normalizeBookingStatus(booking);
      const paymentStatus = normalizePaymentStatus(booking);

      return (
        status !== "cancelled" &&
        paymentStatus !== "cancelled" &&
        (
          paymentStatus === "paid" ||
          status === "confirmed"
        )
      );
    }).length;

    const revenue = normalizedBookings.reduce(
      (sum, booking) => {
        const amount = Number(
          booking?.totalAmount ??
          booking?.amount ??
          booking?.price ??
          0
        );

        return sum + (
          Number.isFinite(amount)
            ? amount
            : 0
        );
      },
      0
    );

    return {
      total,
      pending,
      confirmed,
      revenue,
    };
  }, [normalizedBookings]);

  const formatCurrency = (amount) => {
    return `KES ${Number(
      amount || 0
    ).toLocaleString()}`;
  };

  const formatDate = (date) => {
    if (!date) return "Not scheduled";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "Invalid date";
    }

    return parsed.toLocaleDateString(
      "en-KE",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatDateTime = (date) => {
    if (!date) return "Not available";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "Invalid date";
    }

    return parsed.toLocaleString(
      "en-KE",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const getInitials = (name = "") => {
    const parts = String(name)
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (!parts.length) return "CU";

    if (parts.length === 1) {
      return parts[0]
        .substring(0, 2)
        .toUpperCase();
    }

    return `${parts[0][0]}${
      parts[parts.length - 1][0]
    }`.toUpperCase();
  };

  const getBookingNumber = (booking) => {
    return (
      booking?.bookingNumber ||
      booking?.reference ||
      booking?.bookingReference ||
      booking?.bookingCode ||
      booking?._id ||
      "Booking"
    );
  };

  const getPersonName = (person) => {
    if (!person) return "";

    return (
      person?.name ||
      person?.fullName ||
      `${person?.firstName || ""} ${
        person?.lastName || ""
      }`.trim()
    );
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-50 text-blue-700";

      case "assigned":
        return "bg-indigo-50 text-indigo-700";

      case "ongoing":
        return "bg-amber-50 text-amber-700";

      case "completed":
        return "bg-emerald-50 text-emerald-700";

      case "cancelled":
        return "bg-red-50 text-red-700";

      case "refunded":
        return "bg-purple-50 text-purple-700";

      default:
        return "bg-amber-50 text-amber-700";
    }
  };

  const getStatusDot = (status) => {
    switch (status) {
      case "confirmed":
      case "assigned":
        return "bg-blue-500";

      case "ongoing":
        return "bg-amber-500";

      case "completed":
        return "bg-emerald-500";

      case "cancelled":
        return "bg-red-500";

      case "refunded":
        return "bg-purple-500";

      default:
        return "bg-amber-500";
    }
  };

  const getPaymentClasses = (status) => {
    switch (status) {
      case "paid":
        return "bg-emerald-50 text-emerald-700";

      case "failed":
        return "bg-red-50 text-red-700";

      case "cancelled":
        return "bg-slate-100 text-slate-600";

      case "refunded":
        return "bg-purple-50 text-purple-700";

      default:
        return "bg-amber-50 text-amber-700";
    }
  };

  const handleComplete = (booking) => {
    if (!booking?._id) return;

    const confirmed = window.confirm(
      `Mark booking ${getBookingNumber(
        booking
      )} as completed?`
    );

    if (!confirmed) return;

    completeMutation.mutate(booking._id);
  };

  const handleCancel = (booking) => {
    if (!booking?._id) return;

    const reason = window.prompt(
      "Enter cancellation reason:",
      "Cancelled by tour manager"
    );

    if (reason === null) return;

    cancelMutation.mutate({
      id: booking._id,
      reason:
        reason.trim() ||
        "Cancelled by tour manager",
    });
  };

  if (isLoading) {
    return (
      <section className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="animate-pulse">
            <div className="h-8 w-64 rounded-lg bg-slate-200" />
            <div className="mt-3 h-4 w-96 max-w-full rounded bg-slate-200" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-32 animate-pulse rounded-2xl bg-white shadow-sm ring-1 ring-slate-200"
              />
            ))}
          </div>

          <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <div className="h-20 animate-pulse bg-slate-100" />

            {[1, 2, 3, 4, 5, 6].map(
              (item) => (
                <div
                  key={item}
                  className="h-24 animate-pulse border-t border-slate-100"
                />
              )
            )}
          </div>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
              <ReceiptText className="h-7 w-7 text-red-600" />
            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-900">
              Unable to load bookings
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
              {error?.response?.data?.message ||
                error?.message ||
                "Something went wrong while loading the booking list."}
            </p>

            <button
              type="button"
              onClick={() => refetch()}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">

        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-700">
              <ReceiptText className="h-4 w-4" />
              Booking Management
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Bookings
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Review customer bookings, payment status,
              travel schedules and tour assignments.
            </p>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                isFetching ? "animate-spin" : ""
              }`}
            />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Bookings
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {stats.total}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  All manager bookings
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                <ReceiptText className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Pending
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {stats.pending}
                </p>

                <p className="mt-1 text-xs text-amber-600">
                  Awaiting processing
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50">
                <Clock3 className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Confirmed
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {stats.confirmed}
                </p>

                <p className="mt-1 text-xs text-blue-600">
                  Ready for operations
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Booking Value
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {formatCurrency(stats.revenue)}
                </p>

                <p className="mt-1 text-xs text-emerald-600">
                  Current booking total
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                <CircleDollarSign className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </div>

        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 p-4 sm:p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Booking Directory
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {filteredBookings.length} of{" "}
                  {normalizedBookings.length} bookings displayed
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

                <div className="relative sm:col-span-3 xl:col-span-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="search"
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search booking, customer or tour..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div className="relative">
                  <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <select
                    value={statusFilter}
                    onChange={(event) =>
                      setStatusFilter(event.target.value)
                    }
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-sm font-medium text-slate-700 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="assigned">Assigned</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>

                <div className="relative">
                  <CreditCard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <select
                    value={paymentFilter}
                    onChange={(event) =>
                      setPaymentFilter(event.target.value)
                    }
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-sm font-medium text-slate-700 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  >
                    <option value="all">All Payments</option>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="refunded">Refunded</option>
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>

              </div>
            </div>
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[1250px]">

              <thead>
                <tr className="bg-slate-50 text-left">

                  {[
                    "Booking",
                    "Customer",
                    "Tour",
                    "Travel Date",
                    "Guests",
                    "Amount",
                    "Payment",
                    "Status",
                    "Action",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className={`px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 ${
                        heading === "Action"
                          ? "text-right"
                          : ""
                      }`}
                    >
                      {heading}
                    </th>
                  ))}

                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {filteredBookings.map((booking) => {
                  const status = getStatus(booking);
                  const paymentStatus =
                    getPaymentStatus(booking);

                  const bookingNumber =
                    getBookingNumber(booking);

                  return (
                    <tr
                      key={
                        booking?._id ||
                        bookingNumber
                      }
                      className="transition hover:bg-slate-50/80"
                    >

                      <td className="px-6 py-5">
                        <p className="font-bold text-slate-900">
                          {bookingNumber}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {formatDateTime(
                            booking?.createdAt
                          )}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                            {getInitials(
                              booking.customerName
                            )}
                          </div>

                          <div className="min-w-0">

                            <p className="max-w-[190px] truncate font-semibold text-slate-900">
                              {getDisplayValue(booking.customerName, "Unknown Customer")}
                            </p>

                            {booking.customerEmail ? (
                              <p className="mt-1 flex max-w-[210px] items-center gap-1.5 truncate text-xs text-slate-500">
                                <Mail className="h-3.5 w-3.5 shrink-0" />
                                {booking.customerEmail}
                              </p>
                            ) : booking.customerPhone ? (
                              <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                                <Phone className="h-3.5 w-3.5" />
                                {booking.customerPhone}
                              </p>
                            ) : null}

                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="max-w-[220px]">

                          <p className="font-semibold text-slate-900">
                            {getDisplayValue(booking.tourTitle, "Unknown Tour")}
                          </p>

                          {booking.destination && (
                            <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                              <MapPin className="h-3.5 w-3.5" />
                              {getDisplayValue(booking.destination)}
                            </p>
                          )}

                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <CalendarDays className="h-4 w-4 text-slate-400" />
                          {formatDate(
                            booking?.travelDate
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
                          <Users className="h-4 w-4 text-slate-500" />
                          {getTravelerCount(booking.travelers)}
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <p className="font-bold text-slate-900">
                          {formatCurrency(
                            booking.totalAmount
                          )}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold capitalize ${getPaymentClasses(
                            paymentStatus
                          )}`}
                        >
                          {paymentStatus}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold capitalize ${getStatusClasses(
                            status
                          )}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${getStatusDot(
                              status
                            )}`}
                          />
                          {status}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              setSelectedBooking(
                                booking
                              )
                            }
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                            title="View booking"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {status !== "completed" &&
                            status !== "cancelled" && (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleComplete(
                                      booking
                                    )
                                  }
                                  disabled={
                                    completeMutation.isPending
                                  }
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100 disabled:opacity-50"
                                  title="Complete booking"
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleCancel(
                                      booking
                                    )
                                  }
                                  disabled={
                                    cancelMutation.isPending
                                  }
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                                  title="Cancel booking"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              </>
                            )}

                        </div>
                      </td>

                    </tr>
                  );
                })}

              </tbody>
            </table>
          </div>

          <div className="divide-y divide-slate-100 md:hidden">

            {filteredBookings.map((booking) => {
              const status = getStatus(booking);
              const paymentStatus =
                getPaymentStatus(booking);

              return (
                <div
                  key={
                    booking?._id ||
                    getBookingNumber(booking)
                  }
                  className="p-5"
                >

                  <div className="flex items-start justify-between gap-4">

                    <div className="min-w-0">
                      <p className="truncate font-bold text-slate-900">
                        {getBookingNumber(booking)}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {formatDateTime(
                          booking?.createdAt
                        )}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedBooking(booking)
                      }
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>

                  </div>

                  <div className="mt-5 flex items-center gap-3">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                      {getInitials(
                        booking.customerName
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">
                        {getDisplayValue(booking.customerName, "Unknown Customer")}
                      </p>

                      {booking.customerEmail && (
                        <p className="mt-1 truncate text-xs text-slate-500">
                          {booking.customerEmail}
                        </p>
                      )}
                    </div>

                  </div>

                  <div className="mt-5 rounded-xl bg-slate-50 p-4">
                    <p className="font-semibold text-slate-900">
                      {getDisplayValue(booking.tourTitle, "Unknown Tour")}
                    </p>

                    {booking.destination && (
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPin className="h-3.5 w-3.5" />
                        {getDisplayValue(booking.destination)}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">

                    <div className="rounded-xl border border-slate-100 p-3">
                      <p className="text-xs text-slate-400">
                        Travel Date
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {formatDate(
                          booking?.travelDate
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-100 p-3">
                      <p className="text-xs text-slate-400">
                        Guests
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {getTravelerCount(booking.travelers)}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-100 p-3">
                      <p className="text-xs text-slate-400">
                        Amount
                      </p>

                      <p className="mt-1 text-sm font-bold text-slate-800">
                        {formatCurrency(
                          booking.totalAmount
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-100 p-3">
                      <p className="text-xs text-slate-400">
                        Payment
                      </p>

                      <span
                        className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize ${getPaymentClasses(
                          paymentStatus
                        )}`}
                      >
                        {paymentStatus}
                      </span>
                    </div>

                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">

                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold capitalize ${getStatusClasses(
                        status
                      )}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${getStatusDot(
                          status
                        )}`}
                      />

                      {status}
                    </span>

                    <div className="flex gap-2">

                      {status !== "completed" &&
                        status !== "cancelled" && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                handleComplete(
                                  booking
                                )
                              }
                              className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700"
                            >
                              Complete
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleCancel(
                                  booking
                                )
                              }
                              className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-700"
                            >
                              Cancel
                            </button>
                          </>
                        )}

                    </div>
                  </div>

                </div>
              );
            })}

          </div>

          {!filteredBookings.length && (
            <div className="px-6 py-16 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <ReceiptText className="h-7 w-7 text-slate-400" />
              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-900">
                No bookings found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                {search
                  ? `No bookings match "${search}". Try a different search term.`
                  : "There are no bookings matching the selected filters."}
              </p>

              {(search ||
                statusFilter !== "all" ||
                paymentFilter !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                    setPaymentFilter("all");
                  }}
                  className="mt-5 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Clear Filters
                </button>
              )}

            </div>
          )}

        </div>
      </div>

      {selectedBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedBooking(null);
            }
          }}
        >

          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            <div className="sticky top-0 flex items-start justify-between border-b border-slate-200 bg-white p-5 sm:p-6">

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  Booking Details
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  {getBookingNumber(
                    selectedBooking
                  )}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedBooking(null)
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
              >
                <XCircle className="h-5 w-5" />
              </button>

            </div>

            <div className="space-y-6 p-5 sm:p-6">

              <div>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-400">
                  Customer
                </h3>

                <div className="rounded-xl bg-slate-50 p-4">

                  <div className="flex items-center gap-3">

                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                      {getInitials(
                        selectedBooking.customerName
                      )}
                    </div>

                    <div>

                      <p className="font-bold text-slate-900">
                        {getDisplayValue(selectedBooking.customerName, "Unknown Customer")}
                      </p>

                      {selectedBooking.customerEmail && (
                        <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                          <Mail className="h-4 w-4" />
                          {selectedBooking.customerEmail}
                        </p>
                      )}

                      {selectedBooking.customerPhone && (
                        <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                          <Phone className="h-4 w-4" />
                          {selectedBooking.customerPhone}
                        </p>
                      )}

                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-400">
                  Tour
                </h3>

                <div className="rounded-xl border border-slate-200 p-4">

                  <p className="text-lg font-bold text-slate-900">
                    {getDisplayValue(selectedBooking.tourTitle, "Unknown Tour")}
                  </p>

                  {selectedBooking.destination && (
                    <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                      <MapPin className="h-4 w-4" />
                      {getDisplayValue(selectedBooking.destination)}
                    </p>
                  )}

                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-400">
                  Booking Information
                </h3>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-400">
                      Travel Date
                    </p>

                    <p className="mt-1 font-semibold text-slate-900">
                      {formatDate(
                        selectedBooking.travelDate
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-400">
                      Travelers
                    </p>

                    <p className="mt-1 flex items-center gap-2 font-semibold text-slate-900">
                      <Users className="h-4 w-4 text-slate-400" />
                      {getTravelerCount(selectedBooking.travelers)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-400">
                      Total Amount
                    </p>

                    <p className="mt-1 flex items-center gap-2 font-bold text-slate-900">
                      <Wallet className="h-4 w-4 text-emerald-600" />
                      {formatCurrency(
                        selectedBooking.totalAmount
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-400">
                      Payment Status
                    </p>

                    <span
                      className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-bold capitalize ${getPaymentClasses(
                        getPaymentStatus(
                          selectedBooking
                        )
                      )}`}
                    >
                      {getPaymentStatus(
                        selectedBooking
                      )}
                    </span>
                  </div>

                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-400">
                  Assignments
                </h3>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

                  <div className="rounded-xl border border-slate-200 p-4">

                    <UserCheck className="h-5 w-5 text-emerald-600" />

                    <p className="mt-3 text-xs text-slate-400">
                      Guide
                    </p>

                    <p className="mt-1 font-semibold text-slate-900">
                      {getPersonName(
                        selectedBooking.assignedGuide
                      ) || "Not assigned"}
                    </p>

                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">

                    <UserRound className="h-5 w-5 text-blue-600" />

                    <p className="mt-3 text-xs text-slate-400">
                      Driver
                    </p>

                    <p className="mt-1 font-semibold text-slate-900">
                      {getPersonName(
                        selectedBooking.assignedDriver
                      ) || "Not assigned"}
                    </p>

                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">

                    <Car className="h-5 w-5 text-indigo-600" />

                    <p className="mt-3 text-xs text-slate-400">
                      Vehicle
                    </p>

                    <p className="mt-1 font-semibold text-slate-900">
                      {selectedBooking.assignedVehicle
                        ?.name ||
                        selectedBooking
                          .assignedVehicle
                          ?.registrationNumber ||
                        "Not assigned"}
                    </p>

                  </div>

                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">

                {getStatus(
                  selectedBooking
                ) !== "completed" &&
                  getStatus(
                    selectedBooking
                  ) !== "cancelled" && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          handleCancel(
                            selectedBooking
                          )
                        }
                        disabled={
                          cancelMutation.isPending
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-50 px-5 py-2.5 text-sm font-bold text-red-700 hover:bg-red-100 disabled:opacity-50"
                      >
                        <XCircle className="h-4 w-4" />
                        Cancel Booking
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleComplete(
                            selectedBooking
                          )
                        }
                        disabled={
                          completeMutation.isPending
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Complete Booking
                      </button>
                    </>
                  )}

              </div>

            </div>
          </div>
        </div>
      )}
    </section>
  );
}
