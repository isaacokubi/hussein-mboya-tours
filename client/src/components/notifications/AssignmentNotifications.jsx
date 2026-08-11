import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/axios";

export default function AssignmentNotifications() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["assignment-notifications"],
    queryFn: async () => (await api.get("/notifications", { params: { limit: 20 } })).data,
    refetchInterval: 30000,
  });

  const notifications = (data?.notifications || data?.data || [])
    .filter((item) => !item.isArchived)
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  const readMutation = useMutation({
    mutationFn: (id) => api.put(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["assignment-notifications"] }),
  });

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Notifications</h2>
          <p className="text-sm text-slate-500">System, booking, payment and operational updates for your account.</p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          {notifications.filter((n) => !n.read).length} unread
        </span>
      </div>

      {isLoading ? (
        <p className="mt-5 text-slate-500">Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No notifications yet.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {notifications.map((item) => (
            <button
              key={item._id}
              type="button"
              onClick={() => !item.read && readMutation.mutate(item._id)}
              className={`block w-full rounded-xl border p-4 text-left ${item.read ? "border-slate-100 bg-white" : "border-emerald-200 bg-emerald-50/50"}`}
            >
              <div className="flex justify-between gap-4">
                <strong className="text-slate-900">{item.title}</strong>
                <span className="text-xs text-slate-400">
                  {item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-600">{item.message}</p>
              {item.actionUrl && <p className="mt-2 text-xs font-semibold text-emerald-700">Open assigned tour →</p>}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
