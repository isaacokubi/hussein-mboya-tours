import { useQuery } from "@tanstack/react-query";
import api from "../../api/axios";

export default function AdminNotifications() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: async () => (await api.get("/notifications")).data,
  });
  const notifications = data?.notifications || data?.data || [];

  if (isLoading) return <div className="p-6">Loading notifications...</div>;
  if (isError) return <div className="p-6 text-red-600">Failed to load notifications.</div>;

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-3xl font-bold">Notifications</h1>
      <div className="space-y-3">
        {notifications.map((item) => (
          <div key={item._id} className={`bg-white rounded-xl shadow p-4 ${item.read ? "" : "border-l-4 border-blue-600"}`}>
            <div className="flex justify-between gap-4">
              <h2 className="font-semibold">{item.title}</h2>
              <span className="text-xs text-gray-500">{item.type}</span>
            </div>
            <p className="text-gray-600 mt-1">{item.message}</p>
          </div>
        ))}
        {!notifications.length && <p className="text-gray-500">No notifications found.</p>}
      </div>
    </div>
  );
}
