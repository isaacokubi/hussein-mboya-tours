# Client API module: `client/src/api/passwordResetApi.js`

**Source:** [client/src/api/passwordResetApi.js](../../../../client/src/api/passwordResetApi.js)

## Responsibility

This module is the client-side transport boundary for the password reset feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- api from ./axios

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `requestPasswordReset` (source line 3)

`async ({ email }) => {`

Calls: `POST /auth/password-reset/request`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `resetPasswordWithCode` (source line 8)

`async (payload) => {`

Calls: `POST /auth/password-reset/confirm`. No local catch is present, so Axios rejection propagates to the calling hook/component.

## Callers

- [`client/src/pages/ForgotPassword.jsx`](../../../../client/src/pages/ForgotPassword.jsx)

## Runtime and failure behavior

An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.

## Source excerpt

```js
import api from "./axios";

export const requestPasswordReset = async ({ email }) => {
  const { data } = await api.post("/auth/password-reset/request", { email });
  return data;
};

export const resetPasswordWithCode = async (payload) => {
  const { data } = await api.post("/auth/password-reset/confirm", payload);
  return data;
};
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.
