# Client API module: `client/src/api/tenantSubscriptionApi.js`

**Source:** [client/src/api/tenantSubscriptionApi.js](../../../../client/src/api/tenantSubscriptionApi.js)

## Responsibility

This module is the client-side transport boundary for the tenant subscription feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- axios from ./axios

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `getTenantSubscription` (source line 3)

`async () => (await axios.get("/subscription")).data`

Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `startTenantSubscriptionPayment` (source line 4)

`async (payload) => (await axios.post("/subscription/mpesa", payload)).data`

Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getTenantSubscriptionPaymentStatus` (source line 5)

`async (checkoutRequestId) => (await axios.get(`/subscription/payment/${checkoutRequestId}`)).data`

Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `activateTenantSubscription` (source line 6)

`async (id, payload) => (await axios.post(`/superadmin/tenants/${id}/subscription/activate`, payload)).data`

Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.

## Callers

- [`client/src/pages/admin/TenantBilling.jsx`](../../../../client/src/pages/admin/TenantBilling.jsx)
- [`client/src/pages/admin/finance/AdminFinance.jsx`](../../../../client/src/pages/admin/finance/AdminFinance.jsx)
- [`client/src/pages/superadmin/SuperAdminTenants.jsx`](../../../../client/src/pages/superadmin/SuperAdminTenants.jsx)

## Runtime and failure behavior

An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.

## Source excerpt

```js
import axios from "./axios";

export const getTenantSubscription = async () => (await axios.get("/subscription")).data;
export const startTenantSubscriptionPayment = async (payload) => (await axios.post("/subscription/mpesa", payload)).data;
export const getTenantSubscriptionPaymentStatus = async (checkoutRequestId) => (await axios.get(`/subscription/payment/${checkoutRequestId}`)).data;
export const activateTenantSubscription = async (id, payload) => (await axios.post(`/superadmin/tenants/${id}/subscription/activate`, payload)).data;
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.
