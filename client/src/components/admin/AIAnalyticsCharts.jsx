/**
 * Purpose: AIAnalytics Charts reusable UI component. Main declarations: monthName, amountOf, titleCase, AIAnalyticsCharts, ChartCard.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
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

// Declare monthName for use by the surrounding module or function.
const monthName = (month) => new Date(2000, Number(month) - 1, 1).toLocaleString(undefined, { month: "short" });
// Declare amountOf for use by the surrounding module or function.
const amountOf = (item) => Number(item?.revenue ?? item?.amount ?? item?.totalRevenue ?? 0);
// Declare titleCase for use by the surrounding module or function.
const titleCase = (value) => String(value || "Unknown").replace(/[_-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

// Define AIAnalyticsCharts; its parameters and body implement this operation.
export default function AIAnalyticsCharts({ analytics = {}, fallback = {} }) {
  // Declare aiRevenue for use by the surrounding module or function.
  const aiRevenue = analytics.monthlyRevenue || [];
  // Declare canonicalRevenue for use by the surrounding module or function.
  const canonicalRevenue = fallback.monthlyRevenue || [];
  // Declare canonicalRevenueTotal for use by the surrounding module or function.
  const canonicalRevenueTotal = canonicalRevenue.reduce((sum, item) => sum + amountOf(item), 0);
  // Declare aiRevenueTotal for use by the surrounding module or function.
  const aiRevenueTotal = aiRevenue.reduce((sum, item) => sum + amountOf(item), 0);
  // Declare fallbackRevenueTotal for use by the surrounding module or function.
  const fallbackRevenueTotal = Number(fallback.totalRevenue || fallback.revenue || analytics.totalRevenue || analytics.revenue || 0);

  // Declare revenueSource for use by the surrounding module or function.
  let revenueSource = aiRevenue;
  // Check the condition (!aiRevenue.length || (aiRevenueTotal === 0 && canonicalRevenueTotal > ) and run the matching branch.
  if (!aiRevenue.length || (aiRevenueTotal === 0 && canonicalRevenueTotal > 0)) revenueSource = canonicalRevenue;

  // Declare revenue for use by the surrounding module or function.
  let revenue = revenueSource.map((item) => ({
    ...item,
    label: item.label || item.month || `${monthName(item._id?.month)} ${item._id?.year || ""}`.trim(),
    revenue: amountOf(item)
  }));

  // Check the condition ((!revenue.length || revenue.every((item) => item.revenue === 0)) && fa) and run the matching branch.
  if ((!revenue.length || revenue.every((item) => item.revenue === 0)) && fallbackRevenueTotal > 0) {
    // Perform the side effect or state update expressed on the following line.
    revenue = [{ label: "Recorded revenue", revenue: fallbackRevenueTotal }];
  }

  // Declare aiBookings for use by the surrounding module or function.
  const aiBookings = analytics.bookingActivity || [];
  // Declare canonicalBookings for use by the surrounding module or function.
  const canonicalBookings = fallback.statusData || [];
  // Declare aiBookingTotal for use by the surrounding module or function.
  const aiBookingTotal = aiBookings.reduce((sum, item) => sum + Number(item?.bookings || 0), 0);
  // Declare canonicalBookingTotal for use by the surrounding module or function.
  const canonicalBookingTotal = canonicalBookings.reduce((sum, item) => sum + Number(item?.count || 0), 0);
  // Declare useCanonicalBookings for use by the surrounding module or function.
  const useCanonicalBookings = canonicalBookings.length > 0 && aiBookingTotal === 0 && canonicalBookingTotal > 0;
  // Declare bookingsSource for use by the surrounding module or function.
  const bookingsSource = useCanonicalBookings || !aiBookings.length ? canonicalBookings : aiBookings;
  // Declare bookings for use by the surrounding module or function.
  const bookings = bookingsSource.map((item) => ({
    ...item,
    label: titleCase(item.status || item.label || item._id?.day),
    bookings: Number(item.bookings ?? item.count ?? 0)
  })).filter((item) => item.bookings > 0);
  // Declare hasDailyActivity for use by the surrounding module or function.
  const hasDailyActivity = aiBookings.length > 0 && !useCanonicalBookings;

  // Return the expression shown below to the caller.
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

// Define ChartCard; its parameters and body implement this operation.
function ChartCard({ title, subtitle, empty, children }) {
  // Return the expression shown below to the caller.
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