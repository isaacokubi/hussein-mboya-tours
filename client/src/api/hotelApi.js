import api from "./axios";
const unwrap = (r) => r?.data?.data ?? r?.data ?? [];
export const getHotels = (params = {}) => api.get("/hotels", { params }).then(unwrap);
export const getHotel = (id) => api.get(`/hotels/${id}`).then(unwrap);
export const getHotelAvailability = (params = {}) => api.get("/hotels/availability", { params }).then(unwrap);
export const createHotelBooking = (payload) => api.post("/hotels/bookings", payload).then((response) => {
  const booking = unwrap(response);
  const bookingId = booking?._id || booking?.id;
  if (bookingId && typeof window !== "undefined") {
    window.location.assign(`/hospitality-payment/${bookingId}?type=hotel`);
  }
  return booking;
});
export const getHotelBookings = (params = {}) => api.get("/hotels/bookings", { params }).then(unwrap);
export const updateHotelBooking = (id, payload) => api.patch(`/hotels/bookings/${id}`, payload).then(unwrap);
export const getAdminHotels = (params = {}) => api.get("/hotels/admin/catalog", { params }).then(unwrap);
export const createHotel = (payload) => api.post("/hotels/admin/catalog", payload).then(unwrap);
export const updateHotel = (id, payload) => api.patch(`/hotels/admin/catalog/${id}`, payload).then(unwrap);
export const createRoomType = (hotelId, payload) => api.post(`/hotels/admin/catalog/${hotelId}/rooms`, payload).then(unwrap);
export const updateRoomType = (id, payload) => api.patch(`/hotels/admin/rooms/${id}`, payload).then(unwrap);
