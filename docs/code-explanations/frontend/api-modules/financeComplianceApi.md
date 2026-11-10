# Client API module: `client/src/api/financeComplianceApi.js`

**Source:** [client/src/api/financeComplianceApi.js](../../../../client/src/api/financeComplianceApi.js)

## Responsibility

This module is the client-side transport boundary for the finance compliance feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- api from ./axios

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `getTaxProfile` (source line 2)

`async () => (await api.get("/finance-compliance/tax-profile")).data`

Calls: `GET /finance-compliance/tax-profile`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `saveTaxProfile` (source line 3)

`async (data) => (await api.put("/finance-compliance/tax-profile", data)).data`

Calls: `PUT /finance-compliance/tax-profile`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getEtimsCredentialStatus` (source line 4)

`async (environment = "sandbox") => (await api.get("/finance-compliance/etims/credentials", { params: { environment } })).data`

Calls: `GET /finance-compliance/etims/credentials`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.
### `saveEtimsCredentials` (source line 5)

`async (data) => (await api.put("/finance-compliance/etims/credentials", data)).data`

Calls: `PUT /finance-compliance/etims/credentials`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getFinanceComplianceSummary` (source line 6)

`async () => (await api.get("/finance-compliance/compliance-summary")).data`

Calls: `GET /finance-compliance/compliance-summary`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getCreditDebitNotes` (source line 7)

`async () => (await api.get("/finance-compliance/notes")).data`

Calls: `GET /finance-compliance/notes`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `createCreditDebitNote` (source line 8)

`async (data) => (await api.post("/finance-compliance/notes", data)).data`

Calls: `POST /finance-compliance/notes`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `queueCreditDebitNote` (source line 9)

`async (id) => (await api.post(`/finance-compliance/notes/${id}/queue`)).data`

Calls: `POST /finance-compliance/notes/${…}/queue`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getEtimsSubmissions` (source line 10)

`async (params = {}) => (await api.get("/finance-compliance/etims/submissions", { params })).data`

Calls: `GET /finance-compliance/etims/submissions`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.

## Callers

- [`client/src/api/financeLifecycleApi.js`](../../../../client/src/api/financeLifecycleApi.js)
- [`client/src/components/admin/FinanceLifecycleCenter.jsx`](../../../../client/src/components/admin/FinanceLifecycleCenter.jsx)
- [`client/src/pages/admin/AdminCompliance.jsx`](../../../../client/src/pages/admin/AdminCompliance.jsx)

## Runtime and failure behavior

An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.

## Source excerpt

```js
import api from "./axios";
export const getTaxProfile = async () => (await api.get("/finance-compliance/tax-profile")).data;
export const saveTaxProfile = async (data) => (await api.put("/finance-compliance/tax-profile", data)).data;
export const getEtimsCredentialStatus = async (environment = "sandbox") => (await api.get("/finance-compliance/etims/credentials", { params: { environment } })).data;
export const saveEtimsCredentials = async (data) => (await api.put("/finance-compliance/etims/credentials", data)).data;
export const getFinanceComplianceSummary = async () => (await api.get("/finance-compliance/compliance-summary")).data;
export const getCreditDebitNotes = async () => (await api.get("/finance-compliance/notes")).data;
export const createCreditDebitNote = async (data) => (await api.post("/finance-compliance/notes", data)).data;
export const queueCreditDebitNote = async (id) => (await api.post(`/finance-compliance/notes/${id}/queue`)).data;
export const getEtimsSubmissions = async (params = {}) => (await api.get("/finance-compliance/etims/submissions", { params })).data;
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.
