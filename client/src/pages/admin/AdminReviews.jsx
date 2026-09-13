import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, RefreshCw, CheckCircle2, Clock3, XCircle, MessageSquare, Star, Trash2, ShieldCheck } from "lucide-react";
import { getAdminReviews, approveReview, rejectReview, deleteReview } from "../../api/adminReviewApi";

const statusOf = (r) => r?.approved ? "approved" : r?.rejected ? "rejected" : "pending";
const dateOf = (v) => v ? new Date(v).toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const rating = (v) => Math.max(0, Math.min(5, Number(v) || 0));
const META = {
  pending: ["Pending", "border-amber-200 bg-amber-50 text-amber-700", Clock3],
  approved: ["Approved", "border-emerald-200 bg-emerald-50 text-emerald-700", CheckCircle2],
  rejected: ["Rejected", "border-red-200 bg-red-50 text-red-700", XCircle],
};
function Badge({ status }) { const [label, cls, Icon] = META[status]; return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${cls}`}><Icon size={13} />{label}</span>; }

export default function AdminReviews() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 10;
  const { data, isLoading, isError, refetch, isFetching } = useQuery({ queryKey: ["admin-reviews"], queryFn: getAdminReviews });
  const reviews = Array.isArray(data?.reviews) ? data.reviews : Array.isArray(data) ? data : [];
  const mutation = useMutation({
    mutationFn: ({ action, id }) => action === "approve" ? approveReview(id) : action === "reject" ? rejectReview(id) : deleteReview(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-reviews"] }),
  });
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reviews.filter((r) => {
      const text = `${r?.user?.name || r?.customer?.name || ""} ${r?.user?.email || r?.customer?.email || ""} ${r?.tour?.title || ""} ${r?.title || ""} ${r?.comment || ""}`.toLowerCase();
      return (!q || text.includes(q)) && (filter === "all" || statusOf(r) === filter);
    });
  }, [reviews, search, filter]);
  const pages = Math.max(1, Math.ceil(filtered.length / limit));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice((currentPage - 1) * limit, currentPage * limit);
  useEffect(() => setPage(1), [search, filter]);
  const counts = { total: reviews.length, pending: reviews.filter(r => statusOf(r) === "pending").length, approved: reviews.filter(r => statusOf(r) === "approved").length, rejected: reviews.filter(r => statusOf(r) === "rejected").length };

  if (isLoading) return <div className="min-h-full bg-slate-50 p-6"><div className="mx-auto max-w-7xl rounded-2xl bg-white p-8 text-center shadow-sm">Loading reviews...</div></div>;
  if (isError) return <div className="min-h-full bg-slate-50 p-6"><div className="mx-auto max-w-7xl rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700"><p className="font-semibold">Failed to load reviews.</p><button onClick={() => refetch()} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-red-700 px-4 py-2 font-semibold text-white"><RefreshCw size={16}/>Retry</button></div></div>;

  return <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8"><div className="mx-auto max-w-7xl space-y-6">
    <header className="rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-green-600 p-6 text-white shadow-lg sm:p-8"><div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"><div><div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-emerald-100"><ShieldCheck size={17}/>Customer Experience</div><h1 className="text-2xl font-bold sm:text-3xl">Review Moderation</h1><p className="mt-2 text-sm text-emerald-50 sm:text-base">Review, approve and manage customer feedback before it appears publicly.</p></div><button onClick={() => refetch()} disabled={isFetching} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-emerald-800 disabled:opacity-60"><RefreshCw size={17} className={isFetching ? "animate-spin" : ""}/>Refresh</button></div></header>
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{[["Total Reviews",counts.total,"text-slate-900",MessageSquare],["Pending",counts.pending,"text-amber-700",Clock3],["Approved",counts.approved,"text-emerald-700",CheckCircle2],["Rejected",counts.rejected,"text-red-700",XCircle]].map(([label,value,cls,Icon]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><span className="text-sm font-medium text-slate-500">{label}</span><Icon size={18} className="text-slate-400"/></div><p className={`mt-2 text-2xl font-bold ${cls}`}>{value.toLocaleString()}</p></div>)}</div>
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex flex-col gap-3 lg:flex-row"><div className="relative flex-1"><Search size={18} className="absolute left-3 top-3.5 text-slate-400"/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customer, email, tour or review..." className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"/></div><select value={filter} onChange={e => setFilter(e.target.value)} className="rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-emerald-500"><option value="all">All Reviews</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select></div></section>
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="min-w-[1050px] w-full"><thead className="border-b border-slate-200 bg-slate-50"><tr>{["Customer","Tour","Rating","Review","Status","Submitted","Actions"].map(h => <th key={h} className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">{h}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{visible.map(r => { const s = statusOf(r); const name = r?.user?.name || r?.customer?.name || "Customer"; const email = r?.user?.email || r?.customer?.email || ""; const stars = rating(r?.rating); return <tr key={r._id} className="align-top hover:bg-slate-50/70"><td className="px-5 py-4"><p className="font-semibold text-slate-900">{name}</p><p className="mt-1 text-xs text-slate-500">{email || "No email"}</p></td><td className="px-5 py-4 text-sm font-medium text-slate-700">{r?.tour?.title || "Tour unavailable"}</td><td className="px-5 py-4"><div className="flex items-center gap-1" aria-label={`${stars} out of 5 stars`}>{[1,2,3,4,5].map(i => <Star key={i} size={16} className={i <= stars ? "fill-current text-amber-400" : "text-slate-300"}/>)}</div><span className="mt-1 block text-xs text-slate-500">{stars}/5</span></td><td className="max-w-sm px-5 py-4"><p className="font-semibold text-slate-800">{r?.title || "Customer review"}</p><p className="mt-1 line-clamp-3 text-sm leading-6 text-slate-600">{r?.comment || "No comment provided."}</p>{r?.verified && <span className="mt-2 inline-flex text-xs font-semibold text-emerald-700">Verified customer</span>}</td><td className="px-5 py-4"><Badge status={s}/>{s === "rejected" && r?.rejectionReason && <p className="mt-2 max-w-[180px] text-xs text-slate-500">{r.rejectionReason}</p>}</td><td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">{dateOf(r?.createdAt)}</td><td className="px-5 py-4"><div className="flex flex-wrap gap-2">{s !== "approved" && <button disabled={mutation.isPending} onClick={() => mutation.mutate({action:"approve",id:r._id})} className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">Approve</button>}{s !== "rejected" && <button disabled={mutation.isPending} onClick={() => mutation.mutate({action:"reject",id:r._id})} className="rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50">Reject</button>}<button disabled={mutation.isPending} onClick={() => { if (window.confirm(`Delete review by ${name}?`)) mutation.mutate({action:"delete",id:r._id}); }} className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"><Trash2 size={14}/>Delete</button></div></td></tr>; })}{!visible.length && <tr><td colSpan="7" className="px-6 py-14 text-center"><MessageSquare className="mx-auto text-slate-300" size={42}/><p className="mt-3 font-semibold text-slate-700">No reviews found</p><p className="mt-1 text-sm text-slate-500">Try another search or moderation filter.</p></td></tr>}</tbody></table></div></section>
    {filtered.length > 0 && <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-slate-500">Showing {(currentPage-1)*limit+1}–{Math.min(currentPage*limit,filtered.length)} of {filtered.length}</p><div className="flex gap-2">{Array.from({length:pages},(_,i)=><button key={i} onClick={() => setPage(i+1)} className={`rounded-lg px-3 py-2 text-sm font-semibold ${currentPage===i+1 ? "bg-emerald-700 text-white" : "border border-slate-300 bg-white text-slate-700"}`}>{i+1}</button>)}</div></div>}
  </div></div>;
}
