# Client API module: `client/src/api/adminHeroApi.js`

**Source:** [client/src/api/adminHeroApi.js](../../../../client/src/api/adminHeroApi.js)

## Responsibility

This module is the client-side transport boundary for the admin hero feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- api from ./axios

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `getAdminHeroSlides` (source line 3)

`async () => (await api.get("/admin/hero")).data`

Calls: `GET /admin/hero`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `createAdminHeroSlide` (source line 4)

`async (payload) => (await api.post("/admin/hero", payload)).data`

Calls: `POST /admin/hero`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `updateAdminHeroSlide` (source line 5)

`async ({ id, ...payload }) => (await api.put(`/admin/hero/${id}`, payload)).data`

Calls: `PUT /admin/hero/${…}`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `deleteAdminHeroSlide` (source line 6)

`async (id) => (await api.delete(`/admin/hero/${id}`)).data`

Calls: `DELETE /admin/hero/${…}`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.

## Callers

- [`client/src/components/admin/TenantHeroManager.jsx`](../../../../client/src/components/admin/TenantHeroManager.jsx)
- [`client/src/pages/admin/AdminHeroSlider.jsx`](../../../../client/src/pages/admin/AdminHeroSlider.jsx)

## Runtime and failure behavior

An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.

## Source excerpt

```js
import api from "./axios";

export const getAdminHeroSlides = async () => (await api.get("/admin/hero")).data;
export const createAdminHeroSlide = async (payload) => (await api.post("/admin/hero", payload)).data;
export const updateAdminHeroSlide = async ({ id, ...payload }) => (await api.put(`/admin/hero/${id}`, payload)).data;
export const deleteAdminHeroSlide = async (id) => (await api.delete(`/admin/hero/${id}`)).data;
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.
