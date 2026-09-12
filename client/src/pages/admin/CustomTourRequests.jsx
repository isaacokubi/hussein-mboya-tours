import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, RefreshCw, SlidersHorizontal, MapPin, Users, Clock3, MessageSquareText, WalletCards, UserRound, Car, BriefcaseBusiness, Save, Send, XCircle, AlertCircle } from "lucide-react";
import { getAdminCustomTourRequests, quoteCustomTourRequest, assignCustomTourResources } from "../../api/customTourApi";
import { getAgents } from "../../api/adminAgentApi";
import { getGuides, getDrivers } from "../../api/tourApi";

const STATUS_STYLES = {
  pending: "border-amber-200 bg-amber-50 text-amber-800",
  quoted: "border-blue-200 bg-blue-50 text-blue-800",
  converted: "border-emerald-200 bg-emerald-50 text-emerald-800",
  declined: "border-rose-200 bg-rose-50 text-rose-800",
  rejected: "border-rose-200 bg-rose-50 text-rose-800",
  cancelled: "border-slate-300 bg-slate-100 text-slate-700",
};

const money = (value) => `Ksh ${Number(value || 0).toLocaleString("en-KE")}`;
const customerName = (request) => request.customer?.name || request.guestContact?.name || "Guest customer";
const customerEmail = (request) => request.customer?.email || request.guestContact?.email || "No email provided";

export default function CustomTourRequests() {
  const qc = useQueryClient();
  const [amounts, setAmounts] = useState({});
  const [notes, setNotes] = useState({});
  const [resources, setResources] = useState({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const requestsQuery = useQuery({
    queryKey: ["admin-custom-tour-requests"],
    queryFn: getAdminCustomTourRequests,
  });
  const agentsQuery = useQuery({ queryKey: ["admin-agents"], queryFn: getAgents });
  const guidesQuery = useQuery({ queryKey: ["custom-guides"], queryFn: getGuides });
  const driversQuery = useQuery({ queryKey: ["custom-drivers"], queryFn: getDrivers });

  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-custom-tour-requests"] });

  const assignMutation = useMutation({
    mutationFn: assignCustomTourResources,
    onSuccess: refresh,
  });

  const quoteMutation = useMutation({
    mutationFn: quoteCustomTourRequest,
    onSuccess: refresh,
  });

  const requests = requestsQuery.data?.requests || [];
  const filteredRequests = useMemo(() => {
    const term = search.trim().toLowerCase();
    return requests.filter((r) => {
      const matchesStatus = statusFilter === "all" || String(r.status || "").toLowerCase() === statusFilter;
      const haystack = `${r.destination || ""} ${customerName(r)} ${customerEmail(r)} ${r.requirements || ""}`.toLowerCase();
      return matchesStatus && (!term || haystack.includes(term));
    });
  }, [requests, search, statusFilter]);

  const stats = useMemo(() => ({
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    quoted: requests.filter((r) => r.status === "quoted").length,
    converted: requests.filter((r) => r.status === "converted").length,
    value: requests.reduce((sum, r) => sum + Number(r.quotedAmount || 0), 0),
  }), [requests]);

  const guideOptions = (guidesQuery.data || []).filter((x) => x.availability === "available");
  const driverOptions = (driversQuery.data || []).filter((x) => x.availability === "available");
  const agentOptions = (agentsQuery.data || []).filter((x) => x.status === "active" && x.isApproved !== false);

  if (requestsQuery.isLoading) {
    return <div className="min-h-screen bg-slate-100 p-6"><div className="mx-auto max-w-7xl animate-pulse space-y-5"><div className="h-36 rounded-3xl bg-slate-300" /><div className="h-24 rounded-2xl bg-white" /><div className="h-72 rounded-3xl bg-white" /></div></div>;
  }

  if (requestsQuery.isError) {
    return <div className="min-h-screen bg-slate-100 p-6"><div className="mx-auto max-w-3xl rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-sm"><AlertCircle className="mx-auto mb-3 text-rose-600" size={30} /><h2 className="text-lg font-bold text-slate-900">Unable to load custom tour requests</h2><p className="mt-1 text-sm text-slate-600">Please refresh and try again.</p><button onClick={() => requestsQuery.refetch()} className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700">Retry</button></div></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-indigo-100 p-4 text-slate-900 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-violet-950 p-6 text-white shadow-xl ring-1 ring-slate-800 sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-indigo-100"><BriefcaseBusiness size={14} /> Sales & Operations</div>
              <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Custom Tour Requests</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-200">Review bespoke travel requests, prepare quotes, assign operational resources and move customers toward conversion.</p>
            </div>
            <button onClick={refresh} disabled={requestsQuery.isFetching} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-bold text-white backdrop-blur hover:bg-white/20 disabled:opacity-60"><RefreshCw size={16} className={requestsQuery.isFetching ? "animate-spin" : ""} /> {requestsQuery.isFetching ? "Refreshing…" : "Refresh"}</button>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {[
            ["Total Requests", stats.total, "bg-sky-50 border-sky-200", "text-sky-700"],
            ["Pending", stats.pending, "bg-amber-50 border-amber-200", "text-amber-700"],
            ["Quoted", stats.quoted, "bg-blue-50 border-blue-200", "text-blue-700"],
            ["Converted", stats.converted, "bg-emerald-50 border-emerald-200", "text-emerald-700"],
            ["Quoted Value", money(stats.value), "bg-violet-50 border-violet-200 col-span-2 md:col-span-1", "text-violet-700"],
          ].map(([label, value, card, valueColor]) => <div key={label} className={`rounded-2xl border p-4 shadow-sm ${card}`}><p className="text-[11px] font-extrabold uppercase tracking-wide text-slate-600">{label}</p><p className={`mt-1 text-xl font-black ${valueColor}`}>{value}</p></div>)}
        </section>

        <section className="rounded-2xl border border-slate-300 bg-white p-3 shadow-sm sm:p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={17} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search destination, customer, email or requirements…" className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-3 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-500 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100" /></div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600"><SlidersHorizontal size={15} /> Status</div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"><option value="all">All statuses</option><option value="pending">Pending</option><option value="quoted">Quoted</option><option value="converted">Converted</option><option value="declined">Declined</option><option value="cancelled">Cancelled</option></select>
          </div>
          <div className="mt-3 text-xs font-bold text-slate-600">{filteredRequests.length} of {requests.length} requests shown</div>
        </section>

        <section className="space-y-5">
          {filteredRequests.map((r, index) => {
            const selected = resources[r._id] || {};
            const status = String(r.status || "pending").toLowerCase();
            return (
              <article key={r._id} className="overflow-hidden rounded-3xl border border-slate-300 bg-white shadow-lg shadow-slate-200/70 ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-xl">
                <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-indigo-50/70 p-5 sm:p-6">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2"><span className="rounded-lg bg-indigo-100 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-indigo-800">Request #{index + 1}</span><span className={`rounded-full border px-3 py-1 text-[11px] font-black capitalize ${STATUS_STYLES[status] || STATUS_STYLES.cancelled}`}>{status}</span></div>
                      <h2 className="mt-3 flex items-center gap-2 text-xl font-black text-slate-950 sm:text-2xl"><MapPin size={21} className="shrink-0 text-indigo-600" /> {r.destination || "Custom itinerary"}</h2>
                      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-slate-700"><span className="inline-flex items-center gap-1.5"><UserRound size={14} className="text-indigo-600" /> {customerName(r)}</span><span className="text-slate-400">{customerEmail(r)}</span><span className="inline-flex items-center gap-1.5"><Clock3 size={14} className="text-sky-600" /> {r.durationDays || 0} days</span><span className="inline-flex items-center gap-1.5"><Users size={14} className="text-emerald-600" /> {r.people || 0} people</span></div>
                    </div>
                    <div className="rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 xl:min-w-44"><p className="text-[10px] font-black uppercase tracking-wider text-violet-700">Quoted value</p><p className="mt-1 text-xl font-black text-violet-900">{money(r.quotedAmount)}</p></div>
                  </div>
                </div>

                <div className="grid gap-5 p-5 sm:p-6 xl:grid-cols-[1fr_1.15fr]">
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-700"><MessageSquareText size={15} className="text-indigo-600" /> Customer requirements</div><p className="whitespace-pre-wrap text-sm font-medium leading-6 text-slate-800">{r.requirements || "No additional requirements provided."}</p></div>
                    {r.adminNotes && <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4"><p className="mb-2 text-[10px] font-black uppercase tracking-wider text-blue-800">Latest admin message</p><p className="text-sm font-semibold leading-6 text-blue-950">{r.adminNotes}</p></div>}
                    <div className="rounded-2xl border border-slate-200 bg-white p-4"><div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-700"><WalletCards size={15} className="text-violet-600" /> Quote</div><p className="text-sm text-slate-600">Set the total customer-facing quote in Kenyan Shillings and include a clear message.</p></div>
                  </div>

                  <div className="rounded-2xl border border-slate-300 bg-slate-50 p-4 sm:p-5">
                    <div className="mb-4"><h3 className="text-sm font-black text-slate-950">Operational assignment</h3><p className="mt-1 text-xs font-medium text-slate-600">Allocate available resources for this request.</p></div>
                    <div className="grid gap-3 md:grid-cols-3">
                      <label className="block"><span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wide text-slate-700"><UserRound size={13} /> Guide</span><select value={selected.guide || ""} onChange={(e) => setResources({ ...resources, [r._id]: { ...selected, guide: e.target.value } })} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"><option value="">Unassigned</option>{guideOptions.map((x) => <option key={x._id} value={x._id}>{x.name || x.user?.name || x.email}</option>)}</select></label>
                      <label className="block"><span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wide text-slate-700"><Car size={13} /> Driver</span><select value={selected.driver || ""} onChange={(e) => setResources({ ...resources, [r._id]: { ...selected, driver: e.target.value } })} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"><option value="">Unassigned</option>{driverOptions.map((x) => <option key={x._id} value={x._id}>{x.name || x.user?.name || x.email}</option>)}</select></label>
                      <label className="block"><span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wide text-slate-700"><BriefcaseBusiness size={13} /> Agent</span><select value={selected.agent || ""} onChange={(e) => setResources({ ...resources, [r._id]: { ...selected, agent: e.target.value } })} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"><option value="">Unassigned</option>{agentOptions.map((x) => <option key={x._id} value={x._id}>{x.user?.name || x.companyName || x.email}</option>)}</select></label>
                    </div>
                    <button onClick={() => assignMutation.mutate({ id: r._id, ...selected })} disabled={assignMutation.isPending} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black text-white hover:bg-indigo-950 disabled:opacity-60"><Save size={15} /> {assignMutation.isPending ? "Saving assignment…" : "Save resource assignment"}</button>

                    <div className="my-5 border-t border-slate-300" />
                    <div className="grid gap-3 md:grid-cols-[180px_1fr]">
                      <label className="block"><span className="mb-1.5 block text-[11px] font-black uppercase tracking-wide text-slate-700">Quote amount (KES)</span><input type="number" min="0" value={amounts[r._id] ?? r.quotedAmount ?? ""} onChange={(e) => setAmounts({ ...amounts, [r._id]: e.target.value })} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-black text-slate-950 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" /></label>
                      <label className="block"><span className="mb-1.5 block text-[11px] font-black uppercase tracking-wide text-slate-700">Message to customer</span><input value={notes[r._id] ?? r.adminNotes ?? ""} onChange={(e) => setNotes({ ...notes, [r._id]: e.target.value })} placeholder="Add a professional customer message…" className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-950 outline-none placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" /></label>
                    </div>
                    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                      <button onClick={() => quoteMutation.mutate({ id: r._id, status: "quoted", quotedAmount: Number(amounts[r._id] ?? r.quotedAmount ?? 0), adminNotes: notes[r._id] ?? r.adminNotes ?? "" })} disabled={quoteMutation.isPending} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"><Send size={15} /> {quoteMutation.isPending ? "Sending…" : "Send quote"}</button>
                      <button onClick={() => quoteMutation.mutate({ id: r._id, status: "rejected", quotedAmount: 0, adminNotes: notes[r._id] || "Request declined" })} disabled={quoteMutation.isPending} className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-300 bg-white px-4 py-2.5 text-xs font-black text-rose-700 hover:bg-rose-50 disabled:opacity-60"><XCircle size={15} /> Decline</button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}

          {!filteredRequests.length && <div className="rounded-3xl border border-slate-300 bg-white p-12 text-center shadow-sm"><Search className="mx-auto mb-3 text-slate-400" size={30} /><h3 className="font-black text-slate-900">No matching requests</h3><p className="mt-1 text-sm text-slate-600">Try changing the search or status filter.</p></div>}
        </section>
      </div>
    </div>
  );
}
