# Admin agent API contracts

These four contracts trace the mounted admin-agent routes through `adminAgentRoutes` and `adminAgentController`. They are source-verified, not runtime-tested.

## Shared middleware and tenancy

`server/routes/index.js` mounts this router at `/admin/agents` under `/api`. Router middleware runs `protect` → `resolveTenant` → `adminMiddleware`. `adminMiddleware` establishes the administrator role gate; this router does not add a separate `authorize(...)` permission check. Each controller requires tenant context. Reads use `tenantFilter(req)` or an explicit `tenantId`; agent, linked user, and organization data are scoped to that tenant. There are no query/body controls for tenant selection in these handlers.

## `GET /api/admin/agents`

- **Controller/models:** `getAgents`; reads `Agent`, `Organization`, `Booking`, and `Commission`.
- **Request:** No path parameters, query parameters, request body, or handler-specific headers. Standard auth and tenant context apply.
- **Behavior:** Fetches tenant agents newest first and populates linked user name/email/phone/role/status. Reads the tenant organization address/country for a fallback location. Aggregates non-deleted booking counts by agent and commission totals by agent, net of `refundedAmount`; pending commission includes `pending`, `approved`, and `processing`, while paid totals include `paid`. If the commission aggregation fails, it logs the error and returns the agents with model-stored commission fallback totals. Normalization trims company/contact/location strings, derives phone/email from the linked user when absent, falls back to organization location, computes `isActive` only when status is `active` and `isApproved === true`, and uses stored booking/commission totals when aggregate values are missing.
- **Success:** HTTP 200 `{success:true,data:[agent...]}`. Each entry is the lean agent record with populated `user`, normalized company/contact/location, `totalBookings`, `totalCommission`, `pendingCommission`, `paidCommission`, and `isActive`.
- **Errors:** Tenant-context or tenant-ID conversion errors use the error status/code where present, otherwise 500; envelope `{success:false,code,message}`. Message is passed through `publicErrorMessage`. No write side effects; commission aggregation failure alone is non-fatal.
- **Frontend:** `client/src/api/adminAgentApi.js#getAgents`; used by `client/src/pages/admin/Agents.jsx`, `client/src/pages/admin/CustomTourRequests.jsx`, and the admin dashboard.

## `GET /api/admin/agents/:id`

- **Request:** `id` is converted to a Mongo ObjectId; no query/body fields.
- **Behavior/data:** Tenant-scoped Agent lookup, populated linked User fields `name email phone role status`, returned as lean document.
- **Success:** HTTP 200 `{success:true,data:agent}`.
- **Errors:** Invalid ID is 400 with `INVALID_OBJECT_ID` internally and public message; missing or cross-tenant agent is 404 `{success:false,message:"Agent not found"}`. Other errors use their status or 500 and a public message.
- **Side effects/frontend:** Read only. `getAgent(id)` wrapper is available in `adminAgentApi.js`; the current Agents page primarily uses list data.

## `PUT /api/admin/agents/:id/approve`

- **Request:** Path `id`; no request body is read. Approver ID comes from authenticated `req.user._id`, `req.user.id`, or `req.auth.userId`.
- **Behavior/data:** Converts agent and approver IDs, loads tenant Agent, then tenant linked User. It activates the User (`role` and `legacyRole`=`agent`, `status`=`active`, `isActive`=true), then marks Agent approved and active with `approvedBy` and `approvedAt`. The two document updates are sequential, not transactional. If the final Agent update returns no document, it attempts a best-effort User rollback to the previously read role/status/isActive values; rollback failure is logged and swallowed. A thrown error between the user and agent writes is handled as an error without a general compensation block.
- **Success:** HTTP 200 `{success:true,message:"Agent approved successfully",data:updatedAgent}` with populated user summary.
- **Errors:** Invalid IDs 400; agent missing in tenant 404 `AGENT_NOT_FOUND`; linked user absent or activation/final update failure 422 with respective `AGENT_USER_NOT_FOUND`, `AGENT_USER_ACTIVATION_FAILED`, or `AGENT_APPROVAL_UPDATE_FAILED`; validation and unexpected errors return their status or 500 with a public/validation message and `AGENT_APPROVAL_FAILED` fallback. No notification or email is sent here.
- **Frontend:** `approveAgent(id)` sends a bodyless PUT from the Agents page and admin dashboard.

## `PUT /api/admin/agents/:id/status`

- **Request:** Path `id`; JSON body requires `status`, stringified, trimmed and lowercased. Allowed values are `active`, `inactive`, `suspended`; no other body fields are used.
- **Behavior/data:** Tenant-loads the Agent and optionally its linked User. For `active`, linked User becomes active/enabled with agent roles; for `inactive` or `suspended`, user status follows the requested value and `isActive=false`. It then writes Agent status with validators and populates user summary. Updates are sequential and not transactional: if the User update succeeds but the Agent write later fails, the user may retain changed access state. Re-activating does not change the Agent's `isApproved` flag, so status `active` alone does not make the API's `isActive` presentation field true unless already approved.
- **Success:** HTTP 200 `{success:true,message:"Agent status and access updated",data:updatedAgent}`.
- **Errors:** Unsupported/missing status 400; invalid IDs 400; missing agent 404; missing linked user 422 `AGENT_USER_NOT_FOUND`; other errors use error status or 500 and `publicErrorMessage`.
- **Frontend:** `updateAgentStatus(id,status)` sends normalized status JSON; callers include the Agents page. No email, payment, commission, or booking mutation occurs.

## Contract limitations

The handlers expose no pagination/filtering on the list route. Agent approval/status changes do not use a transaction across Agent and User, so operational reconciliation may be needed after partial failures. No matching frontend caller for the detail wrapper was found in the reviewed API module.
