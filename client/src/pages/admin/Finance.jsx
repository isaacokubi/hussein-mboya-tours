import { useSettings } from "../../context/SettingsContext";
import { useQuery } from "@tanstack/react-query";
import { getFinanceStats } from "../../api/financeApi";

export default function Finance(
) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["finance"],
    queryFn: getFinanceStats,
  });

  const stats = data?.data || data?.stats || data || {};

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold">Finance Dashboard</h1>
        <div className="mt-5 rounded bg-white p-5 shadow">
          Loading finance data...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold">Finance Dashboard</h1>
        <div className="mt-5 rounded bg-white p-5 shadow text-red-600">
          Failed to load finance data.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Finance Dashboard</h1>

      <div className="grid md:grid-cols-4 gap-5 mt-5">
        <div className="bg-white shadow rounded p-5">
          <div className="text-sm text-gray-500">Revenue</div>
          <h2 className="text-2xl font-bold">
            settings.currency || "KES" {stats.revenue || stats.totalRevenue || 0}
          </h2>
        </div>

        <div className="bg-white shadow rounded p-5">
          <div className="text-sm text-gray-500">Paid Revenue</div>
          <h2 className="text-2xl font-bold">
            settings.currency || "KES" {stats.netRevenue || stats.paidRevenue || 0}
          </h2>
        </div>

        <div className="bg-white shadow rounded p-5">
          <div className="text-sm text-gray-500">Pending Payments</div>
          <h2 className="text-2xl font-bold">
            {stats.pendingPayments || 0}
          </h2>
        </div>

        <div className="bg-white shadow rounded p-5">
          <div className="text-sm text-gray-500">Bookings</div>
          <h2 className="text-2xl font-bold">
            {stats.paidBookings || stats.bookings || 0}
          </h2>
        </div>
      </div>
    </div>
  );
}
