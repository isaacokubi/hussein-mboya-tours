import { useQuery } from "@tanstack/react-query";
import { getCustomers } from "../../api/tourManagerApi";

export default function TourManagerCustomers() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["tour-manager-customers"],
    queryFn: () => getCustomers(),
  });
  const customers = Array.isArray(data) ? data : data?.customers || data?.data || [];

  if (isLoading) return <div className="p-6">Loading customers...</div>;
  if (isError) return <div className="p-6 text-red-600">Failed to load customers.</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Tour Manager Customers</h1>
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100"><tr>
            <th className="p-3 text-left">Name</th><th className="p-3 text-left">Email</th><th className="p-3 text-left">Phone</th>
          </tr></thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer._id} className="border-t">
                <td className="p-3">{customer.name || customer.fullName || "-"}</td>
                <td className="p-3">{customer.email || "-"}</td>
                <td className="p-3">{customer.phone || customer.phoneNumber || "-"}</td>
              </tr>
            ))}
            {!customers.length && <tr><td colSpan="3" className="p-6 text-center text-gray-500">No customers found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
