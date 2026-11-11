/**
 * Purpose: Tour Manager Dashboard page-level UI component. Main declarations: formatCurrency, TourManagerDashboard, refreshAll.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useQuery } from "@tanstack/react-query";
// Load lucide-react so this module can use its exported dependencies.
import { AlertTriangle, CalendarDays, CheckCircle2, Map, RefreshCw, Users, Wallet } from "lucide-react";
// Load ../../api/tourManagerApi so this module can use its exported dependencies.
import { getDashboardStats } from "../../api/tourManagerApi";
// Load ../../components/tours/tourManager/StatCard so this module can use its exported dependencies.
import StatCard from "../../components/tours/tourManager/StatCard";
// Load ../../components/tours/tourManager/UpcomingTours so this module can use its exported dependencies.
import UpcomingTours from "../../components/tours/tourManager/UpcomingTours";
// Load ../../components/tours/tourManager/BookingTable so this module can use its exported dependencies.
import BookingTable from "../../components/tours/tourManager/BookingTable";
// Load ../../utils/dashboardData so this module can use its exported dependencies.
import { asArray, firstNumeric, unwrapData } from "../../utils/dashboardData";
// Load ../../context/SettingsContext so this module can use its exported dependencies.
import { useSettings } from "../../context/SettingsContext";

// Declare formatCurrency for use by the surrounding module or function.
const formatCurrency = (value, symbol) => `${symbol} ${Number(value || 0).toLocaleString("en-KE", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

// Define TourManagerDashboard; its parameters and body implement this operation.
export default function TourManagerDashboard() {
  // Declare { settings } for use by the surrounding module or function.
  const { settings } = useSettings();
  // Declare currencySymbol for use by the surrounding module or function.
  const currencySymbol = settings?.currencySymbol || settings?.currency || "KSh";
  // Declare companyName for use by the surrounding module or function.
  const companyName = String(settings?.companyName || settings?.displayName || "Global Tours").trim();

  // Declare dashboardQuery for use by the surrounding module or function.
  const dashboardQuery = useQuery({
    queryKey: ["tour-manager-dashboard"],
    queryFn: getDashboardStats,
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    retry: 1,
  });

  // Declare dashboard for use by the surrounding module or function.
  const dashboard = unwrapData(dashboardQuery.data);
  // Declare stats for use by the surrounding module or function.
  const stats = dashboard.stats || dashboard.summary || {};
  // Declare upcomingTours for use by the surrounding module or function.
  const upcomingTours = asArray(dashboard.upcomingTours ?? dashboard.tours);
  // Declare recentBookings for use by the surrounding module or function.
  const recentBookings = asArray(dashboard.recentBookings ?? dashboard.bookings);
  // Declare isLoading for use by the surrounding module or function.
  const isLoading = dashboardQuery.isLoading;
  // Declare isFetching for use by the surrounding module or function.
  const isFetching = dashboardQuery.isFetching;
  // Declare isError for use by the surrounding module or function.
  const isError = dashboardQuery.isError;
  // Declare error for use by the surrounding module or function.
  const error = dashboardQuery.error;

  // Declare totalTours for use by the surrounding module or function.
  const totalTours = firstNumeric(stats.totalTours, dashboard.totalTours, upcomingTours.length);
  // Declare upcomingCount for use by the surrounding module or function.
  const upcomingCount = firstNumeric(stats.upcomingTours, dashboard.upcomingToursCount, upcomingTours.length);
  // Declare totalCustomers for use by the surrounding module or function.
  const totalCustomers = firstNumeric(stats.totalCustomers, dashboard.totalCustomers, dashboard.customerCount);
  // Declare revenue for use by the surrounding module or function.
  const revenue = firstNumeric(stats.revenue, dashboard.revenue);
  // Declare refreshAll for use by the surrounding module or function.
  const refreshAll = () => void dashboardQuery.refetch();

  // Check the condition (isLoading) and run the matching branch.
  if (isLoading) {
    // Return the expression shown below to the caller.
    return (
      <section className="min-h-[60vh] bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl animate-pulse space-y-6">
          <div className="h-36 rounded-3xl bg-slate-200" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[1, 2, 3, 4].map((item) => <div key={item} className="h-36 rounded-2xl bg-white shadow-sm" />)}</div>
          <div className="h-96 rounded-2xl bg-white shadow-sm" />
        </div>
      </section>
    );
  }

  // Check the condition (isError) and run the matching branch.
  if (isError) {
    // Declare status for use by the surrounding module or function.
    const status = error?.response?.status;
    // Declare message for use by the surrounding module or function.
    const message = error?.response?.data?.message;
    // Return the expression shown below to the caller.
    return (
      <section className="min-h-[60vh] bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-rose-200 bg-white p-8 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600"><AlertTriangle size={24} /></div>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-rose-600">Operations dashboard unavailable</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-950">Unable to load Tour Manager data</h1>
          <p className="mt-2 leading-6 text-slate-600">{status === 401 ? "Your session has expired. Please sign in again." : status === 403 ? "Your account is not authorized for Tour Manager operations." : message || error?.message || "The dashboard request failed. No operational figures are being shown as zero."}</p>
          <button onClick={refreshAll} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 disabled:opacity-60" disabled={isFetching}>
            <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} /> {isFetching ? "Retrying..." : "Retry dashboard"}
          </button>
        </div>
      </section>
    );
  }

  // Return the expression shown below to the caller.
  return (
    <section className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-7">
        <header className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-emerald-950 to-emerald-800 text-white shadow-xl">
          <div className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100"><CheckCircle2 size={14} /> Live tenant operations</div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Tour Manager Dashboard</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-50/80">Monitor scheduled tours, guest capacity, operational assignments and completed-payment revenue for {companyName}.</p>
            </div>
            <button onClick={refreshAll} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15 disabled:opacity-60" disabled={isFetching}>
              <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} /> {isFetching ? "Refreshing..." : "Refresh data"}
            </button>
          </div>
          <div className="grid grid-cols-2 border-t border-white/10 sm:grid-cols-4">
            <div className="px-5 py-4"><p className="text-xs text-emerald-100/60">Data scope</p><p className="mt-1 font-semibold">Tenant-scoped</p></div>
            <div className="px-5 py-4"><p className="text-xs text-emerald-100/60">Revenue basis</p><p className="mt-1 font-semibold">Posted journal entries</p></div>
            <div className="px-5 py-4"><p className="text-xs text-emerald-100/60">Refresh cycle</p><p className="mt-1 font-semibold">Every 60 seconds</p></div>
            <div className="px-5 py-4"><p className="text-xs text-emerald-100/60">Currency</p><p className="mt-1 font-semibold">{currencySymbol}</p></div>
          </div>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Tours" value={totalTours} subtitle="Live tenant tours" icon={<Map size={22} />} color="bg-emerald-700" />
          <StatCard title="Upcoming Tours" value={upcomingCount} subtitle="Scheduled operational tours" icon={<CalendarDays size={22} />} color="bg-sky-700" />
          <StatCard title="Customers" value={totalCustomers} subtitle="Tenant customer accounts" icon={<Users size={22} />} color="bg-violet-700" />
          <StatCard title="Revenue" value={formatCurrency(revenue, currencySymbol)} subtitle="Posted accounting revenue for this tenant" icon={<Wallet size={22} />} color="bg-amber-600" />
        </div>

        <UpcomingTours tours={upcomingTours} />
        <BookingTable bookings={recentBookings} />
      </div>
    </section>
  );
}
