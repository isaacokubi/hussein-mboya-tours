/**
 * Purpose: Admin Dashboard reusable UI component. Main declarations: unwrap, asArray, AdminDashboard.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useMemo } from "react";
// Load @tanstack/react-query so this module can use its exported dependencies.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// Load lucide-react so this module can use its exported dependencies.
import { CheckCircle2, Clock3, Users } from "lucide-react";
// Load react-toastify so this module can use its exported dependencies.
import { toast } from "react-toastify";
// Load ../../../api/adminApi so this module can use its exported dependencies.
import { getDashboard } from "../../../api/adminApi";
// Load ../../../api/adminAgentApi so this module can use its exported dependencies.
import { approveAgent, getAgents } from "../../../api/adminAgentApi";
// Load ../../../context/TenantContext so this module can use its exported dependencies.
import { useTenant } from "../../../context/TenantContext";
// Load ../../../context/AuthContext so this module can use its exported dependencies.
import { useAuth } from "../../../context/AuthContext";
// Load ../../../context/SettingsContext so this module can use its exported dependencies.
import { useSettings } from "../../../context/SettingsContext";
// Load ./DashboardHeader so this module can use its exported dependencies.
import DashboardHeader from "./DashboardHeader";
// Load ./StatsGrid so this module can use its exported dependencies.
import StatsGrid from "./StatsGrid";
// Load ./PopularTours so this module can use its exported dependencies.
import PopularTours from "./PopularTours";
// Load ./RecentBookings so this module can use its exported dependencies.
import RecentBookings from "./RecentBookings";
// Load ./PaymentAnalytics so this module can use its exported dependencies.
import PaymentAnalytics from "./PaymentAnalytics";
// Load ./QuickActions so this module can use its exported dependencies.
import QuickActions from "./QuickActions";
// Load ./SystemHealth so this module can use its exported dependencies.
import SystemHealth from "./SystemHealth";

// Declare unwrap for use by the surrounding module or function.
const unwrap = (payload) => payload?.data ?? payload ?? {};
// Declare asArray for use by the surrounding module or function.
const asArray = (value) => Array.isArray(value) ? value : [];
// Declare BOOKING_STATUSES for use by the surrounding module or function.
const BOOKING_STATUSES = ["pending", "confirmed", "assigned", "ongoing", "completed", "cancelled", "refunded"];
// Declare statusStyles for use by the surrounding module or function.
const statusStyles = { pending: "border-amber-200 bg-amber-50 text-amber-800", confirmed: "border-emerald-200 bg-emerald-50 text-emerald-800", assigned: "border-cyan-200 bg-cyan-50 text-cyan-800", ongoing: "border-indigo-200 bg-indigo-50 text-indigo-800", completed: "border-blue-200 bg-blue-50 text-blue-800", cancelled: "border-red-200 bg-red-50 text-red-800", refunded: "border-violet-200 bg-violet-50 text-violet-800" };

// Define AdminDashboard; its parameters and body implement this operation.
export default function AdminDashboard() {
  // Declare queryClient for use by the surrounding module or function.
  const queryClient = useQueryClient();
  // Declare { tenant } for use by the surrounding module or function.
  const { tenant } = useTenant() || {};
  // Declare { user } for use by the surrounding module or function.
  const { user } = useAuth() || {};
  // Declare { settings = {} } for use by the surrounding module or function.
  const { settings = {} } = useSettings() || {};
  // Authenticated tenant identity is authoritative. Tenant branding can omit an
  // ID/slug on the shared Vercel hostname, so relying on it alone collapses
  // different companies into the same React Query cache key ("current").
  // Declare authenticatedTenantId for use by the surrounding module or function.
  const authenticatedTenantId = user?.tenantId?._id || user?.tenantId;
  // Declare tenantKey for use by the surrounding module or function.
  const tenantKey = authenticatedTenantId || tenant?._id || tenant?.id || user?.tenantSlug || tenant?.slug || "current";
  // Declare currency for use by the surrounding module or function.
  const currency = String(settings.currencySymbol || settings.currency || "KSh").trim() || "KSh";
  // Declare brandStyle for use by the surrounding module or function.
  const brandStyle = { "--admin-primary": settings.primaryColor || "#047857", "--admin-secondary": settings.secondaryColor || "#064e3b", "--admin-accent": settings.accentColor || "#10b981" };
  // Declare { data, isLoading, isError, error, refetch, isFetching } for use by the surrounding module or function.
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({ queryKey: ["admin-dashboard", tenantKey], queryFn: getDashboard, staleTime: 30_000, refetchInterval: 60_000, refetchIntervalInBackground: false, refetchOnMount: "always", refetchOnWindowFocus: false, retry: 1 });
  // Declare { data: agents = [], isLoading: agentsLoading, isError: agentsError, error: agentsLoadError, refetch: refetchAgents } for use by the surrounding module or function.
  const { data: agents = [], isLoading: agentsLoading, isError: agentsError, error: agentsLoadError, refetch: refetchAgents } = useQuery({ queryKey: ["agents", tenantKey], queryFn: getAgents, staleTime: 30_000, refetchInterval: 60_000, refetchOnWindowFocus: false, retry: 1, refetchOnReconnect: true });
  // Declare approve for use by the surrounding module or function.
  const approve = useMutation({ mutationFn: approveAgent, onSuccess: () => { toast.success("Agent approved successfully."); void queryClient.invalidateQueries({ queryKey: ["agents", tenantKey] }); void queryClient.invalidateQueries({ queryKey: ["admin-dashboard", tenantKey] }); }, onError: (e) => toast.error(e?.response?.data?.message || "Unable to approve agent.") });
  // Declare dashboard for use by the surrounding module or function.
  const dashboard = useMemo(() => unwrap(data), [data]);
  // Declare summary for use by the surrounding module or function.
  const summary = dashboard.summary || {};
  // Declare paymentStats for use by the surrounding module or function.
  const paymentStats = dashboard.paymentStats || {};
  // Declare recentBookings for use by the surrounding module or function.
  const recentBookings = asArray(dashboard.recentBookings);
  // Declare popularTours for use by the surrounding module or function.
  const popularTours = asArray(dashboard.popularTours);
  // Declare monthlyRevenue for use by the surrounding module or function.
  const monthlyRevenue = asArray(dashboard.monthlyRevenue);
  // Declare bookingStatus for use by the surrounding module or function.
  const bookingStatus = asArray(dashboard.status || dashboard.statusData);
  // Declare bookingStatusCounts for use by the surrounding module or function.
  const bookingStatusCounts = useMemo(() => { const counts = Object.fromEntries(BOOKING_STATUSES.map((s) => [s, 0])); bookingStatus.forEach((x) => { const s = String(x?.status ?? x?._id ?? "").trim().toLowerCase(); if (s in counts) counts[s] += Number(x?.count || 0); }); return counts; }, [bookingStatus]);
  // Declare pendingAgents for use by the surrounding module or function.
  const pendingAgents = useMemo(() => agents.filter((a) => !a.isApproved && String(a.status || "").toLowerCase() !== "approved"), [agents]);
  // Declare statusTotal for use by the surrounding module or function.
  const statusTotal = Object.values(bookingStatusCounts).reduce((a, b) => a + b, 0);
  // Declare bookingTotal for use by the surrounding module or function.
  const bookingTotal = Number(dashboard.bookings ?? summary.bookings ?? 0);

  // Check the condition (isLoading) and run the matching branch.
  if (isLoading) return <div className="dashboard-responsive min-h-screen bg-[var(--tenant-background,#f8fafc)] p-8 text-slate-600">Loading admin dashboard...</div>;
  // Check the condition (isError) and run the matching branch.
  if (isError) return <div className="dashboard-responsive min-h-screen bg-[var(--tenant-background,#f8fafc)] p-8"><div className="max-w-2xl rounded-2xl border border-red-200 bg-white p-6 shadow-sm"><h2 className="font-semibold text-red-700">Unable to load Admin Dashboard</h2><p className="mt-2 text-gray-600">{error?.response?.data?.message || error?.message || "Dashboard request failed."}</p><button type="button" onClick={() => void refetch()} className="mt-4 rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white">Retry</button></div></div>;

  // Return the expression shown below to the caller.
  return <div className="admin-control-center dashboard-responsive min-h-screen space-y-7 bg-[var(--tenant-background,#f8fafc)] p-5 text-[var(--tenant-text,#0f172a)] lg:p-8" style={brandStyle}>
    <DashboardHeader />
    <div className="admin-dashboard-hero rounded-2xl p-5 text-white shadow-lg sm:p-6"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-white/70">Tenant command center</p><h2 className="text-2xl font-bold tracking-tight">Business Overview</h2><p className="mt-1 text-sm text-white/80">Live tenant-scoped operational, booking and payment metrics.</p></div><button type="button" onClick={() => void refetch()} disabled={isFetching} className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[var(--admin-secondary)] shadow-sm ring-1 ring-white/30 transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-wait disabled:opacity-60">{isFetching ? "Refreshing..." : "Refresh Dashboard"}</button></div></div>
    <StatsGrid stats={dashboard} summary={summary} />
    <section className="admin-panel admin-approval-panel rounded-2xl p-5 shadow-sm sm:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-2"><span className="admin-icon-badge"><Clock3 className="h-5 w-5" /></span><div><h2 className="text-xl font-bold text-slate-900">Agent Approvals</h2><p className="mt-1 text-sm text-slate-600">Review and approve agent accounts before they begin agent operations.</p></div></div></div><div className="admin-count-badge"><Users className="mr-1 inline h-4 w-4" />{agentsLoading ? "Loading..." : `${pendingAgents.length} pending`}</div></div>{agentsError ? <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><div className="font-semibold">Unable to load agent approval requests.</div><div className="mt-1 text-xs text-red-600">{agentsLoadError?.response?.data?.message || agentsLoadError?.message || "The agent management API request failed."}</div><button type="button" onClick={() => void refetchAgents()} className="mt-3 rounded-lg bg-red-700 px-3 py-2 text-xs font-semibold text-white hover:bg-red-800">Retry Agent Approvals</button></div> : agentsLoading ? <div className="mt-5 rounded-xl bg-slate-50 p-5 text-sm text-slate-500">Loading agent approval requests...</div> : pendingAgents.length === 0 ? <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-5"><div className="flex items-center gap-2 font-semibold text-emerald-800"><CheckCircle2 className="h-5 w-5" />All agent accounts are approved</div></div> : <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200 bg-white"><table className="w-full min-w-[720px] text-sm"><thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Agent</th><th className="px-4 py-3">Company</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Action</th></tr></thead><tbody>{pendingAgents.slice(0, 10).map((a) => <tr key={a._id} className="border-t border-slate-100"><td className="px-4 py-4 font-semibold text-slate-900">{a.user?.name || a.name || "Unnamed agent"}</td><td className="px-4 py-4 text-slate-600">{a.companyName || "—"}</td><td className="px-4 py-4 text-slate-600">{a.user?.email || a.email || "—"}</td><td className="px-4 py-4"><span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">Pending approval</span></td><td className="px-4 py-4 text-right"><button type="button" onClick={() => approve.mutate(a._id)} disabled={approve.isPending} className="rounded-xl bg-[var(--admin-primary)] px-3 py-2 font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:brightness-95 disabled:opacity-60">{approve.isPending && approve.variables === a._id ? "Approving..." : "Approve Agent"}</button></td></tr>)}</tbody></table></div>}</section>
    <div className="grid gap-6 xl:grid-cols-3"><div className="xl:col-span-2"><RecentBookings bookings={recentBookings} /></div><PaymentAnalytics payments={paymentStats} /></div>
    <div className="grid gap-6 lg:grid-cols-2"><PopularTours tours={popularTours} /><SystemHealth /></div>
    {(monthlyRevenue.length > 0 || bookingStatus.length > 0) && <div className="grid gap-6 lg:grid-cols-2"><section className="admin-panel rounded-2xl p-6 shadow-sm"><h2 className="mb-5 text-xl font-bold text-slate-900">Revenue Trend</h2>{monthlyRevenue.length === 0 ? <p className="text-slate-500">No completed payment revenue yet.</p> : monthlyRevenue.slice(-6).map((x) => <div key={x.month} className="flex items-center justify-between border-b border-slate-100 py-2.5"><span className="text-slate-600">{x.month}</span><strong className="text-[var(--admin-primary)]">{currency} {Number(x.amount || 0).toLocaleString()}</strong></div>)}</section><section className="admin-panel rounded-2xl p-6 shadow-sm"><div className="mb-5 flex items-center justify-between"><div><h2 className="text-xl font-bold text-slate-900">Booking Status</h2><p className="mt-1 text-sm text-slate-600">Current booking distribution for this tenant.</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold text-white ${statusTotal === bookingTotal ? "bg-emerald-600" : "bg-red-600"}`}>{statusTotal}/{bookingTotal} accounted for</span></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{BOOKING_STATUSES.map((s) => <div key={s} className={`rounded-xl border p-4 shadow-sm ${statusStyles[s]}`}><div className="flex items-center justify-between gap-3"><span className="text-sm font-semibold capitalize">{s}</span><strong className="text-2xl">{bookingStatusCounts[s].toLocaleString()}</strong></div></div>)}</div>{statusTotal !== bookingTotal && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">Dashboard data check: booking status totals do not equal total bookings. Review any unknown booking statuses instead of silently hiding them.</p>}</section></div>}
    <QuickActions />
  </div>;
}
