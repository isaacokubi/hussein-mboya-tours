# Client API module: `client/src/api/superAdminTenantsApi.js`

**Source:** [client/src/api/superAdminTenantsApi.js](../../../../client/src/api/superAdminTenantsApi.js)

## Responsibility

This module is the client-side transport boundary for the super admin tenants feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- axios from ./axios

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `getSuperAdminTenantPlans` (source line 3)

`async () => (await axios.get("/superadmin/tenant-plans")).data`

Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getSuperAdminTenants` (source line 4)

`async (params = {}) => (await axios.get("/superadmin/tenants", { params })).data`

Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.
### `getSuperAdminTenant` (source line 5)

`async (id) => (await axios.get(`/superadmin/tenants/${id}`)).data`

Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `createSuperAdminTenant` (source line 6)

`async (payload) => (await axios.post("/superadmin/tenants", payload)).data`

Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `updateSuperAdminTenantStatus` (source line 7)

`async (id, status) => (await axios.patch(`/superadmin/tenants/${id}/status`, { status })).data`

Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `switchSuperAdminTenantPlan` (source line 8)

`async (id, plan) => (await axios.patch(`/superadmin/tenants/${id}/subscription/plan`, { plan })).data`

Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `deleteSuperAdminTenant` (source line 9)

`async (id, confirmation) => (await axios.delete(`/superadmin/tenants/${id}`, { data: { confirmation } })).data`

Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getSuperAdminTenantMpesa` (source line 10)

`async (id, environment = "sandbox") => (await axios.get(`/superadmin/tenants/${id}/mpesa`, { params: { environment } })).data`

Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.
### `saveSuperAdminTenantMpesa` (source line 11)

`async (id, payload) => (await axios.put(`/superadmin/tenants/${id}/mpesa`, payload)).data`

Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `disableSuperAdminTenantMpesa` (source line 12)

`async (id) => (await axios.delete(`/superadmin/tenants/${id}/mpesa`)).data`

Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `validateSuperAdminTenantMpesa` (source line 13)

`async (id, environment) => (await axios.post(`/superadmin/tenants/${id}/mpesa/validate`, { environment })).data`

Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.

## Callers

- [`client/src/pages/superadmin/SuperAdminTenantMpesa.jsx`](../../../../client/src/pages/superadmin/SuperAdminTenantMpesa.jsx)
- [`client/src/pages/superadmin/SuperAdminTenants.jsx`](../../../../client/src/pages/superadmin/SuperAdminTenants.jsx)
- [`client/src/pages/superadmin/SuperAdminUsers.jsx`](../../../../client/src/pages/superadmin/SuperAdminUsers.jsx)

## Runtime and failure behavior

An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.

## Source excerpt

```js
import axios from "./axios";

export const getSuperAdminTenantPlans = async () => (await axios.get("/superadmin/tenant-plans")).data;
export const getSuperAdminTenants = async (params = {}) => (await axios.get("/superadmin/tenants", { params })).data;
export const getSuperAdminTenant = async (id) => (await axios.get(`/superadmin/tenants/${id}`)).data;
export const createSuperAdminTenant = async (payload) => (await axios.post("/superadmin/tenants", payload)).data;
export const updateSuperAdminTenantStatus = async (id, status) => (await axios.patch(`/superadmin/tenants/${id}/status`, { status })).data;
export const switchSuperAdminTenantPlan = async (id, plan) => (await axios.patch(`/superadmin/tenants/${id}/subscription/plan`, { plan })).data;
export const deleteSuperAdminTenant = async (id, confirmation) => (await axios.delete(`/superadmin/tenants/${id}`, { data: { confirmation } })).data;
export const getSuperAdminTenantMpesa = async (id, environment = "sandbox") => (await axios.get(`/superadmin/tenants/${id}/mpesa`, { params: { environment } })).data;
export const saveSuperAdminTenantMpesa = async (id, payload) => (await axios.put(`/superadmin/tenants/${id}/mpesa`, payload)).data;
export const disableSuperAdminTenantMpesa = async (id) => (await axios.delete(`/superadmin/tenants/${id}/mpesa`)).data;
export const validateSuperAdminTenantMpesa = async (id, environment) => (await axios.post(`/superadmin/tenants/${id}/mpesa/validate`, { environment })).data;
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.
