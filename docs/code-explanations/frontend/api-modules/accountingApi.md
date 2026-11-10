# Client API module: `client/src/api/accountingApi.js`

**Source:** [client/src/api/accountingApi.js](../../../../client/src/api/accountingApi.js)

## Responsibility

This module is the client-side transport boundary for the accounting feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- api from ./axios

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `getAccounts` (source line 10)

`async () => unwrap(await api.get(`${BASE}/accounts`))`

Calls: `GET ${…}/accounts`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `createAccount` (source line 11)

`async (payload) => unwrap(await api.post(`${BASE}/accounts`, payload))`

Calls: `POST ${…}/accounts`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getJournalEntries` (source line 12)

`async (params = {}) => unwrap(await api.get(`${BASE}/journal`, { params }))`

Calls: `GET ${…}/journal`. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.
### `createJournalEntry` (source line 13)

`async (payload) => unwrap(await api.post(`${BASE}/journal`, payload))`

Calls: `POST ${…}/journal`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `postJournalEntry` (source line 14)

`async (id) => unwrap(await api.post(`${BASE}/journal/${id}/post`))`

Calls: `POST ${…}/journal/${…}/post`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `voidJournalEntry` (source line 15)

`async (id) => unwrap(await api.post(`${BASE}/journal/${id}/void`))`

Calls: `POST ${…}/journal/${…}/void`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getLedgerSummary` (source line 16)

`async () => unwrap(await api.get(`${BASE}/summary`))`

Calls: `GET ${…}/summary`. No local catch is present, so Axios rejection propagates to the calling hook/component.

## Callers

- [`client/src/pages/admin/AccountingLedger.jsx`](../../../../client/src/pages/admin/AccountingLedger.jsx)
- [`client/src/pages/admin/finance/AdminFinance.jsx`](../../../../client/src/pages/admin/finance/AdminFinance.jsx)

## Runtime and failure behavior

An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.

## Source excerpt

```js
import api from "./axios";

const unwrap = (response) => response?.data?.data ?? response?.data ?? {};

// Accounting routes are mounted under /admin/finance/accounting on the API.
// Keep this client module aligned with the Express router so the Finance Center
// does not fall through to the generic "Route not found" handler.
const BASE = "/admin/finance/accounting";

export const getAccounts = async () => unwrap(await api.get(`${BASE}/accounts`));
export const createAccount = async (payload) => unwrap(await api.post(`${BASE}/accounts`, payload));
export const getJournalEntries = async (params = {}) => unwrap(await api.get(`${BASE}/journal`, { params }));
export const createJournalEntry = async (payload) => unwrap(await api.post(`${BASE}/journal`, payload));
export const postJournalEntry = async (id) => unwrap(await api.post(`${BASE}/journal/${id}/post`));
export const voidJournalEntry = async (id) => unwrap(await api.post(`${BASE}/journal/${id}/void`));
export const getLedgerSummary = async () => unwrap(await api.get(`${BASE}/summary`));
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.
