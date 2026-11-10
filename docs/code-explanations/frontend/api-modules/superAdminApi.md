# Client API module: `client/src/api/superAdminApi.js`

**Source:** [client/src/api/superAdminApi.js](../../../../client/src/api/superAdminApi.js)

## Responsibility

This module is the client-side transport boundary for the super admin feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- axios from ./axios

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `getSuperAdminDashboard` (source line 5)

`async () => {`

Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getSuperAdminDashboardMetrics` (source line 10)

`getSuperAdminDashboard`

No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getSuperAdminRevenue` (source line 12)

`async () => {`

Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getAuditLogs` (source line 17)

`async (params = {}) =>`

Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.
### `getSecurityStatus` (source line 20)

`async () =>`

Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getDatabaseStatus` (source line 23)

`async () =>`

Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getSystemHealth` (source line 26)

`async () =>`

Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getApiMonitor` (source line 29)

`async () =>`

Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getSettings` (source line 32)

`async () => {`

Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `updateSettings` (source line 37)

`async (data) => {`

Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getSecurityEvents` (source line 42)

`async () =>`

Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getRoles` (source line 45)

`async () => {`

Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getRole` (source line 50)

`async (id) => {`

Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getPermissions` (source line 55)

`async () => {`

Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `updateRolePermissions` (source line 60)

`async (id, permissions) => {`

Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.

## Callers

- [`client/src/admin/rolesApi.js`](../../../../client/src/admin/rolesApi.js)
- [`client/src/api/admin/adminRoleApi.js`](../../../../client/src/api/admin/adminRoleApi.js)
- [`client/src/api/admin/systemHealthApi.js`](../../../../client/src/api/admin/systemHealthApi.js)
- [`client/src/api/adminApi.js`](../../../../client/src/api/adminApi.js)
- [`client/src/api/auditApi.js`](../../../../client/src/api/auditApi.js)
- [`client/src/api/settingsApi.js`](../../../../client/src/api/settingsApi.js)
- [`client/src/components/admin/dashboard/SystemHealth.jsx`](../../../../client/src/components/admin/dashboard/SystemHealth.jsx)
- [`client/src/context/SettingsContext.jsx`](../../../../client/src/context/SettingsContext.jsx)
- [`client/src/pages/admin/AdminSettings.jsx`](../../../../client/src/pages/admin/AdminSettings.jsx)
- [`client/src/pages/admin/AdminSystemHealth.jsx`](../../../../client/src/pages/admin/AdminSystemHealth.jsx)
- [`client/src/pages/admin/MpesaConfiguration.jsx`](../../../../client/src/pages/admin/MpesaConfiguration.jsx)
- [`client/src/pages/admin/system/SystemHealth.jsx`](../../../../client/src/pages/admin/system/SystemHealth.jsx)

## Runtime and failure behavior

An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.

## Source excerpt

```js
import axios from "./axios";

// Canonical platform dashboard endpoint. Keep both exported names for
// compatibility, but never maintain two different dashboard data sources.
export const getSuperAdminDashboard = async () => {
  const response = await axios.get("/superadmin/dashboard");
  return response.data;
};

export const getSuperAdminDashboardMetrics = getSuperAdminDashboard;

export const getSuperAdminRevenue = async () => {
  const response = await axios.get("/superadmin/revenue");
  return response.data;
};

export const getAuditLogs = async (params = {}) =>
  (await axios.get("/superadmin/audit", { params })).data;

export const getSecurityStatus = async () =>
  (await axios.get("/superadmin/security")).data;

export const getDatabaseStatus = async () =>
  (await axios.get("/superadmin/database")).data;

export const getSystemHealth = async () =>
  (await axios.get("/superadmin/system")).data;

export const getApiMonitor = async () =>
  (await axios.get("/superadmin/api-monitor")).data;

export const getSettings = async () => {
  const response = await axios.get("/superadmin/settings");
  return response.data;
};

export const updateSettings = async (data) => {
  const response = await axios.put("/superadmin/settings", data);
  return response.data;
};

export const getSecurityEvents = async () =>
  (await axios.get("/security/events")).data;

export const getRoles = async () => {
  const response = await axios.get("/superadmin/roles");
  return response.data.roles || response.data.data || [];
};

export const getRole = async (id) => {
  const response = await axios.get(`/superadmin/roles/${id}`);
  return response.data.role || response.data.data || response.data;
};

export const getPermissions = async () => {
  const response = await axios.get("/superadmin/roles/permissions/all");
  return response.data.permissions || response.data.data || [];
};

export const updateRolePermissions = async (id, permissions) => {
  const response = await axios.put(
    `/superadmin/roles/${id}/permissions`,
    { permissions },
  );

  return response.data;
};
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.
