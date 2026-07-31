import { Bell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { getNotifications } from "../../api/notificationApi";

export default function Notifications() {
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["adminNotifications"],
    queryFn: () =>
      getNotifications({
        limit: 8,
      }),
  });

  /*
  |--------------------------------------------------------------------------
  | RESPONSE
  |--------------------------------------------------------------------------
  */

  const notifications =
    data?.notifications ||
    data?.data ||
    [];

  /*
  |--------------------------------------------------------------------------
  | ICON COLOR
  |--------------------------------------------------------------------------
  */

  const notificationStyle = (type) => {
    switch (type?.toLowerCase()) {
      case "booking":
        return "bg-blue-100 text-blue-700";

      case "payment":
        return "bg-green-100 text-green-700";

      case "vehicle":
        return "bg-yellow-100 text-yellow-700";

      case "guide":
        return "bg-purple-100 text-purple-700";

      case "warning":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        Loading notifications...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-xl shadow p-6 text-red-600">
        {error?.message || "Failed to load notifications."}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-center gap-3 mb-6">
        <Bell className="text-green-700" />

        <h2 className="text-xl font-bold">
          Notifications
        </h2>
      </div>

      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className={`
                flex
                justify-between
                items-start
                gap-4
                rounded-lg
                p-4
                ${notificationStyle(notification.type)}
              `}
            >
              <div>
                <p className="font-medium">
                  {notification.message}
                </p>

                <p className="text-xs mt-1 opacity-70">
                  {notification.createdAt
                    ? new Date(
                        notification.createdAt
                      ).toLocaleString()
                    : ""}
                </p>
              </div>

              {!notification.read && (
                <span className="h-3 w-3 rounded-full bg-red-500" />
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            No notifications available.
          </div>
        )}
      </div>
    </div>
  );
}