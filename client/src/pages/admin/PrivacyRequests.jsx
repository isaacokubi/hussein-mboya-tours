import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock3, RefreshCw, ShieldCheck, UserRound } from "lucide-react";
import { toast } from "react-toastify";
import { getPrivacyRequests, updatePrivacyRequest } from "../../api/privacyApi";

const STATUSES = ["received", "identity_verification", "in_progress", "completed", "rejected", "cancelled"];
const TYPES = { access: "Access", correction: "Correction", deletion: "Deletion", portability: "Portability", objection: "Objection", restriction: "Restriction" };
const STATUS_LABELS = { received: "Received", identity_verification: "Identity verification", in_progress: "In progress", completed: "Completed", rejected: "Rejected", cancelled: "Cancelled" };
const clean = (value) => {
  const text = String(value ?? "").trim().replace(/\s+/g, " ");
  return text && !/^undefined( undefined)?$/i.test(text) && !/^null( null)?$/i.test(text) ? text : "";
};
const requester = (r) => {
  const person = r?.requester || r?.customer || r?.user || {};
  const personName = clean(person?.name) || clean(person?.fullName) || `${clean(person?.firstName)} ${clean(person?.lastName)}`.trim();
  const snapshotName = clean(r?.requesterName) || `${clean(r?.requesterFirstName)} ${clean(r?.requesterLastName)}`.trim();
  const name = personName || snapshotName || "Requester";
  const email = clean(person?.email) || clean(r?.requesterEmail);
  const phone = clean(person?.phone) || clean(r?.requesterPhone);
  return { name, email, phone };
};
const formatDate = (value, withTime = false) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, withTime ? {} : { year: "numeric", month: "numeric", day: "numeric" });
};
const nextStatuses = (status) => ({
  received: ["identity_verification", "in_progress", "rejected", "cancelled"],
  identity_verification: ["in_progress", "rejected", "cancelled"],
  in_progress: ["completed", "rejected", "cancelled"],
  completed: [],
  rejected: [],
  cancelled: [],
}[status] || []);

export default function PrivacyRequests() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const query = useQuery({ queryKey: ["privacy-requests"], queryFn: () => getPrivacyRequests(), staleTime: 15000 });
  const allRequests = Array.isArray(query.data?.data) ? query.data.data : Array.isArray(query.data) ? query.data : [];
  const requests = useMemo(() => {
    if (!filter) return allRequests;
    return allRequests.filter((r) => String(r?.status || "").toLowerCase() === filter);
  }, [allRequests, filter]);
  const mutation = useMutation({
    mutationFn: ({ id, payload }) => updatePrivacyRequest(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["privacy-requests"] });
      toast.success("Privacy request updated successfully.");
    },
    onError: (e) => toast.error(e?.response?.data?.message || "Unable to update privacy request."),
  });
  const summary = useMemo(() => STATUSES.reduce((acc, status) => ({ ...acc, [status]: allRequests.filter((r) => String(r?.status || "").toLowerCase() === status).length }), {}), [allRequests]);
  const selectRequest = (request) => {
    setSelected(request);
    setResolutionNotes(clean(request?.resolutionNotes));
  };

  return <div className="admin-control-center min-h-screen bg-[var(--tenant-background,#f8fafc)] p-4 text-[var(--tenant-text,#0f172a)] md:p-6"><div className="mx-auto max-w-7xl">
    <header className="mb-6 rounded-3xl bg-gradient-to-r from-slate-950 via-emerald-950 to-emerald-900 p-6 text-white shadow-xl"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-widest text-emerald-300">ODPC / Privacy governance</p><h1 className="mt-2 text-3xl font-bold">Data-subject requests</h1><p className="mt-2 max-w-3xl text-slate-300">Track access, correction, deletion, portability, objection and restriction requests with tenant-scoped deadlines, assignment and resolution notes.</p></div><button type="button" onClick={() => query.refetch()} disabled={query.isFetching} className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold hover:bg-white/10 disabled:opacity-60"><RefreshCw size={16}/>{query.isFetching ? "Refreshing..." : "Refresh"}</button></div></header>
    <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">{STATUSES.map((status) => <div key={status} className="admin-panel rounded-2xl p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{STATUS_LABELS[status]}</p><p className="mt-2 text-2xl font-black text-slate-900">{summary[status] || 0}</p></div>)}</div>
    <div className="mb-5 flex flex-wrap items-center gap-3"><label htmlFor="privacy-status-filter" className="text-sm font-semibold text-slate-700">Filter status</label><select id="privacy-status-filter" value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-xl border bg-white px-3 py-2"><option value="">All requests</option>{STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}</select><span className="text-sm text-slate-500">Showing {requests.length} of {allRequests.length} request{allRequests.length === 1 ? "" : "s"}</span></div>
    {query.isLoading ? <div className="admin-panel rounded-2xl p-8 text-slate-500">Loading privacy requests...</div> : query.isError ? <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">Unable to load privacy requests. Check permissions and retry.</div> : <div className="grid gap-5 lg:grid-cols-[1.4fr_.8fr]">
      <section className="admin-panel overflow-hidden rounded-2xl"><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-emerald-50 text-xs uppercase tracking-wide text-emerald-950"><tr><th className="px-4 py-3">Request</th><th className="px-4 py-3">Requester</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Due</th></tr></thead><tbody className="divide-y divide-slate-100">{requests.map((r) => { const person = requester(r); const status = String(r?.status || "").toLowerCase(); return <tr key={r._id} onClick={() => selectRequest(r)} className={`cursor-pointer hover:bg-emerald-50/50 ${selected?._id === r._id ? "bg-emerald-50" : ""}`}><td className="px-4 py-4"><b>{clean(r.requestNumber) || clean(r._id) || "Request"}</b><div className="mt-1 text-xs text-slate-500">{TYPES[r.type] || clean(r.type) || "Unspecified"}</div></td><td className="px-4 py-4"><div className="font-semibold text-slate-900">{person.name}</div><div className="text-xs text-slate-500">{person.email || person.phone || "No contact details"}</div></td><td className="px-4 py-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold">{STATUS_LABELS[status] || clean(r.status) || "Unknown"}</span></td><td className="px-4 py-4"><div className="font-semibold">{formatDate(r.dueAt)}</div><div className="text-xs text-slate-500">Received {formatDate(r.receivedAt || r.createdAt)}</div></td></tr>; })}{!requests.length && <tr><td colSpan="4" className="px-4 py-12 text-center text-slate-500">No privacy requests match this filter.</td></tr>}</tbody></table></div></section>
      <section className="admin-panel rounded-2xl p-5">{selected ? (() => { const person = requester(selected); const status = String(selected.status || "").toLowerCase(); return <><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{TYPES[selected.type] || clean(selected.type) || "Privacy request"}</p><h2 className="mt-1 text-xl font-bold">{clean(selected.requestNumber) || "Request"}</h2></div><ShieldCheck className="text-emerald-700"/></div><div className="mt-5 space-y-3 text-sm"><div className="rounded-xl bg-slate-50 p-3"><div className="flex items-center gap-2 font-semibold"><UserRound size={16}/> {person.name}</div><p className="mt-1 text-slate-500">{person.email || "No email"} · {person.phone || "No phone"}</p></div><div className="flex items-center gap-2 text-slate-600"><Clock3 size={16}/> Due {formatDate(selected.dueAt, true)}</div><div><label htmlFor="privacy-status" className="mb-1 block font-semibold">Move status</label><select id="privacy-status" className="w-full rounded-xl border px-3 py-2" value={status} onChange={(e) => { const next = e.target.value; if (next !== status) mutation.mutate({ id: selected._id, payload: { status: next } }); }} disabled={mutation.isPending}><option value={status}>{STATUS_LABELS[status] || status || "Unknown"}</option>{nextStatuses(status).map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}</select></div><div><label htmlFor="privacy-resolution-notes" className="mb-1 block font-semibold">Resolution notes</label><textarea value={resolutionNotes} onChange={(e) => setResolutionNotes(e.target.value)} id="privacy-resolution-notes" rows="5" className="w-full rounded-xl border px-3 py-2" placeholder="Record the action taken and evidence reference." /></div><button type="button" disabled={mutation.isPending} onClick={() => mutation.mutate({ id: selected._id, payload: { resolutionNotes } })} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 font-semibold text-white disabled:opacity-50"><CheckCircle2 size={16}/> Save resolution notes</button></div></>; })() : <div className="py-16 text-center text-slate-500">Select a request to review its details and workflow.</div>}</section>
    </div>}
  </div></div>;
}
