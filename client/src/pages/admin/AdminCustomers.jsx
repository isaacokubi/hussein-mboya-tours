import { useSettings } from "../../context/SettingsContext";
import { useQuery } from "@tanstack/react-query";
import api from "../../api/axios";

export default function AdminCustomers(
) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: async () => (await api.get("/customers")).data,
  });
  const customers = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : Array.isArray(data?.customers) ? data.customers : [];

  if (isLoading) return <div className="p-6">Loading customers...</div>;
  if (isError) return <div className="p-6 text-red-600">Failed to load customers.</div>;

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
                  settings.currency || "KES" {Number(customer.totalSpent || 0).toLocaleString()}
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
