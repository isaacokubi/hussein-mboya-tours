# Client API module: `client/src/api/agentBookingApi.js`

**Source:** [client/src/api/agentBookingApi.js](../../../../client/src/api/agentBookingApi.js)

## Responsibility

This module is the client-side transport boundary for the agent booking feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- api from ./axios

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `createAgentBooking` (source line 11)

`async (bookingData) => {`

Calls: `POST /agents/bookings`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getAgentBookings` (source line 26)

`async (params = {}) => {`

Calls: `GET /agents/bookings`. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.
### `getAgentBooking` (source line 43)

`async (id) => {`

Calls: `GET /agents/bookings/${…}`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `updateBookingStatus` (source line 57)

`async (`

Calls: `PATCH /agents/bookings/${…}/status`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `cancelAgentBooking` (source line 77)

`async (id) => {`

Calls: `DELETE /agents/bookings/${…}`. No local catch is present, so Axios rejection propagates to the calling hook/component.

## Callers

- [`client/src/api/adminBookingApi.js`](../../../../client/src/api/adminBookingApi.js)
- [`client/src/api/bookingApi.js`](../../../../client/src/api/bookingApi.js)
- [`client/src/hooks/useAgentBookings.js`](../../../../client/src/hooks/useAgentBookings.js)
- [`client/src/pages/admin/BookingManagement.jsx`](../../../../client/src/pages/admin/BookingManagement.jsx)
- [`client/src/pages/admin/ManageBookings.jsx`](../../../../client/src/pages/admin/ManageBookings.jsx)

## Runtime and failure behavior

An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.

## Source excerpt

```js
// client/src/services/agentBookingService.js

import api from "./axios";

/*
|--------------------------------------------------------------------------
| CREATE BOOKING
|--------------------------------------------------------------------------
*/

export const createAgentBooking = async (bookingData) => {
  const { data } = await api.post(
    "/agents/bookings",
    bookingData
  );

  return data;
};

/*
|--------------------------------------------------------------------------
| GET BOOKINGS
|--------------------------------------------------------------------------
*/

export const getAgentBookings = async (params = {}) => {
  const { data } = await api.get(
    "/agents/bookings",
    {
      params,
    }
  );

  return data;
};

/*
|--------------------------------------------------------------------------
| GET SINGLE BOOKING
|--------------------------------------------------------------------------
*/

export const getAgentBooking = async (id) => {
  const { data } = await api.get(
    `/agents/bookings/${id}`
  );

  return data;
};

/*
|--------------------------------------------------------------------------
| UPDATE BOOKING STATUS
|--------------------------------------------------------------------------
*/

export const updateBookingStatus = async (
  id,
  status
) => {
  const { data } = await api.patch(
    `/agents/bookings/${id}/status`,
    {
      status,
    }
  );

  return data;
};

/*
|--------------------------------------------------------------------------
| CANCEL BOOKING
|--------------------------------------------------------------------------
*/

export const cancelAgentBooking = async (id) => {
  const { data } = await api.delete(
    `/agents/bookings/${id}`
  );

  return data;
};
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.
