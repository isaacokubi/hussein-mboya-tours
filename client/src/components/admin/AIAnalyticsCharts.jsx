import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";

const monthName = (month) => new Date(2000, Number(month) - 1, 1).toLocaleString(undefined, { month: "short" });
const amountOf = (item) => Number(item?.revenue ?? item?.amount ?? item?.totalRevenue ?? 0);
const titleCase = (value) => String(value || "Unknown").replace(/[_-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function AIAnalyticsCharts({ analytics = {}, fallback = {} }) {
  const aiRevenue = analytics.monthlyRevenue || [];
  const canonicalRevenue = fallback.monthlyRevenue || [];
  const canonicalRevenueTotal = canonicalRevenue.reduce((sum, item) => sum + amountOf(item), 0);
  const aiRevenueTotal = aiRevenue.reduce((sum, item) => sum + amountOf(item), 0);
  const fallbackRevenueTotal = Number(fallback.totalRevenue || fallback.revenue || analytics.totalRevenue || analytics.revenue || 0);

  let revenueSource = aiRevenue;
  if (!aiRevenue.length || (aiRevenueTotal === 0 && canonicalRevenueTotal > 0)) revenueSource = canonicalRevenue;

  let revenue = revenueSource.map((item) => ({
    ...item,
    label: item.label || item.month || `${monthName(item._id?.month)} ${item._id?.year || ""}`.trim(),
    revenue: amountOf(item)
  }));

  if ((!revenue.length || revenue.every((item) => item.revenue === 0)) && fallbackRevenueTotal > 0) {
    revenue = [{ label: "Recorded revenue", revenue: fallbackRevenueTotal }];
  }

  const aiBookings = analytics.bookingActivity || [];
  const canonicalBookings = fallback.statusData || [];
  const aiBookingTotal = aiBookings.reduce((sum, item) => sum + Number(item?.bookings || 0), 0);
  const canonicalBookingTotal = canonicalBookings.reduce((sum, item) => sum + Number(item?.count || 0), 0);
  const useCanonicalBookings = canonicalBookings.length > 0 && aiBookingTotal === 0 && canonicalBookingTotal > 0;
  const bookingsSource = useCanonicalBookings || !aiBookings.length ? canonicalBookings : aiBookings;
  const bookings = bookingsSource.map((item) => ({
    ...item,
    label: titleCase(item.status || item.label || item._id?.day),
    bookings: Number(item.bookings ?? item.count ?? 0)
  })).filter((item) => item.bookings > 0);
  const hasDailyActivity = aiBookings.length > 0 && !useCanonicalBookings;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <ChartCard title="Revenue Trend" subtitle="Recorded payment revenue by period" empty={!revenue.length}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenue} margin={{ top: 10, right: 12, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis tickFormatter={(value) => `KES ${Number(value).toLocaleString()}`} />
            <Tooltip formatter={(value) => [`KES ${Number(value).toLocaleString()}`, "Revenue"]} />
            <Line type="monotone" dataKey="revenue" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title={hasDailyActivity ? "Booking Activity" : "Booking Status"} subtitle={hasDailyActivity ? "Recorded bookings by day" : "Current tenant booking distribution"} empty={!bookings.length}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={bookings} margin={{ top: 10, right: 12, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis allowDecimals={false} />
            <Tooltip formatter={(value) => [Number(value).toLocaleString(), "Bookings"]} />
            <Bar dataKey="bookings" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

function ChartCard({ title, subtitle, empty, children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/70 p-4 shadow-sm sm:p-5">
      <div className="mb-3">
        <h3 className="font-black text-slate-900">{title}</h3>
        <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
      </div>
      {empty ? <div className="flex h-[300px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white px-5 text-center text-sm text-slate-500">No records are available for this chart yet.</div> : children}
    </div>
  );
}