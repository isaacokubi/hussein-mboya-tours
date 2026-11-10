# Client API module: `client/src/api/tourAssignmentApi.js`

**Source:** [client/src/api/tourAssignmentApi.js](../../../../client/src/api/tourAssignmentApi.js)

## Responsibility

This module is the client-side transport boundary for the tour assignment feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- api from ./axios

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `getTours` (source line 3)

`async (params = {}) => {`

Calls: `GET /tourmanager/tours`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.
### `getGuides` (source line 8)

`async () => {`

Calls: `GET /tourmanager/guides`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getDrivers` (source line 13)

`async () => {`

Calls: `GET /tourmanager/drivers`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getVehicles` (source line 18)

`async () => {`

Calls: `GET /tourmanager/vehicles`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `assignTour` (source line 23)

`async (tourId, assignmentData) => {`

Calls: `PUT /tourmanager/tours/${…}/assign`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `completeTour` (source line 28)

`async (tourId) => {`

Calls: `PATCH /tourmanager/tours/${…}/complete`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `cancelTour` (source line 33)

`async (tourId, reason) => {`

Calls: `PATCH /tourmanager/tours/${…}/cancel`. No local catch is present, so Axios rejection propagates to the calling hook/component.

## Callers

- [`client/src/api/adminTourApi.js`](../../../../client/src/api/adminTourApi.js)
- [`client/src/api/tourApi.js`](../../../../client/src/api/tourApi.js)
- [`client/src/api/tourManagerApi.js`](../../../../client/src/api/tourManagerApi.js)
- [`client/src/api/vehicleApi.js`](../../../../client/src/api/vehicleApi.js)
- [`client/src/components/admin/AddVehicleModal.jsx`](../../../../client/src/components/admin/AddVehicleModal.jsx)
- [`client/src/hooks/useVehicles.js`](../../../../client/src/hooks/useVehicles.js)
- [`client/src/pages/Tours.jsx`](../../../../client/src/pages/Tours.jsx)
- [`client/src/pages/admin/BookingManagement.jsx`](../../../../client/src/pages/admin/BookingManagement.jsx)
- [`client/src/pages/admin/CustomTourRequests.jsx`](../../../../client/src/pages/admin/CustomTourRequests.jsx)
- [`client/src/pages/admin/Guides.jsx`](../../../../client/src/pages/admin/Guides.jsx)
- [`client/src/pages/admin/Vehicles.jsx`](../../../../client/src/pages/admin/Vehicles.jsx)
- [`client/src/pages/guide/TourGuideDashboard.jsx`](../../../../client/src/pages/guide/TourGuideDashboard.jsx)

## Runtime and failure behavior

An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.

## Source excerpt

```js
import api from "./axios";

export const getTours = async (params = {}) => {
  const { data } = await api.get("/tourmanager/tours", { params });
  return Array.isArray(data?.tours) ? data.tours : Array.isArray(data?.data) ? data.data : [];
};

export const getGuides = async () => {
  const { data } = await api.get("/tourmanager/guides");
  return Array.isArray(data?.data) ? data.data : Array.isArray(data?.guides) ? data.guides : [];
};

export const getDrivers = async () => {
  const { data } = await api.get("/tourmanager/drivers");
  return Array.isArray(data?.data) ? data.data : Array.isArray(data?.staff) ? data.staff : [];
};

export const getVehicles = async () => {
  const { data } = await api.get("/tourmanager/vehicles");
  return Array.isArray(data?.data) ? data.data : Array.isArray(data?.vehicles) ? data.vehicles : [];
};

export const assignTour = async (tourId, assignmentData) => {
  const { data } = await api.put(`/tourmanager/tours/${tourId}/assign`, assignmentData);
  return data;
};

export const completeTour = async (tourId) => {
  const { data } = await api.patch(`/tourmanager/tours/${tourId}/complete`);
  return data;
};

export const cancelTour = async (tourId, reason) => {
  const { data } = await api.patch(`/tourmanager/tours/${tourId}/cancel`, { reason });
  return data;
};
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.
