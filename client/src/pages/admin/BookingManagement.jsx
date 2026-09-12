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
  const first = cleanText(value.firstName || value.givenName);
  const last = cleanText(value.lastName || value.familyName || value.surname);
  return `${first} ${last}`.trim();
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
  const candidates = [
    booking?.customerDisplayName,
    booking?.customer,
    booking?.customerSnapshot,
    booking?.contact,
    booking?.user,
    booking?.guestContact,
  ];

  for (const candidate of candidates) {
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

const statusBadge = (status) => {
  const value = String(status || "pending").toLowerCase();
  if (["completed", "paid"].includes(value)) return "bg-emerald-100 text-emerald-800 ring-emerald-200";
  if (["confirmed", "assigned", "ongoing"].includes(value)) return "bg-sky-100 text-sky-800 ring-sky-200";
  if (["cancelled", "refunded", "failed"].includes(value)) return "bg-rose-100 text-rose-800 ring-rose-200";
  if (["partial", "pending"].includes(value)) return "bg-amber-100 text-amber-800 ring-amber-200";
  return "bg-slate-100 text-slate-700 ring-slate-200";
};

export default function BookingManagement() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const debouncedSearch = useDebouncedValue(search, 350);

  const { data: staffResponse } = useQuery({ queryKey: ["staff"], queryFn: getStaff, staleTime: 30_000 });
  const { data: vehicleResponse } = useQuery({ queryKey: ["vehicles"], queryFn: getVehicles, staleTime: 30_000 });

  const staff = Array.isArray(staffResponse)
    ? staffResponse
    : Array.isArray(staffResponse?.data)
      ? staffResponse.data
      : Array.isArray(staffResponse?.data?.data)
        ? staffResponse.data.data
        : [];

  const guides = staff.filter((member) =>
    ["guide", "tour_guide"].includes(String(member.position || member.role || "").toLowerCase()) || member.isGuide === true
  );
  const drivers = staff.filter((member) => String(member.position || member.role || "").toLowerCase() === "driver");

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
    queryKey: ["admin-bookings", debouncedSearch, statusFilter, paymentFilter],
    queryFn: () =>
      getBookings({
        search: debouncedSearch.trim(),
        status: statusFilter === "all" ? undefined : statusFilter,
        paymentStatus: paymentFilter === "all" ? undefined : paymentFilter,
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

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
  const statusMutation = useMutation({ mutationFn: ({ id, status }) => updateBookingStatus(id, status), onSuccess: invalidate });
  const paymentMutation = useMutation({ mutationFn: ({ id, status }) => updateBookingPayment(id, { status }), onSuccess: invalidate });
  const assignMutation = useMutation({ mutationFn: ({ id, payload }) => assignBookingResources(id, payload), onSuccess: invalidate });
  const refundMutation = useMutation({ mutationFn: ({ id, payload }) => requestRefund(id, payload), onSuccess: invalidate });
  const notificationMutation = useMutation({ mutationFn: ({ id, payload }) => sendBookingNotification(id, payload) });

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
        (!term || id.includes(term) || number.includes(term) || customer.includes(term) || email.includes(term) || phone.includes(term) || tour.includes(term)) &&
        (statusFilter === "all" || booking?.status === statusFilter) &&
        (paymentFilter === "all" || payment === paymentFilter)
      );
    });
  }, [bookings, search, statusFilter, paymentFilter]);

  if (isLoading) {
    return <div className="min-h-[60vh] bg-gradient-to-br from-slate-100 via-sky-50 to-indigo-100 p-6"><div className="animate-pulse rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">Loading bookings...</div></div>;
  }

  if (error) {
    return <div className="min-h-[60vh] bg-gradient-to-br from-slate-100 via-sky-50 to-indigo-100 p-6"><div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800"><p className="font-bold">Unable to load bookings</p><p className="mt-1 text-sm">{error.message || "Please try again."}</p><button type="button" onClick={invalidate} className="mt-4 rounded-lg bg-rose-700 px-4 py-2 font-semibold text-white">Retry</button></div></div>;
  }

  const total = bookings.length;
  const cancelled = bookings.filter((b) => b.status === "cancelled").length;
  const paidBookings = bookings.filter((b) => paymentStatusOf(b) === "paid");
  const paid = paidBookings.length;
  const revenue = paidBookings.reduce((sum, booking) => sum + Math.max(0, Number(booking.paidAmount || booking.depositAmount || booking.totalAmount || booking.amount || 0)), 0);
  const pendingPayments = bookings.filter((b) => paymentStatusOf(b) === "pending").length;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  const departuresOn = (date) => bookings.filter((booking) => { const travelDate = new Date(booking.travelDate); if (Number.isNaN(travelDate.getTime())) return false; travelDate.setHours(0, 0, 0, 0); return travelDate.getTime() === date.getTime(); }).length;
  const upcoming = bookings.filter((booking) => { const travelDate = new Date(booking.travelDate); return !Number.isNaN(travelDate.getTime()) && travelDate >= new Date() && !["cancelled", "refunded", "completed"].includes(String(booking.status || "").toLowerCase()); }).length;
  const unassignedPaid = paidBookings.filter((booking) => !booking.assignedGuide && !booking.assignedVehicle).length;
  const vehicleCounts = {};
  bookings.forEach((booking) => { const id = booking.assignedVehicle?._id; if (id) vehicleCounts[id] = (vehicleCounts[id] || 0) + 1; });
  const vehicleConflicts = Object.values(vehicleCounts).filter((count) => count > 1).length;
  const guideCounts = {};
  bookings.forEach((booking) => { const guide = nameOf(booking.assignedGuide) || nameOf(booking.guide); if (guide) guideCounts[guide] = (guideCounts[guide] || 0) + 1; });
  const tourCounts = {};
  bookings.forEach((booking) => { const name = tourOf(booking); tourCounts[name] = (tourCounts[name] || 0) + 1; });
  const mostBooked = Object.entries(tourCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "None";

  const primaryCards = [
    ["Total Bookings", total, "from-sky-500 to-indigo-600", "text-sky-800"],
    ["Pending Payments", pendingPayments, "from-amber-400 to-orange-500", "text-amber-800"],
    ["Paid", paid, "from-emerald-500 to-teal-600", "text-emerald-800"],
    ["Cancelled", cancelled, "from-rose-500 to-fuchsia-600", "text-rose-800"],
    ["Revenue", `KES ${revenue.toLocaleString()}`, "from-violet-500 to-indigo-600", "text-violet-800"],
    ["Upcoming Departures", upcoming, "from-cyan-500 to-sky-600", "text-cyan-800"],
    ["Most Booked", mostBooked, "from-indigo-500 to-violet-600", "text-indigo-800"],
  ];

  return (
    <div className="min-h-full space-y-6 bg-gradient-to-br from-slate-100 via-sky-50 to-indigo-100 p-4 sm:p-6">
      <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-sky-700 via-indigo-700 to-violet-700 p-5 text-white shadow-lg sm:p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-100">Administration</p><h1 className="mt-1 text-2xl font-bold sm:text-3xl">Booking Management</h1><p className="mt-1 text-sm text-indigo-100">Monitor bookings, payments and operational assignments.</p></div>
          <div className="flex gap-2">
            <button type="button" onClick={invalidate} disabled={isFetching} className="rounded-lg bg-white/15 px-4 py-2 text-sm font-semibold ring-1 ring-white/30 hover:bg-white/25 disabled:opacity-60">{isFetching ? "Refreshing…" : "Refresh"}</button>
            <button type="button" onClick={() => exportBookingsCSV(bookings)} className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-indigo-700 shadow-sm hover:bg-sky-50">Export CSV</button>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-7">
        {primaryCards.map(([title, value, gradient, valueColor]) => (
          <div key={title} className="min-w-0 overflow-hidden rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md">
            <div className={`mb-3 h-1.5 w-12 rounded-full bg-gradient-to-r ${gradient}`} />
            <p className="truncate text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
            <p className={`mt-1 break-words text-lg font-bold leading-tight sm:text-xl ${valueColor}`}>{value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5">
        <div className="mb-3 flex items-center justify-between"><div><h2 className="text-base font-bold text-slate-900">Find bookings</h2><p className="text-xs text-slate-500">Search and filter the operational queue.</p></div><span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">{filteredBookings.length} results</span></div>
        <div className="grid gap-3 md:grid-cols-3">
          <input type="search" autoComplete="off" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Customer, email, phone, tour or ID..." className="min-w-0 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100" />
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"><option value="all">All Status</option>{["pending","confirmed","assigned","ongoing","completed","cancelled","refunded"].map((status) => <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>)}</select>
          <select value={paymentFilter} onChange={(event) => setPaymentFilter(event.target.value)} className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"><option value="all">All Payments</option>{["paid","pending","failed","partial","cancelled","refunded"].map((status) => <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>)}</select>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[["Today's Departures", departuresOn(today)], ["Tomorrow", departuresOn(tomorrow)], ["Unassigned Paid", unassignedPaid], ["Vehicle Conflicts", vehicleConflicts], ["Guide Load", Object.values(guideCounts).reduce((sum, count) => sum + count, 0)]].map(([title, value], index) => (
          <div key={title} className={`rounded-xl border p-4 shadow-sm ${index === 2 && value > 0 ? "border-amber-200 bg-amber-50" : index === 3 && value > 0 ? "border-rose-200 bg-rose-50" : "border-slate-200 bg-white"}`}><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p><p className="mt-1 text-xl font-bold text-slate-900">{value}</p></div>
        ))}
      </section>

      <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-indigo-50 px-4 py-3"><h2 className="text-base font-bold text-slate-900">Booking Queue</h2><p className="text-xs text-slate-500">Use the workflow controls to manage payment and field operations.</p></div>
        <div className="overflow-x-auto"><table className="min-w-[1450px] w-full text-sm"><thead className="bg-slate-900 text-white"><tr>{["Booking","Customer","Tour","Amount","Payment","Status","Guide","Driver","Vehicle","Workflow","Actions"].map((heading) => <th key={heading} className="whitespace-nowrap px-3 py-3 text-left text-xs font-bold uppercase tracking-wide">{heading}</th>)}</tr></thead>
          <tbody>
            {filteredBookings.map((booking) => {
              const payment = paymentStatusOf(booking);
              const status = String(booking.status || "pending").toLowerCase();
              return <tr key={booking._id} className="border-t border-slate-100 align-top transition hover:bg-indigo-50/40">
                <td className="whitespace-nowrap px-3 py-3 font-mono text-xs font-bold text-indigo-700">#{String(booking.bookingNumber || booking._id || "").slice(-8)}</td>
                <td className="px-3 py-3"><div className="max-w-[180px] truncate font-semibold text-slate-900" title={customerOf(booking)}>{customerOf(booking)}</div><div className="mt-0.5 text-xs text-slate-500">{emailOf(booking) || phoneOf(booking) || "No contact details"}</div></td>
                <td className="max-w-[220px] px-3 py-3 font-medium text-slate-700"><div className="truncate" title={tourOf(booking)}>{tourOf(booking)}</div></td>
                <td className="whitespace-nowrap px-3 py-3 font-bold text-slate-900">KES {Number(booking.totalAmount || booking.amount || 0).toLocaleString()}</td>
                <td className="px-3 py-3"><span className={`inline-flex rounded-full px-2 py-1 text-xs font-bold capitalize ring-1 ${statusBadge(payment)}`}>{payment}</span></td>
                <td className="px-3 py-3"><span className={`inline-flex rounded-full px-2 py-1 text-xs font-bold capitalize ring-1 ${statusBadge(status)}`}>{status}</span></td>
                <td className="whitespace-nowrap px-3 py-3 text-slate-600">{nameOf(booking.assignedGuide) || "Not assigned"}</td>
                <td className="whitespace-nowrap px-3 py-3 text-slate-600">{nameOf(booking.assignedDriver) || "Not assigned"}</td>
                <td className="whitespace-nowrap px-3 py-3 text-slate-600">{cleanText(booking.assignedVehicle?.registrationNumber || booking.assignedVehicle?.plateNumber || booking.assignedVehicle?.name) || "Not assigned"}</td>
                <td className="px-3 py-3"><select defaultValue="" onChange={(event) => { const action = event.target.value; if (!action) return; if (["confirmed","assigned","ongoing","completed","cancelled"].includes(action)) statusMutation.mutate({ id: booking._id, status: action }); if (action === "refund") refundMutation.mutate({ id: booking._id, payload: { reason: "Admin refund request" } }); if (action === "sms") notificationMutation.mutate({ id: booking._id, payload: { type: "confirmation", channel: "sms" } }); if (action === "payment-reminder") notificationMutation.mutate({ id: booking._id, payload: { type: "payment_reminder", channel: "whatsapp" } }); if (action === "trip-reminder") notificationMutation.mutate({ id: booking._id, payload: { type: "trip_reminder", channel: "email" } }); event.target.value = ""; }} className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs font-semibold shadow-sm"><option value="">Choose action...</option><option value="confirmed">Confirm booking</option><option value="assigned">Mark assigned</option><option value="ongoing">Start / ongoing</option><option value="completed">Mark completed</option><option value="cancelled">Cancel booking</option><option value="refund">Request refund</option><option value="sms">Send confirmation SMS</option><option value="payment-reminder">Payment reminder</option><option value="trip-reminder">Trip reminder</option></select></td>
                <td className="px-3 py-3"><div className="flex flex-wrap gap-2"><button type="button" onClick={() => setSelectedBooking(booking)} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-700">View</button><select value={status} onChange={(event) => statusMutation.mutate({ id: booking._id, status: event.target.value })} className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs"><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="assigned">Assigned</option><option value="ongoing">Ongoing</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option><option value="refunded">Refunded</option></select><select value={booking.assignedGuide?._id || ""} onChange={(event) => { if (!event.target.value) return; assignMutation.mutate({ id: booking._id, payload: { guide: event.target.value, driver: booking.assignedDriver?._id || null, vehicle: booking.assignedVehicle?._id || null } }); }} className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs"><option value="">Guide</option>{guides.map((guide) => <option key={guide._id} value={guide._id}>{nameOf(guide) || guide.email}</option>)}</select><select value={booking.assignedDriver?._id || ""} onChange={(event) => { if (!event.target.value) return; assignMutation.mutate({ id: booking._id, payload: { guide: booking.assignedGuide?._id || null, driver: event.target.value, vehicle: booking.assignedVehicle?._id || null } }); }} className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs"><option value="">Driver</option>{drivers.map((driver) => <option key={driver._id} value={driver._id}>{nameOf(driver) || driver.email}</option>)}</select><select value={booking.assignedVehicle?._id || ""} onChange={(event) => { if (!event.target.value) return; assignMutation.mutate({ id: booking._id, payload: { guide: booking.assignedGuide?._id || null, driver: booking.assignedDriver?._id || null, vehicle: event.target.value } }); }} className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs"><option value="">Vehicle</option>{vehicles.map((vehicle) => <option key={vehicle._id} value={vehicle._id}>{cleanText(vehicle.name || vehicle.registrationNumber || vehicle.plateNumber) || "Vehicle"}</option>)}</select><select value={payment} onChange={(event) => paymentMutation.mutate({ id: booking._id, status: event.target.value })} className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs">{["pending","partial","paid","failed","cancelled","refunded"].map((value) => <option key={value} value={value}>{value}</option>)}</select></div></td>
              </tr>;
            })}
            {!filteredBookings.length && <tr><td colSpan="11" className="p-12 text-center"><p className="font-semibold text-slate-700">No bookings found</p><p className="mt-1 text-sm text-slate-500">Try clearing your search or filters.</p></td></tr>}
          </tbody>
        </table></div>
      </section>

      {selectedBooking && <div className="fixed inset-0 z-[100] flex justify-end bg-slate-950/50 backdrop-blur-sm" role="dialog" aria-modal="true"><div className="h-full w-full max-w-lg overflow-y-auto bg-white shadow-2xl"><div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-sky-700 via-indigo-700 to-violet-700 p-5 text-white"><div><p className="text-xs font-semibold uppercase tracking-wider text-indigo-100">Booking</p><h2 className="text-xl font-bold">Booking Details</h2></div><button type="button" onClick={() => setSelectedBooking(null)} className="rounded-lg bg-white/15 px-3 py-2 text-sm font-bold ring-1 ring-white/30 hover:bg-white/25">Close</button></div><div className="p-5"><dl className="grid gap-3 sm:grid-cols-2">{[["Booking", selectedBooking.bookingNumber || selectedBooking._id], ["Customer", customerOf(selectedBooking)], ["Email", emailOf(selectedBooking) || "Not provided"], ["Phone", phoneOf(selectedBooking) || "Not provided"], ["Tour", tourOf(selectedBooking)], ["Amount", `KES ${Number(selectedBooking.totalAmount || selectedBooking.amount || 0).toLocaleString()}`], ["Payment", paymentStatusOf(selectedBooking)], ["Paid Amount", `KES ${Number(selectedBooking.paidAmount || selectedBooking.depositAmount || 0).toLocaleString()}`], ["M-Pesa Receipt", selectedBooking.mpesaReceiptNumber || "Pending"], ["Payment Date", selectedBooking.paymentDate ? new Date(selectedBooking.paymentDate).toLocaleString() : "Pending"], ["Status", selectedBooking.status || "pending"]].map(([label, value]) => <div key={label} className="rounded-lg bg-slate-50 p-3"><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt><dd className="mt-1 break-words text-sm font-semibold capitalize text-slate-900">{value}</dd></div>)}</dl></div></div></div>}
    </div>
  );
}
