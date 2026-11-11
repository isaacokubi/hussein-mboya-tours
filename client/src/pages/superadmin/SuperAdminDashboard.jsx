/**
 * Purpose: Super Admin Dashboard page-level UI component. Main declarations: number, hasValue, displayCount, displayMoney, unwrapMetrics.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useQuery } from "@tanstack/react-query";
// Load react-router-dom so this module can use its exported dependencies.
import { Link } from "react-router-dom";
// Load lucide-react so this module can use its exported dependencies.
import {
  Activity,
  Building2,
  CalendarCheck2,
  CarFront,
  CheckCircle2,
  CreditCard,
  Database,
  Gauge,
  Globe2,
  LayoutDashboard,
  Map,
  MapPinned,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  Users,
  WalletCards,
  AlertCircle,
} from "lucide-react";
// Load ../../api/superAdminApi so this module can use its exported dependencies.
import { getSuperAdminDashboardMetrics } from "../../api/superAdminApi";
// Load ./SuperAdminTenants so this module can use its exported dependencies.
import SuperAdminTenants from "./SuperAdminTenants";

// Declare number for use by the surrounding module or function.
const number = (value) => Number(value ?? 0).toLocaleString("en-KE");
// Declare hasValue for use by the surrounding module or function.
const hasValue = (value) => value !== undefined && value !== null;
// Declare displayCount for use by the surrounding module or function.
const displayCount = (value) => (hasValue(value) ? number(value) : "—");
// Declare displayMoney for use by the surrounding module or function.
const displayMoney = (value, currency) =>
  hasValue(value) ? `${currency} ${number(value)}` : "—";

// Declare unwrapMetrics for use by the surrounding module or function.
const unwrapMetrics = (payload) => {
  // Declare current for use by the surrounding module or function.
  let current = payload?.data ?? payload ?? {};
  // Check the condition (current?.data && typeof current.data === "object" && !Array.isArray(cu) and run the matching branch.
  if (current?.data && typeof current.data === "object" && !Array.isArray(current.data)) {
    // Declare nested for use by the surrounding module or function.
    const nested = current.data;
    // Check the condition (nested.users !== undefined || nested.customers !== undefined || nested) and run the matching branch.
    if (
      nested.users !== undefined ||
      nested.customers !== undefined ||
      nested.customerProfiles !== undefined ||
      nested.customerAccounts !== undefined ||
      nested.vehicles !== undefined ||
      nested.bookings !== undefined ||
      nested.tours !== undefined ||
      nested.destinations !== undefined ||
      nested.payments !== undefined
    ) {
      // Perform the side effect or state update expressed on the following line.
      current = nested;
    }
  }
  // Return the value of current to the caller.
  return current;
};

// Declare unwrapScope for use by the surrounding module or function.
const unwrapScope = (payload) =>
  payload?.scope || payload?.data?.scope || payload?.data?.data?.scope || {};

// Declare cards for use by the surrounding module or function.
const cards = [
  { key: "users", label: "Platform users", icon: Users, tone: "indigo" },
  { key: "customerProfiles", label: "Customer profiles", icon: UserCheck, tone: "sky" },
  { key: "customerAccounts", label: "Customer accounts", icon: Users, tone: "cyan" },
  { key: "staff", label: "Staff", icon: ShieldCheck, tone: "violet" },
  { key: "agents", label: "Agents", icon: UserCheck, tone: "purple" },
  { key: "vehicles", label: "Vehicles", icon: CarFront, tone: "amber" },
  { key: "availableVehicles", label: "Available vehicles", icon: CarFront, tone: "lime" },
  { key: "bookings", label: "Bookings", icon: CalendarCheck2, tone: "emerald" },
  { key: "admins", label: "Tenant administrators", icon: Building2, tone: "blue" },
  { key: "tours", label: "Tours", icon: Map, tone: "teal" },
  { key: "destinations", label: "Destinations", icon: MapPinned, tone: "orange" },
  { key: "payments", label: "Payments", icon: CreditCard, tone: "rose" },
  { key: "completedPayments", label: "Completed payments", icon: CheckCircle2, tone: "green" },
];

// Declare toneClasses for use by the surrounding module or function.
const toneClasses = {
  indigo: "bg-indigo-50 text-indigo-700 ring-indigo-100",
  sky: "bg-sky-50 text-sky-700 ring-sky-100",
  cyan: "bg-cyan-50 text-cyan-700 ring-cyan-100",
  violet: "bg-violet-50 text-violet-700 ring-violet-100",
  purple: "bg-purple-50 text-purple-700 ring-purple-100",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
  lime: "bg-lime-50 text-lime-700 ring-lime-100",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  blue: "bg-blue-50 text-blue-700 ring-blue-100",
  teal: "bg-teal-50 text-teal-700 ring-teal-100",
  orange: "bg-orange-50 text-orange-700 ring-orange-100",
  rose: "bg-rose-50 text-rose-700 ring-rose-100",
  green: "bg-green-50 text-green-700 ring-green-100",
};

// Define SuperAdminDashboard; its parameters and body implement this operation.
export default function SuperAdminDashboard() {
  // Declare { data, isLoading, isError, error, refetch, isFetching } for use by the surrounding module or function.
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["superadmin-dashboard-metrics"],
    queryFn: getSuperAdminDashboardMetrics,
    retry: 1,
    staleTime: 30_000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  // Declare stats for use by the surrounding module or function.
  const stats = unwrapMetrics(data);
  // Declare scope for use by the surrounding module or function.
  const scope = unwrapScope(data);
  // Declare status for use by the surrounding module or function.
  const status = error?.response?.status;
  // Declare message for use by the surrounding module or function.
  const message = error?.response?.data?.message;
  // Declare currency for use by the surrounding module or function.
  const currency = String(stats.revenueCurrency || "KES").toUpperCase();
  // Declare tenantCount for use by the surrounding module or function.
  const tenantCount = hasValue(scope.tenantCount) ? Number(scope.tenantCount) : null;
  // Declare activeTenantCount for use by the surrounding module or function.
  const activeTenantCount = hasValue(scope.activeTenantCount) ? Number(scope.activeTenantCount) : null;
  // Declare trialTenantCount for use by the surrounding module or function.
  const trialTenantCount = hasValue(scope.trialTenantCount) ? Number(scope.trialTenantCount) : null;

  // Check the condition (isLoading) and run the matching branch.
  if (isLoading) {
    // Return the expression shown below to the caller.
    return (
      <main className="min-h-screen bg-slate-950 p-6 md:p-8">
        <div className="mx-auto max-w-7xl animate-pulse rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
          <div className="h-4 w-40 rounded bg-slate-800" />
          <div className="mt-4 h-10 w-2/3 rounded bg-slate-800" />
          <div className="mt-3 h-5 w-1/2 rounded bg-slate-800" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-32 rounded-2xl bg-slate-800" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  // Check the condition (isError) and run the matching branch.
  if (isError) {
    // Declare sessionExpired for use by the surrounding module or function.
    const sessionExpired = status === 401;
    // Declare forbidden for use by the surrounding module or function.
    const forbidden = status === 403;
    // Return the expression shown below to the caller.
    return (
      <main className="min-h-screen bg-slate-950 p-6 md:p-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-800 bg-white p-8 shadow-2xl">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertCircle size={25} />
          </div>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Platform governance</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Super Admin Control Center</h1>
          <p className="mt-3 leading-7 text-slate-600">
            {sessionExpired
              ? "Your authentication session is no longer valid. Sign in again to continue."
              : forbidden
                ? "Your account is not authorized for platform governance."
                : message || "Unable to load platform metrics."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 font-bold text-white transition hover:bg-slate-800 disabled:opacity-60" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw size={17} className={isFetching ? "animate-spin" : ""} />
              {isFetching ? "Retrying…" : "Retry"}
            </button>
            {sessionExpired && <Link to="/login" className="rounded-xl border border-slate-200 px-4 py-2.5 font-bold text-slate-700 hover:bg-slate-50">Sign in again</Link>}
          </div>
        </div>
      </main>
    );
  }

  // Return the expression shown below to the caller.
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1700px] space-y-7">
        <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-indigo-950 to-emerald-950 px-6 py-8 text-white shadow-2xl sm:px-8 lg:px-10">
          <div className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-indigo-400/10 blur-3xl" />
          <div className="relative flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-4xl">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-emerald-200 backdrop-blur"><Gauge size={14} /> Super Admin</span>
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-100"><Activity size={14} /> Live platform data</span>
              </div>
              <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">Global Tours Platform Control Center</h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">Govern tenants, users, operations, payments and platform health from one tenant-aware control surface.</p>
            </div>
            <button type="button" onClick={() => refetch()} disabled={isFetching} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"><RefreshCw size={17} className={isFetching ? "animate-spin" : ""} />{isFetching ? "Refreshing…" : "Refresh data"}</button>
          </div>
          <div className="relative mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Operational tenants</p><p className="mt-1 text-2xl font-black">{tenantCount === null ? "—" : number(tenantCount)}</p></div>
            <div className="rounded-2xl border border-emerald-300/10 bg-emerald-400/10 p-4 backdrop-blur"><p className="text-xs font-semibold uppercase tracking-wider text-emerald-200">Active tenants</p><p className="mt-1 text-2xl font-black">{activeTenantCount === null ? "—" : number(activeTenantCount)}</p></div>
            <div className="rounded-2xl border border-amber-300/10 bg-amber-400/10 p-4 backdrop-blur"><p className="text-xs font-semibold uppercase tracking-wider text-amber-200">Trial tenants</p><p className="mt-1 text-2xl font-black">{trialTenantCount === null ? "—" : number(trialTenantCount)}</p></div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(({ key, label, icon: Icon, tone }) => (
            <article key={key} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg">
              <div className="flex items-start justify-between gap-4"><div className={`flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${toneClasses[tone]}`}><Icon size={20} /></div><span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Platform total</span></div>
              <p className="mt-5 text-sm font-semibold text-slate-500">{label}</p>
              <p className="mt-1 text-3xl font-black tracking-tight text-slate-950">{displayCount(stats[key])}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          <article className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-950 to-emerald-800 p-6 text-white shadow-lg lg:col-span-2">
            <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-200">Revenue control</p><h2 className="mt-2 text-2xl font-black">Net revenue</h2></div><div className="rounded-xl bg-white/10 p-3"><WalletCards size={22} /></div></div>
            <p className="mt-6 text-4xl font-black tracking-tight">{displayMoney(stats.revenue, currency)}</p>
            <div className="mt-5 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/10 pt-4 text-sm"><div><span className="text-emerald-200">Gross revenue</span><p className="mt-1 font-bold">{displayMoney(stats.grossRevenue, currency)}</p></div><div><span className="text-emerald-200">Refunds</span><p className="mt-1 font-bold">{displayMoney(stats.refundedRevenue, currency)}</p></div><div><span className="text-emerald-200">Currency</span><p className="mt-1 font-bold">{currency}</p></div></div>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">Partner pipeline</p><h2 className="mt-2 text-2xl font-black text-slate-950">Agent approvals</h2></div><div className="rounded-xl bg-indigo-50 p-3 text-indigo-700"><UserCheck size={22} /></div></div>
            <div className="mt-7 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-emerald-50 p-4"><p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Approved</p><p className="mt-1 text-3xl font-black text-emerald-950">{displayCount(stats.approvedAgents)}</p></div><div className="rounded-2xl bg-amber-50 p-4"><p className="text-xs font-bold uppercase tracking-wider text-amber-700">Pending</p><p className="mt-1 text-3xl font-black text-amber-950">{displayCount(stats.pendingAgents)}</p></div></div>
          </article>
        </section>

        <section className="rounded-2xl border border-sky-200 bg-sky-50 p-5 shadow-sm"><div className="flex items-start gap-3"><div className="mt-0.5 rounded-xl bg-white p-2 text-sky-700 shadow-sm"><Database size={18} /></div><div><h2 className="font-bold text-sky-950">Data scope & interpretation</h2><p className="mt-1 text-sm leading-6 text-sky-900/75">Customer Profiles are profile records, while Customer Accounts are active user accounts with the customer role. Staff, agents, vehicles, tours, destinations, bookings and payments are restricted to operational tenant data. The global platform owner account is excluded from tenant-level totals. An em dash (—) means the API did not supply a value; it is intentionally not presented as zero.</p></div></div></section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-4 sm:px-6"><div className="flex items-center gap-3"><div className="rounded-xl bg-indigo-50 p-2 text-indigo-700"><Building2 size={20} /></div><div><h2 className="font-black text-slate-950">Tenant governance</h2><p className="text-xs text-slate-500">Lifecycle, subscription and operational controls</p></div></div></div>
          <div className="p-3 sm:p-5"><SuperAdminTenants /></div>
        </section>

        <footer className="flex flex-col gap-2 border-t border-slate-200 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between"><span className="inline-flex items-center gap-2"><Globe2 size={14} /> Global Tours platform governance</span><span className="inline-flex items-center gap-2"><LayoutDashboard size={14} /> Metrics are tenant-scoped where indicated</span></footer>
      </div>
    </main>
  );
}
