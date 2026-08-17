import { useNotifications as useNotificationContext } from "../context/NotificationContext";

export const useNotifications = () => {
  return useNotificationContext();
};
