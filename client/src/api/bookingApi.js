// Import the shared Axios client that adds authentication and tenant headers.
import api from "./axios";

// Fetch the administrator booking list, optionally filtered by query parameters.
export const getBookings = async (params = {}) => (await api.get("/admin/bookings", { params })).data;

// Fetch the current user's bookings while rejecting accidental query-library option objects.
export const getMyBookings = async (params = {}) => {
  // Accept ordinary parameter objects, but not query objects containing queryKey/signal fields.
  const safeParams = params && typeof params === "object" && !("queryKey" in params) && !("signal" in params) ? params : {};
  // Request up to one hundred bookings by default and allow safe caller filters to override defaults.
  return (await api.get("/bookings/my-bookings", { params: { limit: 100, ...safeParams } })).data;
};

// Create a booking by sending the supplied booking form data to the API.
export const createBooking = async (data) => (await api.post("/bookings", data)).data;
// Request an M-Pesa payment for the supplied booking/payment details.
export const initiatePayment = async (data) => (await api.post("/payments/mpesa", data)).data;
// Fetch one booking by its identifier.
export const getBooking = async (id) => (await api.get(`/bookings/${id}`)).data;
// Request cancellation of a booking.
export const cancelBooking = async (id) => (await api.put(`/bookings/cancel/${id}`, {})).data;
// Fetch the administrator booking list with optional filters.
export const getAdminBookings = async (params = {}) => (await api.get("/admin/bookings", { params })).data;
// Update the lifecycle status of a booking through the admin endpoint.
export const updateBookingStatus = async (id, status) => (await api.put(`/admin/bookings/${id}/status`, { status })).data;
// Fetch all bookings through the admin endpoint without additional filters.
export const getAllBookings = async () => (await api.get("/admin/bookings")).data;
// Request a change to the scheduled travel date through the reschedule endpoint.
export const rescheduleBooking = async (id, payload) => (await api.put(`/bookings/reschedule/${id}`, payload)).data;
// Alias for retrieving a booking by ID, retained for callers using the older helper name.
export const getBookingById = async (id) => (await api.get(`/bookings/${id}`)).data;
// Update the travel date directly through the booking travel-date endpoint.
export const updateBookingTravelDate = async (id, travelDate) => (await api.put(`/bookings/${id}/travel-date`, { travelDate })).data;
