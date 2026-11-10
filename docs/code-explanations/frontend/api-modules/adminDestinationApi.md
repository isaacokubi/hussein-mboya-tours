# Client API module: `client/src/api/adminDestinationApi.js`

**Source:** [client/src/api/adminDestinationApi.js](../../../../client/src/api/adminDestinationApi.js)

## Responsibility

This module is the client-side transport boundary for the admin destination feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- api from ./axios

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `getDestinations` (source line 10)

`async (params = {}) => {`

Calls: `GET /destinations`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.
### `getDestination` (source line 28)

`async (id) => {`

Calls: `GET /destinations/${…}`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getDestinationBySlug` (source line 38)

`async (slug) => {`

Calls: `GET /destinations/slug/${…}`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getAdminDestinations` (source line 56)

`async () => {`

Calls: `GET /admin/destinations`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getAdminDestinationById` (source line 73)

`async (id) => {`

Calls: `GET /admin/destinations/${…}`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `createDestination` (source line 85)

`async (destination) => {`

Calls: `POST /admin/destinations`. No local catch is present, so Axios rejection propagates to the calling hook/component. Supports multipart form payload handling for uploads.
### `updateDestination` (source line 103)

`async (`

Calls: `PUT /admin/destinations/${…}`. No local catch is present, so Axios rejection propagates to the calling hook/component. Supports multipart form payload handling for uploads.
### `deleteDestination` (source line 124)

`async (id) => {`

Calls: `DELETE /admin/destinations/${…}`. No local catch is present, so Axios rejection propagates to the calling hook/component.

## Callers

- [`client/src/api/adminTourApi.js`](../../../../client/src/api/adminTourApi.js)
- [`client/src/api/destinationApi.js`](../../../../client/src/api/destinationApi.js)
- [`client/src/api/tourApi.js`](../../../../client/src/api/tourApi.js)
- [`client/src/pages/admin/CreateDestination.jsx`](../../../../client/src/pages/admin/CreateDestination.jsx)
- [`client/src/pages/admin/DestinationDetails.jsx`](../../../../client/src/pages/admin/DestinationDetails.jsx)
- [`client/src/pages/admin/DestinationManagement.jsx`](../../../../client/src/pages/admin/DestinationManagement.jsx)
- [`client/src/pages/admin/EditDestination.jsx`](../../../../client/src/pages/admin/EditDestination.jsx)
- [`client/src/pages/tourManager/CreateTour.jsx`](../../../../client/src/pages/tourManager/CreateTour.jsx)
- [`client/src/pages/tourManager/EditTour.jsx`](../../../../client/src/pages/tourManager/EditTour.jsx)
- [`client/src/pages/tourManager/TourManagerTours.jsx`](../../../../client/src/pages/tourManager/TourManagerTours.jsx)

## Runtime and failure behavior

An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.

## Source excerpt

```js
import api from "./axios";


/*
|--------------------------------------------------------------------------
| PUBLIC DESTINATIONS
|--------------------------------------------------------------------------
*/

export const getDestinations = async (params = {}) => {

  const { data } = await api.get(
    "/destinations",
    {
      params,
    }
  );

  return (
    data.data ||
    data.destinations ||
    data ||
    []
  );
};


export const getDestination = async (id) => {

  const { data } = await api.get(
    `/destinations/${id}`
  );

  return data.data || data;
};


export const getDestinationBySlug = async (slug) => {

  const { data } = await api.get(
    `/destinations/slug/${slug}`
  );

  return data.data || data;
};



/*
|--------------------------------------------------------------------------
| ADMIN DESTINATIONS
|--------------------------------------------------------------------------
*/


export const getAdminDestinations = async () => {

  const { data } = await api.get(
    "/admin/destinations"
  );

  return (
    data.data ||
    data.destinations ||
    data ||
    []
  );

};



export const getAdminDestinationById = async (id) => {

  const { data } = await api.get(
    `/admin/destinations/${id}`
  );

  return data.data || data;

};



export const createDestination = async (destination) => {

  const { data } = await api.post(
    "/admin/destinations",
    destination,
    {
      headers:{
        "Content-Type":"multipart/form-data"
      }
    }
  );

  return data;

};



export const updateDestination = async (
  id,
  destination
) => {

  const { data } = await api.put(
    `/admin/destinations/${id}`,
    destination,
    {
      headers:{
        "Content-Type":"multipart/form-data"
      }
    }
  );

  return data;

};



export const deleteDestination = async (id) => {

  const { data } = await api.delete(
    `/admin/destinations/${id}`
  );

  return data;

};
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.
