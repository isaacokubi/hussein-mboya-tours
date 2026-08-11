import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, UserRound, Phone, Mail, CalendarDays, BriefcaseBusiness } from "lucide-react";
import { getGuides } from "../../api/tourManagerApi";

export default function TourManagerGuides() {
  const [search, setSearch] = useState("");
  const { data, isLoading, isError, error } = useQuery({ queryKey: ["tour-manager-guides"], queryFn: getGuides });
  const guides = Array.isArray(data?.guides) ? data.guides : Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
  const filtered = useMemo(() => guides.filter(g => {
    const q = search.toLowerCase();
    return !q || [g.name,g.email,g.phone,g.position,g.availability].some(v => String(v || "").toLowerCase().includes(q));
  }), [guides, search]);

  const stats = {
    total: guides.length,
    available: guides.filter(g=>g.availability==="available").length,
    busy: guides.filter(g=>g.availability==="busy").length,
  };

  if (isLoading) return <div className="p-6">Loading guides...</div>;
  if (isError) return <div className="p-6 text-red-600">{error?.response?.data?.message || "Failed to load guides."}</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">People & assignments</p>
          <h1 className="text-3xl font-bold text-slate-900">Guide Operations</h1>
          <p className="mt-1 text-slate-500">Monitor guide availability, workload and contact details before assigning tours.</p>
        </div>
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          {[
            ["Total guides",stats.total],
            ["Available now",stats.available],
            ["Currently busy",stats.busy],
          ].map(([label,value])=><div key={label} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></div>)}
        </div>
        <div className="mb-6 flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200"><Search size={19} className="text-slate-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search guides by name, phone, email or availability..." className="w-full outline-none"/></div>
        {!filtered.length ? <div className="rounded-2xl bg-white p-10 text-center text-slate-500 shadow-sm">No guides match the current filter.</div> :
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{filtered.map(guide=><article key={guide._id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-start justify-between"><div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700"><UserRound/></div><div><h2 className="text-lg font-bold">{guide.name || "Unnamed Guide"}</h2><p className="text-sm capitalize text-slate-500">{String(guide.position || "guide").replace("_"," ")}</p></div></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${guide.availability==="available"?"bg-emerald-100 text-emerald-700":guide.availability==="busy"?"bg-amber-100 text-amber-700":"bg-slate-100 text-slate-600"}`}>{guide.availability || "available"}</span></div>
            <div className="mt-5 space-y-3 text-sm text-slate-600"><div className="flex gap-2"><Mail size={16}/>{guide.email || "No email"}</div><div className="flex gap-2"><Phone size={16}/>{guide.phone || "No phone"}</div><div className="flex gap-2"><BriefcaseBusiness size={16}/>Assigned tours: {guide.assignedTours?.length || 0}</div><div className="flex gap-2"><CalendarDays size={16}/>Completed tours: {guide.completedTours || 0}</div></div>
          </article>)}</div>}
      </div>
    </div>
  );
}
