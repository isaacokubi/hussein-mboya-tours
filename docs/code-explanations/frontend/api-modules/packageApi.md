# Client API module: `client/src/api/packageApi.js`

**Source:** [client/src/api/packageApi.js](../../../../client/src/api/packageApi.js)

## Responsibility

This module is the client-side transport boundary for the package feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- api from ./axios

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `getPackages` (source line 11)

`async (params = {}) => {`

Calls: `GET /agent/packages`. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.
### `getPackageDetails` (source line 28)

`async (packageId) => {`

Calls: `GET /agent/packages/${…}`. No local catch is present, so Axios rejection propagates to the calling hook/component.

## Callers

- [`client/src/hooks/useAgentPackages.js`](../../../../client/src/hooks/useAgentPackages.js)
- [`client/src/pages/agent/AgentPackages.jsx`](../../../../client/src/pages/agent/AgentPackages.jsx)

## Runtime and failure behavior

An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.

## Source excerpt

```js
// client/src/services/packageService.js

import api from "./axios";

/*
|--------------------------------------------------------------------------
| GET AGENT PACKAGES
|--------------------------------------------------------------------------
*/

export const getPackages = async (params = {}) => {
  const { data } = await api.get(
    "/agent/packages",
    {
      params,
    }
  );

  return data;
};

/*
|--------------------------------------------------------------------------
| GET PACKAGE DETAILS
|--------------------------------------------------------------------------
*/

export const getPackageDetails = async (packageId) => {
  const { data } = await api.get(
    `/agent/packages/${packageId}`
  );

  return data;
};
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.
