# Client API module: `client/src/api/adminApi.js`

**Source:** [client/src/api/adminApi.js](../../../../client/src/api/adminApi.js)

## Responsibility

This module is the client-side transport boundary for the admin feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- api from ./axios

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `getDashboard` (source line 10)

`async () => getData(api.get("/admin/dashboard"))`

Calls: `GET /admin/dashboard`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getDashboardMetrics` (source line 11)

`getDashboard`

No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getUsersAnalytics` (source line 12)

`async () => getData(api.get("/admin/users/analytics"))`

Calls: `GET /admin/users/analytics`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getBookingAnalytics` (source line 13)

`async () => getData(api.get("/admin/bookings/analytics"))`

Calls: `GET /admin/bookings/analytics`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getRevenueAnalytics` (source line 14)

`async () => getData(api.get("/admin/revenue/analytics"))`

Calls: `GET /admin/revenue/analytics`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getSystemHealth` (source line 15)

`async () => getData(api.get("/system/admin/system-health"))`

Calls: `GET /system/admin/system-health`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getAdminBookings` (source line 16)

`async (params = {}) => getData(api.get("/admin/bookings", { params }))`

Calls: `GET /admin/bookings`. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.
### `getAdminTours` (source line 17)

`async (params = {}) => getData(api.get("/admin/tours", { params }))`

Calls: `GET /admin/tours`. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.

## Callers

- [`client/src/api/admin/systemHealthApi.js`](../../../../client/src/api/admin/systemHealthApi.js)
- [`client/src/api/adminTourApi.js`](../../../../client/src/api/adminTourApi.js)
- [`client/src/api/analyticsApi.js`](../../../../client/src/api/analyticsApi.js)
- [`client/src/api/bookingApi.js`](../../../../client/src/api/bookingApi.js)
- [`client/src/api/superAdminApi.js`](../../../../client/src/api/superAdminApi.js)
- [`client/src/components/admin/dashboard/AdminDashboard.jsx`](../../../../client/src/components/admin/dashboard/AdminDashboard.jsx)
- [`client/src/components/admin/dashboard/SystemHealth.jsx`](../../../../client/src/components/admin/dashboard/SystemHealth.jsx)
- [`client/src/components/tours/tourManager/RevenueChart.jsx`](../../../../client/src/components/tours/tourManager/RevenueChart.jsx)
- [`client/src/pages/admin/AdminAITools.jsx`](../../../../client/src/pages/admin/AdminAITools.jsx)
- [`client/src/pages/admin/AdminSystemHealth.jsx`](../../../../client/src/pages/admin/AdminSystemHealth.jsx)
- [`client/src/pages/admin/Bookings.jsx`](../../../../client/src/pages/admin/Bookings.jsx)
- [`client/src/pages/admin/ManageTours.jsx`](../../../../client/src/pages/admin/ManageTours.jsx)

## Runtime and failure behavior

An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.

## Source excerpt

```js
import api from "./axios";

const getData = async (request) => {
  const response = await request;
  return response.data;
};

// Canonical tenant dashboard endpoint. All dashboard consumers use the same
// normalized backend source so cards cannot drift between pages.
export const getDashboard = async () => getData(api.get("/admin/dashboard"));
export const getDashboardMetrics = getDashboard;
export const getUsersAnalytics = async () => getData(api.get("/admin/users/analytics"));
export const getBookingAnalytics = async () => getData(api.get("/admin/bookings/analytics"));
export const getRevenueAnalytics = async () => getData(api.get("/admin/revenue/analytics"));
export const getSystemHealth = async () => getData(api.get("/system/admin/system-health"));
export const getAdminBookings = async (params = {}) => getData(api.get("/admin/bookings", { params }));
export const getAdminTours = async (params = {}) => getData(api.get("/admin/tours", { params }));
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.
