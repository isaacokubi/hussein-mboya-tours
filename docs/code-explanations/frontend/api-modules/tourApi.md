# Client API module: `client/src/api/tourApi.js`

**Source:** [client/src/api/tourApi.js](../../../../client/src/api/tourApi.js)

## Responsibility

This module is the client-side transport boundary for the tour feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- api from ./axios

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `getTours` (source line 4)

`async (params = null) => {`

Calls: `GET /tours`. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.
### `getFeaturedTours` (source line 10)

`async () => {`

Calls: `GET /tours/featured`, `GET /tours`. Returns/destructures Axios response data rather than exposing the full transport response. Contains local try/catch behavior; read the catch branch below to see fallback/error policy. Passes query parameters from the caller into Axios config.
### `getTourById` (source line 26)

`async (id) => {`

Calls: `GET /tours/${…}`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getTour` (source line 31)

`getTourById`

No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getTourBySlug` (source line 33)

`async (slug, { signal } = {}) => {`

Calls: `GET /tours/slug/${…}`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getManagerTours` (source line 39)

`async (params = {}) => {`

Calls: `GET /tours/manager`. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.
### `getUpcomingTours` (source line 44)

`async (params = {}) => {`

Calls: `GET /tourmanager/tours`. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.
### `createTour` (source line 51)

`async (payload) => {`

Calls: `POST /tours`. No local catch is present, so Axios rejection propagates to the calling hook/component. Supports multipart form payload handling for uploads.
### `updateTour` (source line 58)

`async (id, payload) => {`

Calls: `PUT /tours/${…}`. No local catch is present, so Axios rejection propagates to the calling hook/component. Supports multipart form payload handling for uploads.
### `deleteTour` (source line 65)

`async (id) => {`

Calls: `DELETE /tours/${…}`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getGuides` (source line 71)

`async () => {`

Calls: `GET /staff/guides`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getDrivers` (source line 76)

`async () => {`

Calls: `GET /staff/drivers`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getVehicles` (source line 81)

`async () => {`

Calls: `GET /vehicles`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `assignTourResources` (source line 86)

`async (tourId, assignmentData) => {`

Calls: `PUT /tour-assignments/${…}/assign`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `assignGuide` (source line 91)

`(tourId, guideId) => assignTourResources(tourId, { guideId })`

No local catch is present, so Axios rejection propagates to the calling hook/component.
### `assignDriver` (source line 92)

`(tourId, driverId) => assignTourResources(tourId, { driverId })`

No local catch is present, so Axios rejection propagates to the calling hook/component.
### `assignVehicle` (source line 93)

`(tourId, vehicleId) => assignTourResources(tourId, { vehicleId })`

No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getDestinations` (source line 96)

`async () => {`

Calls: `GET /destinations`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getTourAvailability` (source line 102)

`async (id) => {`

Calls: `GET /tours/${…}/availability`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `updateTourAvailability` (source line 107)

`async (id, payload) => {`

Calls: `PATCH /tours/${…}/availability`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getTourReports` (source line 113)

`async (params = {}) => {`

Calls: `GET /tourmanager/reports`. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.

## Callers

- [`client/src/api/adminDestinationApi.js`](../../../../client/src/api/adminDestinationApi.js)
- [`client/src/api/adminTourApi.js`](../../../../client/src/api/adminTourApi.js)
- [`client/src/api/destinationApi.js`](../../../../client/src/api/destinationApi.js)
- [`client/src/api/tourAssignmentApi.js`](../../../../client/src/api/tourAssignmentApi.js)
- [`client/src/api/tourManagerApi.js`](../../../../client/src/api/tourManagerApi.js)
- [`client/src/api/vehicleApi.js`](../../../../client/src/api/vehicleApi.js)
- [`client/src/components/admin/AddVehicleModal.jsx`](../../../../client/src/components/admin/AddVehicleModal.jsx)
- [`client/src/components/home/FeaturedTours.jsx`](../../../../client/src/components/home/FeaturedTours.jsx)
- [`client/src/hooks/useFeaturedTours.js`](../../../../client/src/hooks/useFeaturedTours.js)
- [`client/src/hooks/useVehicles.js`](../../../../client/src/hooks/useVehicles.js)
- [`client/src/pages/Checkout.jsx`](../../../../client/src/pages/Checkout.jsx)
- [`client/src/pages/TourDetails.jsx`](../../../../client/src/pages/TourDetails.jsx)

## Runtime and failure behavior

An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.

## Source excerpt

```js
import api from "./axios";

/* Public tours */
export const getTours = async (params = null) => {
  const query = typeof params === "string" ? { category: params } : (params || {});
  const { data } = await api.get("/tours", { params: query });
  return data;
};

export const getFeaturedTours = async () => {
  try {
    const { data } = await api.get("/tours/featured");
    return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
  } catch (featuredError) {
    try {
      const { data } = await api.get("/tours", { params: { limit: 6, featured: "true" } });
      const fallback = Array.isArray(data?.data) ? data.data : Array.isArray(data?.tours) ? data.tours : Array.isArray(data) ? data : [];
      if (fallback.length) return fallback;
    } catch {
      // Fall through to the original error.
    }
    throw featuredError;
  }
};

export const getTourById = async (id) => {
  const { data } = await api.get(`/tours/${id}`);
  return data?.data || data;
};

export const getTour = getTourById;

export const getTourBySlug = async (slug, { signal } = {}) => {
  const { data } = await api.get(`/tours/slug/${encodeURIComponent(slug)}`, { signal });
  return data?.data || data;
};

/* Tour Manager */
export const getManagerTours = async (params = {}) => {
  const { data } = await api.get("/tours/manager", { params });
  return data;
};

export const getUpcomingTours = async (params = {}) => {
  const { data } = await api.get("/tourmanager/tours", {
    params: { ...params, upcoming: "true" },
  });
  return data;
};

export const createTour = async (payload) => {
  const { data } = await api.post("/tours", payload, {
    headers: payload instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined,
  });
  return data;
};

export const updateTour = async (id, payload) => {
  const { data } = await api.put(`/tours/${id}`, payload, {
    headers: payload instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined,
  });
  return data;
};

export const deleteTour = async (id) => {
  const { data } = await api.delete(`/tours/${id}`);
  return data;
};

/* Staff/resources */
export const getGuides = async () => {
  const { data } = await api.get("/staff/guides");
  return Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : Array.isArray(data?.data?.guides) ? data.data.guides : Array.isArray(data?.guides) ? data.guides : [];
};

export const getDrivers = async () => {
  const { data } = await api.get("/staff/drivers");
  return Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : Array.isArray(data?.data?.drivers) ? data.data.drivers : Array.isArray(data?.drivers) ? data.drivers : [];
};

export const getVehicles = async () => {
  const { data } = await api.get("/vehicles");
  return Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : Array.isArray(data?.data?.vehicles) ? data.data.vehicles : Array.isArray(data?.vehicles) ? data.vehicles : [];
};

export const assignTourResources = async (tourId, assignmentData) => {
  const { data } = await api.put(`/tour-assignments/${tourId}/assign`, assignmentData);
  return data;
};

export const assignGuide = (tourId, guideId) => assignTourResources(tourId, { guideId });
export const assignDriver = (tourId, driverId) => assignTourResources(tourId, { driverId });
export const assignVehicle = (tourId, vehicleId) => assignTourResources(tourId, { vehicleId });

/* Destinations */
export const getDestinations = async () => {
  const { data } = await api.get("/destinations");
  return data;
};

/* Availability */
export const getTourAvailability = async (id) => {
  const { data } = await api.get(`/tours/${id}/availability`);
  return data;
};

export const updateTourAvailability = async (id, payload) => {
  const { data } = await api.patch(`/tours/${id}/availability`, payload);
  return data;
};

/* Reports */
export const getTourReports = async (params = {}) => {
  const { data } = await api.get("/tourmanager/reports", { params });
  return data;
};
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.
