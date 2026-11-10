# Client API module: `client/src/api/hospitalityPaymentApi.js`

**Source:** [client/src/api/hospitalityPaymentApi.js](../../../../client/src/api/hospitalityPaymentApi.js)

## Responsibility

This module is the client-side transport boundary for the hospitality payment feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- api from ./axios

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `initiateHospitalityMpesa` (source line 3)

`async (payload) => (await api.post("/hospitality-payments/mpesa", payload)).data`

Calls: `POST /hospitality-payments/mpesa`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `initiateHospitalityCard` (source line 4)

`async (payload) => (await api.post("/hospitality-payments/card", payload)).data`

Calls: `POST /hospitality-payments/card`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `verifyHospitalityCard` (source line 5)

`async (sessionId) => (await api.get(`/hospitality-payments/card/verify/${encodeURIComponent(sessionId)}`)).data`

Calls: `GET /hospitality-payments/card/verify/${…}`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `submitHospitalityBank` (source line 6)

`async (payload) => (await api.post("/hospitality-payments/bank", payload)).data`

Calls: `POST /hospitality-payments/bank`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `confirmHospitalityBank` (source line 7)

`async (paymentId, payload = {}) => (await api.post(`/hospitality-payments/bank/${paymentId}/confirm`, payload)).data`

Calls: `POST /hospitality-payments/bank/${…}/confirm`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getHospitalityPayments` (source line 8)

`async ({ bookingId, type }) => (await api.get(`/hospitality-payments/${bookingId}`, { params: { type } })).data`

Calls: `GET /hospitality-payments/${…}`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.

## Callers

- [`client/src/pages/HospitalityPayment.jsx`](../../../../client/src/pages/HospitalityPayment.jsx)
- [`client/src/pages/PaymentStatus.jsx`](../../../../client/src/pages/PaymentStatus.jsx)

## Runtime and failure behavior

An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.

## Source excerpt

```js
import api from "./axios";

export const initiateHospitalityMpesa = async (payload) => (await api.post("/hospitality-payments/mpesa", payload)).data;
export const initiateHospitalityCard = async (payload) => (await api.post("/hospitality-payments/card", payload)).data;
export const verifyHospitalityCard = async (sessionId) => (await api.get(`/hospitality-payments/card/verify/${encodeURIComponent(sessionId)}`)).data;
export const submitHospitalityBank = async (payload) => (await api.post("/hospitality-payments/bank", payload)).data;
export const confirmHospitalityBank = async (paymentId, payload = {}) => (await api.post(`/hospitality-payments/bank/${paymentId}/confirm`, payload)).data;
export const getHospitalityPayments = async ({ bookingId, type }) => (await api.get(`/hospitality-payments/${bookingId}`, { params: { type } })).data;
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.
