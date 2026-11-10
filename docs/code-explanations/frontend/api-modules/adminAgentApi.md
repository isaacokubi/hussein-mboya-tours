# Client API module: `client/src/api/adminAgentApi.js`

**Source:** [client/src/api/adminAgentApi.js](../../../../client/src/api/adminAgentApi.js)

## Responsibility

This module is the client-side transport boundary for the admin agent feature. It maps exported operations to the relative URLs shown below; server-side authentication, tenant scope, validation and business rules remain authoritative.

## Imports

- axios from ./axios

The shared Axios instance typically attaches API base URL and applicable authentication/tenant/CSRF metadata. This module should not contain provider credentials or trust client values as authoritative.

## Exported operations

### `getAgents` (source line 31)

`async () => {`

Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `getAgentById` (source line 36)

`async (id) => {`

Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `approveAgent` (source line 42)

`async (id) => {`

Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.
### `updateAgentStatus` (source line 47)

`async (id, status) => {`

Returns/destructures Axios response data rather than exposing the full transport response. No local catch is present, so Axios rejection propagates to the calling hook/component.

## Callers

- [`client/src/components/admin/dashboard/AdminDashboard.jsx`](../../../../client/src/components/admin/dashboard/AdminDashboard.jsx)
- [`client/src/pages/admin/Agents.jsx`](../../../../client/src/pages/admin/Agents.jsx)
- [`client/src/pages/admin/CustomTourRequests.jsx`](../../../../client/src/pages/admin/CustomTourRequests.jsx)

## Runtime and failure behavior

An exported function runs when a page, hook, or mutation invokes it. Axios serializes the supplied data/config and sends the request. Unless the function catches an error, the returned promise rejects and the calling query/mutation handles the failure. Response unwrapping is function-specific and is described above. The URL alone does not define the server contract: follow the corresponding Express route, middleware and controller.

## Source excerpt

```js
import axios from "./axios";

const clean = (value) => (value === null || value === undefined ? "" : String(value).trim());

const normalizeAgent = (agent, companyName = "") => ({
  ...agent,
  companyName: clean(agent?.companyName) || clean(companyName),
  email: clean(agent?.email) || clean(agent?.user?.email),
  phone: clean(agent?.phone) || clean(agent?.user?.phone),
  location: clean(agent?.location),
  status: clean(agent?.status).toLowerCase() || "inactive",
  isApproved: agent?.isApproved === true,
  isActive: agent?.isApproved === true && clean(agent?.status).toLowerCase() === "active",
  totalBookings: Number(agent?.totalBookings || 0),
  totalCommission: Number(agent?.totalCommission || 0),
  pendingCommission: Number(agent?.pendingCommission || 0),
  paidCommission: Number(agent?.paidCommission || 0),
});

const normalizeAgentPayload = (payload, companyName = "") => {
  const data = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.agents)
        ? payload.agents
        : [];
  return data.map((agent) => normalizeAgent(agent, companyName));
};

export const getAgents = async () => {
  const res = await axios.get("/admin/agents");
  return normalizeAgentPayload(res.data);
};

export const getAgentById = async (id) => {
  const res = await axios.get(`/admin/agents/${id}`);
  const agent = res.data?.data || res.data || {};
  return normalizeAgent(agent);
};

export const approveAgent = async (id) => {
  const res = await axios.put(`/admin/agents/${id}/approve`);
  return res.data;
};

export const updateAgentStatus = async (id, status) => {
  const normalizedStatus = clean(status).toLowerCase();
  if (!["active", "inactive", "suspended"].includes(normalizedStatus)) throw new Error("Invalid agent status.");
  const res = await axios.put(`/admin/agents/${id}/status`, { status: normalizedStatus });
  return res.data;
};
```

## Security and maintenance notes

Do not treat hidden UI controls or client-side parameter checks as access control. Avoid logging tokens, customer personal data, or payment payloads. When changing a path or response unwrapping, update the matching backend route/client call sites and tests; preserve AbortSignal/query parameters when the caller supplies them.
