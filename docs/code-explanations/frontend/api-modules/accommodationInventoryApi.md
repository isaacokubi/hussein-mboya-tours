# Client API module: `client/src/api/accommodationInventoryApi.js`

**Source:** [client/src/api/accommodationInventoryApi.js](../../../../client/src/api/accommodationInventoryApi.js)

## Responsibility

This module is the client-side transport boundary for the accommodation inventory feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- api from ./axios

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `getAccommodationInventory` (source line 3)

`async () => unwrap(await api.get("/admin/operations/accommodation-inventory"))`

Calls: `GET /admin/operations/accommodation-inventory`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `createAccommodationInventory` (source line 4)

`async (payload) => unwrap(await api.post("/admin/operations/accommodation-inventory", payload))`

Calls: `POST /admin/operations/accommodation-inventory`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `updateAccommodationInventory` (source line 5)

`async (id, payload) => unwrap(await api.patch(`/admin/operations/accommodation-inventory/${id}`, payload))`

Calls: `PATCH /admin/operations/accommodation-inventory/${…}`. No local catch is present, so Axios rejection propagates to the calling hook/component.

## Callers

- [`client/src/components/admin/AccommodationInventoryPanel.jsx`](../../../../client/src/components/admin/AccommodationInventoryPanel.jsx)

## Runtime and failure behavior

An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.

## Source excerpt

```js
import api from "./axios";
const unwrap = (response) => response?.data?.data ?? response?.data ?? [];
export const getAccommodationInventory = async () => unwrap(await api.get("/admin/operations/accommodation-inventory"));
export const createAccommodationInventory = async (payload) => unwrap(await api.post("/admin/operations/accommodation-inventory", payload));
export const updateAccommodationInventory = async (id, payload) => unwrap(await api.patch(`/admin/operations/accommodation-inventory/${id}`, payload));
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.
