# Client API module: `client/src/api/superadmin/superAdminRoleApi.js`

**Source:** [client/src/api/superadmin/superAdminRoleApi.js](../../../../client/src/api/superadmin/superAdminRoleApi.js)

## Responsibility

This module is the client-side transport boundary for the super admin role feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- api from ../axios

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `getSuperAdminRoles` (source line 3)

`async () => {`

Calls: `GET /superadmin/roles`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getSuperAdminRole` (source line 8)

`async (id) => {`

Calls: `GET /superadmin/roles/${…}`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getSuperAdminPermissions` (source line 13)

`async () => {`

Calls: `GET /superadmin/roles/permissions/all`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `updateSuperAdminRolePermissions` (source line 18)

`async (id, permissions) => {`

Calls: `PUT /superadmin/roles/${…}/permissions`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.

## Callers

- [`client/src/pages/superadmin/SuperAdminRoles.jsx`](../../../../client/src/pages/superadmin/SuperAdminRoles.jsx)

## Runtime and failure behavior

An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.

## Source excerpt

```js
import api from "../axios";

export const getSuperAdminRoles = async () => {
  const { data } = await api.get("/superadmin/roles");
  return data?.roles || data?.data || [];
};

export const getSuperAdminRole = async (id) => {
  const { data } = await api.get(`/superadmin/roles/${id}`);
  return data?.role || data?.data || data;
};

export const getSuperAdminPermissions = async () => {
  const { data } = await api.get("/superadmin/roles/permissions/all");
  return data?.permissions || data?.data || [];
};

export const updateSuperAdminRolePermissions = async (id, permissions) => {
  const { data } = await api.put(`/superadmin/roles/${id}/permissions`, { permissions });
  return data?.role || data?.data || data;
};
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.
