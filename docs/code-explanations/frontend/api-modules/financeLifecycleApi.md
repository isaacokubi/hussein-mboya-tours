# Client API module: `client/src/api/financeLifecycleApi.js`

**Source:** [client/src/api/financeLifecycleApi.js](../../../../client/src/api/financeLifecycleApi.js)

## Responsibility

This module is the client-side transport boundary for the finance lifecycle feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- api from ./axios

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `getCreditDebitNotes` (source line 3)

`async () => (await api.get("/admin/credit-debit-notes")).data`

Calls: `GET /admin/credit-debit-notes`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `createCreditDebitNote` (source line 4)

`async (payload) => (await api.post("/admin/credit-debit-notes", payload)).data`

Calls: `POST /admin/credit-debit-notes`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `issueCreditDebitNote` (source line 5)

`async (id) => (await api.post(`/admin/credit-debit-notes/${id}/issue`)).data`

Calls: `POST /admin/credit-debit-notes/${…}/issue`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `cancelCreditDebitNote` (source line 6)

`async (id) => (await api.post(`/admin/credit-debit-notes/${id}/cancel`)).data`

Calls: `POST /admin/credit-debit-notes/${…}/cancel`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getPaymentLinks` (source line 7)

`async () => (await api.get("/admin/payment-links")).data`

Calls: `GET /admin/payment-links`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `createPaymentLink` (source line 8)

`async (payload) => (await api.post("/admin/payment-links", payload)).data`

Calls: `POST /admin/payment-links`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `cancelPaymentLink` (source line 9)

`async (id) => (await api.post(`/admin/payment-links/${id}/cancel`)).data`

Calls: `POST /admin/payment-links/${…}/cancel`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getPublicPaymentLink` (source line 10)

`async (token) => (await api.get(`/admin/payment-links/public/${encodeURIComponent(token)}`)).data`

Calls: `GET /admin/payment-links/public/${…}`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.

## Callers

- [`client/src/api/financeComplianceApi.js`](../../../../client/src/api/financeComplianceApi.js)
- [`client/src/components/admin/FinanceLifecycleCenter.jsx`](../../../../client/src/components/admin/FinanceLifecycleCenter.jsx)
- [`client/src/pages/PaymentLink.jsx`](../../../../client/src/pages/PaymentLink.jsx)
- [`client/src/pages/admin/AdminCompliance.jsx`](../../../../client/src/pages/admin/AdminCompliance.jsx)

## Runtime and failure behavior

An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.

## Source excerpt

```js
import api from "./axios";

export const getCreditDebitNotes = async () => (await api.get("/admin/credit-debit-notes")).data;
export const createCreditDebitNote = async (payload) => (await api.post("/admin/credit-debit-notes", payload)).data;
export const issueCreditDebitNote = async (id) => (await api.post(`/admin/credit-debit-notes/${id}/issue`)).data;
export const cancelCreditDebitNote = async (id) => (await api.post(`/admin/credit-debit-notes/${id}/cancel`)).data;
export const getPaymentLinks = async () => (await api.get("/admin/payment-links")).data;
export const createPaymentLink = async (payload) => (await api.post("/admin/payment-links", payload)).data;
export const cancelPaymentLink = async (id) => (await api.post(`/admin/payment-links/${id}/cancel`)).data;
export const getPublicPaymentLink = async (token) => (await api.get(`/admin/payment-links/public/${encodeURIComponent(token)}`)).data;
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.
