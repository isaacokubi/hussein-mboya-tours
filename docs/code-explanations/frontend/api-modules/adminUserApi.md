# Client API module: `client/src/api/adminUserApi.js`

**Source:** [client/src/api/adminUserApi.js](../../../../client/src/api/adminUserApi.js)

## Responsibility

This module is the client-side transport boundary for the admin user feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- api from ./axios

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `getAdminUsers` (source line 3)

`async (params = {}) => (await api.get("/admin/users", { params })).data`

Calls: `GET /admin/users`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.
### `updateUserStatus` (source line 5)

`async ({ id, status }) => {`

Calls: `PUT /admin/users/${…}/status`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `updateUserProfile` (source line 10)

`async ({ id, ...payload }) => {`

Calls: `PUT /admin/users/${…}`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `deleteUser` (source line 15)

`async (userId) => {`

Calls: `DELETE /admin/users/${…}`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `createStaffAccount` (source line 20)

`async (payload) => (await api.post("/admin/users/staff", payload)).data`

Calls: `POST /admin/users/staff`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `createCompanyAccount` (source line 21)

`async (payload) => (await api.post("/superadmin/users/accounts", payload)).data`

Calls: `POST /superadmin/users/accounts`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getAdminStaff` (source line 23)

`async (params = {}) => (await api.get("/staff", { params })).data`

Calls: `GET /staff`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.
### `createStaff` (source line 24)

`async (payload) => (await api.post("/staff", payload)).data`

Calls: `POST /staff`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `updateStaff` (source line 25)

`async ({ id, ...payload }) => (await api.put(`/staff/${id}`, payload)).data`

Calls: `PUT /staff/${…}`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `updateStaffStatus` (source line 26)

`async ({ id, active }) => (await api.put(`/staff/${id}/status`, { isActive: active, status: active ? "active" : "inactive", availability: active ? "available" : "offline" })).data`

Calls: `PUT /staff/${…}/status`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `deleteStaff` (source line 27)

`async (id) => (await api.delete(`/staff/${id}`)).data`

Calls: `DELETE /staff/${…}`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.

## Callers

- [`client/src/pages/admin/StaffManagement.jsx`](../../../../client/src/pages/admin/StaffManagement.jsx)
- [`client/src/pages/admin/UserManagement.jsx`](../../../../client/src/pages/admin/UserManagement.jsx)

## Runtime and failure behavior

An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.

## Source excerpt

```js
import api from "./axios";

export const getAdminUsers = async (params = {}) => (await api.get("/admin/users", { params })).data;

export const updateUserStatus = async ({ id, status }) => {
  if (!id) throw new Error("User ID is required");
  return (await api.put(`/admin/users/${id}/status`, { status })).data;
};

export const updateUserProfile = async ({ id, ...payload }) => {
  if (!id) throw new Error("User ID is required");
  return (await api.put(`/admin/users/${id}`, payload)).data;
};

export const deleteUser = async (userId) => {
  if (!userId) throw new Error("User ID is required");
  return (await api.delete(`/admin/users/${userId}`)).data;
};

export const createStaffAccount = async (payload) => (await api.post("/admin/users/staff", payload)).data;
export const createCompanyAccount = async (payload) => (await api.post("/superadmin/users/accounts", payload)).data;

export const getAdminStaff = async (params = {}) => (await api.get("/staff", { params })).data;
export const createStaff = async (payload) => (await api.post("/staff", payload)).data;
export const updateStaff = async ({ id, ...payload }) => (await api.put(`/staff/${id}`, payload)).data;
export const updateStaffStatus = async ({ id, active }) => (await api.put(`/staff/${id}/status`, { isActive: active, status: active ? "active" : "inactive", availability: active ? "available" : "offline" })).data;
export const deleteStaff = async (id) => (await api.delete(`/staff/${id}`)).data;
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.
