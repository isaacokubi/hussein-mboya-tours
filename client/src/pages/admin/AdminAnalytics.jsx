import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Users, CalendarCheck, Car, Trophy, WalletCards } from "lucide-react";
import { getAnalytics } from "../../api/analyticsApi";

export default function AdminAnalytics() {
  const { data, isLoading, isError } = useQuery({ queryKey:["analytics"], queryFn:getAnalytics });
  const payload = data?.data || data || {};
  const revenue = payload.revenue || {};
  const bookingsSeries = Array.isArray(payload.bookings) ? payload.bookings : [];
  const bookingStatus = Array.isArray(payload.bookingStatus) ? payload.bookingStatus : [];
  const monthlyRevenue = Array.isArray(payload.monthlyRevenue) ? payload.monthlyRevenue : [];
  const vehicleStats = Array.isArray(payload.vehicleStats) ? payload.vehicleStats : [];
  const popularTours = Array.isArray(payload.popularTours) ? payload.popularTours : [];
  const customerCount = Number(payload.customers || 0);
  const bookingCount = bookingsSeries.reduce((sum,item)=>sum+Number(item.bookings||0),0);

  if (isLoading) return <div className="p-8">Loading analytics...</div>;
  if (isError) return <div className="p-8 text-red-600">Failed to load analytics.</div>;

  const cards = [
    ["Confirmed payment revenue",`KES ${Number(revenue.totalRevenue||0).toLocaleString()}`,WalletCards],
    ["Customers",customerCount,Users],
    ["Bookings",bookingCount,CalendarCheck],
    ["Fleet",vehicleStats.reduce((n,i)=>n+Number(i.count||0),0),Car],
  ];

  return <div className="min-h-screen bg-slate-50 p-6"><div className="mx-auto max-w-7xl">
    <div className="mb-8"><p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Business intelligence</p><h1 className="text-3xl font-bold text-slate-900">Analytics & Performance</h1><p className="mt-1 text-slate-500">Revenue and paid-tour performance are based only on confirmed payments.</p></div>
    <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{cards.map(([label,value,Icon])=><div key={label} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><div className="flex justify-between"><span className="text-sm text-slate-500">{label}</span><Icon className="text-emerald-700" size={20}/></div><p className="mt-3 text-3xl font-bold">{value}</p></div>)}</div>
    <div className="grid gap-6 lg:grid-cols-2">
      <ChartCard title="Monthly collected revenue"><ResponsiveContainer width="100%" height={320}><BarChart data={monthlyRevenue}><XAxis dataKey="_id.month"/><YAxis/><Tooltip formatter={(v)=>`KES ${Number(v).toLocaleString()}`}/><Bar dataKey="revenue"/></BarChart></ResponsiveContainer></ChartCard>
      <ChartCard title="Booking status"><ResponsiveContainer width="100%" height={320}><PieChart><Pie data={bookingStatus} dataKey="count" nameKey="_id" outerRadius={110} label>{bookingStatus.map((_,i)=><Cell key={i}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer></ChartCard>
    </div>
    <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><div className="flex items-center gap-2"><Trophy className="text-amber-600"/><h2 className="text-xl font-bold">Most popular tours</h2></div><p className="mt-1 text-sm text-slate-500">Ranked by confirmed payments. Recognized revenue comes only from completed payment records.</p><div className="mt-5 overflow-x-auto"><table className="w-full"><thead className="bg-slate-50"><tr><th className="p-3 text-left">Rank</th><th className="p-3 text-left">Tour</th><th className="p-3 text-left">Confirmed payments</th><th className="p-3 text-left">Recognized revenue</th></tr></thead><tbody>{popularTours.map((item,i)=><tr key={item._id||i} className="border-t"><td className="p-3 font-bold">#{i+1}</td><td className="p-3 font-semibold">{item.tour?.title || item.title || "Unknown tour"}</td><td className="p-3">{item.confirmedPaidBookings||0}</td><td className="p-3 font-semibold">KES {Number(item.revenue||0).toLocaleString()}</td></tr>)}{!popularTours.length&&<tr><td colSpan="4" className="p-8 text-center text-slate-500">No tour data yet.</td></tr>}</tbody></table></div></div>
  </div></div>;
}
function ChartCard({title,children}) { return <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><h2 className="mb-4 text-lg font-bold">{title}</h2>{children}</div>; }
