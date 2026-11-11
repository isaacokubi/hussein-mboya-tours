/**
 * Purpose: Notification Bell reusable UI component. Main declarations: NotificationBell.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { Bell } from "lucide-react";
// Load ../../context/NotificationContext so this module can use its exported dependencies.
import { useNotifications } from "../../context/NotificationContext";

// Define NotificationBell; its parameters and body implement this operation.
export default function NotificationBell() {
  // Declare { notifications = [] } for use by the surrounding module or function.
  const { notifications = [] } = useNotifications();

  // Declare unreadCount for use by the surrounding module or function.
  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  // Declare badgeCount for use by the surrounding module or function.
  const badgeCount = unreadCount > 99 ? "99+" : unreadCount;

  // Return the expression shown below to the caller.
  return (
    <button
      type="button"
      aria-label={`Notifications (${unreadCount} unread)`}
      className="
      relative
      p-2
      rounded-full
      hover:bg-gray-100
      transition
      duration-200
      "
    >
      <Bell
        size={22}
        className="text-gray-700"
      />

      {unreadCount > 0 && (
        <span
          className="
          absolute
          -top-1
          -right-1
          min-w-[20px]
          h-5
          px-1
          flex
          items-center
          justify-center
          rounded-full
          bg-red-600
          text-white
          text-[10px]
          font-bold
          leading-none
          shadow
          "
        >
          {badgeCount}
        </span>
      )}
    </button>
  );
}
