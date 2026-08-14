import { useSettings } from "../../context/SettingsContext";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, ChevronLeft, ChevronRight, Users, Mail, Phone } from "lucide-react";
import { getCustomers } from "../../api/tourManagerApi";

export default function TourManagerCustomers(
) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["tour-manager-customers", search, page],
    queryFn: () => getCustomers({ search, page, limit: 10 }),
    keepPreviousData: true,
  });

  const customers = Array.isArray(data?.customers) ? data.customers : Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
  const totalPages = Math.max(1, Number(data?.pagination?.pages || data?.pages || 1));

  if (isLoading) return <div className="p-6">Loading customers...</div>;
  if (isError) return <div className="p-6 text-red-600">Failed to load customers.</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div><p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Customer operations</p><h1 className="text-3xl font-bold text-slate-900">Customers</h1><p className="text-slate-500">Review customer contacts and confirmed travel activity.</p></div>
          <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 shadow-sm ring-1 ring-slate-200"><Users size={18} className="text-emerald-700"/><span className="text-sm font-semibold">{data?.pagination?.total || customers.length} customers</span></div>
        </div>
        <div className="mb-5 flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200"><Search size={19} className="text-slate-400"/><input value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}} placeholder="Search name, email or phone..." className="w-full outline-none"/></div>
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="overflow-x-auto"><table className="w-full"><thead className="bg-slate-50"><tr><th className="p-4 text-left">Customer</th><th className="p-4 text-left">Contact</th><th className="p-4 text-left">Bookings</th><th className="p-4 text-left">Confirmed spend</th></tr></thead>
          <tbody>{customers.map(c=><tr key={c._id} className="border-t hover:bg-slate-50"><td className="p-4"><div className="font-semibold">{c.name || "-"}</div><div className="text-sm text-slate-500">{c.customerType || "individual"}</div></td><td className="p-4"><div className="flex items-center gap-2 text-sm"><Mail size={15}/>{c.email || "-"}</div><div className="mt-1 flex items-center gap-2 text-sm text-slate-500"><Phone size={15}/>{c.phone || "-"}</div></td><td className="p-4 font-semibold">{c.totalBookings || 0}</td><td className="p-4 font-semibold">KES {Number(c.totalSpent || 0).toLocaleString()}</td></tr>)}{!customers.length&&<tr><td colSpan="4" className="p-10 text-center text-slate-500">No customers found.</td></tr>}</tbody></table></div>
          <div className="flex items-center justify-between border-t p-4"><span className="text-sm text-slate-500">Page {page} of {totalPages}</span><div className="flex gap-2"><button disabled={page<=1} onClick={()=>setPage(p=>p-1)} className="rounded-lg border p-2 disabled:opacity-40"><ChevronLeft size={18}/></button><button disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)} className="rounded-lg border p-2 disabled:opacity-40"><ChevronRight size={18}/></button></div></div>
        </div>
      </div>
    </div>
  );
}
