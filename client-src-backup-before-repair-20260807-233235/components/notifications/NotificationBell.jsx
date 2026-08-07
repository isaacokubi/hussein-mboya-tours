import { Bell } from "lucide-react";
import { useNotifications } from "../../context/NotificationContext";

export default function NotificationBell() {
  const { notifications = [] } = useNotifications();

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const badgeCount = unreadCount > 99 ? "99+" : unreadCount;

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