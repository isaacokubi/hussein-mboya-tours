# Client API module: `client/src/api/searchApi.js`

**Source:** [client/src/api/searchApi.js](../../../../client/src/api/searchApi.js)

## Responsibility

This module is the client-side transport boundary for the search feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- api from ./axios

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `searchTours` (source line 11)

`async (filters = {}) => {`

Calls: `GET /tours/search`. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.

## Callers

No static caller was detected by symbol search; it may be used dynamically or currently unused.

## Runtime and failure behavior

An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.

## Source excerpt

```js
// client/src/services/searchService.js

import api from "./axios";

/*
|--------------------------------------------------------------------------
| SEARCH TOURS
|--------------------------------------------------------------------------
*/

export const searchTours = async (filters = {}) => {
  const { data } = await api.get(
    "/tours/search",
    {
      params: filters,
    }
  );

  return data;
};
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.
