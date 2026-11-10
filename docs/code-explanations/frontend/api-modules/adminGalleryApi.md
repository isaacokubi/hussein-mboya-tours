# Client API module: `client/src/api/adminGalleryApi.js`

**Source:** [client/src/api/adminGalleryApi.js](../../../../client/src/api/adminGalleryApi.js)

## Responsibility

This module is the client-side transport boundary for the admin gallery feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- api from ./axios

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `getAdminGallery` (source line 10)

`async () => {`

Calls: `GET /admin/gallery`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `createGallery` (source line 15)

`async (payload) => (await api.post("/admin/gallery", payload)).data`

Calls: `POST /admin/gallery`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `updateGallery` (source line 16)

`async (id, payload) => (await api.put(`/admin/gallery/${id}`, payload)).data`

Calls: `PUT /admin/gallery/${…}`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `deleteGallery` (source line 17)

`async (id) => (await api.delete(`/admin/gallery/${id}`)).data`

Calls: `DELETE /admin/gallery/${…}`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.

## Callers

- [`client/src/pages/admin/AdminGallery.jsx`](../../../../client/src/pages/admin/AdminGallery.jsx)

## Runtime and failure behavior

An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.

## Source excerpt

```js
import api from "./axios";

const unwrapList = (data, keys = []) => {
  if (Array.isArray(data)) return data;
  for (const key of keys) if (Array.isArray(data?.[key])) return data[key];
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

export const getAdminGallery = async () => {
  const { data } = await api.get("/admin/gallery");
  return unwrapList(data, ["gallery", "images"]);
};

export const createGallery = async (payload) => (await api.post("/admin/gallery", payload)).data;
export const updateGallery = async (id, payload) => (await api.put(`/admin/gallery/${id}`, payload)).data;
export const deleteGallery = async (id) => (await api.delete(`/admin/gallery/${id}`)).data;
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.
