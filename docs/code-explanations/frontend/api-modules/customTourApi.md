# Client API module: `client/src/api/customTourApi.js`

**Source:** [client/src/api/customTourApi.js](../../../../client/src/api/customTourApi.js)

## Responsibility

This module is the client-side transport boundary for the custom tour feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- api from ./axios

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `createCustomTourRequest` (source line 1)

`async(payload)=>(await api.post("/custom-tour-requests",payload)).data`

Calls: `POST /custom-tour-requests`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getMyCustomTourRequests` (source line 1)

`async()=>(await api.get("/custom-tour-requests/mine")).data`

Calls: `GET /custom-tour-requests/mine`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getAdminCustomTourRequests` (source line 1)

`async()=>(await api.get("/custom-tour-requests/admin")).data`

Calls: `GET /custom-tour-requests/admin`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `quoteCustomTourRequest` (source line 1)

`async({id,...payload})=>(await api.patch(`/custom-tour-requests/admin/${id}/quote`,payload)).data`

Calls: `PATCH /custom-tour-requests/admin/${…}/quote`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `assignCustomTourResources` (source line 2)

`async({id,guide,driver,agent})=>(await api.patch(`/custom-tour-requests/admin/${id}/assign`,{guide,driver,agent})).data`

Calls: `PATCH /custom-tour-requests/admin/${…}/assign`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `convertCustomTourRequest` (source line 4)

`async(id)=>(await api.post(`/custom-tour-requests/${id}/convert`)).data`

Calls: `POST /custom-tour-requests/${…}/convert`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.

## Callers

- [`client/src/pages/Checkout.jsx`](../../../../client/src/pages/Checkout.jsx)
- [`client/src/pages/CustomTourRequest.jsx`](../../../../client/src/pages/CustomTourRequest.jsx)
- [`client/src/pages/MyCustomTours.jsx`](../../../../client/src/pages/MyCustomTours.jsx)
- [`client/src/pages/admin/CustomTourRequests.jsx`](../../../../client/src/pages/admin/CustomTourRequests.jsx)

## Runtime and failure behavior

An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.

## Source excerpt

```js
import api from "./axios";export const createCustomTourRequest=async(payload)=>(await api.post("/custom-tour-requests",payload)).data;export const getMyCustomTourRequests=async()=>(await api.get("/custom-tour-requests/mine")).data;export const getAdminCustomTourRequests=async()=>(await api.get("/custom-tour-requests/admin")).data;export const quoteCustomTourRequest=async({id,...payload})=>(await api.patch(`/custom-tour-requests/admin/${id}/quote`,payload)).data;
export const assignCustomTourResources=async({id,guide,driver,agent})=>(await api.patch(`/custom-tour-requests/admin/${id}/assign`,{guide,driver,agent})).data;

export const convertCustomTourRequest=async(id)=>(await api.post(`/custom-tour-requests/${id}/convert`)).data;
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.
