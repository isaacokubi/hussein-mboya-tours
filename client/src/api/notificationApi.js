// Import the shared Axios client used for authenticated, tenant-aware API requests.
import api from "./axios";

// Fetch the current user's notifications with optional filters/pagination.
export const getNotifications = async (params = {}) => {
  // Request notifications and pass the caller's query parameters.
  const response = await api.get("/notifications", {
    params,
  });

  // Return the backend JSON body rather than the Axios response wrapper.
  return response.data;
}

/*
 Auto completed API helpers
*/

// Fetch notifications using the legacy helper name retained by older components.
export const getAll = async () => {
    // Request the notification list without extra filters.
    const { data } = await api.get("/notifications");
    // Return only the response body to the caller.
    return data;
};
