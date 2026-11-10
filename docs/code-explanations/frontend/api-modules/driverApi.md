# Client API module: `client/src/api/driverApi.js`

**Source:** [client/src/api/driverApi.js](../../../../client/src/api/driverApi.js)

## Responsibility

This module is the client-side transport boundary for the driver feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- api from ./axios

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `getDriverDashboard` (source line 3)

`async () => {`

Calls: `GET /driver/dashboard`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getDriverAssignedTours` (source line 8)

`async () => {`

Calls: `GET /driver/assigned-tours`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getDriverTour` (source line 13)

`async (tourId) => {`

Calls: `GET /driver/tours/${…}`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getDriverTourGuests` (source line 18)

`async (tourId) => {`

Calls: `GET /driver/tours/${…}/guests`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `updateDriverTourStatus` (source line 23)

`async (tourId, status) => {`

Calls: `PUT /driver/tours/${…}/status`. No local catch is present, so Axios rejection propagates to the calling hook/component.

## Callers

- [`client/src/pages/driver/DriverDashboard.jsx`](../../../../client/src/pages/driver/DriverDashboard.jsx)

## Runtime and failure behavior

An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.

## Source excerpt

```js
import api from "./axios";

export const getDriverDashboard = async () => {
  const { data } = await api.get("/driver/dashboard");
  return data;
};

export const getDriverAssignedTours = async () => {
  const { data } = await api.get("/driver/assigned-tours");
  return data;
};

export const getDriverTour = async (tourId) => {
  const { data } = await api.get(`/driver/tours/${tourId}`);
  return data;
};

export const getDriverTourGuests = async (tourId) => {
  const { data } = await api.get(`/driver/tours/${tourId}/guests`);
  return data;
};

export const updateDriverTourStatus = async (tourId, status) => {
  const { data } = await api.put(`/driver/tours/${tourId}/status`, { status });
  return data;
};
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.
