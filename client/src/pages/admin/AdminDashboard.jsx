// AdminDashboard.jsx
// Premium Control Center version
// Replace your current AdminDashboard.jsx with this file and
// move over any remaining sections (Agents, Guides, Notifications)
// if needed. All existing query/data logic is preserved.

import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Map,
  CalendarCheck,
  Wallet,
  CreditCard,
  Activity,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { getDashboard } from "../../api/adminApi";

export default function AdminDashboard() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["adminDashboard"],
    queryFn: getDashboard,
    staleTime: 300000,
  });

  if (isLoading) return <div className="p-8">Loading dashboard...</div>;
  if (isError) return <div className="p-8 text-red-600">{error?.message}</div>;

  const stats = data?.data || data || {};

  const paymentStats = stats.paymentStats || {
    completed: 0,
    pending: 0,
    failed: 0,
  };

  const {
    users = 0,
    tours = 0,
    bookings = 0,
    destinations = 0,
    revenue = 0,
    monthlyRevenue = [],
    bookingStatus = [],
    recentBookings = [],
    notifications = [],
  } = stats;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-8 space-y-8">
      <div className="bg-white rounded-3xl border p-8 shadow-sm flex justify-between flex-wrap gap-4">
        <div>
          <p className="text-blue-600 text-xs font-bold uppercase">
            Admin Control Center
          </p>
          <h1 className="text-4xl font-black mt-2">Hussein Mboya Tours</h1>
          <p className="text-slate-500 mt-2">
            Executive overview of bookings, revenue and operations.
          </p>
        </div>

        <div className="flex gap-3">
          <QuickLink title="Create Tour" to="/admin/tours/create" />
          <QuickLink title="Bookings" to="/admin/bookings" />
          <QuickLink title="Reports" to="/admin/reports" />
        </div>
      </div>

      <section className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 text-white">
        <div className="flex items-center gap-2 mb-6">
          <Activity />
          <h2 className="text-2xl font-bold">Business Health</h2>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <SummaryBox title="Customers" value={users} />
          <SummaryBox title="Tours" value={tours} />
          <SummaryBox title="Bookings" value={bookings} />
          <SummaryBox
            title="Revenue"
            value={`Ksh ${Number(revenue).toLocaleString()}`}
          />
        </div>
      </section>

      <div className="grid md:grid-cols-2 xl:grid-cols-6 gap-6">
        <StatCard title="Users" value={users} icon={<Users />} />
        <StatCard title="Tours" value={tours} icon={<Map />} />
        <StatCard title="Destinations" value={destinations} icon={<Map />} />
        <StatCard title="Bookings" value={bookings} icon={<CalendarCheck />} />
        <StatCard title="Revenue" value={`Ksh ${Number(revenue).toLocaleString()}`} icon={<Wallet />} />
        <StatCard title="Paid" value={paymentStats.completed} icon={<CreditCard />} />
      </div>

      <div className="grid xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8 space-y-6">
          <section className="bg-white rounded-3xl border p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-5">Revenue Analytics</h2>

            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#2563eb"
                    strokeWidth={4}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="bg-white rounded-3xl border p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-5">Recent Bookings</h2>

            <div className="overflow-hidden rounded-2xl border">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-3 text-left">Customer</th>
                    <th className="p-3 text-left">Tour</th>
                    <th className="p-3 text-left">Amount</th>
                    <th className="p-3 text-left">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {recentBookings.map((booking, index) => (
                    <tr key={booking._id || index} className="border-b hover:bg-slate-50">
                      <td className="p-3">
                        {booking.customer?.name || booking.fullName || "Guest"}
                      </td>
                      <td className="p-3">{booking.tour?.title || "Tour"}</td>
                      <td className="p-3">
                        Ksh {Number(booking.amount || 0).toLocaleString()}
                      </td>
                      <td className="p-3">
                        <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                          {booking.bookingStatus || "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="xl:col-span-4 space-y-6">
          <section className="bg-white rounded-3xl border p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">Payment Overview</h2>
            <div className="grid gap-4">
              <PaymentBox title="Completed" value={paymentStats.completed} />
              <PaymentBox title="Pending" value={paymentStats.pending} />
              <PaymentBox title="Failed" value={paymentStats.failed} />
            </div>
          </section>

          <section className="bg-white rounded-3xl border p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">Booking Status</h2>

            <div className="space-y-3">
              {bookingStatus.map((item, i) => (
                <div key={i} className="border rounded-xl p-4">
                  <div className="font-semibold">
                    {item?._id?.bookingStatus || item?._id?.paymentStatus || "Unknown"}
                  </div>
                  <div>{item.count || 0} bookings</div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-3xl border p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">Notifications</h2>
            {notifications.length === 0 ? (
              <p>No notifications</p>
            ) : (
              notifications.map((n, i) => (
                <div key={n._id || i} className="border rounded-xl p-4 mb-3">
                  <div className="font-semibold">{n.title}</div>
                  <div className="text-slate-500">{n.message}</div>
                </div>
              ))
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function QuickLink({ title, to }) {
  return (
    <Link to={to} className="px-4 py-3 rounded-2xl border hover:bg-blue-50">
      {title}
    </Link>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white rounded-3xl border p-6 shadow-sm">
      <div className="flex justify-between">
        <div>
          <p className="text-slate-500">{title}</p>
          <h2 className="text-3xl font-black mt-2">{value}</h2>
        </div>
        <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

function PaymentBox({ title, value }) {
  return (
    <div className="border rounded-xl p-4">
      <p>{title}</p>
      <h3 className="text-3xl font-bold">{value}</h3>
    </div>
  );
}

function SummaryBox({ title, value }) {
  return (
    <div>
      <p className="opacity-80">{title}</p>
      <h2 className="text-3xl font-black">{value}</h2>
    </div>
  );
}
