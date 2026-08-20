// client/src/api/bookingApi.js

import api from "./axios";

export const getBookings = async (params = {}) => (await api.get("/admin/bookings", { params })).data;

export const getMyBookings = async (params = {}) => {
  const safeParams = params && typeof params === "object" && !("queryKey" in params) && !("signal" in params) ? params : {};
  return (await api.get("/bookings/my-bookings", { params: safeParams })).data;
};

export const createBooking = async (data) => (await api.post("/bookings", data)).data;
export const initiatePayment = async (data) => (await api.post("/payments/mpesa", data)).data;
export const getBooking = async (id) => (await api.get(`/bookings/${id}`)).data;
export const cancelBooking = async (id) => (await api.put(`/bookings/cancel/${id}`, {})).data;
export const getAdminBookings = async (params = {}) => (await api.get("/admin/bookings", { params })).data;
export const updateBookingStatus = async (id, status) => (await api.put(`/admin/bookings/${id}/status`, { status })).data;
export const getAllBookings = async () => (await api.get("/admin/bookings")).data;
export const rescheduleBooking = async (id, payload) => (await api.put(`/bookings/reschedule/${id}`, payload)).data;
export const getBookingById = async (id) => (await api.get(`/bookings/${id}`)).data;
export const updateBookingTravelDate = async (id, travelDate) => (await api.put(`/bookings/${id}/travel-date`, { travelDate })).data;
