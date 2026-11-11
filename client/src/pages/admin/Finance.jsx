/**
 * Purpose: Finance page-level UI component. Main declarations: Finance.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useQuery } from "@tanstack/react-query";
// Load ../../api/financeApi so this module can use its exported dependencies.
import { getFinanceStats } from "../../api/financeApi";

// Define Finance; its parameters and body implement this operation.
export default function Finance(
) {
  // Declare { data, isLoading, isError } for use by the surrounding module or function.
  const { data, isLoading, isError } = useQuery({
    queryKey: ["finance"],
    queryFn: getFinanceStats,
  });

  // Declare stats for use by the surrounding module or function.
  const stats = data?.data || data?.stats || data || {};

  // Check the condition (isLoading) and run the matching branch.
  if (isLoading) {
    // Return the expression shown below to the caller.
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold">Finance Dashboard</h1>
        <div className="mt-5 rounded bg-white p-5 shadow">
          Loading finance data...
        </div>
      </div>
    );
  }

  // Check the condition (isError) and run the matching branch.
  if (isError) {
    // Return the expression shown below to the caller.
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold">Finance Dashboard</h1>
        <div className="mt-5 rounded bg-white p-5 shadow text-red-600">
          Failed to load finance data.
        </div>
      </div>
    );
  }

  // Return the expression shown below to the caller.
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Finance Dashboard</h1>

      <div className="grid md:grid-cols-4 gap-5 mt-5">
        <div className="bg-white shadow rounded p-5">
          <div className="text-sm text-gray-500">Revenue</div>
          <h2 className="text-2xl font-bold">
            KES {stats.revenue || stats.totalRevenue || 0}
          </h2>
        </div>

        <div className="bg-white shadow rounded p-5">
          <div className="text-sm text-gray-500">Paid Revenue</div>
          <h2 className="text-2xl font-bold">
            KES {stats.netRevenue || stats.paidRevenue || 0}
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
