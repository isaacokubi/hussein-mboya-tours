# Client API module: `client/src/api/travelServiceRequestApi.js`

**Source:** [client/src/api/travelServiceRequestApi.js](../../../../client/src/api/travelServiceRequestApi.js)

## Responsibility

This module is the client-side transport boundary for the travel service request feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- api from ./axios

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `getTravelServiceRequests` (source line 3)

`(params = {}) => api.get("/admin/operations/service-requests", { params })`

Calls: `GET /admin/operations/service-requests`. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.
### `getTravelServiceSummary` (source line 4)

`() => api.get("/admin/operations/service-requests/summary")`

Calls: `GET /admin/operations/service-requests/summary`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `createTravelServiceRequest` (source line 5)

`(payload) => api.post("/admin/operations/service-requests", payload)`

Calls: `POST /admin/operations/service-requests`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `updateTravelServiceRequest` (source line 6)

`(id, payload) => api.patch(`/admin/operations/service-requests/${id}`, payload)`

Calls: `PATCH /admin/operations/service-requests/${…}`. No local catch is present, so Axios rejection propagates to the calling hook/component.

## Callers

- [`client/src/components/admin/TravelServiceDesk.jsx`](../../../../client/src/components/admin/TravelServiceDesk.jsx)

## Runtime and failure behavior

An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.

## Source excerpt

```js
import api from "./axios";

export const getTravelServiceRequests = (params = {}) => api.get("/admin/operations/service-requests", { params });
export const getTravelServiceSummary = () => api.get("/admin/operations/service-requests/summary");
export const createTravelServiceRequest = (payload) => api.post("/admin/operations/service-requests", payload);
export const updateTravelServiceRequest = (id, payload) => api.patch(`/admin/operations/service-requests/${id}`, payload);
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.
