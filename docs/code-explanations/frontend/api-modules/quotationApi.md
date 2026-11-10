# Client API module: `client/src/api/quotationApi.js`

**Source:** [client/src/api/quotationApi.js](../../../../client/src/api/quotationApi.js)

## Responsibility

This module is the client-side transport boundary for the quotation feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- api from ./axios

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `getAgentQuotations` (source line 3)

`async () => (await api.get("/agent/quotes")).data`

Calls: `GET /agent/quotes`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `createQuotation` (source line 4)

`async (payload) => (await api.post("/agent/quotes", payload)).data`

Calls: `POST /agent/quotes`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `updateQuotationStatus` (source line 5)

`async ({ id, status }) => (await api.patch(`/agent/quotes/${id}/status`, { status })).data`

Calls: `PATCH /agent/quotes/${…}/status`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.

## Callers

- [`client/src/pages/agent/AgentQuotes.jsx`](../../../../client/src/pages/agent/AgentQuotes.jsx)

## Runtime and failure behavior

An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.

## Source excerpt

```js
import api from "./axios";

export const getAgentQuotations = async () => (await api.get("/agent/quotes")).data;
export const createQuotation = async (payload) => (await api.post("/agent/quotes", payload)).data;
export const updateQuotationStatus = async ({ id, status }) => (await api.patch(`/agent/quotes/${id}/status`, { status })).data;
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.
