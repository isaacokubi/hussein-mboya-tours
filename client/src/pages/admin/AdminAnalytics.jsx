import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Users, CalendarCheck, Car, Trophy, WalletCards, RefreshCw } from "lucide-react";
import { getAnalytics } from "../../api/analyticsApi";

const idLabel = (value) => value ? String(value).slice(-8).toUpperCase() : "—";
const displayStatus = (value, fallback = "Not recorded") => {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (!normalized || normalized === "unknown" || normalized === "null" || normalized === "undefined") return fallback;
  return normalized.replace(/[_-]+/g, " ");
};
const tourTitle = (item) => item?.tour?.title || item?.title || (item?._id ? `Tour ID: ${idLabel(item._id)}` : "Tour not linked");

export default function AdminAnalytics() {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({ queryKey: ["analytics"], queryFn: () => getAnalytics(), staleTime: 30_000, retry: 2, refetchOnWindowFocus: false });
  const payload = data?.data || data || {};
  const revenue = payload.revenue || {};
  const bookingsSeries = Array.isArray(payload.bookings) ? payload.bookings : [];
  const bookingStatus = (Array.isArray(payload.bookingStatus) ? payload.bookingStatus : []).map((item) => ({ ...item, _id: displayStatus(item?._id) }));
  const monthlyRevenue = Array.isArray(payload.monthlyRevenue) ? payload.monthlyRevenue : [];
  const vehicleStats = (Array.isArray(payload.vehicleStats) ? payload.vehicleStats : []).map((item) => ({ ...item, _id: displayStatus(item?._id) }));
  const popularTours = Array.isArray(payload.popularTours) ? payload.popularTours : [];
  const profitability = payload.profitability || {};
  const customerCount = Number(payload.customers || 0);
  const bookingCount = bookingsSeries.reduce((sum, item) => sum + Number(item.bookings || 0), 0);

  if (isLoading) return <div className="min-h-screen bg-slate-100 p-8 text-slate-600">Loading analytics...</div>;
  if (isError && !data) return <div className="min-h-screen bg-slate-100 p-8"><div className="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm"><p className="font-semibold text-red-700">Failed to load analytics.</p><button type="button" onClick={refetch} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-700 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-800"><RefreshCw size={16} />Retry</button></div></div>;

  const cards = [
    ["Confirmed payment revenue", `KES ${Number(revenue.totalRevenue || 0).toLocaleString()}`, WalletCards],
    ["Customers", customerCount, Users],
    ["Bookings", bookingCount, CalendarCheck],
    ["Fleet", vehicleStats.reduce((n, i) => n + Number(i.count || 0), 0), Car],
  ];

  return <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8"><div className="mx-auto max-w-7xl">
    <div className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 p-6 shadow-lg sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-sm font-semibold uppercase tracking-wider text-sky-300">Business intelligence</p><h1 className="mt-1 text-3xl font-bold text-white">Analytics & Performance</h1><p className="mt-1 max-w-4xl text-slate-300">Revenue and paid-tour performance are based only on confirmed payments. Contribution margin is an operational indicator after recorded agent commissions; supplier and vehicle costs can be added later for full net-profit accounting.</p></div><button type="button" onClick={() => refetch()} disabled={isFetching} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"><RefreshCw className={isFetching ? "animate-spin" : ""} size={16} />Refresh</button></div>
    </div>
    <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{cards.map(([label, value, Icon]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex justify-between"><span className="text-sm text-slate-500">{label}</span><Icon className="text-indigo-700" size={20} /></div><p className="mt-3 text-3xl font-bold text-slate-950">{value}</p></div>)}</div>
    <div className="mt-6 grid gap-4 md:grid-cols-4">
      <Metric label="Collected revenue" value={`KES ${Number(profitability.collectedRevenue || revenue.totalRevenue || 0).toLocaleString()}`} />
      <Metric label="Commission cost" value={`KES ${Number(profitability.commissionCost || 0).toLocaleString()}`} />
      <Metric label="Contribution margin" value={`KES ${Number(profitability.contributionMargin || 0).toLocaleString()}`} />
      <Metric label="Margin" value={`${Number(profitability.marginPercent || 0)}%`} />
    </div>
    <div className="grid gap-6 lg:grid-cols-2">
      <ChartCard title="Monthly collected revenue"><ResponsiveContainer width="100%" height={320}><BarChart data={monthlyRevenue}><XAxis dataKey="_id.month" /><YAxis /><Tooltip formatter={(v) => `KES ${Number(v).toLocaleString()}`} /><Bar dataKey="revenue" /></BarChart></ResponsiveContainer></ChartCard>
      <ChartCard title="Booking status"><ResponsiveContainer width="100%" height={320}><PieChart><Pie data={bookingStatus} dataKey="count" nameKey="_id" outerRadius={110} label>{bookingStatus.map((_, i) => <Cell key={i} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></ChartCard>
    </div>
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center gap-2"><Trophy className="text-amber-600" /><h2 className="text-xl font-bold text-slate-950">Most popular tours</h2></div><p className="mt-1 text-sm text-slate-500">Ranked by confirmed payments. Recognized revenue comes only from completed payment records.</p><div className="mt-5 overflow-x-auto"><table className="w-full"><thead className="bg-slate-50"><tr><th className="p-3 text-left text-xs uppercase tracking-wide text-slate-500">Rank</th><th className="p-3 text-left text-xs uppercase tracking-wide text-slate-500">Tour</th><th className="p-3 text-left text-xs uppercase tracking-wide text-slate-500">Confirmed payments</th><th className="p-3 text-left text-xs uppercase tracking-wide text-slate-500">Recognized revenue</th></tr></thead><tbody>{popularTours.map((item, i) => <tr key={item._id || i} className="border-t border-slate-100"><td className="p-3 font-bold text-indigo-700">#{i + 1}</td><td className="p-3 font-semibold text-slate-900">{tourTitle(item)}</td><td className="p-3 text-slate-600">{Number(item.confirmedPaidBookings || 0).toLocaleString()}</td><td className="p-3 font-semibold text-slate-900">KES {Number(item.revenue || 0).toLocaleString()}</td></tr>)}{!popularTours.length && <tr><td colSpan="4" className="p-8 text-center text-slate-500">No tour data yet.</td></tr>}</tbody></table></div></div>
    <div className="mt-6 grid gap-6 lg:grid-cols-2"><StatusSummary title="Booking status details" items={bookingStatus} /><StatusSummary title="Fleet status details" items={vehicleStats} /></div>
  </div></div>;
}
function Metric({ label, value }) { return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold text-slate-950">{value}</p></div>; }
function ChartCard({ title, children }) { return <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="mb-4 text-lg font-bold text-slate-950">{title}</h2>{children}</div>; }
function StatusSummary({ title, items }) { return <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-bold text-slate-950">{title}</h2>{items.length ? <div className="mt-4 space-y-2">{items.map((item, index) => <div key={`${item._id}-${index}`} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"><span className="font-medium capitalize text-slate-700">{displayStatus(item._id)}</span><span className="font-bold text-indigo-700">{Number(item.count || 0).toLocaleString()}</span></div>)} </div> : <p className="mt-4 text-sm text-slate-500">No status data recorded.</p>}</div>; }
