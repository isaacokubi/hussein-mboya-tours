# Client API module: `client/src/api/paymentGatewayApi.js`

**Source:** [client/src/api/paymentGatewayApi.js](../../../../client/src/api/paymentGatewayApi.js)

## Responsibility

This module is the client-side transport boundary for the payment gateway feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- api from ./axios

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `listPaymentGateways` (source line 3)

`async () => (await api.get("/admin/payment-gateways")).data`

Calls: `GET /admin/payment-gateways`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getPaymentGateway` (source line 4)

`async (provider, environment) => (await api.get(`/admin/payment-gateways/${provider}`, { params: environment ? { environment } : {} })).data`

Calls: `GET /admin/payment-gateways/${…}`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.
### `savePaymentGateway` (source line 5)

`async (provider, payload) => (await api.put(`/admin/payment-gateways/${provider}`, payload)).data`

Calls: `PUT /admin/payment-gateways/${…}`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `disablePaymentGateway` (source line 6)

`async (provider) => (await api.delete(`/admin/payment-gateways/${provider}`)).data`

Calls: `DELETE /admin/payment-gateways/${…}`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `validatePaymentGateway` (source line 7)

`async (provider, environment) => (await api.post(`/admin/payment-gateways/${provider}/validate`, { environment })).data`

Calls: `POST /admin/payment-gateways/${…}/validate`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.

## Callers

- [`client/src/components/admin/PaymentGatewayCenter.jsx`](../../../../client/src/components/admin/PaymentGatewayCenter.jsx)

## Runtime and failure behavior

An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.

## Source excerpt

```js
import api from "./axios";

export const listPaymentGateways = async () => (await api.get("/admin/payment-gateways")).data;
export const getPaymentGateway = async (provider, environment) => (await api.get(`/admin/payment-gateways/${provider}`, { params: environment ? { environment } : {} })).data;
export const savePaymentGateway = async (provider, payload) => (await api.put(`/admin/payment-gateways/${provider}`, payload)).data;
export const disablePaymentGateway = async (provider) => (await api.delete(`/admin/payment-gateways/${provider}`)).data;
export const validatePaymentGateway = async (provider, environment) => (await api.post(`/admin/payment-gateways/${provider}/validate`, { environment })).data;
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.
