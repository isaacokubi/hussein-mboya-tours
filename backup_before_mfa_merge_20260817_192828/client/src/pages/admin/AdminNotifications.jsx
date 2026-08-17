import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import api from "../../api/axios";
import { toast } from "react-toastify";

const groups = [
  ["guide", "Guides"],
  ["driver", "Drivers"],
  ["agent", "Agents"],
  ["manager", "Managers"],
  ["admin", "Administrators"],
];

export default function AdminNotifications() {
  const queryClient = useQueryClient();
  const [roles, setRoles] = useState([]);
  const [recipientIds, setRecipientIds] = useState([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("system");
  const [priority, setPriority] = useState("normal");
  const [actionUrl, setActionUrl] = useState("");
  const [page, setPage] = useState(1);

  const recipientsQuery = useQuery({
    queryKey: ["notification-recipients"],
    queryFn: async () => (await api.get("/notifications/recipients", {
      params: { roles: "guide,driver,agent,manager,admin" },
    })).data,
  });

  const notificationsQuery = useQuery({
    queryKey: ["admin-notifications", page],
    queryFn: async () => (await api.get("/notifications", { params: { page, limit: 5 } })).data,
  });

  const recipients = recipientsQuery.data?.recipients || [];

  const sendMutation = useMutation({
    mutationFn: async (payload) => (await api.post("/notifications/internal", payload)).data,
    onSuccess: (data) => {
      toast.success(data?.message || "Notification sent.");
      setTitle("");
      setMessage("");
      setActionUrl("");
      setRecipientIds([]);
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
    },
    onError: (error) => toast.error(error?.response?.data?.message || "Failed to send notification."),
  });

  const toggleRole = (role) => {
    setRoles((current) => current.includes(role) ? current.filter((r) => r !== role) : [...current, role]);
  };

  const toggleRecipient = (id) => {
    setRecipientIds((current) => current.includes(id) ? current.filter((r) => r !== id) : [...current, id]);
  };

  const submit = (event) => {
    event.preventDefault();
    if (!title.trim() || !message.trim()) return toast.error("Enter a title and message.");
    if (!roles.length && !recipientIds.length) return toast.error("Select a group or specific recipient.");
    sendMutation.mutate({ roles, recipientIds, title, message, type, priority, actionUrl });
  };

  const notifications = notificationsQuery.data?.notifications || notificationsQuery.data?.data || [];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
          <p className="mt-1 text-slate-500">Send operational messages to guides, drivers, agents, managers and administrators.</p>
        </div>

        <form onSubmit={submit} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <h2 className="text-xl font-bold">Send Internal Notification</h2>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-slate-700">Recipient groups</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {groups.map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleRole(value)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${roles.includes(value) ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">Specific recipients</label>
              <div className="mt-2 max-h-32 overflow-y-auto rounded-xl border p-2">
                {recipients.map((user) => (
                  <label key={user._id} className="flex cursor-pointer items-center gap-2 p-2 text-sm hover:bg-slate-50">
                    <input type="checkbox" checked={recipientIds.includes(user._id)} onChange={() => toggleRecipient(user._id)} />
                    <span>{user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email}</span>
                    <span className="ml-auto text-xs text-slate-400">{user.roleId?.displayName || user.role || user.legacyRole || ""}</span>
                  </label>
                ))}
                {!recipientsQuery.isLoading && !recipients.length && <p className="p-2 text-sm text-slate-500">No active recipients found.</p>}
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Notification title" className="rounded-xl border p-3" />
            <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-xl border p-3">
              <option value="system">System</option>
              <option value="assignment">Assignment</option>
              <option value="tour_update">Tour Update</option>
              <option value="alert">Alert</option>
              <option value="promotion">Promotion</option>
            </select>
            <select value={priority} onChange={(e) => setPriority(e.target.value)} className="rounded-xl border p-3">
              <option value="normal">Normal</option>
              <option value="low">Low</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder="Write the message..." className="mt-4 w-full rounded-xl border p-3" />
          <input value={actionUrl} onChange={(e) => setActionUrl(e.target.value)} placeholder="Optional action URL, e.g. /guide/dashboard" className="mt-4 w-full rounded-xl border p-3" />

          <button disabled={sendMutation.isPending} className="mt-4 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
            {sendMutation.isPending ? "Sending..." : "Send Notification"}
          </button>
        </form>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">Recent Notifications</h2>
          {notifications.map((item) => (
            <div key={item._id} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
              <div className="flex justify-between gap-4">
                <h3 className="font-semibold">{item.title}</h3>
                <span className="text-xs text-slate-400">{item.type}</span>
              </div>
              <p className="mt-1 text-slate-600">{item.message}</p>
            </div>
          ))}
          {!notifications.length && <p className="text-slate-500">No notifications found.</p>}
          <div className="flex items-center justify-between border-t pt-4"><button disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40">Previous</button><span className="text-sm font-semibold text-slate-500">Page {page} of {Math.max(1,Number(notificationsQuery.data?.pages||1))}</span><button disabled={page>=Number(notificationsQuery.data?.pages||1)} onClick={()=>setPage(p=>p+1)} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40">Next</button></div>
        </section>
      </div>
    </div>
  );
}
