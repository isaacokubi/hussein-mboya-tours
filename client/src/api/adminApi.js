import api from "./axios";

const getData = async (request) => {
  const response = await request;
  return response.data;
};

export const getDashboard = async () => getData(api.get("/admin/dashboard"));
// Kept as a compatibility alias because the backend exposes the consolidated dashboard endpoint.
export const getDashboardMetrics = getDashboard;
export const getUsersAnalytics = async () => getData(api.get("/admin/users/analytics"));
export const getBookingAnalytics = async () => getData(api.get("/admin/bookings/analytics"));
export const getRevenueAnalytics = async () => getData(api.get("/admin/revenue/analytics"));
export const getSystemHealth = async () => getData(api.get("/system/admin/system-health"));
export const getAdminBookings = async (params = {}) => getData(api.get("/admin/bookings", { params }));
export const getAdminTours = async (params = {}) => getData(api.get("/admin/tours", { params }));
