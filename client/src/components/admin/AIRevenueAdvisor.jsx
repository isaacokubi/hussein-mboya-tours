const hasValue = (value) => value !== undefined && value !== null && value !== "";
const numeric = (value) => hasValue(value) && Number.isFinite(Number(value)) ? Number(value) : null;

export default function AIRevenueAdvisor({ data = {}, fallback = {} }) {
  const metrics = data.metrics || {};
  const fallbackMetrics = fallback.metrics || {};
  const recommendations = data.recommendations?.length ? data.recommendations : fallback.recommendations || [];
  const topTours = data.topTours?.length ? data.topTours : fallback.topTours || [];

  const totalBookings = numeric(metrics.totalBookings) ?? numeric(fallbackMetrics.totalBookings);
  const totalRevenue = numeric(metrics.totalRevenue) ?? numeric(fallbackMetrics.totalRevenue);
  const totalTours = numeric(metrics.totalTours) ?? numeric(fallbackMetrics.totalTours);

  return (
    <div>
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-widest text-amber-700">Growth intelligence</p>
        <h2 className="mt-1 text-xl font-black text-slate-900">AI Revenue & Marketing Advisor</h2>
        <p className="mt-1 text-sm text-slate-500">Revenue signals and practical actions based on this tenant's recorded activity.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Metric label="Bookings" value={hasValue(totalBookings) ? totalBookings.toLocaleString() : "—"} tone="emerald" />
        <Metric label="Revenue" value={hasValue(totalRevenue) ? `KES ${totalRevenue.toLocaleString()}` : "—"} tone="amber" />
        <Metric label="Tours" value={hasValue(totalTours) ? totalTours.toLocaleString() : "—"} tone="blue" />
      </div>

      {topTours.length > 0 && (
        <div className="mt-5 rounded-2xl border border-violet-100 bg-violet-50/50 p-4">
          <h3 className="font-black text-violet-950">Top performing tours</h3>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {topTours.map((item, index) => (
              <div key={`${item._id || index}`} className="flex items-center justify-between rounded-xl border border-white bg-white px-4 py-3 shadow-sm">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-800">{item.tour?.title || item.title || "Tour record"}</p>
                  <p className="text-xs text-slate-500">Rank #{index + 1}</p>
                </div>
                <span className="ml-3 rounded-full bg-violet-100 px-2.5 py-1 text-xs font-black text-violet-700">{Number(item.bookings ?? item.totalBookings ?? 0)} bookings</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-5">
        <h3 className="font-black text-slate-900">AI Recommendations</h3>
        {recommendations.length ? (
          <div className="mt-3 space-y-2">
            {recommendations.map((item, index) => (
              <div key={index} className="flex gap-3 rounded-xl border border-amber-100 bg-white p-3 shadow-sm">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-black text-amber-700">{index + 1}</span>
                <p className="text-sm leading-6 text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 rounded-xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-500">No recommendations are available yet.</p>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value, tone }) {
  const styles = {
    emerald: "border-emerald-100 bg-emerald-50/70 text-emerald-950",
    amber: "border-amber-100 bg-amber-50/70 text-amber-950",
    blue: "border-blue-100 bg-blue-50/70 text-blue-950"
  };
  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${styles[tone]}`}>
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-3 text-2xl font-black tracking-tight">{value}</p>
    </div>
  );
}
