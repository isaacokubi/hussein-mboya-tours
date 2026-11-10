# Client API module: `client/src/api/adminExperienceApi.js`

**Source:** [client/src/api/adminExperienceApi.js](../../../../client/src/api/adminExperienceApi.js)

## Responsibility

This module is the client-side transport boundary for the admin experience feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- api from ./axios

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `getAdminExperiences` (source line 3)

`async function getAdminExperiences() {`

Calls: `GET /admin/experiences`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `createExperience` (source line 8)

`async function createExperience(payload) {`

Calls: `POST /admin/experiences`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `updateExperience` (source line 13)

`async function updateExperience(id, payload) {`

Calls: `PUT /admin/experiences/${…}`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `deleteExperience` (source line 18)

`async function deleteExperience(id) {`

Calls: `DELETE /admin/experiences/${…}`. No local catch is present, so Axios rejection propagates to the calling hook/component.

## Callers

- [`client/src/pages/admin/AdminGallery.jsx`](../../../../client/src/pages/admin/AdminGallery.jsx)

## Runtime and failure behavior

An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.

## Source excerpt

```js
import api from "./axios";

export async function getAdminExperiences() {
  const { data } = await api.get("/admin/experiences");
  return data?.categories || data?.experiences || [];
}

export async function createExperience(payload) {
  const { data } = await api.post("/admin/experiences", payload);
  return data?.category || data?.experience;
}

export async function updateExperience(id, payload) {
  const { data } = await api.put(`/admin/experiences/${id}`, payload);
  return data?.category || data?.experience;
}

export async function deleteExperience(id) {
  const { data } = await api.delete(`/admin/experiences/${id}`);
  return data;
}
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.
