/**
 * Purpose: Assignment Notifications reusable UI component. Main declarations: notificationMessage, AssignmentNotifications.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useState } from "react";
// Load @tanstack/react-query so this module can use its exported dependencies.
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// Load ../../api/axios so this module can use its exported dependencies.
import api from "../../api/axios";
// Load ../../context/AuthContext so this module can use its exported dependencies.
import { useAuth } from "../../context/AuthContext";

// Declare PAGE_SIZE for use by the surrounding module or function.
const PAGE_SIZE = 10;
// Declare malformedGreeting for use by the surrounding module or function.
const malformedGreeting = /\bundefined\s+undefined\b/i;

// Declare notificationMessage for use by the surrounding module or function.
const notificationMessage = (message, user) => {
  // Declare text for use by the surrounding module or function.
  const text = String(message ?? "");
  // Check the condition (!malformedGreeting.test(text)) and run the matching branch.
  if (!malformedGreeting.test(text)) return text;
  // Declare name for use by the surrounding module or function.
  const name = String(user?.name || "Customer").replace(/\s+/g, " ").trim() || "Customer";
  // Return the result of text.replace() to the caller.
  return text.replace(/\bundefined\s+undefined\b/gi, name);
};

// Define AssignmentNotifications; its parameters and body implement this operation.
export default function AssignmentNotifications() {
  // Declare queryClient for use by the surrounding module or function.
  const queryClient = useQueryClient();
  // Declare { user } for use by the surrounding module or function.
  const { user } = useAuth();
  // Declare [page, setPage] for use by the surrounding module or function.
  const [page, setPage] = useState(1);
  // Declare { data, isLoading } for use by the surrounding module or function.
  const { data, isLoading } = useQuery({
    queryKey: ["assignment-notifications", page],
    queryFn: async () => (await api.get("/notifications", { params: { page, limit: PAGE_SIZE } })).data,
    refetchInterval: 30000,
    keepPreviousData: true,
  });
  // Declare notifications for use by the surrounding module or function.
  const notifications = (data?.notifications || data?.data || [])
    .filter((item) => !item.isArchived)
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  // Declare pages for use by the surrounding module or function.
  const pages = Math.max(1, Number(data?.pages || Math.ceil(Number(data?.total || 0) / PAGE_SIZE) || 1));
  // Declare readMutation for use by the surrounding module or function.
  const readMutation = useMutation({
    mutationFn: (id) => api.put(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["assignment-notifications"] }),
  });
  // Return the expression shown below to the caller.
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><h2 className="text-xl font-bold text-slate-900">Notifications</h2><p className="text-sm text-slate-500">System, booking, payment and operational updates.</p></div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{notifications.filter((n) => !n.read).length} unread</span>
      </div>
      {isLoading ? <p className="mt-5 text-slate-500">Loading notifications...</p> : notifications.length === 0 ? <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No notifications on this page.</p> : <div className="mt-4 space-y-3">{notifications.map((item) => <button key={item._id} type="button" onClick={() => !item.read && readMutation.mutate(item._id)} className={`block w-full rounded-xl border p-4 text-left ${item.read ? "border-slate-100 bg-white" : "border-emerald-200 bg-emerald-50/50"}`}><div className="flex justify-between gap-4"><strong className="text-slate-900">{item.title}</strong><span className="text-xs text-slate-400">{item.createdAt ? new Date(item.createdAt).toLocaleString("en-KE") : ""}</span></div><p className="mt-1 text-sm text-slate-600">{notificationMessage(item.message, user)}</p>{item.actionUrl && <p className="mt-2 text-xs font-semibold text-emerald-700">Open →</p>}</button>)}</div>}
      <div className="mt-5 flex items-center justify-between border-t pt-4"><button disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40">Previous</button><span className="text-sm font-semibold text-slate-500">Page {page} of {pages}</span><button disabled={page>=pages} onClick={()=>setPage(p=>Math.min(pages,p+1))} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40">Next</button></div>
    </section>
  );
}
