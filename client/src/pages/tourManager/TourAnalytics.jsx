import { useQuery } from "@tanstack/react-query";
import { BarChart3, RefreshCw } from "lucide-react";
import { useSettings } from "../../context/SettingsContext";
import { getReports } from "../../api/tourManagerApi";

const unwrap = (payload) => payload?.data || payload || {};

export default function TourAnalytics() {
  const { companyName } = useSettings() || {};
  const query = useQuery({
    queryKey: ["tour-manager-analytics"],
    queryFn: getReports,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  const analytics = unwrap(query.data);
  const monthlyRevenue = Array.isArray(analytics.monthlyRevenue) ? analytics.monthlyRevenue : [];
  const popularTours = Array.isArray(analytics.popularTours) ? analytics.popularTours : [];
  const maxBookings = Math.max(1, ...popularTours.map((item) => Number(item?.bookings || 0)));

  const kpis = [
    ["Total Bookings", Number(analytics.totalBookings || 0)],
    ["Revenue", `KES ${Number(analytics.totalRevenue || 0).toLocaleString("en-KE")}`],
    ["Customers", Number(analytics.totalCustomers || 0)],
    ["Completed Tours", Number(analytics.completedTours || 0)],
  ];

  if (query.isLoading) {
    return <div className="p-6">Loading analytics...</div>;
  }

  if (query.isError) {
    const message = query.error?.response?.data?.message || "Unable to load tour analytics.";
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-xl font-bold text-slate-900">Analytics unavailable</h1>
          <p className="mt-2 text-slate-600">{message}</p>
          <button
            type="button"
            onClick={() => query.refetch()}
            disabled={query.isFetching}
            className="mt-5 inline-flex items-center gap-2 rounded-xl border px-4 py-2 font-semibold disabled:opacity-50"
          >
            <RefreshCw size={16} className={query.isFetching ? "animate-spin" : ""} />
            {query.isFetching ? "Retrying..." : "Retry"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-8 bg-slate-50 p-4 md:p-8">
      <header>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-slate-900 p-3 text-white"><BarChart3 size={20} /></div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Tour Analytics</h1>
            <p className="text-slate-500">Operational performance for {companyName || "Company"}</p>
          </div>
        </div>
      </header>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map(([title, value]) => (
          <div key={title} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-xl font-semibold text-slate-900">Monthly booking activity</h2>
        <div className="mt-6 space-y-4">
          {monthlyRevenue.length === 0 && <p className="text-sm text-slate-500">No monthly payment activity yet.</p>}
          {monthlyRevenue.map((item) => {
            const year = item?._id?.year || "";
            const month = String(item?._id?.month || "").padStart(2, "0");
            const bookings = Number(item?.bookings || 0);
            return (
              <div key={`${year}-${month}`} className="flex items-center gap-4">
                <span className="w-20 shrink-0 text-sm font-medium text-slate-600">{year}-{month}</span>
                <div className="h-5 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-slate-900" style={{ width: `${Math.min(100, bookings * 8)}%` }} />
                </div>
                <span className="w-10 text-right text-sm font-bold text-slate-800">{bookings}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-xl font-semibold text-slate-900">Top performing tours</h2>
        <div className="mt-6 space-y-5">
          {popularTours.length === 0 && <p className="text-sm text-slate-500">No completed bookings yet.</p>}
          {popularTours.map((item, index) => {
            const bookings = Number(item?.bookings || 0);
            const percentage = Math.round((bookings / maxBookings) * 100);
            return (
              <div key={item?._id || item?.slug || `${item?.title}-${index}`}>
                <div className="mb-2 flex justify-between gap-4 text-sm">
                  <span className="font-medium text-slate-700">{index + 1}. {item?.title || "Untitled tour"}</span>
                  <span className="font-bold text-slate-800">{bookings} bookings</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-emerald-600" style={{ width: `${percentage}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
