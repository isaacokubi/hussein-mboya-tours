# Client API module: `client/src/api/guideApi.js`

**Source:** [client/src/api/guideApi.js](../../../../client/src/api/guideApi.js)

## Responsibility

This module is the client-side transport boundary for the guide feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- api from ./axios

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `getGuideDashboard` (source line 11)

`async () => {`

Calls: `GET /guide/dashboard`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getAssignedTours` (source line 25)

`async (params = {}) => {`

Calls: `GET /guide/assigned-tours`. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.
### `getTourGuests` (source line 42)

`async (tourId) => {`

Calls: `GET /guide/tours/${…}/guests`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `updateTourStatus` (source line 56)

`async (`

Calls: `PUT /guide/tours/${…}/status`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `submitTourReport` (source line 76)

`async (`

Calls: `POST /guide/tours/${…}/report`. No local catch is present, so Axios rejection propagates to the calling hook/component.

## Callers

- [`client/src/pages/guide/AssignedTours.jsx`](../../../../client/src/pages/guide/AssignedTours.jsx)
- [`client/src/pages/guide/TourGuideDashboard.jsx`](../../../../client/src/pages/guide/TourGuideDashboard.jsx)

## Runtime and failure behavior

An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.

## Source excerpt

```js
// client/src/services/guideService.js

import api from "./axios";

/*
|--------------------------------------------------------------------------
| GUIDE DASHBOARD
|--------------------------------------------------------------------------
*/

export const getGuideDashboard = async () => {
  const { data } = await api.get(
    "/guide/dashboard"
  );

  return data;
};

/*
|--------------------------------------------------------------------------
| ASSIGNED TOURS
|--------------------------------------------------------------------------
*/

export const getAssignedTours = async (params = {}) => {
  const { data } = await api.get(
    "/guide/assigned-tours",
    {
      params,
    }
  );

  return data;
};

/*
|--------------------------------------------------------------------------
| TOUR GUESTS
|--------------------------------------------------------------------------
*/

export const getTourGuests = async (tourId) => {
  const { data } = await api.get(
    `/guide/tours/${tourId}/guests`
  );

  return data;
};

/*
|--------------------------------------------------------------------------
| UPDATE TOUR STATUS
|--------------------------------------------------------------------------
*/

export const updateTourStatus = async (
  tourId,
  status
) => {
  const { data } = await api.put(
    `/guide/tours/${tourId}/status`,
    {
      status,
    }
  );

  return data;
};

/*
|--------------------------------------------------------------------------
| SUBMIT TOUR REPORT
|--------------------------------------------------------------------------
*/

export const submitTourReport = async (
  tourId,
  reportData
) => {
  const { data } = await api.post(
    `/guide/tours/${tourId}/report`,
    reportData
  );

  return data;
};
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.
