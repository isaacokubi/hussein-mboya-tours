# Client API module: `client/src/api/mpesaApi.js`

**Source:** [client/src/api/mpesaApi.js](../../../../client/src/api/mpesaApi.js)

## Responsibility

This module is the client-side transport boundary for the mpesa feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- api from ./axios

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `initiateMpesa` (source line 3)

`async (data) => {`

Calls: `POST /mpesa/stkpush`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `checkPaymentStatus` (source line 8)

`async (checkoutRequestId) => {`

Calls: `GET /mpesa/status/${…}`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `verifyPayment` (source line 13)

`async (bookingId) => {`

Calls: `GET /mpesa/verify/${…}`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.

## Callers

- [`client/src/pages/Checkout.jsx`](../../../../client/src/pages/Checkout.jsx)

## Runtime and failure behavior

An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.

## Source excerpt

```js
import api from "./axios";

export const initiateMpesa = async (data) => {
  const response = await api.post("/mpesa/stkpush", data);
  return response.data;
};

export const checkPaymentStatus = async (checkoutRequestId) => {
  const response = await api.get(`/mpesa/status/${checkoutRequestId}`);
  return response.data;
};

export const verifyPayment = async (bookingId) => {
  const response = await api.get(`/mpesa/verify/${bookingId}`);
  return response.data;
};

export default api;
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.
