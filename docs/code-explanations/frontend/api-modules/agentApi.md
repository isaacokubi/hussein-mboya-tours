# Client API module: `client/src/api/agentApi.js`

**Source:** [client/src/api/agentApi.js](../../../../client/src/api/agentApi.js)

## Responsibility

This module is the client-side transport boundary for the agent feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- api from ./axios

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `fetchAgentDashboard` (source line 9)

`async () => {`

Calls: `GET /agent/dashboard`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `fetchAgentBookings` (source line 23)

`async (params = {}) => {`

Calls: `GET /agent/bookings`. No local catch is present, so Axios rejection propagates to the calling hook/component. Passes query parameters from the caller into Axios config.
### `fetchAgentQuotes` (source line 40)

`async () => {`

Calls: `GET /agent/quotes`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `fetchAgentCustomers` (source line 54)

`async () => {`

Calls: `GET /agent/customers`. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `fetchAgentCommission` (source line 68)

`async () => {`

Calls: `GET /agent/commission`. No local catch is present, so Axios rejection propagates to the calling hook/component.

## Callers

- [`client/src/pages/agent/AgentCommission.jsx`](../../../../client/src/pages/agent/AgentCommission.jsx)
- [`client/src/pages/agent/AgentDashboard.jsx`](../../../../client/src/pages/agent/AgentDashboard.jsx)

## Runtime and failure behavior

An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.

## Source excerpt

```js
import api from "./axios";

/*
|--------------------------------------------------------------------------
| AGENT DASHBOARD
|--------------------------------------------------------------------------
*/

export const fetchAgentDashboard = async () => {
  const { data } = await api.get(
    "/agent/dashboard"
  );

  return data;
};

/*
|--------------------------------------------------------------------------
| AGENT BOOKINGS
|--------------------------------------------------------------------------
*/

export const fetchAgentBookings = async (params = {}) => {
  const { data } = await api.get(
    "/agent/bookings",
    {
      params,
    }
  );

  return data;
};

/*
|--------------------------------------------------------------------------
| AGENT QUOTATIONS
|--------------------------------------------------------------------------
*/

export const fetchAgentQuotes = async () => {
  const { data } = await api.get(
    "/agent/quotes"
  );

  return data;
};

/*
|--------------------------------------------------------------------------
| AGENT CUSTOMERS
|--------------------------------------------------------------------------
*/

export const fetchAgentCustomers = async () => {
  const { data } = await api.get(
    "/agent/customers"
  );

  return data;
};

/*
|--------------------------------------------------------------------------
| AGENT COMMISSION
|--------------------------------------------------------------------------
*/

export const fetchAgentCommission = async () => {
  const { data } = await api.get(
    "/agent/commission"
  );

  return data;
};
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.
