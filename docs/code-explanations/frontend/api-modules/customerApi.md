# Client API module: `client/src/api/customerApi.js`

**Source:** [client/src/api/customerApi.js](../../../../client/src/api/customerApi.js)

## Responsibility

This module is the client-side transport boundary for the customer feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- api from ./axios

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `getAdminCustomers` (source line 16)

`async (params = {}) => {`

Calls: `GET /customers`. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.
### `getCustomerProfile` (source line 25)

`async (id) => {`

Calls: `GET /customers/${…}`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getAgentCustomers` (source line 34)

`async (params = {}) => {`

Calls: `GET /agent/customers`. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.
### `getCustomers` (source line 43)

`async (params = {}) => {`

Calls: `GET /customers`. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.
### `getCustomerById` (source line 52)

`async (id) => {`

Calls: `GET /customers/${…}`. No local catch is present, so Axios rejection propagates to the calling hook/component.

## Callers

- [`client/src/api/tourManagerApi.js`](../../../../client/src/api/tourManagerApi.js)
- [`client/src/hooks/useAgentCustomers.js`](../../../../client/src/hooks/useAgentCustomers.js)
- [`client/src/pages/admin/CustomerDetails.jsx`](../../../../client/src/pages/admin/CustomerDetails.jsx)
- [`client/src/pages/admin/Customers.jsx`](../../../../client/src/pages/admin/Customers.jsx)
- [`client/src/services/tourManagerService.js`](../../../../client/src/services/tourManagerService.js)

## Runtime and failure behavior

An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.

## Source excerpt

```js
import api from "./axios";

/*
 * Customer-management API contract.
 *
 * The server exposes customer management at /api/customers and Agent
 * customer access at /api/agent/customers. Keep this module aligned with
 * those canonical routes instead of retaining legacy /admin/customers and
 * /agents/customers paths that no longer exist.
 */

/**
 * Get customers available to an administrator.
 * GET /api/customers
 */
export const getAdminCustomers = async (params = {}) => {
  const { data } = await api.get("/customers", { params });
  return data;
};

/**
 * Get the customer-management profile for an administrator.
 * GET /api/customers/:id
 */
export const getCustomerProfile = async (id) => {
  const { data } = await api.get(`/customers/${id}`);
  return data;
};

/**
 * Get customers associated with the authenticated Agent.
 * GET /api/agent/customers
 */
export const getAgentCustomers = async (params = {}) => {
  const { data } = await api.get("/agent/customers", { params });
  return data;
};

/**
 * Generic customer-management alias used by existing admin screens.
 * GET /api/customers
 */
export const getCustomers = async (params = {}) => {
  const { data } = await api.get("/customers", { params });
  return data;
};

/**
 * Get a single customer profile.
 * GET /api/customers/:id
 */
export const getCustomerById = async (id) => {
  const { data } = await api.get(`/customers/${id}`);
  return data;
};
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.
