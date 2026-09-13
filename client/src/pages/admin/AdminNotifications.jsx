import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, ChevronLeft, ChevronRight, Loader2, RefreshCw, Search, Send, Users, X } from "lucide-react";
import api from "../../api/axios";
import { toast } from "react-toastify";

const groups = [
  ["guide", "Guides"],
  ["driver", "Drivers"],
  ["agent", "Agents"],
  ["manager", "Managers"],
  ["admin", "Administrators"],
];

const types = [
  ["system", "System"],
  ["assignment", "Assignment"],
  ["tour_update", "Tour Update"],
  ["alert", "Alert"],
  ["promotion", "Promotion"],
];

const priorities = [
  ["normal", "Normal"],
  ["low", "Low"],
  ["high", "High"],
  ["urgent", "Urgent"],
];

const roleLabel = (user) => user?.roleId?.displayName || user?.role || user?.legacyRole || "Staff";
const userLabel = (user) => user?.name || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || user?.email || "Unnamed user";

export default function AdminNotifications() {
  const queryClient = useQueryClient();
  const [roles, setRoles] = useState([]);
  const [recipientIds, setRecipientIds] = useState([]);
  const [recipientSearch, setRecipientSearch] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("system");
  const [priority, setPriority] = useState("normal");
  const [actionUrl, setActionUrl] = useState("");
  const [page, setPage] = useState(1);

  const recipientsQuery = useQuery({
    queryKey: ["notification-recipients"],
    queryFn: async () => (await api.get("/notifications/recipients", { params: { roles: "guide,driver,agent,manager,admin" } })).data,
  });

  const notificationsQuery = useQuery({
    queryKey: ["admin-notifications", page],
    queryFn: async () => (await api.get("/notifications", { params: { page, limit: 5 } })).data,
  });

  const recipients = recipientsQuery.data?.recipients || [];
  const notifications = notificationsQuery.data?.notifications || notificationsQuery.data?.data || [];
  const totalPages = Math.max(1, Number(notificationsQuery.data?.pages || notificationsQuery.data?.totalPages || 1));

  const filteredRecipients = useMemo(() => {
    const term = recipientSearch.trim().toLowerCase();
    if (!term) return recipients;
    return recipients.filter((user) => `${userLabel(user)} ${user?.email || ""} ${roleLabel(user)}`.toLowerCase().includes(term));
  }, [recipients, recipientSearch]);

  const selectedCount = recipientIds.length;
  const canSend = Boolean(title.trim() && message.trim() && (roles.length || recipientIds.length));

  const sendMutation = useMutation({
    mutationFn: async (payload) => (await api.post("/notifications/internal", payload)).data,
    onSuccess: (data) => {
      toast.success(data?.message || "Notification sent successfully.");
      setTitle("");
      setMessage("");
      setActionUrl("");
      setRecipientIds([]);
      setRoles([]);
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
    },
    onError: (error) => toast.error(error?.response?.data?.message || "Failed to send notification."),
  });

  const toggleRole = (role) => setRoles((current) => current.includes(role) ? current.filter((item) => item !== role) : [...current, role]);
  const toggleRecipient = (id) => setRecipientIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  const toggleVisibleRecipients = () => {
    const visibleIds = filteredRecipients.map((user) => user._id).filter(Boolean);
    const allSelected = visibleIds.length > 0 && visibleIds.every((id) => recipientIds.includes(id));
    setRecipientIds((current) => allSelected ? current.filter((id) => !visibleIds.includes(id)) : [...new Set([...current, ...visibleIds])]);
  };

  const clearComposer = () => {
    setTitle("");
    setMessage("");
    setActionUrl("");
    setRecipientIds([]);
    setRoles([]);
  };

  const submit = (event) => {
    event.preventDefault();
    if (!title.trim() || !message.trim()) return toast.error("Enter a notification title and message.");
    if (!roles.length && !recipientIds.length) return toast.error("Select at least one recipient group or specific recipient.");
    if (actionUrl && !actionUrl.startsWith("/") && !/^https?:\/\//i.test(actionUrl)) return toast.error("Action URL must be a relative path or a valid http(s) URL.");
    sendMutation.mutate({ roles, recipientIds, title: title.trim(), message: message.trim(), type, priority, actionUrl: actionUrl.trim() });
  };

  const formatDate = (value) => {
    if (!value) return "Date unavailable";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700"><Bell size={22} /></div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Administration</p>
                <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">Notifications</h1>
                <p className="mt-1 max-w-2xl text-sm text-slate-500">Send targeted operational messages to internal teams without losing recipient context or delivery visibility.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600">
              <Users size={16} /> {recipients.length} eligible recipients
            </div>
          </div>
        </header>

        <form onSubmit={submit} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-slate-900">Send internal notification</h2>
                <p className="mt-1 text-xs text-slate-500">Choose groups, individuals, or both.</p>
              </div>
              <button type="button" onClick={clearComposer} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100"><X size={14} /> Clear</button>
            </div>
          </div>

          <div className="space-y-5 p-5 sm:p-6">
            <div className="grid gap-5 lg:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-slate-700">Recipient groups</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {groups.map(([value, label]) => {
                    const selected = roles.includes(value);
                    return <button key={value} type="button" onClick={() => toggleRole(value)} aria-pressed={selected} className={`rounded-xl border px-3.5 py-2 text-sm font-semibold transition ${selected ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50"}`}>{selected && <Check className="mr-1 inline" size={14} />}{label}</button>;
                  })}
                </div>
                {roles.length > 0 && <p className="mt-2 text-xs font-medium text-emerald-700">{roles.length} group{roles.length === 1 ? "" : "s"} selected</p>}
              </div>

              <div>
                <div className="flex items-center justify-between gap-2">
                  <label className="text-sm font-semibold text-slate-700">Specific recipients</label>
                  <button type="button" onClick={toggleVisibleRecipients} disabled={!filteredRecipients.length} className="text-xs font-semibold text-emerald-700 disabled:text-slate-300">Select / clear visible</button>
                </div>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input value={recipientSearch} onChange={(event) => setRecipientSearch(event.target.value)} placeholder="Search name, email or role" className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
                </div>
                <div className="mt-2 max-h-52 overflow-y-auto rounded-xl border border-slate-200">
                  {recipientsQuery.isLoading ? <div className="flex items-center gap-2 p-4 text-sm text-slate-500"><Loader2 className="animate-spin" size={16} /> Loading recipients...</div> : filteredRecipients.map((user) => {
                    const selected = recipientIds.includes(user._id);
                    return <label key={user._id} className={`flex cursor-pointer items-center gap-3 border-b border-slate-100 p-3 last:border-0 ${selected ? "bg-emerald-50/60" : "hover:bg-slate-50"}`}>
                      <input type="checkbox" checked={selected} onChange={() => toggleRecipient(user._id)} className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                      <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-slate-800">{userLabel(user)}</span><span className="block truncate text-xs text-slate-500">{roleLabel(user)}{user?.email ? ` · ${user.email}` : ""}</span></span>
                    </label>;
                  })}
                  {!recipientsQuery.isLoading && !filteredRecipients.length && <p className="p-4 text-sm text-slate-500">No matching active recipients.</p>}
                </div>
                <p className="mt-2 text-xs text-slate-500">{selectedCount} specific recipient{selectedCount === 1 ? "" : "s"} selected</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="md:col-span-2"><label className="text-xs font-semibold text-slate-600">Title</label><input value={title} maxLength={120} onChange={(event) => setTitle(event.target.value)} placeholder="Notification title" className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /><p className="mt-1 text-right text-[11px] text-slate-400">{title.length}/120</p></div>
              <div><label className="text-xs font-semibold text-slate-600">Type</label><select value={type} onChange={(event) => setType(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100">{types.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div><label className="text-xs font-semibold text-slate-600">Priority</label><select value={priority} onChange={(event) => setPriority(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100">{priorities.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
              <div><label className="text-xs font-semibold text-slate-600">Action URL <span className="font-normal text-slate-400">(optional)</span></label><input value={actionUrl} onChange={(event) => setActionUrl(event.target.value)} placeholder="/admin/bookings or https://..." className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /></div>
            </div>

            <div><div className="flex items-center justify-between"><label className="text-xs font-semibold text-slate-600">Message</label><span className="text-[11px] text-slate-400">{message.length}/2000</span></div><textarea value={message} maxLength={2000} onChange={(event) => setMessage(event.target.value)} rows={5} placeholder="Write the operational message..." className="mt-1.5 w-full resize-y rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /></div>

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">{canSend ? "Ready to send." : "Add a title, message and at least one recipient."}</p>
              <button disabled={sendMutation.isPending || !canSend} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"><Send size={16} />{sendMutation.isPending ? "Sending..." : "Send notification"}</button>
            </div>
          </div>
        </form>

        <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div><h2 className="font-bold text-slate-900">Recent notification activity</h2><p className="mt-1 text-xs text-slate-500">Notifications currently visible to this administrator account.</p></div>
            <button type="button" onClick={() => notificationsQuery.refetch()} disabled={notificationsQuery.isFetching} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"><RefreshCw className={notificationsQuery.isFetching ? "animate-spin" : ""} size={14} /> Refresh</button>
          </div>
          <div className="divide-y divide-slate-100">
            {notificationsQuery.isLoading && <div className="flex items-center gap-2 p-6 text-sm text-slate-500"><Loader2 className="animate-spin" size={17} /> Loading notification activity...</div>}
            {notificationsQuery.isError && <div className="p-6 text-sm text-red-600">Unable to load notification activity. Refresh and try again.</div>}
            {!notificationsQuery.isLoading && !notificationsQuery.isError && notifications.map((item) => <article key={item._id} className="p-5 sm:px-6"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-slate-900">{item.title || "Untitled notification"}</h3><span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600">{item.type || "system"}</span>{item.priority && item.priority !== "normal" && <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-700">{item.priority}</span>}</div><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-600">{item.message || "No message"}</p></div><time className="shrink-0 text-xs text-slate-400">{formatDate(item.createdAt || item.updatedAt)}</time></div></article>)}
            {!notificationsQuery.isLoading && !notificationsQuery.isError && !notifications.length && <div className="p-8 text-center text-sm text-slate-500">No notification activity found.</div>}
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 sm:px-6"><button disabled={page <= 1 || notificationsQuery.isFetching} onClick={() => setPage((current) => Math.max(1, current - 1))} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft size={16} /> Previous</button><span className="text-xs font-semibold text-slate-500">Page {page} of {totalPages}</span><button disabled={page >= totalPages || notificationsQuery.isFetching} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40">Next <ChevronRight size={16} /></button></div>
        </section>
      </div>
    </div>
  );
}
