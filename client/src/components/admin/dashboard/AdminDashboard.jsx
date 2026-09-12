import { useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock3, Users } from "lucide-react";
import { toast } from "react-toastify";
import { getDashboard } from "../../../api/adminApi";
import { approveAgent, getAgents } from "../../../api/adminAgentApi";
import { useTenant } from "../../../context/TenantContext";
import { useSettings } from "../../../context/SettingsContext";
import DashboardHeader from "./DashboardHeader";
import StatsGrid from "./StatsGrid";
import PopularTours from "./PopularTours";
import RecentBookings from "./RecentBookings";
import PaymentAnalytics from "./PaymentAnalytics";
import QuickActions from "./QuickActions";
import SystemHealth from "./SystemHealth";

const unwrap = (payload) => payload?.data ?? payload ?? {};
const asArray = (value) => Array.isArray(value) ? value : [];
const BOOKING_STATUSES = ["pending", "confirmed", "assigned", "ongoing", "completed", "cancelled", "refunded"];
const statusStyles = { pending: "border-amber-200 bg-amber-50 text-amber-800", confirmed: "border-emerald-200 bg-emerald-50 text-emerald-800", assigned: "border-cyan-200 bg-cyan-50 text-cyan-800", ongoing: "border-indigo-200 bg-indigo-50 text-indigo-800", completed: "border-blue-200 bg-blue-50 text-blue-800", cancelled: "border-red-200 bg-red-50 text-red-800", refunded: "border-violet-200 bg-violet-50 text-violet-800" };

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const { tenant } = useTenant() || {};
  const { settings = {} } = useSettings() || {};
  const tenantKey = tenant?._id || tenant?.id || tenant?.slug || "current";
  const currency = String(settings.currencySymbol || settings.currency || "KSh").trim() || "KSh";
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({ queryKey: ["admin-dashboard", tenantKey], queryFn: getDashboard, staleTime: 30_000, refetchInterval: 60_000, refetchIntervalInBackground: false, refetchOnMount: "always", refetchOnWindowFocus: true, retry: 1 });
  const { data: agents = [], isLoading: agentsLoading, isError: agentsError } = useQuery({ queryKey: ["agents", tenantKey], queryFn: getAgents, staleTime: 30_000, refetchInterval: 60_000, refetchOnWindowFocus: true, retry: 1 });
  const approve = useMutation({ mutationFn: approveAgent, onSuccess: () => { toast.success("Agent approved successfully."); void queryClient.invalidateQueries({ queryKey: ["agents", tenantKey] }); void queryClient.invalidateQueries({ queryKey: ["admin-dashboard", tenantKey] }); }, onError: (e) => toast.error(e?.response?.data?.message || "Unable to approve agent.") });
  useEffect(() => { const refresh = () => { void refetch(); void queryClient.invalidateQueries({ queryKey: ["agents", tenantKey] }); }; window.addEventListener("dashboard:data-changed", refresh); return () => window.removeEventListener("dashboard:data-changed", refresh); }, [refetch, queryClient, tenantKey]);
  const dashboard = useMemo(() => unwrap(data), [data]);
  const summary = dashboard.summary || {};
  const paymentStats = dashboard.paymentStats || {};
  const recentBookings = asArray(dashboard.recentBookings);
  const popularTours = asArray(dashboard.popularTours);
  const monthlyRevenue = asArray(dashboard.monthlyRevenue);
  const bookingStatus = asArray(dashboard.status || dashboard.statusData);
  const bookingStatusCounts = useMemo(() => { const counts = Object.fromEntries(BOOKING_STATUSES.map((s) => [s, 0])); bookingStatus.forEach((x) => { const s = String(x?.status ?? x?._id ?? "").trim().toLowerCase(); if (s in counts) counts[s] += Number(x?.count || 0); }); return counts; }, [bookingStatus]);
  const pendingAgents = useMemo(() => agents.filter((a) => !a.isApproved && String(a.status || "").toLowerCase() !== "approved"), [agents]);
  const statusTotal = Object.values(bookingStatusCounts).reduce((a, b) => a + b, 0);
  const bookingTotal = Number(dashboard.bookings ?? summary.bookings ?? 0);

  if (isLoading) return <div className="min-h-screen bg-slate-100 p-8 text-slate-600">Loading admin dashboard...</div>;
  if (isError) return <div className="min-h-screen bg-slate-100 p-8"><div className="max-w-2xl rounded-xl border border-red-200 bg-white p-6 shadow-sm"><h2 className="font-semibold text-red-700">Unable to load Admin Dashboard</h2><p className="mt-2 text-gray-600">{error?.response?.data?.message || error?.message || "Dashboard request failed."}</p><button type="button" onClick={() => void refetch()} className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-white">Retry</button></div></div>;

  return <div className="min-h-screen space-y-7 bg-gradient-to-br from-slate-100 via-sky-50 to-indigo-100 p-5 lg:p-8">
    <DashboardHeader />
    <div className="rounded-2xl border border-sky-200 bg-gradient-to-r from-sky-700 via-indigo-700 to-violet-700 p-5 text-white shadow-md"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-2xl font-bold">Business Overview</h2><p className="text-sm text-sky-100">Live tenant-scoped operational, booking and payment metrics.</p></div><button type="button" onClick={() => void refetch()} disabled={isFetching} className="rounded-lg bg-white/15 px-4 py-2 text-sm font-bold text-white ring-1 ring-white/30 backdrop-blur hover:bg-white/25 disabled:opacity-60">{isFetching ? "Refreshing..." : "Refresh Dashboard"}</button></div></div>
    <StatsGrid stats={dashboard} summary={summary} />
    <section className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-5 shadow-sm sm:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-2"><Clock3 className="h-5 w-5 text-amber-600" /><h2 className="text-xl font-bold text-slate-900">Agent Approvals</h2></div><p className="mt-1 text-sm text-slate-600">Review and approve agent accounts before they begin agent operations.</p></div><div className="rounded-full bg-amber-500 px-3 py-1.5 text-sm font-bold text-white shadow-sm"><Users className="mr-1 inline h-4 w-4" />{agentsLoading ? "Loading..." : `${pendingAgents.length} pending`}</div></div>{agentsError ? <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Unable to load agent approval requests.</div> : agentsLoading ? <div className="mt-5 rounded-xl bg-white/70 p-5 text-sm text-slate-500">Loading agent approval requests...</div> : pendingAgents.length === 0 ? <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-5"><div className="flex items-center gap-2 font-semibold text-emerald-800"><CheckCircle2 className="h-5 w-5" />All agent accounts are approved</div></div> : <div className="mt-5 overflow-x-auto rounded-xl border border-amber-200 bg-white/80"><table className="w-full min-w-[720px] text-sm"><thead className="bg-amber-100/80 text-left text-xs uppercase tracking-wide text-amber-900"><tr><th className="px-4 py-3">Agent</th><th className="px-4 py-3">Company</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Action</th></tr></thead><tbody>{pendingAgents.slice(0, 10).map((a) => <tr key={a._id} className="border-t border-amber-100"><td className="px-4 py-4 font-semibold">{a.user?.name || a.name || "Unnamed agent"}</td><td className="px-4 py-4">{a.companyName || "—"}</td><td className="px-4 py-4">{a.user?.email || a.email || "—"}</td><td className="px-4 py-4"><span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">Pending approval</span></td><td className="px-4 py-4 text-right"><button type="button" onClick={() => approve.mutate(a._id)} disabled={approve.isPending} className="rounded-lg bg-emerald-600 px-3 py-2 font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60">{approve.isPending && approve.variables === a._id ? "Approving..." : "Approve Agent"}</button></td></tr>)}</tbody></table></div>}</section>
    <div className="grid gap-6 xl:grid-cols-3"><div className="xl:col-span-2"><RecentBookings bookings={recentBookings} /></div><PaymentAnalytics payments={paymentStats} /></div>
    <div className="grid gap-6 lg:grid-cols-2"><PopularTours tours={popularTours} /><SystemHealth /></div>
    {(monthlyRevenue.length > 0 || bookingStatus.length > 0) && <div className="grid gap-6 lg:grid-cols-2"><section className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-6 shadow-sm"><h2 className="mb-5 text-xl font-bold text-slate-900">Revenue Trend</h2>{monthlyRevenue.length === 0 ? <p className="text-slate-500">No completed payment revenue yet.</p> : monthlyRevenue.slice(-6).map((x) => <div key={x.month} className="flex items-center justify-between border-b border-blue-100 py-2"><span className="text-slate-600">{x.month}</span><strong className="text-blue-800">{currency} {Number(x.amount || 0).toLocaleString()}</strong></div>)}</section><section className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-6 shadow-sm"><div className="mb-5 flex items-center justify-between"><div><h2 className="text-xl font-bold text-slate-900">Booking Status</h2><p className="mt-1 text-sm text-slate-600">Current booking distribution for this tenant.</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold text-white ${statusTotal === bookingTotal ? "bg-emerald-600" : "bg-red-600"}`}>{statusTotal}/{bookingTotal} accounted for</span></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{BOOKING_STATUSES.map((s) => <div key={s} className={`rounded-xl border p-4 shadow-sm ${statusStyles[s]}`}><div className="flex items-center justify-between gap-3"><span className="text-sm font-semibold capitalize">{s}</span><strong className="text-2xl">{bookingStatusCounts[s].toLocaleString()}</strong></div></div>)}</div>{statusTotal !== bookingTotal && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">Dashboard data check: booking status totals do not equal total bookings. Review any unknown booking statuses instead of silently hiding them.</p>}</section></div>}
    <QuickActions />
  </div>;
}
