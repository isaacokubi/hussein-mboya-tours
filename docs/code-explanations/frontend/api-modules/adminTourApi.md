# Client API module: `client/src/api/adminTourApi.js`

**Source:** [client/src/api/adminTourApi.js](../../../../client/src/api/adminTourApi.js)

## Responsibility

This module is the client-side transport boundary for the admin tour feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- api from ./axios

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `getTours` (source line 9)

`async (params = {}) => {`

Calls: `GET /tours`. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.
### `getTour` (source line 20)

`async (id) => {`

Calls: `GET /admin/tours/${…}`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getTourBySlug` (source line 34)

`async (slug) => {`

Calls: `GET /tours/slug/${…}`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getAdminTours` (source line 48)

`async (params = {}) => {`

Calls: `GET /admin/tours`. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.
### `createTour` (source line 59)

`async (formData) => {`

Calls: `POST /admin/tours`. No local catch is present, so Axios rejection propagates to the calling hook/component. Supports multipart form payload handling for uploads.
### `updateTour` (source line 73)

`async (`

Calls: `PUT /admin/tours/${…}`. No local catch is present, so Axios rejection propagates to the calling hook/component. Supports multipart form payload handling for uploads.
### `deleteTour` (source line 90)

`async (id) => {`

Calls: `DELETE /admin/tours/${…}`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getGuides` (source line 104)

`async () => {`

Calls: `GET /users/guides`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getVehicles` (source line 115)

`async () => {`

Calls: `GET /vehicles`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getDestinations` (source line 126)

`async () => {`

Calls: `GET /destinations`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.

## Callers

- [`client/src/api/adminApi.js`](../../../../client/src/api/adminApi.js)
- [`client/src/api/adminDestinationApi.js`](../../../../client/src/api/adminDestinationApi.js)
- [`client/src/api/destinationApi.js`](../../../../client/src/api/destinationApi.js)
- [`client/src/api/tourApi.js`](../../../../client/src/api/tourApi.js)
- [`client/src/api/tourAssignmentApi.js`](../../../../client/src/api/tourAssignmentApi.js)
- [`client/src/api/tourManagerApi.js`](../../../../client/src/api/tourManagerApi.js)
- [`client/src/api/vehicleApi.js`](../../../../client/src/api/vehicleApi.js)
- [`client/src/hooks/useVehicles.js`](../../../../client/src/hooks/useVehicles.js)
- [`client/src/pages/TourDetails.jsx`](../../../../client/src/pages/TourDetails.jsx)
- [`client/src/pages/Tours.jsx`](../../../../client/src/pages/Tours.jsx)
- [`client/src/pages/admin/BookingManagement.jsx`](../../../../client/src/pages/admin/BookingManagement.jsx)
- [`client/src/pages/admin/CustomTourRequests.jsx`](../../../../client/src/pages/admin/CustomTourRequests.jsx)

## Runtime and failure behavior

An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.

## Source excerpt

```js
import api from "./axios";

/*
|--------------------------------------------------------------------------
| PUBLIC TOURS
|--------------------------------------------------------------------------
*/

export const getTours = async (params = {}) => {
  const { data } = await api.get(
    "/tours",
    {
      params,
    }
  );

  return data;
};

export const getTour = async (id) => {



  const { data } = await api.get(
    `/admin/tours/${id}`
  );



  return data.tour;

};

export const getTourBySlug = async (slug) => {
  const { data } = await api.get(
    `/tours/slug/${slug}`
  );

  return data;
};

/*
|--------------------------------------------------------------------------
| ADMIN TOURS
|--------------------------------------------------------------------------
*/

export const getAdminTours = async (params = {}) => {
  const { data } = await api.get(
    "/admin/tours",
    {
      params,
    }
  );

  return data;
};

export const createTour = async (formData) => {
  const { data } = await api.post(
    "/admin/tours",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;
};

export const updateTour = async (
  id,
  formData
) => {
  const { data } = await api.put(
    `/admin/tours/${id}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;
};

export const deleteTour = async (id) => {
  const { data } = await api.delete(
    `/admin/tours/${id}`
  );

  return data;
};

/*
|--------------------------------------------------------------------------
| SUPPORT DATA
|--------------------------------------------------------------------------
*/

export const getGuides = async () => {

  const { data } = await api.get(
    "/users/guides"
  );

  return data.guides || data.data || data.users || data;

};


export const getVehicles = async () => {

  const { data } = await api.get(
    "/vehicles"
  );

  return data.vehicles || data.data || data;

};


export const getDestinations = async () => {

  const { data } = await api.get(
    "/destinations"
  );

  return data.destinations || data.data || data;

};
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.
