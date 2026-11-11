/**
 * Purpose: use Notifications reusable React hook. Main declarations: useNotifications.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useNotifications as useNotificationContext } from "../context/NotificationContext";

// Declare useNotifications for use by the surrounding module or function.
export const useNotifications = () => {
  // Return the result of useNotificationContext() to the caller.
  return useNotificationContext();
};
