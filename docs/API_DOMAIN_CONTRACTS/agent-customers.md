# Agent customer API contracts

## Shared mount, authentication, and tenant scope

`server/routes/index.js` mounts `agentCustomerRoutes.js` at both `/api/agents` and `/api/agent`; the router itself adds `/customers`. Thus each operation below has plural and singular path aliases, with inventory entries 123–134. Both use `resolveTenant` → `protect` → `agentMiddleware`. The middleware requires an authenticated active User whose canonical role is `agent`, plus an Agent profile; it can repair a missing Agent.user link by matching email. It records pending approval but does not use `requireApprovedAgent`, so these customer-management routes do not require Agent approval or active Agent status. There is no branch restriction. `requireTenantId()` is called in list, create, detail, but not update/delete/stats; agent lookup and query hooks normally scope data through tenant context. The update/delete filters also constrain owner Agent and ID, with Customer tenant query middleware contributing scope.

No request-schema middleware is mounted. The controller uses an allowlist on create/update. Errors thrown by Mongoose or tenant-context helpers are forwarded to the centralized error handler unless a handler returns a specific JSON error below.

## GET `/api/agents/customers` and `/api/agent/customers` (entries 123–124; repeated route entries 143–144)

**Effective runtime handler:** the broad `agentRoutes.js` mounts at both prefixes before `agentCustomerRoutes.js` in `server/routes/index.js`. Its `GET /customers` handler therefore responds first; the dedicated `agentCustomerRoutes.js` list handler is shadowed for these exact paths. `agentRoutes` requires `requireApprovedAgent` after its dashboard route, so the effective list requires an approved, active Agent profile. The dedicated handler’s list contract is not the live behavior for these two URLs unless mount order changes.

The effective `getAgentCustomers` handler ignores query parameters, loads all non-deleted Agent bookings, populates customer summary fields, selects customer/snapshot/contact, deduplicates by customer ID/email/phone/name, and returns HTTP 200 `{success:true,data:[...]}`. Missing Agent profile returns 404. Database errors go to centralized handling. It is not paginated and has no search/status filters. The agent UI should not assume the dedicated list shape (`customers`, `pagination`) from this URL.

Optional query parameters for the shadowed dedicated route (not effective at the mounted path): `page` (numeric coercion; default 1; minimum 1), `limit` (default 20; clamped 1–100), `status` (passed through as-is), `search` (trimmed string used in a case-insensitive regex against first name, last name, email, and phone). Regex metacharacters are not escaped and search length is not bounded. The controller finds the current Agent, filters non-deleted customers owned by that Agent, sorts newest first, applies skip/limit and counts in parallel. Success 200 `{success:true,page,limit,total,pages,count,customers}` where documents are lean objects. Missing Agent profile returns 404 `{success:false,message}`. Database/regex errors go to central error handling. No branch filter. Frontend caller `getAgentCustomers` in `client/src/api/customerApi.js` uses the singular path.

## GET `/api/agents/customers/stats` and singular alias (entries 125–126)

No request parameters. Counts four groups in parallel for the current Agent: non-deleted total, non-deleted `status: active`, non-deleted `customerType: vip`, and deleted. Success 200 `{success:true,stats:{total,active,vip,deleted}}`; missing Agent profile 404. These count filters omit an explicit tenant predicate and rely on model tenant query middleware. There is no observed first-party stats caller or dedicated endpoint test.

## GET `/api/agents/customers/:id` and singular alias (entries 127–128)

Path parameter `id` must pass Mongoose ObjectId validation or returns 400. Finds a non-deleted Customer owned by the current Agent; missing Agent or Customer returns 404. Success 200 `{success:true,customer}` with a lean record. This prevents one Agent from reading another Agent's customer through this handler. No explicit body or query handling.

## POST `/api/agents/customers` and singular alias (entries 129–130)

JSON body properties accepted by the controller allowlist: `firstName`, `lastName`, `email`, `phone`, `country`, `address`, `customerType`, `passportNumber`, `nationality`, `dateOfBirth`, `notes`, `gender`, `city`, `county`, `postalCode`, `company`, `jobTitle`. `name` is additionally split on whitespace only as fallback for missing first/last fields. Email is trimmed and lowercased; phone is stringified and trimmed. `firstName`, `lastName`, and `phone` are required by controller; Customer schema also requires first/last/phone and validates email format, gender/customerType enums, and dates through Mongoose. Unknown fields are discarded. If a normalized email exists, a non-deleted duplicate for the same Agent returns 409; empty/missing email skips this duplicate lookup. Success 201 `{success:true,message:"Customer created successfully.",customer}`; missing Agent profile 404; missing required fields 400. A race can still create duplicates because the pre-check is not a uniqueness constraint on `(agent,email)`.

## PUT `/api/agents/customers/:id` and singular alias (entries 131–132)

Path ID validation returns 400 if invalid. Request body uses the same allowlist and normalization (`name` fallback); there is no controller-level required-field check or email duplicate pre-check. It sets `updatedBy` to the authenticated User and performs owner/ID/non-deleted scoped `findOneAndUpdate` with `new:true, runValidators:true`. Success 200 `{success:true,message:"Customer updated successfully.",customer}`; invalid ID 400; no Agent profile or no owned non-deleted record 404. Schema validators apply to supplied values, but Mongoose update validators only run on updated paths. This operation lacks an explicit `requireTenantId()` call, relying on middleware-established tenant context and Customer query middleware as well as Agent ownership filter.

## DELETE `/api/agents/customers/:id` and singular alias (entries 133–134)

Soft delete only: validates ID (400), finds and updates the current Agent's non-deleted record to `isDeleted:true`, `deletedAt: now`, and `updatedBy`. Success 200 `{success:true,message:"Customer deleted successfully."}` without returning the customer. Missing Agent/customer returns 404. It does not cascade or modify bookings. This filter also omits explicit tenant context in the controller and relies on tenant middleware/model query scope plus owner Agent.

## Dependencies, tests, and verification limits

- Route aliases and guards: `server/routes/index.js`, `server/routes/agentCustomerRoutes.js`, `server/middleware/authMiddleware.js`, `server/middleware/agentMiddleware.js`.
- Handler symbols: `createCustomer`, `getCustomers`, `getCustomer`, `updateCustomer`, `deleteCustomer`, `getCustomerStats` in `server/controllers/agentCustomerController.js`.
- Data rules: `server/models/Customer.js`, `server/models/Agent.js`, `server/tenancy/context.js`, `server/tenancy/tenantPlugin.js`.
- Frontend: `getAgentCustomers` in `client/src/api/customerApi.js`; legacy `fetchAgentCustomers` in `client/src/api/agentApi.js` should be checked separately for current usage.
- No focused request/database test for these handlers was found in the searched `server/tests` suite. Contract details above are source-inspected, not live HTTP verified; Mongoose validation and tenant plugin behavior were read but not exercised here.
