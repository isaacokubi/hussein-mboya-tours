# Client API module: `client/src/api/admin/adminRoleApi.js`

**Source:** [client/src/api/admin/adminRoleApi.js](../../../../client/src/api/admin/adminRoleApi.js)

## Responsibility

This module is the client-side transport boundary for the admin role feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- api from ../axios

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `getAdminRoles` (source line 13)

`async () => {`

Calls: `GET /admin/roles`. Returns/destructures Axios response data rather than exposing the full transport response. Contains local try/catch behavior; read the catch branch below to see fallback/error policy.
### `getAdminRole` (source line 29)

`async (id) => {`

Calls: `GET /admin/roles/${…}`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `createAdminRole` (source line 43)

`async (payload) => {`

Calls: `POST /admin/roles`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `updateAdminRole` (source line 58)

`async (`

Calls: `PUT /admin/roles/${…}`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `deleteAdminRole` (source line 76)

`async (id) => {`

Calls: `DELETE /admin/roles/${…}`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `toggleRoleStatus` (source line 90)

`async (`

Calls: `PATCH /admin/roles/${…}`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getAdminPermissions` (source line 105)

`async () => {`

Calls: `GET /admin/roles/permissions/all`. Returns/destructures Axios response data rather than exposing the full transport response. Contains local try/catch behavior; read the catch branch below to see fallback/error policy.
### `updateAdminRolePermissions` (source line 115)

`async (id, permissions) => {`

Calls: `PUT /admin/roles/${…}/permissions`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getRoles` (source line 128)

`async () => {`

Calls: `GET /admin/roles`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `updateRolePermissions` (source line 139)

`async (`

Calls: `PUT /admin/roles/${…}/permissions`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.

## Callers

- [`client/src/admin/rolesApi.js`](../../../../client/src/admin/rolesApi.js)
- [`client/src/api/superAdminApi.js`](../../../../client/src/api/superAdminApi.js)
- [`client/src/pages/admin/roles/AdminRoles.jsx`](../../../../client/src/pages/admin/roles/AdminRoles.jsx)
- [`client/src/pages/rbac/RolesPage.jsx`](../../../../client/src/pages/rbac/RolesPage.jsx)

## Runtime and failure behavior

An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.

## Source excerpt

```js
// client/src/api/admin/adminRoleApi.js

import api from "../axios";


/*
|--------------------------------------------------------------------------
| ADMIN ROLES
|--------------------------------------------------------------------------
*/


export const getAdminRoles = async () => {

  try {
    const { data } = await api.get("/admin/roles");
    return data;
  } catch (error) {
    console.error("ADMIN ROLES API ERROR:", error?.response?.data || error);
    throw error;
  }

};





export const getAdminRole = async (id) => {

  const { data } = await api.get(
    `/admin/roles/${id}`
  );

  return data;

};





export const createAdminRole = async (payload) => {

  const { data } = await api.post(
    "/admin/roles",
    payload
  );

  return data;

};





export const updateAdminRole = async (
  id,
  payload
) => {

  const { data } = await api.put(
    `/admin/roles/${id}`,
    payload
  );

  return data;

};





export const deleteAdminRole = async (id) => {

  const { data } = await api.delete(
    `/admin/roles/${id}`
  );

  return data;

};





export const toggleRoleStatus = async (
  id,
  payload
) => {

  const { data } = await api.patch(
    `/admin/roles/${id}`,
    payload
  );

  return data;

};


export const getAdminPermissions = async () => {
  try {
    const { data } = await api.get("/admin/roles/permissions/all");
    return data;
  } catch (error) {
    console.error("ADMIN PERMISSIONS API ERROR:", error?.response?.data || error);
    throw error;
  }
};

export const updateAdminRolePermissions = async (id, permissions) => {
  const { data } = await api.put(
    `/admin/roles/${id}/permissions`,
    { permissions }
  );
  return data;
};


// ===============================
// SUPER ADMIN ROLE MANAGEMENT
// ===============================

export const getRoles = async () => {

    const response = await api.get(
        "/admin/roles"
    );

    return response.data;

};


export const updateRolePermissions = async (
    id,
    permissions
)=>{

    const response = await api.put(
        `/admin/roles/${id}/permissions`,
        {
            permissions
        }
    );

    return response.data;

};
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.
