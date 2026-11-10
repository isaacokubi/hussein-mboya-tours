# Client API module: `client/src/api/complianceApi.js`

**Source:** [client/src/api/complianceApi.js](../../../../client/src/api/complianceApi.js)

## Responsibility

This module is the client-side transport boundary for the compliance feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- api from ./axios

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `getComplianceRecords` (source line 3)

`async () => (await api.get("/admin/compliance")).data`

Calls: `GET /admin/compliance`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getComplianceSummary` (source line 4)

`async () => (await api.get("/admin/compliance/summary")).data`

Calls: `GET /admin/compliance/summary`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `saveComplianceRecord` (source line 5)

`async (type, data) => (await api.put(`/admin/compliance/${type}`, { ...data, type })).data`

Calls: `PUT /admin/compliance/${…}`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `queueEtimsInvoice` (source line 6)

`async (invoiceId) => (await api.post(`/admin/compliance/etims/invoices/${invoiceId}/queue`)).data`

Calls: `POST /admin/compliance/etims/invoices/${…}/queue`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.

## Callers

- [`client/src/pages/admin/AdminCompliance.jsx`](../../../../client/src/pages/admin/AdminCompliance.jsx)

## Runtime and failure behavior

An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.

## Source excerpt

```js
import api from "./axios";

export const getComplianceRecords = async () => (await api.get("/admin/compliance")).data;
export const getComplianceSummary = async () => (await api.get("/admin/compliance/summary")).data;
export const saveComplianceRecord = async (type, data) => (await api.put(`/admin/compliance/${type}`, { ...data, type })).data;
export const queueEtimsInvoice = async (invoiceId) => (await api.post(`/admin/compliance/etims/invoices/${invoiceId}/queue`)).data;
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.
