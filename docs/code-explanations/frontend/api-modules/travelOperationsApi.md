# Client API module: `client/src/api/travelOperationsApi.js`

**Source:** [client/src/api/travelOperationsApi.js](../../../../client/src/api/travelOperationsApi.js)

## Responsibility

This module is the client-side transport boundary for the travel operations feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- api from ./axios

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `getTravelOperations` (source line 5)

`async (params = {}) => unwrap(await api.get("/operations", { params }))`

Calls: `GET /operations`. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.
### `createTravelOperation` (source line 6)

`async (payload) => unwrap(await api.post("/operations", payload))`

Calls: `POST /operations`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `updateTravelOperation` (source line 7)

`async (id, payload) => unwrap(await api.patch(`/operations/${id}`, payload))`

Calls: `PATCH /operations/${…}`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `deleteTravelOperation` (source line 8)

`async (id) => unwrap(await api.delete(`/operations/${id}`))`

Calls: `DELETE /operations/${…}`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getTravelRules` (source line 9)

`async () => unwrap(await api.get("/operations/rules/list"))`

Calls: `GET /operations/rules/list`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `createTravelRule` (source line 10)

`async (payload) => unwrap(await api.post("/operations/rules", payload))`

Calls: `POST /operations/rules`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `updateTravelRule` (source line 11)

`async (id, payload) => unwrap(await api.patch(`/operations/rules/${id}`, payload))`

Calls: `PATCH /operations/rules/${…}`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `deleteTravelRule` (source line 12)

`async (id) => unwrap(await api.delete(`/operations/rules/${id}`))`

Calls: `DELETE /operations/rules/${…}`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getOperationalAssets` (source line 14)

`async (params = {}) => unwrap(await api.get("/operational-assets", { params }))`

Calls: `GET /operational-assets`. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.
### `createOperationalAsset` (source line 15)

`async (payload) => unwrap(await api.post("/operational-assets", payload))`

Calls: `POST /operational-assets`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `updateOperationalAsset` (source line 16)

`async (id, payload) => unwrap(await api.patch(`/operational-assets/${id}`, payload))`

Calls: `PATCH /operational-assets/${…}`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `deleteOperationalAsset` (source line 17)

`async (id) => unwrap(await api.delete(`/operational-assets/${id}`))`

Calls: `DELETE /operational-assets/${…}`. No local catch is present, so Axios rejection propagates to the calling hook/component.

## Callers

- [`client/src/components/admin/TravelOperationsCenter.jsx`](../../../../client/src/components/admin/TravelOperationsCenter.jsx)

## Runtime and failure behavior

An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.

## Source excerpt

```js
import api from "./axios";

const unwrap = (response) => response?.data?.data ?? response?.data ?? [];

export const getTravelOperations = async (params = {}) => unwrap(await api.get("/operations", { params }));
export const createTravelOperation = async (payload) => unwrap(await api.post("/operations", payload));
export const updateTravelOperation = async (id, payload) => unwrap(await api.patch(`/operations/${id}`, payload));
export const deleteTravelOperation = async (id) => unwrap(await api.delete(`/operations/${id}`));
export const getTravelRules = async () => unwrap(await api.get("/operations/rules/list"));
export const createTravelRule = async (payload) => unwrap(await api.post("/operations/rules", payload));
export const updateTravelRule = async (id, payload) => unwrap(await api.patch(`/operations/rules/${id}`, payload));
export const deleteTravelRule = async (id) => unwrap(await api.delete(`/operations/rules/${id}`));

export const getOperationalAssets = async (params = {}) => unwrap(await api.get("/operational-assets", { params }));
export const createOperationalAsset = async (payload) => unwrap(await api.post("/operational-assets", payload));
export const updateOperationalAsset = async (id, payload) => unwrap(await api.patch(`/operational-assets/${id}`, payload));
export const deleteOperationalAsset = async (id) => unwrap(await api.delete(`/operational-assets/${id}`));
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.
