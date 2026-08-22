import { useSettings } from "../../../context/SettingsContext";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import { useQuery } from "@tanstack/react-query";

import { getRevenueAnalytics } from "../../../api/analyticsApi";

export default function RevenueChart(
) {
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["adminRevenueAnalytics"],
    queryFn: () =>
      getRevenueAnalytics({
        period: "monthly",
      }),
  });

  /*
  |--------------------------------------------------------------------------
  | NORMALIZE API RESPONSE
  |--------------------------------------------------------------------------
  */

  const chartData =
    data?.revenue ||
    data?.monthlyRevenue ||
    data?.data ||
    [];

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        Loading revenue analytics...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-xl shadow p-6 text-red-600">
        {error?.message || "Failed to load revenue analytics."}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-bold mb-6">
        Revenue Growth
      </h2>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="month" />

          <YAxis
            tickFormatter={(value) =>
              `KES ${Number(value).toLocaleString()}`
            }
          />

          <Tooltip
            formatter={(value) => [
              `KES ${Number(value).toLocaleString()}`,
              "Revenue",
            ]}
          />

          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#15803d"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}