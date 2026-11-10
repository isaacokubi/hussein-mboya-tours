# Client API module: `client/src/api/auditApi.js`

**Source:** [client/src/api/auditApi.js](../../../../client/src/api/auditApi.js)

## Responsibility

This module is the client-side transport boundary for the audit feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- api from ./axios

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `getAuditLogs` (source line 5)

`async(params={})=>{`

Calls: `GET /superadmin/audit`. Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.

## Callers

- [`client/src/api/superAdminApi.js`](../../../../client/src/api/superAdminApi.js)
- [`client/src/pages/superadmin/SuperAdminAudit.jsx`](../../../../client/src/pages/superadmin/SuperAdminAudit.jsx)

## Runtime and failure behavior

An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.

## Source excerpt

```js

import api from "./axios";


export const getAuditLogs = async(params={})=>{

const response = await api.get(
"/superadmin/audit",
{
params
}
);

return response.data;

};
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.
