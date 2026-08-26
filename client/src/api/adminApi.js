import api from "./axios";

export const getDashboard = async () => {
  const response = await api.get("/admin/dashboard");
  return response.data;
};

export const getDashboardMetrics = async () => {
  const response = await api.get("/admin/dashboard/metrics");
  return response.data;
};

export const getUsersAnalytics = async () => {
  const response = await api.get("/admin/users/analytics");
  return response.data;
};

export const getBookingAnalytics = async () => {
  const response = await api.get("/admin/bookings/analytics");
  return response.data;
};

export const getRevenueAnalytics = async () => {
  const response = await api.get("/admin/revenue/analytics");
  return response.data;
};

export const getSystemHealth = async () => {
  const response = await api.get("/admin/system-health");
  return response.data;
};

export const getAdminBookings = async (params = {}) => {
  const { data } = await api.get('/admin/bookings', { params });
  return data;
};

export const getAdminTours = async (params = {}) => {
  const { data } = await api.get('/admin/tours', { params });
  return data;
};
