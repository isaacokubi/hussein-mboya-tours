# Client API module: `client/src/api/financeApi.js`

**Source:** [client/src/api/financeApi.js](../../../../client/src/api/financeApi.js)

## Responsibility

This module is the client-side transport boundary for the finance feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- api from ./axios

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `getFinanceStats` (source line 3)

`async () => {`

Calls: `GET /admin/finance`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `requestRefund` (source line 8)

`async (id, payload) => {`

Calls: `POST /admin/bookings/${…}/refund`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `processRefund` (source line 13)

`async (id, payload) => {`

Calls: `PUT /admin/refunds/${…}/process`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getReports` (source line 18)

`async (params = {}) => {`

Calls: `GET /admin/finance/reports`. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.
### `getMpesaTransactions` (source line 23)

`async (params = {}) => {`

Calls: `GET /admin/finance/transactions`. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.
### `getFinancialStatements` (source line 28)

`async (params = {}) => {`

Calls: `GET /admin/finance/accounting/statements`. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.
### `getArAging` (source line 33)

`async (params = {}) => {`

Calls: `GET /admin/finance/accounting/ar-aging`. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.
### `getApAging` (source line 38)

`async (params = {}) => {`

Calls: `GET /admin/finance/accounting/ap-aging`. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.
### `getCashFlow` (source line 43)

`async (params = {}) => {`

Calls: `GET /admin/finance/accounting/cash-flow`. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.
### `reconcileOperationalAccounting` (source line 48)

`async () => {`

Calls: `POST /admin/finance/accounting/operational-reconciliation`. No local catch is present, so Axios rejection propagates to the calling hook/component.

## Callers

- [`client/src/api/tourManagerApi.js`](../../../../client/src/api/tourManagerApi.js)
- [`client/src/pages/admin/Finance.jsx`](../../../../client/src/pages/admin/Finance.jsx)
- [`client/src/pages/admin/finance/AdminFinance.jsx`](../../../../client/src/pages/admin/finance/AdminFinance.jsx)
- [`client/src/pages/admin/finance/FinanceReports.jsx`](../../../../client/src/pages/admin/finance/FinanceReports.jsx)
- [`client/src/pages/admin/finance/MpesaTransactions.jsx`](../../../../client/src/pages/admin/finance/MpesaTransactions.jsx)
- [`client/src/services/tourManagerService.js`](../../../../client/src/services/tourManagerService.js)

## Runtime and failure behavior

An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.

## Source excerpt

```js
import api from "./axios";

export const getFinanceStats = async () => {
  const { data } = await api.get("/admin/finance");
  return data;
};

export const requestRefund = async (id, payload) => {
  const { data } = await api.post(`/admin/bookings/${id}/refund`, payload);
  return data;
};

export const processRefund = async (id, payload) => {
  const { data } = await api.put(`/admin/refunds/${id}/process`, payload);
  return data;
};

export const getReports = async (params = {}) => {
  const { data } = await api.get("/admin/finance/reports", { params });
  return data;
};

export const getMpesaTransactions = async (params = {}) => {
  const { data } = await api.get("/admin/finance/transactions", { params });
  return data;
};

export const getFinancialStatements = async (params = {}) => {
  const { data } = await api.get("/admin/finance/accounting/statements", { params });
  return data;
};

export const getArAging = async (params = {}) => {
  const { data } = await api.get("/admin/finance/accounting/ar-aging", { params });
  return data;
};

export const getApAging = async (params = {}) => {
  const { data } = await api.get("/admin/finance/accounting/ap-aging", { params });
  return data;
};

export const getCashFlow = async (params = {}) => {
  const { data } = await api.get("/admin/finance/accounting/cash-flow", { params });
  return data;
};

export const reconcileOperationalAccounting = async () => {
  const { data } = await api.post("/admin/finance/accounting/operational-reconciliation");
  return data;
};
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.
