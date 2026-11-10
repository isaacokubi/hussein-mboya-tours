# Client API module: `client/src/api/platformBillingApi.js`

**Source:** [client/src/api/platformBillingApi.js](../../../../client/src/api/platformBillingApi.js)

## Responsibility

This module is the client-side transport boundary for the platform billing feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- axios from ./axios

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `getPlatformBillingConfig` (source line 3)

`async () => (await axios.get("/superadmin/billing/config")).data`

Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `updatePlatformBillingConfig` (source line 4)

`async (payload) => (await axios.put("/superadmin/billing/config", payload)).data`

Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.

## Callers

- [`client/src/pages/superadmin/SuperAdminPlanFeatures.jsx`](../../../../client/src/pages/superadmin/SuperAdminPlanFeatures.jsx)
- [`client/src/pages/superadmin/SuperAdminSettings.jsx`](../../../../client/src/pages/superadmin/SuperAdminSettings.jsx)

## Runtime and failure behavior

An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.

## Source excerpt

```js
import axios from "./axios";

export const getPlatformBillingConfig = async () => (await axios.get("/superadmin/billing/config")).data;
export const updatePlatformBillingConfig = async (payload) => (await axios.put("/superadmin/billing/config", payload)).data;
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.
