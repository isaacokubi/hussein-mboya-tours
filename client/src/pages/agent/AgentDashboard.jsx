import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { fetchAgentDashboard } from "../../api/agentApi";

const money = (value) => `KES ${Number(value || 0).toLocaleString()}`;
const StatCard = ({ label, value, hint, tone = "blue" }) => (
  <div className={`agent-stat-card rounded-2xl border p-5 shadow-sm agent-stat-${tone}`}>
    <p className="text-sm font-semibold text-slate-600">{label}</p>
    <p className="mt-2 text-2xl font-black text-indigo-950">{value}</p>
    {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
  </div>
);
const bookingStatus = (booking) => booking?.status || booking?.bookingStatus || "pending";
const customerName = (booking) => { const c = booking?.customer; if (c?.name) return c.name; const full = `${c?.firstName || ""} ${c?.lastName || ""}`.trim(); return full || booking?.customerSnapshot?.name || booking?.contact?.name || "Customer unavailable"; };

export default function AgentDashboard() {
  const { user } = useAuth();
  const agentKey = user?._id || user?.id || user?.email || "current";
  const { data: response, isLoading, isError, error, refetch, isFetching } = useQuery({ queryKey: ["agent-dashboard", agentKey], queryFn: fetchAgentDashboard, enabled: Boolean(user), retry: 1, staleTime: 30000, refetchOnMount: "always", refetchOnWindowFocus: true });
  const payload = response?.data || {};
  const stats = payload?.statistics || payload?.stats || {};
  const recentBookings = Array.isArray(payload?.recentBookings) ? payload.recentBookings : Array.isArray(payload?.bookings) ? payload.bookings : [];
  const agentStatus = String(payload?.agent?.status || "active").toLowerCase();
  const isApproved = Boolean(payload?.agent?.isApproved);
  const statusLabel = agentStatus === "active" ? "Active" : agentStatus === "suspended" ? "Suspended" : "Inactive";
  const statusClass = agentStatus === "active" ? "bg-emerald-100 text-emerald-700" : agentStatus === "suspended" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700";
  const statusCode = error?.response?.status;
  if (isLoading) return <div className="p-6 text-slate-600">Loading agent dashboard...</div>;
  if (isError) return <div className="m-6 rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-orange-50 p-5 text-red-700"><p className="font-semibold">Agent dashboard unavailable</p><p className="mt-1 text-sm">{statusCode === 401 ? "Your session has expired. Please sign in again." : statusCode === 403 ? "Your account is not authorized for the agent dashboard." : error?.response?.data?.message || error?.message || "Unable to load the agent dashboard."}</p><div className="mt-4 flex gap-2"><button onClick={() => refetch()} disabled={isFetching} className="rounded-lg bg-gradient-to-r from-red-600 to-orange-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">{isFetching ? "Retrying..." : "Retry"}</button>{statusCode === 401 && <a href="/login" className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium">Sign in</a>}</div></div>;

  return (
    <section className="agent-dashboard space-y-6 p-4 sm:p-6">
      <div className="rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-700 p-5 text-white shadow-xl sm:p-7">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h1 className="text-3xl font-black">Agent Dashboard</h1><p className="mt-1 text-sm text-blue-100">{payload?.agent?.companyName || "Agent operations"}</p></div><div className="flex items-center gap-3"><span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass}`}>{statusLabel}</span><button onClick={() => refetch()} disabled={isFetching} className="rounded-xl border border-white/30 bg-white/15 px-4 py-2 text-sm font-bold text-white backdrop-blur hover:bg-white/25 disabled:opacity-60">{isFetching ? "Refreshing..." : "Refresh"}</button></div></div>
      </div>
      {!isApproved && <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 px-4 py-3 text-sm text-amber-800"><span className="font-semibold">Approval pending:</span> your agent account is active, but it has not yet been approved for agent operations.</div>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard tone="blue" label="Bookings" value={stats.bookings ?? 0} hint="Active agent bookings" /><StatCard tone="violet" label="Upcoming" value={stats.upcomingBookings ?? 0} hint="Confirmed future trips" /><StatCard tone="green" label="Completed" value={stats.completedTours ?? 0} hint="Completed bookings" /><StatCard tone="amber" label="Pending" value={stats.pendingBookings ?? 0} hint="Awaiting processing" /><StatCard tone="rose" label="Total Sales" value={money(stats.totalSales)} hint="Paid booking sales" /><StatCard tone="indigo" label="Commission" value={money(stats.totalCommission)} hint={`${Number(payload?.agent?.commissionRate ?? 0)}% earned`} /><StatCard tone="cyan" label="Customers" value={stats.totalCustomers ?? 0} hint="Unique non-cancelled customers" /><StatCard tone="orange" label="Guests" value={stats.totalGuests ?? 0} hint="Guests on non-cancelled bookings" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-indigo-100 bg-white/95 p-5 shadow-lg"><h2 className="font-bold text-indigo-950">Agent account</h2><dl className="mt-4 space-y-3 text-sm"><div className="flex justify-between gap-4"><dt className="text-slate-500">Status</dt><dd className="font-medium capitalize">{payload?.agent?.status || "—"}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">Approval</dt><dd className="font-medium">{isApproved ? "Approved" : "Pending"}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">Commission rate</dt><dd className="font-medium">{payload?.agent?.commissionRate ?? 0}%</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">Total commission</dt><dd className="font-medium">{money(stats.totalCommission)}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">Pending commission</dt><dd className="font-medium">{money(stats.pendingCommission)}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">Paid commission</dt><dd className="font-medium">{money(stats.paidCommission)}</dd></div><div className="flex justify-between gap-4 border-t border-indigo-100 pt-3"><dt className="font-semibold text-indigo-900">Wallet balance</dt><dd className="font-semibold text-indigo-900">{money(payload?.agent?.walletBalance)}</dd></div></dl></div>
        <div className="rounded-2xl border border-violet-100 bg-white/95 p-5 shadow-lg lg:col-span-2"><div className="flex items-center justify-between gap-3"><h2 className="font-bold text-violet-950">Recent bookings</h2><span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">Latest {Math.min(5, recentBookings.length)}</span></div><div className="mt-4 overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="border-b border-violet-100 bg-violet-50/60 text-left text-violet-700"><th className="px-3 py-2">Customer</th><th className="px-3 py-2">Tour</th><th className="px-3 py-2">Travel date</th><th className="px-3 py-2">Amount</th><th className="px-3 py-2">Payment</th><th className="px-3 py-2">Status</th></tr></thead><tbody>{recentBookings.length === 0 ? <tr><td colSpan="6" className="px-3 py-6 text-center text-slate-500">No recent bookings found.</td></tr> : recentBookings.map((booking) => <tr key={booking._id} className="border-b border-slate-100 last:border-0 hover:bg-indigo-50/40"><td className="px-3 py-3">{customerName(booking)}</td><td className="px-3 py-3">{booking.tour?.title || booking.tour?.name || "Tour unavailable"}</td><td className="px-3 py-3">{booking.travelDate ? new Date(booking.travelDate).toLocaleDateString("en-KE") : "—"}</td><td className="px-3 py-3 font-bold text-indigo-700">{money(booking.totalAmount ?? booking.amount)}</td><td className="px-3 py-3"><span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold capitalize text-emerald-700">{booking.paymentStatus || "pending"}</span></td><td className="px-3 py-3"><span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold capitalize text-blue-700">{bookingStatus(booking)}</span></td></tr>)}</tbody></table></div></div>
      </div>
    </section>
  );
}
