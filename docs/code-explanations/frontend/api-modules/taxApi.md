# Client API module: `client/src/api/taxApi.js`

**Source:** [client/src/api/taxApi.js](../../../../client/src/api/taxApi.js)

## Responsibility

This module is the client-side transport boundary for the tax feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- api from ./axios

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `getTaxRules` (source line 3)

`async () => unwrap(await api.get("/admin/tax/rules"))`

Calls: `GET /admin/tax/rules`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `initializeTaxRules` (source line 4)

`async () => unwrap(await api.post("/admin/tax/rules/initialize"))`

Calls: `POST /admin/tax/rules/initialize`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `saveTaxRule` (source line 5)

`async (code, payload) => unwrap(await api.put(`/admin/tax/rules/${encodeURIComponent(code)}`, payload))`

Calls: `PUT /admin/tax/rules/${…}`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `calculateTax` (source line 6)

`async (payload) => unwrap(await api.post("/admin/tax/calculate", payload))`

Calls: `POST /admin/tax/calculate`. No local catch is present, so Axios rejection propagates to the calling hook/component.

## Callers

- [`client/src/components/admin/KenyaTaxCenter.jsx`](../../../../client/src/components/admin/KenyaTaxCenter.jsx)

## Runtime and failure behavior

An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.

## Source excerpt

```js
import api from "./axios";
const unwrap = (response) => response?.data?.data ?? response?.data ?? {};
export const getTaxRules = async () => unwrap(await api.get("/admin/tax/rules"));
export const initializeTaxRules = async () => unwrap(await api.post("/admin/tax/rules/initialize"));
export const saveTaxRule = async (code, payload) => unwrap(await api.put(`/admin/tax/rules/${encodeURIComponent(code)}`, payload));
export const calculateTax = async (payload) => unwrap(await api.post("/admin/tax/calculate", payload));
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.
