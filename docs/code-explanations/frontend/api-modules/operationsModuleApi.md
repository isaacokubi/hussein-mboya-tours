# Client API module: `client/src/api/operationsModuleApi.js`

**Source:** [client/src/api/operationsModuleApi.js](../../../../client/src/api/operationsModuleApi.js)

## Responsibility

This module is the client-side transport boundary for the operations module feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- api from ./axios

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `getSuppliers` (source line 5)

`async () => unwrap(await api.get("/admin/operations/module/suppliers"))`

Calls: `GET /admin/operations/module/suppliers`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `createSupplier` (source line 6)

`async (payload) => unwrap(await api.post("/admin/operations/module/suppliers", payload))`

Calls: `POST /admin/operations/module/suppliers`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `updateSupplier` (source line 7)

`async (id, payload) => unwrap(await api.patch(`/admin/operations/module/suppliers/${id}`, payload))`

Calls: `PATCH /admin/operations/module/suppliers/${…}`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getPurchaseOrders` (source line 8)

`async () => unwrap(await api.get("/admin/operations/module/purchase-orders"))`

Calls: `GET /admin/operations/module/purchase-orders`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `createPurchaseOrder` (source line 9)

`async (payload) => unwrap(await api.post("/admin/operations/module/purchase-orders", payload))`

Calls: `POST /admin/operations/module/purchase-orders`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `transitionPurchaseOrder` (source line 10)

`async (id, status) => unwrap(await api.patch(`/admin/operations/module/purchase-orders/${id}/status`, { status }))`

Calls: `PATCH /admin/operations/module/purchase-orders/${…}/status`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getTourCosts` (source line 11)

`async () => unwrap(await api.get("/admin/operations/module/tour-costs"))`

Calls: `GET /admin/operations/module/tour-costs`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `createTourCost` (source line 12)

`async (payload) => unwrap(await api.post("/admin/operations/module/tour-costs", payload))`

Calls: `POST /admin/operations/module/tour-costs`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getTourProfitability` (source line 13)

`async (tourId) => unwrap(await api.get(`/admin/operations/module/tour-costs/profitability/${tourId}`))`

Calls: `GET /admin/operations/module/tour-costs/profitability/${…}`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getSupplierPayables` (source line 14)

`async () => unwrap(await api.get("/admin/operations/module/supplier-payables"))`

Calls: `GET /admin/operations/module/supplier-payables`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `createSupplierPayable` (source line 15)

`async (payload) => unwrap(await api.post("/admin/operations/module/supplier-payables", payload))`

Calls: `POST /admin/operations/module/supplier-payables`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `paySupplierPayable` (source line 16)

`async (id, amount, paymentReference) => unwrap(await api.post(`/admin/operations/module/supplier-payables/${id}/pay`, { amount, paymentReference }))`

Calls: `POST /admin/operations/module/supplier-payables/${…}/pay`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getCorporateAccounts` (source line 17)

`async () => unwrap(await api.get("/admin/operations/module/corporate-accounts"))`

Calls: `GET /admin/operations/module/corporate-accounts`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `createCorporateAccount` (source line 18)

`async (payload) => unwrap(await api.post("/admin/operations/module/corporate-accounts", payload))`

Calls: `POST /admin/operations/module/corporate-accounts`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `reconcileCorporateAccount` (source line 19)

`async (id) => unwrap(await api.post(`/admin/operations/module/corporate-accounts/${id}/reconcile`))`

Calls: `POST /admin/operations/module/corporate-accounts/${…}/reconcile`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getResourceConflicts` (source line 20)

`async () => unwrap(await api.get("/admin/operations/module/resource-conflicts"))`

Calls: `GET /admin/operations/module/resource-conflicts`. No local catch is present, so Axios rejection propagates to the calling hook/component.

## Callers

- [`client/src/components/admin/OperationsActionCenter.jsx`](../../../../client/src/components/admin/OperationsActionCenter.jsx)
- [`client/src/pages/admin/CorporateAccounts.jsx`](../../../../client/src/pages/admin/CorporateAccounts.jsx)
- [`client/src/pages/admin/OperationsProcurement.jsx`](../../../../client/src/pages/admin/OperationsProcurement.jsx)
- [`client/src/pages/admin/finance/AdminFinance.jsx`](../../../../client/src/pages/admin/finance/AdminFinance.jsx)

## Runtime and failure behavior

An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.

## Source excerpt

```js
import api from "./axios";

const unwrap = (response) => response?.data?.data ?? response?.data ?? {};

export const getSuppliers = async () => unwrap(await api.get("/admin/operations/module/suppliers"));
export const createSupplier = async (payload) => unwrap(await api.post("/admin/operations/module/suppliers", payload));
export const updateSupplier = async (id, payload) => unwrap(await api.patch(`/admin/operations/module/suppliers/${id}`, payload));
export const getPurchaseOrders = async () => unwrap(await api.get("/admin/operations/module/purchase-orders"));
export const createPurchaseOrder = async (payload) => unwrap(await api.post("/admin/operations/module/purchase-orders", payload));
export const transitionPurchaseOrder = async (id, status) => unwrap(await api.patch(`/admin/operations/module/purchase-orders/${id}/status`, { status }));
export const getTourCosts = async () => unwrap(await api.get("/admin/operations/module/tour-costs"));
export const createTourCost = async (payload) => unwrap(await api.post("/admin/operations/module/tour-costs", payload));
export const getTourProfitability = async (tourId) => unwrap(await api.get(`/admin/operations/module/tour-costs/profitability/${tourId}`));
export const getSupplierPayables = async () => unwrap(await api.get("/admin/operations/module/supplier-payables"));
export const createSupplierPayable = async (payload) => unwrap(await api.post("/admin/operations/module/supplier-payables", payload));
export const paySupplierPayable = async (id, amount, paymentReference) => unwrap(await api.post(`/admin/operations/module/supplier-payables/${id}/pay`, { amount, paymentReference }));
export const getCorporateAccounts = async () => unwrap(await api.get("/admin/operations/module/corporate-accounts"));
export const createCorporateAccount = async (payload) => unwrap(await api.post("/admin/operations/module/corporate-accounts", payload));
export const reconcileCorporateAccount = async (id) => unwrap(await api.post(`/admin/operations/module/corporate-accounts/${id}/reconcile`));
export const getResourceConflicts = async () => unwrap(await api.get("/admin/operations/module/resource-conflicts"));
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.
