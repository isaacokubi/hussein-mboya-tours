# Client API module: `client/src/api/integrationApi.js`

**Source:** [client/src/api/integrationApi.js](../../../../client/src/api/integrationApi.js)

## Responsibility

This module is the client-side transport boundary for the integration feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- api from ./axios

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `listWebsiteIntegrations` (source line 3)

`async () => {`

Calls: `GET /integrations/keys`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `createWebsiteIntegration` (source line 8)

`async (payload) => {`

Calls: `POST /integrations/keys`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `revokeWebsiteIntegration` (source line 13)

`async (id) => {`

Calls: `DELETE /integrations/keys/${…}`. No local catch is present, so Axios rejection propagates to the calling hook/component.

## Callers

- [`client/src/pages/admin/AdminSettings.jsx`](../../../../client/src/pages/admin/AdminSettings.jsx)

## Runtime and failure behavior

An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.

## Source excerpt

```js
import api from "./axios";

export const listWebsiteIntegrations = async () => {
  const { data } = await api.get("/integrations/keys");
  return data;
};

export const createWebsiteIntegration = async (payload) => {
  const { data } = await api.post("/integrations/keys", payload);
  return data;
};

export const revokeWebsiteIntegration = async (id) => {
  const { data } = await api.delete(`/integrations/keys/${id}`);
  return data;
};
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.
