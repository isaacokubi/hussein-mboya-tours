# Client API module: `client/src/api/checkoutPaymentsApi.js`

**Source:** [client/src/api/checkoutPaymentsApi.js](../../../../client/src/api/checkoutPaymentsApi.js)

## Responsibility

This module is the client-side transport boundary for the checkout payments feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- api from ./axios

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `createStripeCheckout` (source line 3)

`async (payload) => (await api.post("/payments/stripe/checkout", payload)).data`

Calls: `POST /payments/stripe/checkout`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `createPaypalOrder` (source line 4)

`async (payload) => (await api.post("/payments/paypal/orders", payload)).data`

Calls: `POST /payments/paypal/orders`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `capturePaypalOrder` (source line 5)

`async (payload) => (await api.post("/payments/paypal/orders/capture", payload)).data`

Calls: `POST /payments/paypal/orders/capture`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `createBankTransferPayment` (source line 6)

`async (payload) => (await api.post("/payments/stripe/bank-transfer", payload)).data`

Calls: `POST /payments/stripe/bank-transfer`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `createCashPayment` (source line 7)

`async (payload) => (await api.post("/payments/cash", payload)).data`

Calls: `POST /payments/cash`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.

## Callers

- [`client/src/pages/Checkout.jsx`](../../../../client/src/pages/Checkout.jsx)
- [`client/src/pages/PaymentStatus.jsx`](../../../../client/src/pages/PaymentStatus.jsx)

## Runtime and failure behavior

An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.

## Source excerpt

```js
import api from "./axios";

export const createStripeCheckout = async (payload) => (await api.post("/payments/stripe/checkout", payload)).data;
export const createPaypalOrder = async (payload) => (await api.post("/payments/paypal/orders", payload)).data;
export const capturePaypalOrder = async (payload) => (await api.post("/payments/paypal/orders/capture", payload)).data;
export const createBankTransferPayment = async (payload) => (await api.post("/payments/stripe/bank-transfer", payload)).data;
export const createCashPayment = async (payload) => (await api.post("/payments/cash", payload)).data;
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.
