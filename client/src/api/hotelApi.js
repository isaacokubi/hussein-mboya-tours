/**
 * Purpose: hotel Api client application module. Main declarations: unwrap, activeTenantId, tenantSafe, normalizeMealPlan, normalizeList.
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
  } catch {
    // Return a configured text value to the caller.
    return "";
  }
};

// Declare tenantSafe for use by the surrounding module or function.
const tenantSafe = (rows) => {
  // Declare tenantId for use by the surrounding module or function.
  const tenantId = activeTenantId();
  // Check the condition (!Array.isArray(rows) || !tenantId) and run the matching branch.
  if (!Array.isArray(rows) || !tenantId) return rows;
  // Return the result of rows.filter() to the caller.
  return rows.filter(
    (row) => String(row?.tenantId || row?.tenant?._id || "") === tenantId,
  );
};

// Declare normalizeMealPlan for use by the surrounding module or function.
const normalizeMealPlan = (value) => ({
  bed_and_breakfast: "breakfast",
  bnb: "breakfast",
  breakfast: "breakfast",
  room_only: "room_only",
  half_board: "half_board",
  full_board: "full_board",
  all_inclusive: "all_inclusive",
}[String(value || "room_only").toLowerCase()] || "room_only");

// Declare normalizeList for use by the surrounding module or function.
const normalizeList = (value) => {
  // Check the condition (Array.isArray(value)) and run the matching branch.
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  // Return the result of String(value || "").split(",").map((item) => item.trim()).filter() to the caller.
  return String(value || "").split(",").map((item) => item.trim()).filter(Boolean);
};

// Declare hotelQueryScope for use by the surrounding module or function.
export const hotelQueryScope = () => {
  // Check the condition (typeof window === "undefined") and run the matching branch.
  if (typeof window === "undefined") return "server";
  // Declare tenant for use by the surrounding module or function.
  let tenant = "";
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare user for use by the surrounding module or function.
    const user = JSON.parse(window.localStorage.getItem("user") || "null");
    // Perform the side effect or state update expressed on the following line.
    tenant = String(user?.tenantId?._id || user?.tenantId || user?.tenant?._id || user?.organizationId || "").trim();
  } catch {
    // Public hostname still provides a stable cache scope when storage is unavailable.
  }
  // Return the expression shown below to the caller.
  return `${window.location.hostname}:${tenant}`;
};

// Declare getHotels for use by the surrounding module or function.
export const getHotels = (params = {}) => api.get("/hotels", { params }).then(unwrap);
// Declare getHotel for use by the surrounding module or function.
export const getHotel = (id) => api.get(`/hotels/${encodeURIComponent(id)}`).then(unwrap);

// Keep detail and reservation views consistent with the public catalogue. Some
// deployed API versions may temporarily fail to resolve a detail URL even when
// the property is present in the tenant-scoped public list.
// Declare getPublicHotel for use by the surrounding module or function.
export const getPublicHotel = async (id) => {
  // Declare detailError for use by the surrounding module or function.
  let detailError;
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare detail for use by the surrounding module or function.
    const detail = await getHotel(id);
    // Check the condition (detail) and run the matching branch.
    if (detail) return detail;
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    detailError = error;
  }
  // Declare catalogue for use by the surrounding module or function.
  const catalogue = await getHotels();
  // Declare key for use by the surrounding module or function.
  const key = String(id || "").trim().toLowerCase();
  // Declare match for use by the surrounding module or function.
  const match = Array.isArray(catalogue)
    ? catalogue.find((item) =>
        String(item?._id || "").toLowerCase() === key ||
        String(item?.slug || "").trim().toLowerCase() === key
      )
    : null;
  // Check the condition (match) and run the matching branch.
  if (match) return match;
  // Check the condition (detailError) and run the matching branch.
  if (detailError) throw detailError;
  // Return the expression shown below to the caller.
  return null;
};
// Declare getHotelAvailability for use by the surrounding module or function.
export const getHotelAvailability = (params = {}) => api.get("/hotels/availability", { params }).then(unwrap);

// Declare createHotelBooking for use by the surrounding module or function.
export const createHotelBooking = async (payload) => {
  // Declare response for use by the surrounding module or function.
  const response = await api.post("/hotels/bookings", payload);
  // Declare body for use by the surrounding module or function.
  const body = response?.data || {};
  // Declare booking for use by the surrounding module or function.
  const booking = body?.data || body;
  // Check the condition (!booking?._id) and run the matching branch.
  if (!booking?._id) {
    // Declare error for use by the surrounding module or function.
    const error = new Error(body?.message || "The hotel reservation was not created.");
    // Perform the side effect or state update expressed on the following line.
    error.response = response;
    // Stop the current operation by raising the value of error.
    throw error;
  }
  // Return the object assembled below to the caller.
  return { ...booking, data: booking, success: body.success !== false, paymentRequired: Boolean(body.paymentRequired), invoice: body.invoice || null };
};

// Declare getHotelBookings for use by the surrounding module or function.
export const getHotelBookings = (params = {}) => api.get("/hotels/bookings", { params }).then(unwrap).then(tenantSafe);
// Declare updateHotelBooking for use by the surrounding module or function.
export const updateHotelBooking = (id, payload) => api.patch(`/hotels/bookings/${id}`, payload).then(unwrap);
// Declare syncHotelInventory for use by the surrounding module or function.
export const syncHotelInventory = () => api.post("/hotels/admin/sync-inventory").then(unwrap);

// Declare getAdminHotels for use by the surrounding module or function.
export const getAdminHotels = async (params = {}) => {
  // Perform the side effect or state update expressed on the following line.
  await syncHotelInventory().catch(() => null);
  // Return the result of api.get("/hotels/admin/catalog", { params }).then(unwrap).then() to the caller.
  return api.get("/hotels/admin/catalog", { params }).then(unwrap).then(tenantSafe);
};

// Declare createHotel for use by the surrounding module or function.
export const createHotel = (payload) => api.post("/hotels/admin/catalog", payload).then(unwrap);
// Declare updateHotel for use by the surrounding module or function.
export const updateHotel = (id, payload) => api.patch(`/hotels/admin/catalog/${id}`, payload).then(unwrap);

// Declare createRoomType for use by the surrounding module or function.
export const createRoomType = (hotelId, payload) => {
  // Check the condition (!hotelId) and run the matching branch.
  if (!hotelId) {
    // Declare error for use by the surrounding module or function.
    const error = new Error("Select a property before creating a room type.");
    // Perform the side effect or state update expressed on the following line.
    error.code = "HOTEL_REQUIRED";
    // Return the result of Promise.reject() to the caller.
    return Promise.reject(error);
  }
  // Declare body for use by the surrounding module or function.
  const body = {
    ...payload,
    name: String(payload?.name || "").trim(),
    description: String(payload?.description || "").trim(),
    beds: normalizeList(payload?.beds),
    amenities: normalizeList(payload?.amenities),
    mealPlans: normalizeList(payload?.mealPlans).map(normalizeMealPlan),
    totalRooms: Number(payload?.totalRooms),
    availableRooms: Number(payload?.availableRooms),
    nightlyRate: Number(payload?.nightlyRate),
    maxAdults: Number(payload?.maxAdults),
    maxChildren: Number(payload?.maxChildren),
    currency: String(payload?.currency || "KES").toUpperCase(),
  };
  // Check the condition (!body.mealPlans.length) and run the matching branch.
  if (!body.mealPlans.length) body.mealPlans = ["room_only"];
  // Return the result of api.post(`/hotels/admin/catalog/${encodeURIComponent(hotelId)}/rooms`, body).then() to the caller.
  return api.post(`/hotels/admin/catalog/${encodeURIComponent(hotelId)}/rooms`, body).then(unwrap);
};

// Declare updateRoomType for use by the surrounding module or function.
export const updateRoomType = (id, payload) =>
  api.patch(`/hotels/admin/rooms/${id}`, {
    ...payload,
    ...(payload?.beds !== undefined ? { beds: normalizeList(payload.beds) } : {}),
    ...(payload?.amenities !== undefined ? { amenities: normalizeList(payload.amenities) } : {}),
    ...(payload?.mealPlans ? { mealPlans: normalizeList(payload.mealPlans).map(normalizeMealPlan) } : {}),
  }).then(unwrap);
