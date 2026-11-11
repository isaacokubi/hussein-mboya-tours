/**
 * Purpose: airport Transfer Api client application module. Main declarations: unwrap, activeTenantId, tenantSafe, getAirportTransfers, getAirportTransfer.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import api from "./axios";
// Declare unwrap for use by the surrounding module or function.
const unwrap = (r) => r?.data?.data ?? r?.data ?? [];
// Declare activeTenantId for use by the surrounding module or function.
const activeTenantId = () => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare user for use by the surrounding module or function.
    const user = JSON.parse(localStorage.getItem("user") || "null");
    // Return the result of String(user?.tenantId || user?.tenant?._id || user?.organizationId || "").trim() to the caller.
    return String(user?.tenantId || user?.tenant?._id || user?.organizationId || "").trim();
  } catch { return ""; }
};
// Declare tenantSafe for use by the surrounding module or function.
const tenantSafe = (rows) => {
  // Declare tenantId for use by the surrounding module or function.
  const tenantId = activeTenantId();
  // Check the condition (!Array.isArray(rows) || !tenantId) and run the matching branch.
  if (!Array.isArray(rows) || !tenantId) return rows;
  // Return the result of rows.filter() to the caller.
  return rows.filter((row) => String(row?.tenantId || row?.tenant?._id || "") === tenantId);
};
// Declare getAirportTransfers for use by the surrounding module or function.
export const getAirportTransfers = (params = {}) => api.get("/airport-transfers", { params }).then(unwrap).then(tenantSafe);
// Declare getAirportTransfer for use by the surrounding module or function.
export const getAirportTransfer = (id) => api.get(`/airport-transfers/${id}`).then(unwrap);
// Declare createTransferBooking for use by the surrounding module or function.
export const createTransferBooking = (payload) => api.post("/airport-transfers/bookings", payload).then((response) => {
  // Declare booking for use by the surrounding module or function.
  const booking = unwrap(response);
  // Declare bookingId for use by the surrounding module or function.
  const bookingId = booking?._id || booking?.id;
  // Check the condition (bookingId && typeof window !== "undefined") and run the matching branch.
  if (bookingId && typeof window !== "undefined") window.location.assign(`/hospitality-payment/${bookingId}?type=airport_transfer`);
  // Return the value of booking to the caller.
  return booking;
});
// Declare getTransferBookings for use by the surrounding module or function.
export const getTransferBookings = (params = {}) => api.get("/airport-transfers/bookings", { params }).then(unwrap).then(tenantSafe);
// Declare updateTransferBooking for use by the surrounding module or function.
export const updateTransferBooking = (id, payload) => api.patch(`/airport-transfers/bookings/${id}`, payload).then(unwrap);
// Declare getAdminTransfers for use by the surrounding module or function.
export const getAdminTransfers = (params = {}) => api.get("/airport-transfers/admin/catalog", { params }).then(unwrap).then(tenantSafe);
// Declare createTransfer for use by the surrounding module or function.
export const createTransfer = (payload) => api.post("/airport-transfers/admin/catalog", payload).then(unwrap);
// Declare updateTransfer for use by the surrounding module or function.
export const updateTransfer = (id, payload) => api.patch(`/airport-transfers/admin/catalog/${id}`, payload).then(unwrap);
