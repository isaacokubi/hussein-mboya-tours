# Client API module: `client/src/api/airportTransferApi.js`

**Source:** [client/src/api/airportTransferApi.js](../../../../client/src/api/airportTransferApi.js)

## Responsibility

This module is the client-side transport boundary for the airport transfer feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- api from ./axios

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `getAirportTransfers` (source line 14)

`(params = {}) => api.get("/airport-transfers", { params }).then(unwrap).then(tenantSafe)`

Calls: `GET /airport-transfers`. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.
### `getAirportTransfer` (source line 15)

`(id) => api.get(`/airport-transfers/${id}`).then(unwrap)`

Calls: `GET /airport-transfers/${…}`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `createTransferBooking` (source line 16)

`(payload) => api.post("/airport-transfers/bookings", payload).then((response) => {`

Calls: `POST /airport-transfers/bookings`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getTransferBookings` (source line 22)

`(params = {}) => api.get("/airport-transfers/bookings", { params }).then(unwrap).then(tenantSafe)`

Calls: `GET /airport-transfers/bookings`. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.
### `updateTransferBooking` (source line 23)

`(id, payload) => api.patch(`/airport-transfers/bookings/${id}`, payload).then(unwrap)`

Calls: `PATCH /airport-transfers/bookings/${…}`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getAdminTransfers` (source line 24)

`(params = {}) => api.get("/airport-transfers/admin/catalog", { params }).then(unwrap).then(tenantSafe)`

Calls: `GET /airport-transfers/admin/catalog`. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.
### `createTransfer` (source line 25)

`(payload) => api.post("/airport-transfers/admin/catalog", payload).then(unwrap)`

Calls: `POST /airport-transfers/admin/catalog`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `updateTransfer` (source line 26)

`(id, payload) => api.patch(`/airport-transfers/admin/catalog/${id}`, payload).then(unwrap)`

Calls: `PATCH /airport-transfers/admin/catalog/${…}`. No local catch is present, so Axios rejection propagates to the calling hook/component.

## Callers

- [`client/src/pages/AirportTransferDetails.jsx`](../../../../client/src/pages/AirportTransferDetails.jsx)
- [`client/src/pages/AirportTransferReservation.jsx`](../../../../client/src/pages/AirportTransferReservation.jsx)
- [`client/src/pages/AirportTransfers.jsx`](../../../../client/src/pages/AirportTransfers.jsx)
- [`client/src/pages/AirportTransfersMarketplace.jsx`](../../../../client/src/pages/AirportTransfersMarketplace.jsx)
- [`client/src/pages/admin/HospitalityCommercial.jsx`](../../../../client/src/pages/admin/HospitalityCommercial.jsx)
- [`client/src/pages/admin/HospitalityManagement.jsx`](../../../../client/src/pages/admin/HospitalityManagement.jsx)
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
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.
