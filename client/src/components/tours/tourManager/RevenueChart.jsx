/**
 * Purpose: Revenue Chart reusable UI component. Main declarations: RevenueChart.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

// Load @tanstack/react-query so this module can use its exported dependencies.
import { useQuery } from "@tanstack/react-query";

// Load ../../../api/analyticsApi so this module can use its exported dependencies.
import { getRevenueAnalytics } from "../../../api/analyticsApi";

// Define RevenueChart; its parameters and body implement this operation.
export default function RevenueChart(
) {
  // Declare { data, isLoading, isError, error, } for use by the surrounding module or function.
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

  // Declare chartData for use by the surrounding module or function.
  const chartData =
    data?.revenue ||
    data?.monthlyRevenue ||
    data?.data ||
    [];

  // Check the condition (isLoading) and run the matching branch.
  if (isLoading) {
    // Return the expression shown below to the caller.
    return (
      <div className="bg-white rounded-xl shadow p-6">
        Loading revenue analytics...
      </div>
    );
  }

  // Check the condition (isError) and run the matching branch.
  if (isError) {
    // Return the expression shown below to the caller.
    return (
      <div className="bg-white rounded-xl shadow p-6 text-red-600">
        {error?.message || "Failed to load revenue analytics."}
      </div>
    );
  }

  // Return the expression shown below to the caller.
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
