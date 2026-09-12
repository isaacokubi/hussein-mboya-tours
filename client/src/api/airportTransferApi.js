import api from "./axios";
const unwrap = (r) => r?.data?.data ?? r?.data ?? [];
const activeTenantId = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    return String(user?.tenantId || user?.tenant?._id || user?.organizationId || "").trim();
  } catch { return ""; }
};
const tenantSafe = (rows) => {
  const tenantId = activeTenantId();
  if (!Array.isArray(rows) || !tenantId) return rows;
  return rows.filter((row) => String(row?.tenantId || row?.tenant?._id || "") === tenantId);
};
export const getAirportTransfers = (params = {}) => api.get("/airport-transfers", { params }).then(unwrap).then(tenantSafe);
export const getAirportTransfer = (id) => api.get(`/airport-transfers/${id}`).then(unwrap);
export const createTransferBooking = (payload) => api.post("/airport-transfers/bookings", payload).then((response) => {
  const booking = unwrap(response);
  const bookingId = booking?._id || booking?.id;
  if (bookingId && typeof window !== "undefined") window.location.assign(`/hospitality-payment/${bookingId}?type=airport_transfer`);
  return booking;
});
export const getTransferBookings = (params = {}) => api.get("/airport-transfers/bookings", { params }).then(unwrap).then(tenantSafe);
export const updateTransferBooking = (id, payload) => api.patch(`/airport-transfers/bookings/${id}`, payload).then(unwrap);
export const getAdminTransfers = (params = {}) => api.get("/airport-transfers/admin/catalog", { params }).then(unwrap).then(tenantSafe);
export const createTransfer = (payload) => api.post("/airport-transfers/admin/catalog", payload).then(unwrap);
export const updateTransfer = (id, payload) => api.patch(`/airport-transfers/admin/catalog/${id}`, payload).then(unwrap);
