# Client API module: `client/src/api/analyticsApi.js`

**Source:** [client/src/api/analyticsApi.js](../../../../client/src/api/analyticsApi.js)

## Responsibility

This module is the client-side transport boundary for the analytics feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- api from ./axios

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `getAnalytics` (source line 11)

`async (params = {}) => {`

Calls: `GET /analytics`. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.
### `getRevenueAnalytics` (source line 25)

`async (params = {}) => {`

Calls: `GET /analytics/revenue`. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.

## Callers

- [`client/src/api/adminApi.js`](../../../../client/src/api/adminApi.js)
- [`client/src/components/tours/tourManager/RevenueChart.jsx`](../../../../client/src/components/tours/tourManager/RevenueChart.jsx)
- [`client/src/pages/admin/AdminAnalytics.jsx`](../../../../client/src/pages/admin/AdminAnalytics.jsx)

## Runtime and failure behavior

An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.

## Source excerpt

```js
// client/src/services/analyticsService.js

import api from "./axios";

/*
|--------------------------------------------------------------------------
| GET ANALYTICS
|--------------------------------------------------------------------------
*/

export const getAnalytics = async (params = {}) => {
  const { data } = await api.get("/analytics", {
    params,
  });

  return data;
};

/*
|--------------------------------------------------------------------------
| GET REVENUE ANALYTICS
|--------------------------------------------------------------------------
*/

export const getRevenueAnalytics = async (params = {}) => {
  const { data } = await api.get("/analytics/revenue", {
    params,
  });

  return data;
};
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.
