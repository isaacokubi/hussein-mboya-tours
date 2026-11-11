/**
 * Purpose: Notifications reusable UI component. Main declarations: Notifications, notificationStyle.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { Bell, ChevronLeft, ChevronRight } from "lucide-react";
// Load @tanstack/react-query so this module can use its exported dependencies.
import { useQuery } from "@tanstack/react-query";

// Load ../../../api/notificationApi so this module can use its exported dependencies.
import { getNotifications } from "../../../api/notificationApi";
// Load react so this module can use its exported dependencies.
import { useState } from "react";

// Define Notifications; its parameters and body implement this operation.
export default function Notifications() {
  // Declare [page,setPage] for use by the surrounding module or function.
  const [page,setPage]=useState(1);
  // Declare { data, isLoading, isError, error, } for use by the surrounding module or function.
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["adminNotifications",page],
    queryFn: () =>
      getNotifications({
        page, limit: 5,
      }),
  });

  /*
  |--------------------------------------------------------------------------
  | RESPONSE
  |--------------------------------------------------------------------------
  */

  // Declare notifications for use by the surrounding module or function.
  const notifications =
    data?.notifications ||
    data?.data ||
    [];

  /*
  |--------------------------------------------------------------------------
  | ICON COLOR
  |--------------------------------------------------------------------------
  */

  // Declare notificationStyle for use by the surrounding module or function.
  const notificationStyle = (type) => {
    // Select the appropriate branch based on type?.toLowerCase().
    switch (type?.toLowerCase()) {
      case "booking":
        // Return a configured text value to the caller.
        return "bg-blue-100 text-blue-700";

      case "payment":
        // Return a configured text value to the caller.
        return "bg-green-100 text-green-700";

      case "vehicle":
        // Return a configured text value to the caller.
        return "bg-yellow-100 text-yellow-700";

      case "guide":
        // Return a configured text value to the caller.
        return "bg-purple-100 text-purple-700";

      case "warning":
        // Return a configured text value to the caller.
        return "bg-red-100 text-red-700";

      default:
        // Return a configured text value to the caller.
        return "bg-gray-100 text-gray-700";
    }
  };

  // Check the condition (isLoading) and run the matching branch.
  if (isLoading) {
    // Return the expression shown below to the caller.
    return (
      <div className="bg-white rounded-xl shadow p-6">
        Loading notifications...
      </div>
    );
  }

  // Check the condition (isError) and run the matching branch.
  if (isError) {
    // Return the expression shown below to the caller.
    return (
      <div className="bg-white rounded-xl shadow p-6 text-red-600">
        {error?.message || "Failed to load notifications."}
      </div>
    );
  }

  // Return the expression shown below to the caller.
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
      <div className="mt-5 flex items-center justify-between border-t pt-4"><button disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="rounded-lg border p-2 disabled:opacity-40"><ChevronLeft size={16}/></button><span className="text-xs font-semibold text-slate-500">Page {page} of {Math.max(1,Number(data?.pages||1))}</span><button disabled={page>=Number(data?.pages||1)} onClick={()=>setPage(p=>p+1)} className="rounded-lg border p-2 disabled:opacity-40"><ChevronRight size={16}/></button></div>
    </div>
  );
}
