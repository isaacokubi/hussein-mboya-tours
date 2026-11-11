/**
 * Purpose: Admin Customers page-level UI component. Main declarations: AdminCustomers.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useQuery } from "@tanstack/react-query";
// Load ../../api/axios so this module can use its exported dependencies.
import api from "../../api/axios";

// Define AdminCustomers; its parameters and body implement this operation.
export default function AdminCustomers(
) {
  // Declare { data, isLoading, isError } for use by the surrounding module or function.
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: async () => (await api.get("/customers")).data,
  });
  // Declare customers for use by the surrounding module or function.
  const customers = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : Array.isArray(data?.customers) ? data.customers : [];

  // Check the condition (isLoading) and run the matching branch.
  if (isLoading) return <div className="p-6">Loading customers...</div>;
  // Check the condition (isError) and run the matching branch.
  if (isError) return <div className="p-6 text-red-600">Failed to load customers.</div>;

  // Return the expression shown below to the caller.
  return (
    <div className="p-6 space-y-5">
      <h1 className="text-3xl font-bold">Customers CRM</h1>
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100"><tr>
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-left">Phone</th>
            <th className="p-3 text-left">Bookings</th>
            <th className="p-3 text-left">Spent</th>
            <th className="p-3 text-left">Status</th>
          </tr></thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer._id} className="border-t">
                <td className="p-3">{customer.name || customer.fullName || "-"}</td>
                <td className="p-3">{customer.email || "-"}</td>
                <td className="p-3">{customer.phone || customer.phoneNumber || "-"}</td>
                <td className="p-3">{customer.totalBookings || 0}</td>
                <td className="p-3 font-semibold">
                  KES {Number(customer.totalSpent || 0).toLocaleString()}
                </td>
                <td className="p-3">
                  <span className={customer.isActive === false ? "text-red-600" : "text-green-600"}>
                    {customer.isActive === false ? "Inactive" : "Active"}
                  </span>
                </td>
              </tr>
            ))}
            {!customers.length && <tr><td colSpan="7" className="p-6 text-center text-gray-500">No customers found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
