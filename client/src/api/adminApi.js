/**
 * Purpose: admin Api client application module. Main declarations: getData, getDashboard, getUsersAnalytics, getBookingAnalytics, getRevenueAnalytics.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import api from "./axios";

// Declare getData for use by the surrounding module or function.
const getData = async (request) => {
  // Declare response for use by the surrounding module or function.
  const response = await request;
  // Return the data value to the caller.
  return response.data;
};

// Canonical tenant dashboard endpoint. All dashboard consumers use the same
// normalized backend source so cards cannot drift between pages.
// Declare getDashboard for use by the surrounding module or function.
export const getDashboard = async () => getData(api.get("/admin/dashboard"));
// Declare getDashboardMetrics for use by the surrounding module or function.
export const getDashboardMetrics = getDashboard;
// Declare getUsersAnalytics for use by the surrounding module or function.
export const getUsersAnalytics = async () => getData(api.get("/admin/users/analytics"));
// Declare getBookingAnalytics for use by the surrounding module or function.
export const getBookingAnalytics = async () => getData(api.get("/admin/bookings/analytics"));
// Declare getRevenueAnalytics for use by the surrounding module or function.
export const getRevenueAnalytics = async () => getData(api.get("/admin/revenue/analytics"));
// Declare getSystemHealth for use by the surrounding module or function.
export const getSystemHealth = async () => getData(api.get("/system/admin/system-health"));
// Declare getAdminBookings for use by the surrounding module or function.
export const getAdminBookings = async (params = {}) => getData(api.get("/admin/bookings", { params }));
// Declare getAdminTours for use by the surrounding module or function.
export const getAdminTours = async (params = {}) => getData(api.get("/admin/tours", { params }));
