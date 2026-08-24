import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Bell, Check, RefreshCw } from "lucide-react";
import api from "../api/axios";
import { toast } from "react-toastify";

export default function Notifications() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const query = useQuery({ queryKey: ["notifications", page], queryFn: async () => (await api.get("/notifications", { params: { page, limit: 20 } })).data });
  const markRead = useMutation({ mutationFn: async (id) => (await api.put(`/notifications/${id}/read`)).data, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }), onError: (error) => toast.error(error?.response?.data?.message || "Unable to update notification.") });
  const notifications = query.data?.notifications || query.data?.data || [];
  const unread = notifications.filter((item) => !item.read).length;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-4xl space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div><div className="flex items-center gap-2"><Bell className="h-6 w-6 text-emerald-600" /><h1 className="text-3xl font-bold text-slate-900">Notification Center</h1></div><p className="mt-1 text-slate-500">Bookings, payments, tours and subscription alerts for your account.</p></div>
          <button type="button" onClick={() => query.refetch()} className="rounded-xl border bg-white p-3 text-slate-600 hover:bg-slate-50" aria-label="Refresh notifications"><RefreshCw className="h-5 w-5" /></button>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100"><span className="text-sm font-semibold text-slate-700">Unread on this page: {unread}</span></div>
        <section className="space-y-3">
          {query.isLoading && <div className="rounded-2xl bg-white p-8 text-center text-slate-500">Loading notifications...</div>}
          {!query.isLoading && !notifications.length && <div className="rounded-2xl bg-white p-8 text-center text-slate-500">You have no notifications.</div>}
          {notifications.map((item) => (
            <article key={item._id} className={`rounded-2xl bg-white p-5 shadow-sm ring-1 ${item.read ? "ring-slate-100" : "ring-emerald-200"}`}>
              <div className="flex items-start gap-4"><div className={`mt-1 rounded-full p-2 ${item.read ? "bg-slate-100 text-slate-500" : "bg-emerald-100 text-emerald-700"}`}><Bell className="h-4 w-4" /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-bold text-slate-900">{item.title}</h2><span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{item.type}</span></div><p className="mt-1 text-slate-600">{item.message}</p><p className="mt-2 text-xs text-slate-400">{item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}</p></div>{!item.read && <button type="button" disabled={markRead.isPending} onClick={() => markRead.mutate(item._id)} className="rounded-lg border px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><Check className="mr-1 inline h-4 w-4" />Mark read</button>}</div>
            </article>
          ))}
        </section>
        <div className="flex items-center justify-between"><button type="button" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded-xl border bg-white px-4 py-2 text-sm disabled:opacity-40">Previous</button><span className="text-sm font-semibold text-slate-500">Page {page} of {Math.max(1, Number(query.data?.pages || 1))}</span><button type="button" disabled={page >= Number(query.data?.pages || 1)} onClick={() => setPage((value) => value + 1)} className="rounded-xl border bg-white px-4 py-2 text-sm disabled:opacity-40">Next</button></div>
      </div>
    </div>
  );
}
