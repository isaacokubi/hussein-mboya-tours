# Client API module: `client/src/api/bookingApi.js`

**Source:** [client/src/api/bookingApi.js](../../../../client/src/api/bookingApi.js)

## Responsibility

This module is the client-side transport boundary for the booking feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- api from ./axios

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `getBookings` (source line 5)

`async (params = {}) => (await api.get("/admin/bookings", { params })).data`

Calls: `GET /admin/bookings`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.
### `getMyBookings` (source line 7)

`async (params = {}) => {`

Calls: `GET /bookings/my-bookings`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.
### `createBooking` (source line 12)

`async (data) => (await api.post("/bookings", data)).data`

Calls: `POST /bookings`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `initiatePayment` (source line 13)

`async (data) => (await api.post("/payments/mpesa", data)).data`

Calls: `POST /payments/mpesa`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getBooking` (source line 14)

`async (id) => (await api.get(`/bookings/${id}`)).data`

Calls: `GET /bookings/${…}`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `cancelBooking` (source line 15)

`async (id) => (await api.put(`/bookings/cancel/${id}`, {})).data`

Calls: `PUT /bookings/cancel/${…}`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getAdminBookings` (source line 16)

`async (params = {}) => (await api.get("/admin/bookings", { params })).data`

Calls: `GET /admin/bookings`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.
### `updateBookingStatus` (source line 17)

`async (id, status) => (await api.put(`/admin/bookings/${id}/status`, { status })).data`

Calls: `PUT /admin/bookings/${…}/status`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getAllBookings` (source line 18)

`async () => (await api.get("/admin/bookings")).data`

Calls: `GET /admin/bookings`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `rescheduleBooking` (source line 19)

`async (id, payload) => (await api.put(`/bookings/reschedule/${id}`, payload)).data`

Calls: `PUT /bookings/reschedule/${…}`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getBookingById` (source line 20)

`async (id) => (await api.get(`/bookings/${id}`)).data`

Calls: `GET /bookings/${…}`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `updateBookingTravelDate` (source line 21)

`async (id, travelDate) => (await api.put(`/bookings/${id}/travel-date`, { travelDate })).data`

Calls: `PUT /bookings/${…}/travel-date`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.

## Callers

- [`client/src/api/adminApi.js`](../../../../client/src/api/adminApi.js)
- [`client/src/api/adminBookingApi.js`](../../../../client/src/api/adminBookingApi.js)
- [`client/src/api/agentBookingApi.js`](../../../../client/src/api/agentBookingApi.js)
- [`client/src/api/tourManagerApi.js`](../../../../client/src/api/tourManagerApi.js)
- [`client/src/pages/BookingDetails.jsx`](../../../../client/src/pages/BookingDetails.jsx)
- [`client/src/pages/Checkout.jsx`](../../../../client/src/pages/Checkout.jsx)
- [`client/src/pages/Dashboard.jsx`](../../../../client/src/pages/Dashboard.jsx)
- [`client/src/pages/MyBookings.jsx`](../../../../client/src/pages/MyBookings.jsx)
- [`client/src/pages/PaymentStatus.jsx`](../../../../client/src/pages/PaymentStatus.jsx)
- [`client/src/pages/admin/BookingManagement.jsx`](../../../../client/src/pages/admin/BookingManagement.jsx)
- [`client/src/pages/admin/Bookings.jsx`](../../../../client/src/pages/admin/Bookings.jsx)
- [`client/src/pages/admin/ManageBookings.jsx`](../../../../client/src/pages/admin/ManageBookings.jsx)

## Runtime and failure behavior

An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.

## Source excerpt

```js
// client/src/api/bookingApi.js

import api from "./axios";

export const getBookings = async (params = {}) => (await api.get("/admin/bookings", { params })).data;

export const getMyBookings = async (params = {}) => {
  const safeParams = params && typeof params === "object" && !("queryKey" in params) && !("signal" in params) ? params : {};
  return (await api.get("/bookings/my-bookings", { params: { limit: 100, ...safeParams } })).data;
};

export const createBooking = async (data) => (await api.post("/bookings", data)).data;
export const initiatePayment = async (data) => (await api.post("/payments/mpesa", data)).data;
export const getBooking = async (id) => (await api.get(`/bookings/${id}`)).data;
export const cancelBooking = async (id) => (await api.put(`/bookings/cancel/${id}`, {})).data;
export const getAdminBookings = async (params = {}) => (await api.get("/admin/bookings", { params })).data;
export const updateBookingStatus = async (id, status) => (await api.put(`/admin/bookings/${id}/status`, { status })).data;
export const getAllBookings = async () => (await api.get("/admin/bookings")).data;
export const rescheduleBooking = async (id, payload) => (await api.put(`/bookings/reschedule/${id}`, payload)).data;
export const getBookingById = async (id) => (await api.get(`/bookings/${id}`)).data;
export const updateBookingTravelDate = async (id, travelDate) => (await api.put(`/bookings/${id}/travel-date`, { travelDate })).data;
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.
