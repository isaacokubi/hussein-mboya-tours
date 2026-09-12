import api from "./axios";

const unwrap = (r) => r?.data?.data ?? r?.data ?? [];

const activeTenantId = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    return String(user?.tenantId || user?.tenant?._id || user?.organizationId || "").trim();
  } catch {
    return "";
  }
};

const tenantSafe = (rows) => {
  const tenantId = activeTenantId();
  if (!Array.isArray(rows) || !tenantId) return rows;
  return rows.filter(
    (row) => String(row?.tenantId || row?.tenant?._id || "") === tenantId,
  );
};

const normalizeMealPlan = (value) => ({
  bed_and_breakfast: "breakfast",
  bnb: "breakfast",
  breakfast: "breakfast",
  room_only: "room_only",
  half_board: "half_board",
  full_board: "full_board",
  all_inclusive: "all_inclusive",
}[String(value || "room_only").toLowerCase()] || "room_only");

export const getHotels = (params = {}) =>
  api.get("/hotels", { params }).then(unwrap);

export const getHotel = (id) =>
  api.get(`/hotels/${id}`).then(unwrap);

export const getHotelAvailability = (params = {}) =>
  api.get("/hotels/availability", { params }).then(unwrap);

export const createHotelBooking = async (payload) => {
  const response = await api.post("/hotels/bookings", payload);
  const body = response?.data || {};
  const booking = body?.data || body;

  if (!booking?._id) {
    const error = new Error(
      body?.message || "The hotel reservation was not created.",
    );
    error.response = response;
    throw error;
  }

  return {
    ...booking,
    data: booking,
    success: body.success !== false,
    paymentRequired: Boolean(body.paymentRequired),
    invoice: body.invoice || null,
  };
};

export const getHotelBookings = (params = {}) =>
  api.get("/hotels/bookings", { params }).then(unwrap).then(tenantSafe);

export const updateHotelBooking = (id, payload) =>
  api.patch(`/hotels/bookings/${id}`, payload).then(unwrap);

export const syncHotelInventory = () =>
  api.post("/hotels/admin/sync-inventory").then(unwrap);

export const getAdminHotels = async (params = {}) => {
  await syncHotelInventory().catch(() => null);
  return api
    .get("/hotels/admin/catalog", { params })
    .then(unwrap)
    .then(tenantSafe);
};

export const createHotel = (payload) =>
  api.post("/hotels/admin/catalog", payload).then(unwrap);

export const updateHotel = (id, payload) =>
  api.patch(`/hotels/admin/catalog/${id}`, payload).then(unwrap);

export const createRoomType = (hotelId, payload) =>
  api
    .post(`/hotels/admin/catalog/${hotelId}/rooms`, {
      ...payload,
      mealPlans: (Array.isArray(payload?.mealPlans)
        ? payload.mealPlans
        : [payload?.mealPlans]
      ).map(normalizeMealPlan),
    })
    .then(unwrap);

export const updateRoomType = (id, payload) =>
  api
    .patch(`/hotels/admin/rooms/${id}`, {
      ...payload,
      ...(payload?.mealPlans
        ? {
            mealPlans: (Array.isArray(payload.mealPlans)
              ? payload.mealPlans
              : [payload.mealPlans]
            ).map(normalizeMealPlan),
          }
        : {}),
    })
    .then(unwrap);
