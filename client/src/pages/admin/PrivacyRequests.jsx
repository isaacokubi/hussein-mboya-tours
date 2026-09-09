import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock3, RefreshCw, ShieldCheck, UserRound } from "lucide-react";
import { toast } from "react-toastify";
import { getPrivacyRequests, updatePrivacyRequest } from "../../api/privacyApi";

const STATUSES = ["received", "identity_verification", "in_progress", "completed", "rejected", "cancelled"];
const TYPES = { access: "Access", correction: "Correction", deletion: "Deletion", portability: "Portability", objection: "Objection", restriction: "Restriction" };
const STATUS_LABELS = { received: "Received", identity_verification: "Identity verification", in_progress: "In progress", completed: "Completed", rejected: "Rejected", cancelled: "Cancelled" };

const nextStatuses = (status) => ({
  received: ["identity_verification", "in_progress", "rejected", "cancelled"],
  identity_verification: ["in_progress", "rejected", "cancelled"],
  in_progress: ["completed", "rejected", "cancelled"],
  completed: [], rejected: [], cancelled: [],
}[status] || []);

export default function PrivacyRequests() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const query = useQuery({ queryKey: ["privacy-requests", filter], queryFn: () => getPrivacyRequests(filter), staleTime: 15000 });
  const requests = query.data?.data || query.data || [];

  const mutation = useMutation({
    mutationFn: ({ id, payload }) => updatePrivacyRequest(id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["privacy-requests"] }); toast.success("Privacy request updated."); },
    onError: (e) => toast.error(e?.response?.data?.message || "Unable to update privacy request."),
  });

  const summary = useMemo(() => STATUSES.reduce((acc, status) => ({ ...acc, [status]: requests.filter((r) => r.status === status).length }), {}), [requests]);

  return <div className="min-h-screen bg-slate-50 p-4 md:p-6">
    <div className="mx-auto max-w-7xl">
      <header className="mb-6 rounded-3xl bg-slate-950 p-6 text-white shadow-xl">
        <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-widest text-emerald-300">ODPC / Privacy governance</p><h1 className="mt-2 text-3xl font-bold">Data-subject requests</h1><p className="mt-2 max-w-3xl text-slate-300">Track access, correction, deletion, portability, objection and restriction requests with tenant-scoped deadlines, assignment and resolution notes.</p></div><button onClick={() => query.refetch()} className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold hover:bg-white/10"><RefreshCw size={16}/> Refresh</button></div>
      </header>
      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">{STATUSES.map((status) => <div key={status} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{STATUS_LABELS[status]}</p><p className="mt-2 text-2xl font-black text-slate-900">{summary[status] || 0}</p></div>)}</div>
      <div className="mb-5 flex flex-wrap items-center gap-3"><label className="text-sm font-semibold text-slate-700">Filter status</label><select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-xl border bg-white px-3 py-2"><option value="">All requests</option>{STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}</select><span className="text-sm text-slate-500">{requests.length} request{requests.length === 1 ? "" : "s"}</span></div>
      {query.isLoading ? <div className="rounded-2xl bg-white p-8 text-slate-500">Loading privacy requests...</div> : query.isError ? <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">Unable to load privacy requests. Check permissions and retry.</div> : <div className="grid gap-5 lg:grid-cols-[1.4fr_.8fr]">
        <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200"><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Request</th><th className="px-4 py-3">Requester</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Due</th></tr></thead><tbody className="divide-y divide-slate-100">{requests.map((r) => <tr key={r._id} onClick={() => setSelected(r)} className={`cursor-pointer hover:bg-slate-50 ${selected?._id === r._id ? "bg-emerald-50/50" : ""}`}><td className="px-4 py-4"><b>{r.requestNumber}</b><div className="mt-1 text-xs text-slate-500">{TYPES[r.type] || r.type}</div></td><td className="px-4 py-4"><div className="font-semibold">{r.requesterName}</div><div className="text-xs text-slate-500">{r.requesterEmail || r.requesterPhone || "No contact"}</div></td><td className="px-4 py-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold">{STATUS_LABELS[r.status] || r.status}</span></td><td className="px-4 py-4"><div className="font-semibold">{r.dueAt ? new Date(r.dueAt).toLocaleDateString() : "—"}</div><div className="text-xs text-slate-500">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}</div></td></tr>)}{!requests.length && <tr><td colSpan="4" className="px-4 py-12 text-center text-slate-500">No privacy requests match this filter.</td></tr>}</tbody></table></div></section>
        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">{selected ? <><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{TYPES[selected.type] || selected.type}</p><h2 className="mt-1 text-xl font-bold">{selected.requestNumber}</h2></div><ShieldCheck className="text-emerald-700"/></div><div className="mt-5 space-y-3 text-sm"><div className="rounded-xl bg-slate-50 p-3"><div className="flex items-center gap-2 font-semibold"><UserRound size={16}/> {selected.requesterName}</div><p className="mt-1 text-slate-500">{selected.requesterEmail || "No email"} · {selected.requesterPhone || "No phone"}</p></div><div className="flex items-center gap-2 text-slate-600"><Clock3 size={16}/> Due {selected.dueAt ? new Date(selected.dueAt).toLocaleString() : "—"}</div><div><label className="mb-1 block font-semibold">Move status</label><select className="w-full rounded-xl border px-3 py-2" value={selected.status} onChange={(e) => { const status = e.target.value; if (status !== selected.status) mutation.mutate({ id: selected._id, payload: { status } }); }} disabled={mutation.isPending}><option value={selected.status}>{STATUS_LABELS[selected.status]}</option>{nextStatuses(selected.status).map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}</select></div><div><label className="mb-1 block font-semibold">Resolution notes</label><textarea defaultValue={selected.resolutionNotes || ""} id="privacy-resolution-notes" rows="5" className="w-full rounded-xl border px-3 py-2" placeholder="Record the action taken and evidence reference." /></div><button disabled={mutation.isPending} onClick={() => mutation.mutate({ id: selected._id, payload: { resolutionNotes: document.getElementById("privacy-resolution-notes")?.value || "" } })} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 font-semibold text-white disabled:opacity-50"><CheckCircle2 size={16}/> Save resolution notes</button></div></> : <div className="py-16 text-center text-slate-500">Select a request to review its details and workflow.</div>}</section>
      </div>}
    </div>
  </div>;
}
