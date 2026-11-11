/**
 * Purpose: Agent Dashboard page-level UI component. Main declarations: hasValue, cleanText, numberOrNull, money, displayNumber.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useMemo } from "react";
// Load @tanstack/react-query so this module can use its exported dependencies.
import { useQuery } from "@tanstack/react-query";
// Load lucide-react so this module can use its exported dependencies.
import { AlertTriangle, CheckCircle2, Clock3, DollarSign, RefreshCw, ShieldCheck, Users, UserRound, Wallet, CalendarDays } from "lucide-react";
// Load ../../context/AuthContext so this module can use its exported dependencies.
import { useAuth } from "../../context/AuthContext";
// Load ../../api/agentApi so this module can use its exported dependencies.
import { fetchAgentDashboard } from "../../api/agentApi";

// Declare hasValue for use by the surrounding module or function.
const hasValue = (value) => value !== undefined && value !== null && value !== "";
// Declare cleanText for use by the surrounding module or function.
const cleanText = (value) => {
  // Check the condition (!hasValue(value)) and run the matching branch.
  if (!hasValue(value)) return "";
  // Declare text for use by the surrounding module or function.
  const text = String(value).trim();
  // Return the expression shown below to the caller.
  return /^(?:undefined(?:\s+undefined)?|null(?:\s+null)?)$/i.test(text) ? "" : text;
};
// Declare numberOrNull for use by the surrounding module or function.
const numberOrNull = (value) => {
  // Declare number for use by the surrounding module or function.
  const number = Number(value);
  // Return the expression shown below to the caller.
  return Number.isFinite(number) ? number : null;
};
// Declare money for use by the surrounding module or function.
const money = (value) => {
  // Declare number for use by the surrounding module or function.
  const number = numberOrNull(value);
  // Return the expression shown below to the caller.
  return number === null ? "—" : `KES ${number.toLocaleString("en-KE", { minimumFractionDigits: 0 })}`;
};
// Declare displayNumber for use by the surrounding module or function.
const displayNumber = (value) => numberOrNull(value) === null ? "—" : numberOrNull(value).toLocaleString("en-KE");
// Declare customerName for use by the surrounding module or function.
const customerName = (booking) => {
  // Declare customer for use by the surrounding module or function.
  const customer = booking?.customer;
  // Declare name for use by the surrounding module or function.
  const name = cleanText(customer?.name)
    || [cleanText(customer?.firstName), cleanText(customer?.lastName)].filter(Boolean).join(" ")
    || cleanText(booking?.customerSnapshot?.name)
    || cleanText(booking?.contact?.name);
  // Return the expression shown below to the caller.
  return name || cleanText(customer?.email) || cleanText(booking?.customerSnapshot?.email) || cleanText(booking?.contact?.email) || cleanText(customer?.phone) || cleanText(booking?.customerSnapshot?.phone) || cleanText(booking?.contact?.phone) || "Customer unavailable";
};
// Declare tourName for use by the surrounding module or function.
const tourName = (booking) => {
  // Declare tour for use by the surrounding module or function.
  const tour = booking?.tour;
  // Declare direct for use by the surrounding module or function.
  const direct = cleanText(tour?.title) || cleanText(tour?.name);
  // Check the condition (direct) and run the matching branch.
  if (direct) return direct;
  // Declare customDestination for use by the surrounding module or function.
  const customDestination = cleanText(booking?.customTourRequest?.destination);
  // Return the expression shown below to the caller.
  return customDestination ? `Custom trip — ${customDestination}` : "Tour unavailable";
};
// Declare normalizeStatus for use by the surrounding module or function.
const normalizeStatus = (value) => cleanText(value).replace(/[_-]+/g, " ") || "Unknown";
// Declare bookingStatus for use by the surrounding module or function.
const bookingStatus = (booking) => normalizeStatus(booking?.status || booking?.bookingStatus);
// Declare paymentStatus for use by the surrounding module or function.
const paymentStatus = (booking) => normalizeStatus(booking?.paymentStatus || booking?.payment?.status);
// Declare formatDate for use by the surrounding module or function.
const formatDate = (value) => {
  // Check the condition (!value) and run the matching branch.
  if (!value) return "—";
  // Declare date for use by the surrounding module or function.
  const date = new Date(value);
  // Return the expression shown below to the caller.
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-KE", { day: "2-digit", month: "2-digit", year: "numeric" });
};
// Declare tone for use by the surrounding module or function.
const tone = {
  indigo: "bg-indigo-50 text-indigo-700 ring-indigo-100",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
  rose: "bg-rose-50 text-rose-700 ring-rose-100",
  cyan: "bg-cyan-50 text-cyan-700 ring-cyan-100",
  violet: "bg-violet-50 text-violet-700 ring-violet-100",
};

// Define StatCard; its parameters and body implement this operation.
function StatCard({ label, value, hint, icon: Icon, color = "indigo" }) {
  // Return the expression shown below to the caller.
  return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
    <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p><p className="mt-2 text-2xl font-black text-slate-950">{value}</p><p className="mt-1 text-xs text-slate-500">{hint}</p></div><div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ${tone[color]}`}><Icon className="h-5 w-5" /></div></div>
  </article>;
}

// Define AgentDashboard; its parameters and body implement this operation.
export default function AgentDashboard() {
  // Declare { user } for use by the surrounding module or function.
  const { user } = useAuth();
  // Declare agentKey for use by the surrounding module or function.
  const agentKey = user?._id || user?.id || user?.email || "current";
  // Declare query for use by the surrounding module or function.
  const query = useQuery({ queryKey: ["agent-dashboard", agentKey], queryFn: fetchAgentDashboard, enabled: Boolean(user), retry: 1, staleTime: 30000, refetchOnMount: "always", refetchOnWindowFocus: true });
  // Declare payload for use by the surrounding module or function.
  const payload = query.data?.data || query.data || {};
  // Declare stats for use by the surrounding module or function.
  const stats = payload?.statistics || payload?.stats || {};
  // Declare recentBookings for use by the surrounding module or function.
  const recentBookings = Array.isArray(payload?.recentBookings) ? payload.recentBookings : Array.isArray(payload?.bookings) ? payload.bookings : [];
  // Declare agent for use by the surrounding module or function.
  const agent = payload?.agent || {};
  // Declare agentStatus for use by the surrounding module or function.
  const agentStatus = String(agent.status || "unknown").toLowerCase();
  // Declare isApproved for use by the surrounding module or function.
  const isApproved = agent.isApproved === true || agent.approved === true;
  // Declare statusLabel for use by the surrounding module or function.
  const statusLabel = agentStatus === "active" ? "Active" : agentStatus === "suspended" ? "Suspended" : agentStatus === "inactive" ? "Inactive" : "Unknown";
  // Declare statusClass for use by the surrounding module or function.
  const statusClass = agentStatus === "active" ? "bg-emerald-100 text-emerald-700" : agentStatus === "suspended" ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-700";
  // Declare commissionRate for use by the surrounding module or function.
  const commissionRate = numberOrNull(agent.commissionRate);
  // Declare statsMap for use by the surrounding module or function.
  const statsMap = useMemo(() => ({
    bookings: displayNumber(stats.bookings),
    upcoming: displayNumber(stats.upcomingBookings),
    completed: displayNumber(stats.completedTours),
    pending: displayNumber(stats.pendingBookings),
    sales: money(stats.totalSales),
    commission: money(stats.totalCommission),
    customers: displayNumber(stats.totalCustomers),
    guests: displayNumber(stats.totalGuests),
  }), [stats]);

  // Check the condition (query.isLoading) and run the matching branch.
  if (query.isLoading) return <div className="min-h-full bg-slate-50 p-6"><div className="mx-auto max-w-7xl animate-pulse space-y-5"><div className="h-40 rounded-3xl bg-slate-200"/><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-32 rounded-2xl bg-white"/>)}</div></div></div>;
  // Check the condition (query.isError) and run the matching branch.
  if (query.isError) return <div className="min-h-full bg-slate-50 p-6"><div className="mx-auto max-w-4xl rounded-3xl border border-rose-200 bg-white p-8 shadow-sm"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600"><AlertTriangle className="h-6 w-6"/></div><h1 className="mt-5 text-2xl font-bold text-slate-900">Agent dashboard unavailable</h1><p className="mt-2 text-sm text-slate-600">Dashboard telemetry could not be loaded. Missing data is not represented as zero.</p><p className="mt-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{query.error?.response?.data?.message || query.error?.message || "Unable to load the agent dashboard."}</p><button type="button" onClick={() => query.refetch()} disabled={query.isFetching} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60"><RefreshCw className={`h-4 w-4 ${query.isFetching ? "animate-spin" : ""}`}/> Retry</button></div></div>;

  // Return the expression shown below to the caller.
  return <section className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8"><div className="mx-auto max-w-7xl space-y-6">
    <header className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white shadow-xl"><div className="p-6 sm:p-8"><div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div><div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-indigo-100"><ShieldCheck className="h-4 w-4"/> Agent workspace</div><h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">Agent Dashboard</h1><p className="mt-2 text-sm text-slate-300">{cleanText(agent.companyName) || "Sales operations"}</p></div><div className="flex items-center gap-3"><span className={`rounded-full px-3 py-1.5 text-xs font-bold ${statusClass}`}>{statusLabel}</span><button type="button" onClick={() => query.refetch()} disabled={query.isFetching} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-bold hover:bg-white/15 disabled:opacity-60"><RefreshCw className={`h-4 w-4 ${query.isFetching ? "animate-spin" : ""}`}/> Refresh</button></div></div></div></header>
    {!isApproved && <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0"/><div><p className="font-bold">Agent approval requires attention</p><p className="mt-1 text-sm">The account is not marked as approved by the dashboard data. Confirm approval before treating sales operations as fully enabled.</p></div></div>}
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><StatCard label="Bookings" value={statsMap.bookings} hint="Active agent bookings" icon={CalendarDays} color="indigo"/><StatCard label="Upcoming" value={statsMap.upcoming} hint="Confirmed future trips" icon={Clock3} color="violet"/><StatCard label="Completed" value={statsMap.completed} hint="Completed bookings" icon={CheckCircle2} color="emerald"/><StatCard label="Pending" value={statsMap.pending} hint="Awaiting processing" icon={AlertTriangle} color="amber"/><StatCard label="Total sales" value={statsMap.sales} hint="Reported paid booking sales" icon={DollarSign} color="rose"/><StatCard label="Commission" value={statsMap.commission} hint={commissionRate === null ? "Commission rate unavailable" : `${commissionRate}% reported rate`} icon={Wallet} color="violet"/><StatCard label="Customers" value={statsMap.customers} hint="Unique non-cancelled customers" icon={Users} color="cyan"/><StatCard label="Guests" value={statsMap.guests} hint="Guests on non-cancelled bookings" icon={UserRound} color="indigo"/></div>
    <div className="grid gap-6 lg:grid-cols-3"><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-indigo-600"/><h2 className="font-bold text-slate-900">Agent account</h2></div><dl className="mt-5 space-y-3 text-sm"><div className="flex justify-between gap-4"><dt className="text-slate-500">Status</dt><dd className="font-semibold capitalize text-slate-800">{cleanText(agent.status) || "—"}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">Approval</dt><dd className="font-semibold text-slate-800">{isApproved ? "Approved" : hasValue(agent.isApproved) || hasValue(agent.approved) ? "Pending / not approved" : "—"}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">Commission rate</dt><dd className="font-semibold text-slate-800">{commissionRate === null ? "—" : `${commissionRate}%`}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">Total commission</dt><dd className="font-semibold text-slate-800">{money(stats.totalCommission)}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">Pending commission</dt><dd className="font-semibold text-amber-700">{money(stats.pendingCommission)}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">Paid commission</dt><dd className="font-semibold text-emerald-700">{money(stats.paidCommission)}</dd></div><div className="flex justify-between gap-4 border-t border-slate-100 pt-3"><dt className="font-bold text-indigo-900">Wallet balance</dt><dd className="font-bold text-indigo-900">{money(agent.walletBalance)}</dd></div></dl></section>
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="font-bold text-slate-900">Recent bookings</h2><p className="mt-0.5 text-xs text-slate-500">Latest agent booking activity returned by the API.</p></div><span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">Latest {Math.min(5, recentBookings.length)}</span></div><div className="overflow-x-auto"><table className="min-w-full text-sm"><thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Tour</th><th className="px-4 py-3">Travel date</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Payment</th><th className="px-4 py-3">Status</th></tr></thead><tbody>{recentBookings.length === 0 ? <tr><td colSpan="6" className="px-4 py-8 text-center text-slate-500">No recent bookings were returned.</td></tr> : recentBookings.map((booking, index) => <tr key={booking._id || booking.id || booking.bookingNumber || `booking-${index}`} className="border-t border-slate-100 hover:bg-indigo-50/40"><td className="whitespace-nowrap px-4 py-3 font-medium text-slate-800">{customerName(booking)}</td><td className="px-4 py-3 text-slate-700">{tourName(booking)}</td><td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDate(booking.travelDate)}</td><td className="whitespace-nowrap px-4 py-3 font-bold text-indigo-700">{money(booking.totalAmount ?? booking.amount)}</td><td className="px-4 py-3"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold capitalize text-slate-700">{paymentStatus(booking)}</span></td><td className="px-4 py-3"><span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold capitalize text-indigo-700">{bookingStatus(booking)}</span></td></tr>)}</tbody></table></div></section></div>
  </div></section>;
}
