import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/axios";

const PAGE_SIZE = 5;

export default function AssignmentNotifications() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ["assignment-notifications", page],
    queryFn: async () => (await api.get("/notifications", { params: { page, limit: PAGE_SIZE } })).data,
    refetchInterval: 30000,
    keepPreviousData: true,
  });
  const notifications = (data?.notifications || data?.data || [])
    .filter((item) => !item.isArchived)
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  const pages = Math.max(1, Number(data?.pages || Math.ceil(Number(data?.total || 0) / PAGE_SIZE) || 1));
  const readMutation = useMutation({
    mutationFn: (id) => api.put(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["assignment-notifications"] }),
  });
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><h2 className="text-xl font-bold text-slate-900">Notifications</h2><p className="text-sm text-slate-500">System, booking, payment and operational updates.</p></div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{notifications.filter((n) => !n.read).length} unread</span>
      </div>
      {isLoading ? <p className="mt-5 text-slate-500">Loading notifications...</p> : notifications.length === 0 ? <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No notifications on this page.</p> : <div className="mt-4 space-y-3">{notifications.map((item) => <button key={item._id} type="button" onClick={() => !item.read && readMutation.mutate(item._id)} className={`block w-full rounded-xl border p-4 text-left ${item.read ? "border-slate-100 bg-white" : "border-emerald-200 bg-emerald-50/50"}`}><div className="flex justify-between gap-4"><strong className="text-slate-900">{item.title}</strong><span className="text-xs text-slate-400">{item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}</span></div><p className="mt-1 text-sm text-slate-600">{item.message}</p>{item.actionUrl && <p className="mt-2 text-xs font-semibold text-emerald-700">Open →</p>}</button>)}</div>}
      <div className="mt-5 flex items-center justify-between border-t pt-4"><button disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40">Previous</button><span className="text-sm font-semibold text-slate-500">Page {page} of {pages}</span><button disabled={page>=pages} onClick={()=>setPage(p=>Math.min(pages,p+1))} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40">Next</button></div>
    </section>
  );
}