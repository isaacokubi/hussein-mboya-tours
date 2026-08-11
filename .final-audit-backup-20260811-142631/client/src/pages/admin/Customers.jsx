import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { getCustomers } from "../../api/customerApi";

export default function Customers() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = useQuery({
    queryKey:["customers",search,page],
    queryFn:()=>getCustomers({search,page,limit:10}),
    keepPreviousData:true,
  });
  const customers = Array.isArray(data?.data) ? data.data : Array.isArray(data?.customers) ? data.customers : [];
  const pages = Math.max(1, Number(data?.pagination?.pages || data?.pages || 1));
  if (isLoading) return <div className="p-6">Loading customers...</div>;
  if (isError) return <div className="p-6 text-red-600">Failed to load customers: {error?.response?.data?.message || error?.message}</div>;

  return <div className="min-h-screen bg-slate-50 p-6"><div className="mx-auto max-w-7xl">
    <div className="mb-6 flex items-end justify-between"><div><p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Customer relationship management</p><h1 className="text-3xl font-bold text-slate-900">Customers</h1><p className="text-slate-500">Only genuine customer accounts are shown; spend reflects confirmed and paid bookings.</p></div><div className="rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200"><Users size={18} className="inline text-emerald-700"/> <strong>{data?.pagination?.total || 0}</strong> customers</div></div>
    <div className="mb-5 flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200"><Search size={19} className="text-slate-400"/><input value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}} placeholder="Search customer name, email or phone..." className="w-full outline-none"/>{search&&<button onClick={()=>setSearch("")} className="text-sm text-slate-500">Clear</button>}</div>
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200"><div className="overflow-x-auto"><table className="w-full"><thead className="bg-slate-50"><tr><th className="p-4 text-left">Customer</th><th className="p-4 text-left">Phone</th><th className="p-4 text-left">Type</th><th className="p-4 text-left">Bookings</th><th className="p-4 text-left">Confirmed spend</th></tr></thead><tbody>{customers.map(c=><tr key={c._id} className="border-t hover:bg-slate-50"><td className="p-4"><div className="font-semibold">{c.name}</div><div className="text-sm text-slate-500">{c.email}</div></td><td className="p-4">{c.phone||"-"}</td><td className="p-4 capitalize">{c.customerType||"individual"}</td><td className="p-4">{c.totalBookings||0}</td><td className="p-4 font-semibold">KES {Number(c.totalSpent||0).toLocaleString()}</td></tr>)}{!customers.length&&<tr><td colSpan="5" className="p-10 text-center text-slate-500">No customers found.</td></tr>}</tbody></table></div><div className="flex items-center justify-between border-t p-4"><span className="text-sm text-slate-500">Page {page} of {pages}</span><div className="flex gap-2"><button disabled={page<=1} onClick={()=>setPage(p=>p-1)} className="rounded-lg border p-2 disabled:opacity-40"><ChevronLeft size={18}/></button><button disabled={page>=pages} onClick={()=>setPage(p=>p+1)} className="rounded-lg border p-2 disabled:opacity-40"><ChevronRight size={18}/></button></div></div></div>
  </div></div>;
}
