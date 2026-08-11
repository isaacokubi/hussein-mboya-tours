import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, ChevronLeft, ChevronRight, Users, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { getAdminCustomers } from "../../api/customerApi";

export default function Customers() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin-customers", search, page],
    queryFn: () => getAdminCustomers({ search, page, limit: 20 }),
  });

  const customers = Array.isArray(data?.data) ? data.data : [];
  const pages = Math.max(1, Number(data?.pagination?.pages || 1));

  if (isLoading) return <div className="p-6">Loading customers...</div>;
  if (isError) return <div className="p-6 text-red-600">Failed to load customers: {error?.response?.data?.message || error?.message}</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Customer relationship management</p>
            <h1 className="text-3xl font-bold text-slate-900">Customers</h1>
            <p className="text-slate-500">Search genuine customer accounts and inspect their booking history.</p>
          </div>
          <div className="rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200">
            <Users size={18} className="mr-1 inline text-emerald-700" />
            <strong>{data?.pagination?.total || 0}</strong> customers
          </div>
        </div>

        <div className="mb-5 flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <Search size={19} className="text-slate-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search customer name, email or phone..."
            className="w-full outline-none"
          />
          {search && <button onClick={() => setSearch("")} className="text-sm text-slate-500">Clear</button>}
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50"><tr>
                <th className="p-4 text-left">Customer</th><th className="p-4 text-left">Phone</th><th className="p-4 text-left">Type</th><th className="p-4 text-left">Bookings</th><th className="p-4 text-left">Confirmed spend</th><th className="p-4 text-right">Action</th>
              </tr></thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer._id} className="border-t hover:bg-slate-50">
                    <td className="p-4"><div className="font-semibold">{customer.name || "-"}</div><div className="text-sm text-slate-500">{customer.email || "-"}</div></td>
                    <td className="p-4">{customer.phone || "-"}</td>
                    <td className="p-4 capitalize">{customer.customerType || "individual"}</td>
                    <td className="p-4">{customer.totalBookings || 0}</td>
                    <td className="p-4 font-semibold">KES {Number(customer.totalSpent || 0).toLocaleString()}</td>
                    <td className="p-4 text-right"><Link to={`/admin/customers/${customer._id}`} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white"><Eye size={15} /> View</Link></td>
                  </tr>
                ))}
                {!customers.length && <tr><td colSpan="6" className="p-10 text-center text-slate-500">No customers found.</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t p-4">
            <span className="text-sm text-slate-500">Page {page} of {pages}</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border p-2 disabled:opacity-40"><ChevronLeft size={18} /></button>
              <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="rounded-lg border p-2 disabled:opacity-40"><ChevronRight size={18} /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
