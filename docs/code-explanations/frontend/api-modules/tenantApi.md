# Client API module: `client/src/api/tenantApi.js`

**Source:** [client/src/api/tenantApi.js](../../../../client/src/api/tenantApi.js)

## Responsibility

This module is the client-side transport boundary for the tenant feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- api from ./axios

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `getTenants` (source line 3)

`async () => (await api.get("/tenants")).data`

Calls: `GET /tenants`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `createTenant` (source line 4)

`async (payload) => (await api.post("/tenants", payload)).data`

Calls: `POST /tenants`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getTenant` (source line 5)

`async (id) => (await api.get(`/tenants/${id}`)).data`

Calls: `GET /tenants/${…}`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `updateTenant` (source line 6)

`async (id, payload) => (await api.patch(`/tenants/${id}`, payload)).data`

Calls: `PATCH /tenants/${…}`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `selectTenant` (source line 8)

`(tenant) => {`

No local catch is present, so Axios rejection propagates to the calling hook/component.

## Callers

No static caller was detected by symbol search; it may be used dynamically or currently unused.

## Runtime and failure behavior

An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.

## Source excerpt

```js
import api from "./axios";

export const getTenants = async () => (await api.get("/tenants")).data;
export const createTenant = async (payload) => (await api.post("/tenants", payload)).data;
export const getTenant = async (id) => (await api.get(`/tenants/${id}`)).data;
export const updateTenant = async (id, payload) => (await api.patch(`/tenants/${id}`, payload)).data;

export const selectTenant = (tenant) => {
  if (!tenant) return;
  localStorage.setItem("tenantId", String(tenant._id));
  localStorage.setItem("tenantSlug", tenant.slug);
  window.dispatchEvent(new CustomEvent("tenant:changed", { detail: tenant }));
  window.location.reload();
};
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.
