import { useQuery } from "@tanstack/react-query";
import { fetchAgentDashboard } from "../../api/agentApi";

const money = (value) => `KES ${Number(value || 0).toLocaleString()}`;
const StatCard = ({ label, value, hint }) => (
  <div className="rounded-xl border bg-white p-5 shadow-sm">
    <p className="text-sm text-gray-500">{label}</p>
    <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
    {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
  </div>
);
const bookingStatus = (booking) => booking?.status || booking?.bookingStatus || "pending";
const customerName = (booking) => {
  const c = booking?.customer;
  if (c?.name) return c.name;
  const full = `${c?.firstName || ""} ${c?.lastName || ""}`.trim();
  return full || booking?.customerSnapshot?.name || booking?.contact?.name || "Customer unavailable";
};

export default function AgentDashboard() {
  const { data: response, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["agent-dashboard"],
    queryFn: fetchAgentDashboard,
    retry: false,
    staleTime: 30000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const payload = response?.data || {};
  const stats = payload?.statistics || payload?.stats || {};
  const recentBookings = Array.isArray(payload?.recentBookings)
    ? payload.recentBookings
    : Array.isArray(payload?.bookings)
      ? payload.bookings
      : [];
  const agentStatus = String(payload?.agent?.status || "active").toLowerCase();
  const isApproved = Boolean(payload?.agent?.isApproved);
  const statusLabel = agentStatus === "active" ? "Active" : agentStatus === "suspended" ? "Suspended" : "Inactive";
  const statusClass = agentStatus === "active"
    ? "bg-green-100 text-green-700"
    : agentStatus === "suspended"
      ? "bg-red-100 text-red-700"
      : "bg-gray-100 text-gray-700";
  const statusCode = error?.response?.status;
  const walletBalance = Number(payload?.agent?.walletBalance ?? stats.pendingCommission ?? 0);

  if (isLoading) return <div className="p-6 text-gray-600">Loading agent dashboard...</div>;

  if (isError) {
    return (
      <div className="m-6 rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
        <p className="font-semibold">Agent dashboard unavailable</p>
        <p className="mt-1 text-sm">
          {statusCode === 401
            ? "Your session has expired. Please sign in again."
            : statusCode === 403
              ? "Your account is not authorized for the agent dashboard."
              : error?.response?.data?.message || error?.message || "Unable to load the agent dashboard."}
        </p>
        <div className="mt-4 flex gap-2">
          <button onClick={() => refetch()} disabled={isFetching} className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
            {isFetching ? "Retrying..." : "Retry"}
          </button>
          {statusCode === 401 && (
            <a href="/login" className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium">Sign in</a>
          )}
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-6 p-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agent Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">{payload?.agent?.companyName || "Agent operations"}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}>{statusLabel}</span>
          <button onClick={() => refetch()} disabled={isFetching} className="rounded-lg border bg-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-gray-50 disabled:opacity-60">
            {isFetching ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {!isApproved && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <span className="font-semibold">Approval pending:</span> your agent account is active, but it has not yet been approved for agent operations.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Bookings" value={stats.bookings ?? 0} hint="All agent bookings" />
        <StatCard label="Upcoming" value={stats.upcomingBookings ?? 0} hint="Confirmed future trips" />
        <StatCard label="Completed" value={stats.completedTours ?? 0} hint="Completed bookings" />
        <StatCard label="Pending" value={stats.pendingBookings ?? 0} hint="Awaiting processing" />
        <StatCard label="Cancelled" value={stats.cancelledBookings ?? 0} hint="Cancelled bookings" />
        <StatCard label="Total Sales" value={money(stats.totalSales)} hint="Paid booking sales" />
        <StatCard label="Outstanding" value={money(stats.outstandingSales)} hint="Customer balance still due" />
        <StatCard label="Commission" value={money(stats.totalCommission)} hint={`${Number(payload?.agent?.commissionRate ?? 0)}% earned`} />
        <StatCard label="Wallet" value={money(walletBalance)} hint="Unpaid commission balance" />
        <StatCard label="Customers" value={stats.totalCustomers ?? 0} hint={`${stats.totalGuests ?? 0} non-cancelled guests`} />
      </div>

      <div className="rounded-2xl border border-green-200 bg-green-50 p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-green-800">Agent wallet</p>
            <p className="mt-1 text-3xl font-bold text-green-950">{money(walletBalance)}</p>
            <p className="mt-1 text-sm text-green-800">Commission earned but not yet paid out.</p>
          </div>
          <div className="grid grid-cols-2 gap-6 text-sm sm:min-w-[320px]">
            <div>
              <p className="text-green-700">Pending</p>
              <p className="mt-1 font-semibold text-green-950">{money(stats.pendingCommission)}</p>
            </div>
            <div>
              <p className="text-green-700">Paid</p>
              <p className="mt-1 font-semibold text-green-950">{money(stats.paidCommission)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900">Agent account</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4"><dt className="text-gray-500">Status</dt><dd className="font-medium capitalize">{payload?.agent?.status || "—"}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-gray-500">Approval</dt><dd className="font-medium">{isApproved ? "Approved" : "Pending"}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-gray-500">Commission rate</dt><dd className="font-medium">{payload?.agent?.commissionRate ?? 0}%</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-gray-500">Total commission</dt><dd className="font-medium">{money(stats.totalCommission)}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-gray-500">Pending commission</dt><dd className="font-medium">{money(stats.pendingCommission)}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-gray-500">Paid commission</dt><dd className="font-medium">{money(stats.paidCommission)}</dd></div>
            <div className="flex justify-between gap-4 border-t pt-3"><dt className="font-semibold text-gray-700">Wallet balance</dt><dd className="font-semibold text-green-700">{money(walletBalance)}</dd></div>
          </dl>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold text-gray-900">Recent bookings</h2>
            <span className="text-xs text-gray-500">Latest {Math.min(5, recentBookings.length)}</span>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="px-3 py-2">Customer</th>
                  <th className="px-3 py-2">Tour</th>
                  <th className="px-3 py-2">Travel date</th>
                  <th className="px-3 py-2">Amount</th>
                  <th className="px-3 py-2">Payment</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.length === 0 ? (
                  <tr><td colSpan="6" className="px-3 py-6 text-center text-gray-500">No recent bookings found.</td></tr>
                ) : recentBookings.map((booking) => (
                  <tr key={booking._id} className="border-b last:border-0">
                    <td className="px-3 py-3">{customerName(booking)}</td>
                    <td className="px-3 py-3">{booking.tour?.title || booking.tour?.name || "Tour unavailable"}</td>
                    <td className="px-3 py-3">{booking.travelDate ? new Date(booking.travelDate).toLocaleDateString() : "—"}</td>
                    <td className="px-3 py-3">{money(booking.totalAmount ?? booking.amount)}</td>
                    <td className="px-3 py-3"><span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs capitalize">{booking.paymentStatus || "pending"}</span></td>
                    <td className="px-3 py-3"><span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs capitalize">{bookingStatus(booking)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
