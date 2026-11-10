# Client API module: `client/src/api/userApi.js`

**Source:** [client/src/api/userApi.js](../../../../client/src/api/userApi.js)

## Responsibility

This module is the client-side transport boundary for the user feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- api from ./axios

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `getProfile` (source line 3)

`async () => {`

Calls: `GET /users/profile`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getAll` (source line 8)

`getProfile`

No local catch is present, so Axios rejection propagates to the calling hook/component.

## Callers

- [`client/src/api/admin/systemHealthApi.js`](../../../../client/src/api/admin/systemHealthApi.js)
- [`client/src/api/categoryApi.js`](../../../../client/src/api/categoryApi.js)
- [`client/src/api/crmApi.js`](../../../../client/src/api/crmApi.js)
- [`client/src/api/galleryApi.js`](../../../../client/src/api/galleryApi.js)
- [`client/src/api/heroApi.js`](../../../../client/src/api/heroApi.js)
- [`client/src/api/notificationApi.js`](../../../../client/src/api/notificationApi.js)
- [`client/src/api/staffApi.js`](../../../../client/src/api/staffApi.js)

## Runtime and failure behavior

An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.

## Source excerpt

```js
import api from "./axios";

export const getProfile = async () => {
  const { data } = await api.get("/users/profile");
  return data;
};

export const getAll = getProfile;
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.
