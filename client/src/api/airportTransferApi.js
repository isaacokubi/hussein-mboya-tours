import api from "./axios";
const unwrap = (r) => r?.data?.data ?? r?.data ?? [];
export const getAirportTransfers = (params = {}) => api.get("/airport-transfers", { params }).then(unwrap);
export const createTransferBooking = (payload) => api.post("/airport-transfers/bookings", payload).then(unwrap);
export const getTransferBookings = (params = {}) => api.get("/airport-transfers/bookings", { params }).then(unwrap);
export const updateTransferBooking = (id, payload) => api.patch(`/airport-transfers/bookings/${id}`, payload).then(unwrap);
export const getAdminTransfers = (params = {}) => api.get("/airport-transfers/admin/catalog", { params }).then(unwrap);
export const createTransfer = (payload) => api.post("/airport-transfers/admin/catalog", payload).then(unwrap);
export const updateTransfer = (id, payload) => api.patch(`/airport-transfers/admin/catalog/${id}`, payload).then(unwrap);
