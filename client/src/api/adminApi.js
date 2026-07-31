// client/src/services/adminService.js

import api from "./axios";

/*
|--------------------------------------------------------------------------
| DASHBOARD
|--------------------------------------------------------------------------
*/

export const getDashboard = async () => {
  const { data } = await api.get("/admin/dashboard");
  return data;
};

/*
|--------------------------------------------------------------------------
| BOOKINGS
|--------------------------------------------------------------------------
*/

export const getAdminBookings = async (params = {}) => {
  const { data } = await api.get("/admin/bookings", {
    params,
  });

  return data;
};

export const getBooking = async (id) => {
  const { data } = await api.get(`/admin/bookings/${id}`);

  return data;
};

export const updateBooking = async (id, payload) => {
  const { data } = await api.put(
    `/admin/bookings/${id}`,
    payload
  );

  return data;
};

export const deleteBooking = async (id) => {
  const { data } = await api.delete(
    `/admin/bookings/${id}`
  );

  return data;
};

/*
|--------------------------------------------------------------------------
| TOURS
|--------------------------------------------------------------------------
*/

export const getTours = async () => {
  const { data } = await api.get("/admin/tours");

  return data;
};

export const getTour = async (id) => {
  const { data } = await api.get(`/admin/tours/${id}`);

  return data;
};

export const createTour = async (tour) => {
  const { data } = await api.post(
    "/admin/tours",
    tour
  );

  return data;
};

export const updateTour = async (id, tour) => {
  const { data } = await api.put(
    `/admin/tours/${id}`,
    tour
  );

  return data;
};

export const deleteTour = async (id) => {
  const { data } = await api.delete(
    `/admin/tours/${id}`
  );

  return data;
};

/*
|--------------------------------------------------------------------------
| DESTINATIONS
|--------------------------------------------------------------------------
*/

export const getDestinations = async () => {
  const { data } = await api.get(
    "/admin/destinations"
  );

  return data;
};

export const createDestination = async (destination) => {
  const { data } = await api.post(
    "/admin/destinations",
    destination
  );

  return data;
};

export const updateDestination = async (
  id,
  destination
) => {
  const { data } = await api.put(
    `/admin/destinations/${id}`,
    destination
  );

  return data;
};

export const deleteDestination = async (id) => {
  const { data } = await api.delete(
    `/admin/destinations/${id}`
  );

  return data;
};

/*
|--------------------------------------------------------------------------
| USERS
|--------------------------------------------------------------------------
*/

export const getUsers = async () => {
  const { data } = await api.get("/users");

  return data;
};

export const getUser = async (id) => {
  const { data } = await api.get(`/users/${id}`);

  return data;
};

export const updateUser = async (id, user) => {
  const { data } = await api.put(
    `/users/${id}`,
    user
  );

  return data;
};

export const deleteUser = async (id) => {
  const { data } = await api.delete(
    `/users/${id}`
  );

  return data;
};

/*
|--------------------------------------------------------------------------
| ANALYTICS
|--------------------------------------------------------------------------
*/

export const getAnalytics = async () => {
  const { data } = await api.get(
    "/analytics"
  );

  return data;
};

/*
|--------------------------------------------------------------------------
| FINANCE
|--------------------------------------------------------------------------
*/

export const getFinanceDashboard = async () => {
  const { data } = await api.get(
    "/admin/finance/dashboard"
  );

  return data;
};

export const getTransactions = async () => {
  const { data } = await api.get(
    "/admin/finance/transactions"
  );

  return data;
};

/*
|--------------------------------------------------------------------------
| REPORTS
|--------------------------------------------------------------------------
*/

export const getTourReports = async () => {
  const { data } = await api.get(
    "/tour-reports"
  );

  return data;
};

/*
|--------------------------------------------------------------------------
| NOTIFICATIONS
|--------------------------------------------------------------------------
*/

export const getNotifications = async () => {
  const { data } = await api.get(
    "/notifications"
  );

  return data;
};

export const markNotificationRead = async (id) => {
  const { data } = await api.put(
    `/notifications/${id}/read`
  );

  return data;
};

/*
|--------------------------------------------------------------------------
| AI ASSISTANT
|--------------------------------------------------------------------------
*/

export const askAI = async (message) => {
  const { data } = await api.post(
    "/ai",
    {
      message,
    }
  );

  return data;
};