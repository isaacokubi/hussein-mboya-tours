/**
 * Purpose: booking Api client application module. Main declarations: getBookings, getMyBookings, createBooking, initiatePayment, getBooking.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// client/src/api/bookingApi.js

// Load ./axios so this module can use its exported dependencies.
import api from "./axios";

// Declare getBookings for use by the surrounding module or function.
export const getBookings = async (params = {}) => (await api.get("/admin/bookings", { params })).data;

// Declare getMyBookings for use by the surrounding module or function.
export const getMyBookings = async (params = {}) => {
  // Declare safeParams for use by the surrounding module or function.
  const safeParams = params && typeof params === "object" && !("queryKey" in params) && !("signal" in params) ? params : {};
  // Return the data value to the caller.
  return (await api.get("/bookings/my-bookings", { params: { limit: 100, ...safeParams } })).data;
};

// Declare createBooking for use by the surrounding module or function.
export const createBooking = async (data) => (await api.post("/bookings", data)).data;
// Declare initiatePayment for use by the surrounding module or function.
export const initiatePayment = async (data) => (await api.post("/payments/mpesa", data)).data;
// Declare getBooking for use by the surrounding module or function.
export const getBooking = async (id) => (await api.get(`/bookings/${id}`)).data;
// Declare cancelBooking for use by the surrounding module or function.
export const cancelBooking = async (id) => (await api.put(`/bookings/cancel/${id}`, {})).data;
// Declare getAdminBookings for use by the surrounding module or function.
export const getAdminBookings = async (params = {}) => (await api.get("/admin/bookings", { params })).data;
// Declare updateBookingStatus for use by the surrounding module or function.
export const updateBookingStatus = async (id, status) => (await api.put(`/admin/bookings/${id}/status`, { status })).data;
// Declare getAllBookings for use by the surrounding module or function.
export const getAllBookings = async () => (await api.get("/admin/bookings")).data;
// Declare rescheduleBooking for use by the surrounding module or function.
export const rescheduleBooking = async (id, payload) => (await api.put(`/bookings/reschedule/${id}`, payload)).data;
// Declare getBookingById for use by the surrounding module or function.
export const getBookingById = async (id) => (await api.get(`/bookings/${id}`)).data;
// Declare updateBookingTravelDate for use by the surrounding module or function.
export const updateBookingTravelDate = async (id, travelDate) => (await api.put(`/bookings/${id}/travel-date`, { travelDate })).data;
