# Client API module: `client/src/api/admin/systemHealthApi.js`

**Source:** [client/src/api/admin/systemHealthApi.js](../../../../client/src/api/admin/systemHealthApi.js)

## Responsibility

This module is the client-side transport boundary for the system health feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- api from ../axios

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `getSystemHealth` (source line 12)

`async () => {`

Calls: `GET /system/health`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getAll` (source line 18)

`async () => {`

Calls: `GET /system/health`. No local catch is present, so Axios rejection propagates to the calling hook/component.

## Callers

- [`client/src/api/adminApi.js`](../../../../client/src/api/adminApi.js)
- [`client/src/api/categoryApi.js`](../../../../client/src/api/categoryApi.js)
- [`client/src/api/crmApi.js`](../../../../client/src/api/crmApi.js)
- [`client/src/api/galleryApi.js`](../../../../client/src/api/galleryApi.js)
- [`client/src/api/heroApi.js`](../../../../client/src/api/heroApi.js)
- [`client/src/api/notificationApi.js`](../../../../client/src/api/notificationApi.js)
- [`client/src/api/staffApi.js`](../../../../client/src/api/staffApi.js)
- [`client/src/api/superAdminApi.js`](../../../../client/src/api/superAdminApi.js)
- [`client/src/api/userApi.js`](../../../../client/src/api/userApi.js)
- [`client/src/components/admin/dashboard/SystemHealth.jsx`](../../../../client/src/components/admin/dashboard/SystemHealth.jsx)
- [`client/src/pages/admin/AdminSystemHealth.jsx`](../../../../client/src/pages/admin/AdminSystemHealth.jsx)
- [`client/src/pages/admin/system/SystemHealth.jsx`](../../../../client/src/pages/admin/system/SystemHealth.jsx)

## Runtime and failure behavior

An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.

## Source excerpt

```js
// client/src/api/admin/systemHealthApi.js

import api from "../axios";

/*
 * SYSTEM HEALTH
 *
 * The backend mounts systemHealthRoutes at /api/system, so the canonical
 * authenticated health endpoint is /api/system/health. Axios already
 * provides the /api prefix in local and production environments.
 */
export const getSystemHealth = async () => {
  const { data } = await api.get("/system/health");
  return data;
};

// Backwards-compatible helper used by older consumers of this module.
export const getAll = async () => {
  const { data } = await api.get("/system/health");
  return data;
};
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.
