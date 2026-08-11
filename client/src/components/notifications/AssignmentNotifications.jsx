import { useQuery } from "@tanstack/react-query";
import { Bell, CalendarDays, CheckCircle2 } from "lucide-react";
import { getNotifications } from "../../api/notificationApi";

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString("en-KE", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

export default function AssignmentNotifications({ compact = false }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["my-notifications"],
    queryFn: () => getNotifications({ limit: 8 }),
    staleTime: 15000,
    refetchInterval: 30000,
  });

  const notifications = data?.notifications || [];

  return (
    <section className={`rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 ${compact ? "p-5" : "p-6"}`}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Bell className="text-emerald-600" size={20} />
            Notifications
          </h2>
          <p className="mt-1 text-sm text-slate-500">Tour assignments and operational updates.</p>
        </div>
        {notifications.length > 0 && (
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            {notifications.filter((item) => !item.read).length} unread
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="mt-5 animate-pulse space-y-3">
          <div className="h-14 rounded-xl bg-slate-100" />
          <div className="h-14 rounded-xl bg-slate-100" />
        </div>
      ) : isError ? (
        <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          Notifications could not be loaded. Refresh the page to try again.
        </p>
      ) : notifications.length === 0 ? (
        <div className="mt-5 rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
          <CheckCircle2 className="mx-auto mb-2 text-slate-300" />
          No new notifications.
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {notifications.map((notification) => (
            <article
              key={notification._id}
              className={`rounded-xl border p-4 ${
                notification.read
                  ? "border-slate-100 bg-slate-50"
                  : "border-emerald-100 bg-emerald-50/60"
              }`}
            >
              <div className="flex items-start gap-3">
                <CalendarDays className="mt-0.5 shrink-0 text-emerald-600" size={18} />
                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-900">{notification.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{notification.message}</p>
                  <p className="mt-2 text-xs text-slate-400">{formatDate(notification.createdAt)}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
