/**
 * Purpose: Tour Manager Bookings page-level UI component. Main declarations: safeStatus, paymentStatus, personName, customerName, customerEmail.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useMemo, useState } from "react";
// Load @tanstack/react-query so this module can use its exported dependencies.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// Load react-toastify so this module can use its exported dependencies.
import { toast } from "react-toastify";
// Load lucide-react so this module can use its exported dependencies.
import {
  AlertTriangle, CalendarDays, Car, CheckCircle2, ChevronLeft, ChevronRight,
  CircleDollarSign, CreditCard, Eye, Mail, MapPin, ReceiptText, RefreshCw,
  Search, ShieldCheck, SlidersHorizontal, UserCheck, UserRound, Users, Wallet, X, XCircle,
} from "lucide-react";
// Load ../../api/tourManagerApi so this module can use its exported dependencies.
import { getBookings, completeBooking, cancelBooking } from "../../api/tourManagerApi";

// Declare STATUS_OPTIONS for use by the surrounding module or function.
const STATUS_OPTIONS = ["all", "pending", "confirmed", "assigned", "ongoing", "completed", "cancelled", "refunded"];
// Declare PAYMENT_OPTIONS for use by the surrounding module or function.
const PAYMENT_OPTIONS = ["all", "pending", "partial", "paid", "failed", "cancelled", "refunded"];
// Declare statusMeta for use by the surrounding module or function.
const statusMeta = {
  pending: { label: "Pending", classes: "bg-amber-50 text-amber-700 ring-amber-200", dot: "bg-amber-500" },
  confirmed: { label: "Confirmed", classes: "bg-blue-50 text-blue-700 ring-blue-200", dot: "bg-blue-500" },
  assigned: { label: "Assigned", classes: "bg-indigo-50 text-indigo-700 ring-indigo-200", dot: "bg-indigo-500" },
  ongoing: { label: "Ongoing", classes: "bg-violet-50 text-violet-700 ring-violet-200", dot: "bg-violet-500" },
  completed: { label: "Completed", classes: "bg-emerald-50 text-emerald-700 ring-emerald-200", dot: "bg-emerald-500" },
  cancelled: { label: "Cancelled", classes: "bg-rose-50 text-rose-700 ring-rose-200", dot: "bg-rose-500" },
  refunded: { label: "Refunded", classes: "bg-slate-100 text-slate-700 ring-slate-200", dot: "bg-slate-500" },
};
// Declare paymentMeta for use by the surrounding module or function.
const paymentMeta = {
  pending: { label: "Pending", classes: "bg-amber-50 text-amber-700 ring-amber-200" },
  partial: { label: "Partial", classes: "bg-orange-50 text-orange-700 ring-orange-200" },
  paid: { label: "Paid", classes: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  failed: { label: "Failed", classes: "bg-rose-50 text-rose-700 ring-rose-200" },
  cancelled: { label: "Cancelled", classes: "bg-slate-100 text-slate-600 ring-slate-200" },
  refunded: { label: "Refunded", classes: "bg-violet-50 text-violet-700 ring-violet-200" },
};
// Declare safeStatus for use by the surrounding module or function.
const safeStatus = (value) => String(value || "pending").trim().toLowerCase();
// Declare paymentStatus for use by the surrounding module or function.
const paymentStatus = (booking) => safeStatus(booking?.paymentStatus || booking?.payment?.status);
// Declare personName for use by the surrounding module or function.
const personName = (person) => {
  // Check the condition (!person || typeof person !== "object") and run the matching branch.
  if (!person || typeof person !== "object") return "";
  // Return the expression shown below to the caller.
  return person.name || person.fullName || [person.firstName, person.lastName].filter(Boolean).join(" ").trim();
};
// Declare customerName for use by the surrounding module or function.
const customerName = (booking) => {
  // Declare customer for use by the surrounding module or function.
  const customer = booking?.customer || {};
  // Declare display for use by the surrounding module or function.
  const display = booking?.customerDisplay || {};
  // Declare snapshot for use by the surrounding module or function.
  const snapshot = booking?.customerSnapshot || booking?.customerDetails || booking?.customerInfo || {};
  // Declare contact for use by the surrounding module or function.
  const contact = booking?.contact || {};
  // Return the expression shown below to the caller.
  return display.name || personName(customer) || personName(booking?.user) || snapshot.name || personName(snapshot) || contact.name || "Customer record unavailable";
};
// Declare customerEmail for use by the surrounding module or function.
const customerEmail = (booking) => {
  // Declare customer for use by the surrounding module or function.
  const customer = booking?.customer || {};
  // Declare display for use by the surrounding module or function.
  const display = booking?.customerDisplay || {};
  // Declare snapshot for use by the surrounding module or function.
  const snapshot = booking?.customerSnapshot || {};
  // Declare contact for use by the surrounding module or function.
  const contact = booking?.contact || {};
  // Return the expression shown below to the caller.
  return display.email || customer.email || booking?.user?.email || snapshot.email || contact.email || "";
};
// Declare customerPhone for use by the surrounding module or function.
const customerPhone = (booking) => {
  // Declare customer for use by the surrounding module or function.
  const customer = booking?.customer || {};
  // Declare display for use by the surrounding module or function.
  const display = booking?.customerDisplay || {};
  // Declare snapshot for use by the surrounding module or function.
  const snapshot = booking?.customerSnapshot || {};
  // Declare contact for use by the surrounding module or function.
  const contact = booking?.contact || {};
  // Return the expression shown below to the caller.
  return display.phone || customer.phone || booking?.user?.phone || snapshot.phone || contact.phone || "";
};
// Declare tourName for use by the surrounding module or function.
const tourName = (booking) => {
  // Declare tour for use by the surrounding module or function.
  const tour = booking?.tour || booking?.tourSnapshot || {};
  // Return the expression shown below to the caller.
  return tour.title || tour.name || booking?.tourName || booking?.packageName || booking?.customTourName || "Custom Tour Package";
};
// Declare destinationName for use by the surrounding module or function.
const destinationName = (booking) => {
  // Declare destination for use by the surrounding module or function.
  const destination = booking?.tour?.destination || booking?.destination;
  // Check the condition (!destination) and run the matching branch.
  if (!destination) return "";
  // Return the expression shown below to the caller.
  return typeof destination === "string" ? destination : destination.name || destination.title || "";
};
// Declare guestCount for use by the surrounding module or function.
const guestCount = (booking) => {
  // Declare direct for use by the surrounding module or function.
  const direct = Number(booking?.numberOfGuests ?? booking?.guestCount ?? booking?.pax);
  // Check the condition (Number.isFinite(direct)) and run the matching branch.
  if (Number.isFinite(direct)) return direct;
  // Check the condition (Array.isArray(booking?.travelers)) and run the matching branch.
  if (Array.isArray(booking?.travelers)) return booking.travelers.length;
  // Check the condition (Array.isArray(booking?.guests)) and run the matching branch.
  if (Array.isArray(booking?.guests)) return booking.guests.length;
  // Return the expression shown below to the caller.
  return null;
};
// Declare amountValue for use by the surrounding module or function.
const amountValue = (booking) => {
  // Declare numeric for use by the surrounding module or function.
  const numeric = Number(booking?.totalAmount ?? booking?.amount ?? booking?.total ?? booking?.price);
  // Return the expression shown below to the caller.
  return Number.isFinite(numeric) ? numeric : null;
};
// Declare formatKES for use by the surrounding module or function.
const formatKES = (value) => value === null || value === undefined || !Number.isFinite(Number(value)) ? "—" : `KES ${Number(value).toLocaleString("en-KE", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
// Declare formatDate for use by the surrounding module or function.
const formatDate = (value) => {
  // Check the condition (!value) and run the matching branch.
  if (!value) return "Not scheduled";
  // Declare date for use by the surrounding module or function.
  const date = new Date(value);
  // Check the condition (Number.isNaN(date.getTime())) and run the matching branch.
  if (Number.isNaN(date.getTime())) return "Invalid date";
  // Return the result of new Intl.DateTimeFormat("en-KE", { day: "2-digit", month: "short", year: "numeric", timeZone: "Africa/Nairobi" }).format() to the caller.
  return new Intl.DateTimeFormat("en-KE", { day: "2-digit", month: "short", year: "numeric", timeZone: "Africa/Nairobi" }).format(date);
};
// Declare formatDateTime for use by the surrounding module or function.
const formatDateTime = (value) => {
  // Check the condition (!value) and run the matching branch.
  if (!value) return "Not available";
  // Declare date for use by the surrounding module or function.
  const date = new Date(value);
  // Check the condition (Number.isNaN(date.getTime())) and run the matching branch.
  if (Number.isNaN(date.getTime())) return "Invalid date";
  // Return the result of new Intl.DateTimeFormat("en-KE", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Nairobi" }).format() to the caller.
  return new Intl.DateTimeFormat("en-KE", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Nairobi" }).format(date);
};
// Declare initials for use by the surrounding module or function.
const initials = (name) => {
  // Declare parts for use by the surrounding module or function.
  const parts = String(name || "CU").trim().split(/\s+/).filter(Boolean);
  // Check the condition (!parts.length) and run the matching branch.
  if (!parts.length) return "CU";
  // Check the condition (parts.length === 1) and run the matching branch.
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  // Return the result of `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase() to the caller.
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};
// Declare bookingNumber for use by the surrounding module or function.
const bookingNumber = (booking) => booking?.bookingNumber || booking?.reference || booking?.bookingReference || booking?.bookingCode || booking?._id || "Booking reference unavailable";

// Define StatusBadge; its parameters and body implement this operation.
function StatusBadge({ status }) {
  // Declare meta for use by the surrounding module or function.
  const meta = statusMeta[safeStatus(status)] || statusMeta.pending;
  // Return the expression shown below to the caller.
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${meta.classes}`}><span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />{meta.label}</span>;
}
// Define PaymentBadge; its parameters and body implement this operation.
function PaymentBadge({ status }) {
  // Declare meta for use by the surrounding module or function.
  const meta = paymentMeta[safeStatus(status)] || paymentMeta.pending;
  // Return the expression shown below to the caller.
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${meta.classes}`}>{meta.label}</span>;
}
// Define MetricCard; its parameters and body implement this operation.
function MetricCard({ icon: Icon, label, value, detail, tone }) {
  // Declare tones for use by the surrounding module or function.
  const tones = { emerald: "border-emerald-100 bg-emerald-50/70 text-emerald-700", amber: "border-amber-100 bg-amber-50/70 text-amber-700", blue: "border-blue-100 bg-blue-50/70 text-blue-700", violet: "border-violet-100 bg-violet-50/70 text-violet-700" };
  // Return the expression shown below to the caller.
  return <div className={`rounded-2xl border p-5 shadow-sm ${tones[tone] || tones.blue}`}><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] opacity-70">{label}</p><p className="mt-2 text-2xl font-black text-slate-950">{value}</p><p className="mt-1 text-xs font-medium opacity-75">{detail}</p></div><div className="rounded-xl bg-white/80 p-2.5 shadow-sm"><Icon size={20} /></div></div></div>;
}

// Define TourManagerBookings; its parameters and body implement this operation.
export default function TourManagerBookings() {
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
  // Declare { data, isLoading, isError, error, isFetching, refetch } for use by the surrounding module or function.
  const { data, isLoading, isError, error, isFetching, refetch } = useQuery({ queryKey: ["manager-bookings", page], queryFn: () => getBookings({ page, limit: 20 }), placeholderData: (previousData) => previousData });
  // Declare bookings for use by the surrounding module or function.
  const bookings = useMemo(() => { const result = data?.bookings || data?.data?.bookings || data?.data || data || []; return Array.isArray(result) ? result : []; }, [data]);
  // Declare filteredBookings for use by the surrounding module or function.
  const filteredBookings = useMemo(() => { const query = search.trim().toLowerCase(); return bookings.filter((booking) => { const haystack = [bookingNumber(booking), customerName(booking), customerEmail(booking), customerPhone(booking), tourName(booking), destinationName(booking)].filter(Boolean).join(" ").toLowerCase(); return (!query || haystack.includes(query)) && (statusFilter === "all" || safeStatus(booking.status) === statusFilter) && (paymentFilter === "all" || paymentStatus(booking) === paymentFilter); }); }, [bookings, search, statusFilter, paymentFilter]);
  // Declare metrics for use by the surrounding module or function.
  const metrics = useMemo(() => { const total = Number.isFinite(Number(data?.total)) ? Number(data.total) : bookings.length; const pending = bookings.filter((booking) => safeStatus(booking.status) === "pending").length; const operational = bookings.filter((booking) => ["confirmed", "assigned", "ongoing"].includes(safeStatus(booking.status)) && paymentStatus(booking) !== "cancelled").length; const paidValue = bookings.reduce((sum, booking) => paymentStatus(booking) === "paid" && amountValue(booking) !== null ? sum + amountValue(booking) : sum, 0); const totalValue = bookings.reduce((sum, booking) => amountValue(booking) !== null ? sum + amountValue(booking) : sum, 0); return { total, pending, operational, paidValue, totalValue }; }, [bookings, data?.total]);
  // Declare completeMutation for use by the surrounding module or function.
  const completeMutation = useMutation({ mutationFn: completeBooking, onSuccess: () => { toast.success("Booking marked as completed."); queryClient.invalidateQueries({ queryKey: ["manager-bookings"] }); queryClient.invalidateQueries({ queryKey: ["tour-manager-dashboard"] }); setSelectedBooking(null); }, onError: (mutationError) => toast.error(mutationError?.response?.data?.message || "Booking completion failed. No changes were applied.") });
  // Declare cancelMutation for use by the surrounding module or function.
  const cancelMutation = useMutation({ mutationFn: ({ id, reason }) => cancelBooking(id, reason), onSuccess: () => { toast.success("Booking cancelled successfully."); queryClient.invalidateQueries({ queryKey: ["manager-bookings"] }); queryClient.invalidateQueries({ queryKey: ["tour-manager-dashboard"] }); setSelectedBooking(null); }, onError: (mutationError) => toast.error(mutationError?.response?.data?.message || "Booking cancellation failed. No changes were applied.") });
  // Declare handleComplete for use by the surrounding module or function.
  const handleComplete = (booking) => { if (!booking?._id || completeMutation.isPending) return; if (!window.confirm(`Mark ${bookingNumber(booking)} as completed?`)) return; completeMutation.mutate(booking._id); };
  // Declare handleCancel for use by the surrounding module or function.
  const handleCancel = (booking) => { if (!booking?._id || cancelMutation.isPending) return; const reason = window.prompt("Cancellation reason:", "Cancelled by tour manager"); if (reason === null) return; cancelMutation.mutate({ id: booking._id, reason: reason.trim() || "Cancelled by tour manager" }); };
  // Declare totalPages for use by the surrounding module or function.
  const totalPages = Math.max(Number(data?.pages) || Number(data?.totalPages) || 1, 1);
  // Check the condition (isLoading) and run the matching branch.
  if (isLoading) return <div className="min-h-screen bg-slate-50 p-6"><div className="mx-auto max-w-[1600px] animate-pulse space-y-6"><div className="h-40 rounded-3xl bg-slate-200" /><div className="grid gap-4 md:grid-cols-4">{[1,2,3,4].map((item) => <div key={item} className="h-32 rounded-2xl bg-slate-200" />)}</div><div className="h-[520px] rounded-3xl bg-slate-200" /></div></div>;
  // Check the condition (isError) and run the matching branch.
  if (isError) return <section className="min-h-screen bg-slate-50 p-6"><div className="mx-auto max-w-3xl rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-sm"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600"><AlertTriangle /></div><h1 className="mt-5 text-2xl font-black text-slate-950">Bookings could not be loaded</h1><p className="mt-2 text-sm text-slate-600">The booking service did not return a usable response. Unavailable data is not represented as zero.</p><p className="mt-3 text-xs font-medium text-slate-500">{error?.response?.data?.message || error?.message || "Service unavailable"}</p><button onClick={() => refetch()} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-700"><RefreshCw size={16} />Retry</button></div></section>;
  // Return the expression shown below to the caller.
  return <section className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8"><div className="mx-auto max-w-[1600px] space-y-6">
    <header className="overflow-hidden rounded-3xl bg-slate-950 text-white shadow-xl"><div className="relative px-6 py-7 sm:px-8 lg:px-10"><div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-emerald-500/20 to-transparent" /><div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"><div><div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-emerald-300"><ShieldCheck size={14} />Tenant-scoped operations</div><h1 className="text-3xl font-black tracking-tight sm:text-4xl">Booking Operations Center</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Review customer bookings, payment state, travel schedules and operational readiness from one controlled workspace.</p></div><button onClick={() => refetch()} disabled={isFetching} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"><RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />{isFetching ? "Refreshing" : "Refresh bookings"}</button></div></div><div className="grid grid-cols-2 border-t border-white/10 sm:grid-cols-4"><div className="border-white/10 p-4 sm:border-r"><p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Records</p><p className="mt-1 text-xl font-black">{metrics.total}</p></div><div className="border-white/10 p-4 sm:border-r"><p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Pending</p><p className="mt-1 text-xl font-black text-amber-300">{metrics.pending}</p></div><div className="border-white/10 p-4 sm:border-r"><p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Operational</p><p className="mt-1 text-xl font-black text-blue-300">{metrics.operational}</p></div><div className="p-4"><p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Paid value</p><p className="mt-1 text-xl font-black text-emerald-300">{formatKES(metrics.paidValue)}</p></div></div></header>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><MetricCard icon={ReceiptText} label="Total bookings" value={metrics.total} detail="Records returned by the manager API" tone="blue" /><MetricCard icon={CircleDollarSign} label="Booking value" value={formatKES(metrics.totalValue)} detail="Value of loaded booking records" tone="emerald" /><MetricCard icon={UserCheck} label="Operational" value={metrics.operational} detail="Confirmed, assigned or ongoing" tone="violet" /><MetricCard icon={Wallet} label="Paid value" value={formatKES(metrics.paidValue)} detail="Successful payment status only" tone="emerald" /></div>
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between"><div className="relative min-w-0 flex-1 xl:max-w-xl"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search booking, customer, email, phone or tour..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-medium text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10" /></div><div className="flex flex-col gap-3 sm:flex-row"><div className="relative"><SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} /><select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }} className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-9 pr-9 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-500 sm:w-48">{STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status === "all" ? "All statuses" : statusMeta[status]?.label || status}</option>)}</select></div><div className="relative"><CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} /><select value={paymentFilter} onChange={(event) => { setPaymentFilter(event.target.value); setPage(1); }} className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-9 pr-9 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-500 sm:w-48">{PAYMENT_OPTIONS.map((status) => <option key={status} value={status}>{status === "all" ? "All payments" : paymentMeta[status]?.label || status}</option>)}</select></div>{(search || statusFilter !== "all" || paymentFilter !== "all") && <button onClick={() => { setSearch(""); setStatusFilter("all"); setPaymentFilter("all"); setPage(1); }} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50">Clear filters</button>}</div></div></div>
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"><div><h2 className="text-lg font-black text-slate-950">Booking Directory</h2><p className="mt-1 text-sm text-slate-500">Showing {filteredBookings.length} of {metrics.total} records on this page.</p></div><div className="text-xs font-semibold text-slate-400">Currency: KES · Timezone: Africa/Nairobi</div></div>{filteredBookings.length === 0 ? <div className="px-6 py-20 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><ReceiptText /></div><h3 className="mt-4 text-lg font-black text-slate-900">No bookings match these filters</h3><p className="mt-1 text-sm text-slate-500">Try a different search or clear the operational filters.</p></div> : <div className="overflow-x-auto"><table className="w-full text-left"><thead className="bg-slate-50 text-[11px] font-black uppercase tracking-[0.14em] text-slate-500"><tr><th className="px-6 py-4">Booking</th><th className="px-6 py-4">Customer</th><th className="px-6 py-4">Tour</th><th className="px-6 py-4">Travel</th><th className="px-6 py-4">Guests</th><th className="px-6 py-4">Amount</th><th className="px-6 py-4">Payment</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredBookings.map((booking) => { const status = safeStatus(booking.status); const amount = amountValue(booking); const guests = guestCount(booking); const name = customerName(booking); return <tr key={booking._id || bookingNumber(booking)} className="transition hover:bg-emerald-50/30"><td className="px-6 py-5 align-top"><button onClick={() => setSelectedBooking(booking)} className="text-left"><p className="font-black text-slate-900 hover:text-emerald-700">{bookingNumber(booking)}</p><p className="mt-1 text-xs text-slate-400">Created {formatDateTime(booking.createdAt)}</p></button></td><td className="px-6 py-5 align-top"><div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-xs font-black text-emerald-700">{initials(name)}</div><div className="min-w-0"><p className="font-bold text-slate-900">{name}</p>{customerEmail(booking) ? <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500"><Mail size={12} />{customerEmail(booking)}</p> : <p className="mt-1 text-xs italic text-slate-400">Email unavailable</p>}</div></div></td><td className="px-6 py-5 align-top"><p className="max-w-[250px] font-bold text-slate-800">{tourName(booking)}</p>{destinationName(booking) && <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500"><MapPin size={12} />{destinationName(booking)}</p>}</td><td className="px-6 py-5 align-top"><p className="flex items-center gap-1.5 whitespace-nowrap font-semibold text-slate-800"><CalendarDays size={14} className="text-emerald-600" />{formatDate(booking.travelDate)}</p></td><td className="px-6 py-5 align-top">{guests === null ? <span className="text-xs font-semibold text-slate-400">Unavailable</span> : <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-700"><Users size={13} />{guests}</span>}</td><td className="px-6 py-5 align-top"><p className="font-black text-slate-900">{formatKES(amount)}</p>{amount === null && <p className="mt-1 text-[11px] font-semibold text-amber-600">Amount unavailable</p>}</td><td className="px-6 py-5 align-top"><PaymentBadge status={paymentStatus(booking)} /></td><td className="px-6 py-5 align-top"><StatusBadge status={status} /></td><td className="px-6 py-5 text-right align-top"><div className="flex justify-end gap-2"><button title="View booking" onClick={() => setSelectedBooking(booking)} className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"><Eye size={16} /></button>{status !== "completed" && status !== "cancelled" && <button title="Complete booking" onClick={() => handleComplete(booking)} disabled={completeMutation.isPending} className="rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"><CheckCircle2 size={16} /></button>}{status !== "completed" && status !== "cancelled" && <button title="Cancel booking" onClick={() => handleCancel(booking)} disabled={cancelMutation.isPending} className="rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-rose-700 hover:bg-rose-100 disabled:opacity-50"><XCircle size={16} /></button>}</div></td></tr>; })}</tbody></table></div>}<div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"><p className="text-xs font-semibold text-slate-500">Page {page} of {totalPages}</p><div className="flex items-center gap-2"><button disabled={page <= 1 || isFetching} onClick={() => setPage((value) => Math.max(1, value - 1))} className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft size={15} />Previous</button><button disabled={page >= totalPages || isFetching} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40">Next<ChevronRight size={15} /></button></div></div></div>
    <div className="grid gap-4 md:grid-cols-3"><div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5"><div className="flex items-center gap-3"><div className="rounded-xl bg-white p-2 text-emerald-700 shadow-sm"><Wallet size={18} /></div><div><p className="text-sm font-black text-slate-900">Paid booking value</p><p className="mt-1 text-xs text-slate-600">Successful payment status only</p></div></div><p className="mt-4 text-xl font-black text-emerald-700">{formatKES(metrics.paidValue)}</p></div><div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5"><div className="flex items-center gap-3"><div className="rounded-xl bg-white p-2 text-blue-700 shadow-sm"><UserCheck size={18} /></div><div><p className="text-sm font-black text-slate-900">Operational readiness</p><p className="mt-1 text-xs text-slate-600">Confirmed, assigned or ongoing</p></div></div><p className="mt-4 text-xl font-black text-blue-700">{metrics.operational} bookings</p></div><div className="rounded-2xl border border-violet-100 bg-violet-50/60 p-5"><div className="flex items-center gap-3"><div className="rounded-xl bg-white p-2 text-violet-700 shadow-sm"><Car size={18} /></div><div><p className="text-sm font-black text-slate-900">Assignment visibility</p><p className="mt-1 text-xs text-slate-600">Inspect guide, driver and vehicle in details</p></div></div><p className="mt-4 text-sm font-bold text-violet-700">Use the booking details panel for dispatch context.</p></div></div>
  </div>
  {selectedBooking && <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedBooking(null); }}><aside className="h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl"><div className="sticky top-0 z-10 border-b border-slate-100 bg-white/95 px-6 py-5 backdrop-blur"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">Booking detail</p><h2 className="mt-1 text-xl font-black text-slate-950">{bookingNumber(selectedBooking)}</h2><p className="mt-1 text-xs text-slate-500">Created {formatDateTime(selectedBooking.createdAt)}</p></div><button onClick={() => setSelectedBooking(null)} className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"><X size={18} /></button></div></div><div className="space-y-6 p-6"><div className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><div className="flex items-center gap-4"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 font-black text-emerald-700">{initials(customerName(selectedBooking))}</div><div className="min-w-0"><p className="text-lg font-black text-slate-950">{customerName(selectedBooking)}</p><p className="mt-1 text-sm text-slate-500">{customerEmail(selectedBooking) || "Email unavailable"}</p>{customerPhone(selectedBooking) && <p className="mt-1 text-sm text-slate-500">{customerPhone(selectedBooking)}</p>}</div></div></div><div className="grid grid-cols-2 gap-3"><div className="rounded-2xl border border-slate-200 p-4"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Payment</p><div className="mt-2"><PaymentBadge status={paymentStatus(selectedBooking)} /></div></div><div className="rounded-2xl border border-slate-200 p-4"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Booking status</p><div className="mt-2"><StatusBadge status={selectedBooking.status} /></div></div></div><div className="rounded-2xl border border-slate-200 p-5"><h3 className="font-black text-slate-950">Travel plan</h3><div className="mt-4 space-y-4 text-sm"><div className="flex gap-3"><ReceiptText size={17} className="mt-0.5 text-emerald-600" /><div><p className="font-bold text-slate-900">{tourName(selectedBooking)}</p><p className="text-slate-500">{destinationName(selectedBooking) || "Destination unavailable"}</p></div></div><div className="flex gap-3"><CalendarDays size={17} className="mt-0.5 text-blue-600" /><div><p className="font-bold text-slate-900">{formatDate(selectedBooking.travelDate)}</p><p className="text-slate-500">Travel date</p></div></div><div className="flex gap-3"><Users size={17} className="mt-0.5 text-violet-600" /><div><p className="font-bold text-slate-900">{guestCount(selectedBooking) ?? "Unavailable"} {guestCount(selectedBooking) === 1 ? "guest" : "guests"}</p><p className="text-slate-500">Party size</p></div></div></div></div><div className="rounded-2xl border border-slate-200 p-5"><h3 className="font-black text-slate-950">Financial snapshot</h3><div className="mt-4 grid grid-cols-2 gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total</p><p className="mt-1 text-lg font-black text-slate-950">{formatKES(amountValue(selectedBooking))}</p></div><div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Deposit</p><p className="mt-1 text-lg font-black text-slate-950">{formatKES(Number.isFinite(Number(selectedBooking.depositAmount)) ? Number(selectedBooking.depositAmount) : null)}</p></div><div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Balance</p><p className="mt-1 text-lg font-black text-slate-950">{formatKES(Number.isFinite(Number(selectedBooking.balanceAmount)) ? Number(selectedBooking.balanceAmount) : null)}</p></div><div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Method</p><p className="mt-1 text-sm font-black text-slate-800">{selectedBooking.paymentMethod || selectedBooking.payment?.method || "Not recorded"}</p></div></div></div><div className="rounded-2xl border border-slate-200 p-5"><h3 className="font-black text-slate-950">Operational assignment</h3><div className="mt-4 space-y-3 text-sm"><div className="flex items-center gap-3"><UserRound size={17} className="text-emerald-600" /><span className="text-slate-500">Guide</span><strong className="ml-auto text-right text-slate-900">{personName(selectedBooking.assignedGuide || selectedBooking.guide) || "Not assigned"}</strong></div><div className="flex items-center gap-3"><UserCheck size={17} className="text-blue-600" /><span className="text-slate-500">Driver</span><strong className="ml-auto text-right text-slate-900">{personName(selectedBooking.assignedDriver || selectedBooking.driver) || "Not assigned"}</strong></div><div className="flex items-center gap-3"><Car size={17} className="text-violet-600" /><span className="text-slate-500">Vehicle</span><strong className="ml-auto text-right text-slate-900">{selectedBooking.assignedVehicle?.name || selectedBooking.assignedVehicle?.registrationNumber || selectedBooking.vehicle?.name || selectedBooking.vehicle?.registrationNumber || "Not assigned"}</strong></div></div></div>{selectedBooking.pickupLocation && <div className="rounded-2xl border border-slate-200 p-5"><h3 className="font-black text-slate-950">Pickup</h3><p className="mt-2 flex gap-2 text-sm text-slate-600"><MapPin size={16} className="mt-0.5 shrink-0 text-rose-500" />{selectedBooking.pickupLocation}</p></div>}<div className="flex gap-3 border-t border-slate-100 pt-5">{safeStatus(selectedBooking.status) !== "completed" && safeStatus(selectedBooking.status) !== "cancelled" && <><button onClick={() => handleComplete(selectedBooking)} disabled={completeMutation.isPending} className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white hover:bg-emerald-700 disabled:opacity-50">{completeMutation.isPending ? "Completing..." : "Mark completed"}</button><button onClick={() => handleCancel(selectedBooking)} disabled={cancelMutation.isPending} className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-black text-rose-700 hover:bg-rose-100 disabled:opacity-50">{cancelMutation.isPending ? "Cancelling..." : "Cancel"}</button></>}</div></div></aside></div>}
  </section>;
}
