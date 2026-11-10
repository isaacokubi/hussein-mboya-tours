# Client API module: `client/src/api/hotelApi.js`

**Source:** [client/src/api/hotelApi.js](../../../../client/src/api/hotelApi.js)

## Responsibility

This module is the client-side transport boundary for the hotel feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- api from ./axios

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `hotelQueryScope` (source line 37)

`() => {`

Contains local try/catch behavior; read the catch branch below to see fallback/error policy.
### `getHotels` (source line 49)

`(params = {}) => api.get("/hotels", { params }).then(unwrap)`

Calls: `GET /hotels`. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.
### `getHotel` (source line 50)

`(id) => api.get(`/hotels/${encodeURIComponent(id)}`).then(unwrap)`

Calls: `GET /hotels/${…}`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getPublicHotel` (source line 55)

`async (id) => {`

Contains local try/catch behavior; read the catch branch below to see fallback/error policy.
### `getHotelAvailability` (source line 75)

`(params = {}) => api.get("/hotels/availability", { params }).then(unwrap)`

Calls: `GET /hotels/availability`. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.
### `createHotelBooking` (source line 77)

`async (payload) => {`

Calls: `POST /hotels/bookings`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getHotelBookings` (source line 89)

`(params = {}) => api.get("/hotels/bookings", { params }).then(unwrap).then(tenantSafe)`

Calls: `GET /hotels/bookings`. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.
### `updateHotelBooking` (source line 90)

`(id, payload) => api.patch(`/hotels/bookings/${id}`, payload).then(unwrap)`

Calls: `PATCH /hotels/bookings/${…}`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `syncHotelInventory` (source line 91)

`() => api.post("/hotels/admin/sync-inventory").then(unwrap)`

Calls: `POST /hotels/admin/sync-inventory`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getAdminHotels` (source line 93)

`async (params = {}) => {`

Calls: `GET /hotels/admin/catalog`. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.
### `createHotel` (source line 98)

`(payload) => api.post("/hotels/admin/catalog", payload).then(unwrap)`

Calls: `POST /hotels/admin/catalog`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `updateHotel` (source line 99)

`(id, payload) => api.patch(`/hotels/admin/catalog/${id}`, payload).then(unwrap)`

Calls: `PATCH /hotels/admin/catalog/${…}`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `createRoomType` (source line 101)

`(hotelId, payload) => {`

Calls: `POST /hotels/admin/catalog/${…}/rooms`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `updateRoomType` (source line 125)

`(id, payload) =>`

Calls: `PATCH /hotels/admin/rooms/${…}`. No local catch is present, so Axios rejection propagates to the calling hook/component.

## Callers

- [`client/src/pages/HotelDetails.jsx`](../../../../client/src/pages/HotelDetails.jsx)
- [`client/src/pages/HotelReservation.jsx`](../../../../client/src/pages/HotelReservation.jsx)
- [`client/src/pages/Hotels.jsx`](../../../../client/src/pages/Hotels.jsx)
- [`client/src/pages/HotelsMarketplace.jsx`](../../../../client/src/pages/HotelsMarketplace.jsx)
- [`client/src/pages/admin/HospitalityCommercial.jsx`](../../../../client/src/pages/admin/HospitalityCommercial.jsx)
- [`client/src/pages/admin/HospitalityManagement.jsx`](../../../../client/src/pages/admin/HospitalityManagement.jsx)
- [`client/src/pages/admin/HospitalityOperations.jsx`](../../../../client/src/pages/admin/HospitalityOperations.jsx)
- [`client/src/pages/admin/HospitalityReservationOperations.jsx`](../../../../client/src/pages/admin/HospitalityReservationOperations.jsx)

## Runtime and failure behavior

An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.

## Source excerpt

```js
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

const normalizeList = (value) => {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  return String(value || "").split(",").map((item) => item.trim()).filter(Boolean);
};

export const hotelQueryScope = () => {
  if (typeof window === "undefined") return "server";
  let tenant = "";
  try {
    const user = JSON.parse(window.localStorage.getItem("user") || "null");
    tenant = String(user?.tenantId?._id || user?.tenantId || user?.tenant?._id || user?.organizationId || "").trim();
  } catch {
    // Public hostname still provides a stable cache scope when storage is unavailable.
  }
  return `${window.location.hostname}:${tenant}`;
};

export const getHotels = (params = {}) => api.get("/hotels", { params }).then(unwrap);
export const getHotel = (id) => api.get(`/hotels/${encodeURIComponent(id)}`).then(unwrap);

// Keep detail and reservation views consistent with the public catalogue. Some
// deployed API versions may temporarily fail to resolve a detail URL even when
// the property is present in the tenant-scoped public list.
export const getPublicHotel = async (id) => {
  let detailError;
  try {
    const detail = await getHotel(id);
    if (detail) return detail;
  } catch (error) {
    detailError = error;
  }
  const catalogue = await getHotels();
  const key = String(id || "").trim().toLowerCase();
  const match = Array.isArray(catalogue)
    ? catalogue.find((item) =>
        String(item?._id || "").toLowerCase() === key ||
        String(item?.slug || "").trim().toLowerCase() === key
      )
    : null;
  if (match) return match;
  if (detailError) throw detailError;
  return null;
};
export const getHotelAvailability = (params = {}) => api.get("/hotels/availability", { params }).then(unwrap);

export const createHotelBooking = async (payload) => {
  const response = await api.post("/hotels/bookings", payload);
  const body = response?.data || {};
  const booking = body?.data || body;
  if (!booking?._id) {
    const error = new Error(body?.message || "The hotel reservation was not created.");
    error.response = response;
    throw error;
  }
  return { ...booking, data: booking, success: body.success !== false, paymentRequired: Boolean(body.paymentRequired), invoice: body.invoice || null };
};

export const getHotelBookings = (params = {}) => api.get("/hotels/bookings", { params }).then(unwrap).then(tenantSafe);
export const updateHotelBooking = (id, payload) => api.patch(`/hotels/bookings/${id}`, payload).then(unwrap);
export const syncHotelInventory = () => api.post("/hotels/admin/sync-inventory").then(unwrap);

export const getAdminHotels = async (params = {}) => {
  await syncHotelInventory().catch(() => null);
  return api.get("/hotels/admin/catalog", { params }).then(unwrap).then(tenantSafe);
};

export const createHotel = (payload) => api.post("/hotels/admin/catalog", payload).then(unwrap);
export const updateHotel = (id, payload) => api.patch(`/hotels/admin/catalog/${id}`, payload).then(unwrap);

export const createRoomType = (hotelId, payload) => {
  if (!hotelId) {
    const error = new Error("Select a property before creating a room type.");
    error.code = "HOTEL_REQUIRED";
    return Promise.reject(error);
  }
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
  if (!body.mealPlans.length) body.mealPlans = ["room_only"];
  return api.post(`/hotels/admin/catalog/${encodeURIComponent(hotelId)}/rooms`, body).then(unwrap);
};

export const updateRoomType = (id, payload) =>
  api.patch(`/hotels/admin/rooms/${id}`, {
    ...payload,
    ...(payload?.beds !== undefined ? { beds: normalizeList(payload.beds) } : {}),
    ...(payload?.amenities !== undefined ? { amenities: normalizeList(payload.amenities) } : {}),
    ...(payload?.mealPlans ? { mealPlans: normalizeList(payload.mealPlans).map(normalizeMealPlan) } : {}),
  }).then(unwrap);
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.
