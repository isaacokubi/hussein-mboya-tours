# Route module: adminAgentRoutes.js

**Source:** [server/routes/adminAgentRoutes.js](../../../../server/routes/adminAgentRoutes.js)

Observed mount prefixes include `/api/admin/agents`, `/api/admin/agents/:id`, `/api/admin/agents/:id/approve`, `/api/admin/agents/:id/status`.

## Router-wide middleware

- `router.use(protect);`
- `router.use(resolveTenant);`
- `router.use(adminMiddleware);`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET / → `/api/admin/agents`

Declared at source line 20. Route handler pipeline names: `getAgents`.

```js
router.get("/", getAgents)
```

- Imported handler/middleware `getAgents`: [adminAgentController.js](../../../../server/controllers/adminAgentController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getAgents`

Handler starts at [controller line 40](../../../../server/controllers/adminAgentController.js#L40). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `data`, `code`, `message`.
- Database operations detected: `Agent.find`, `Organization.findById`, `Booking.aggregate`, `Commission.aggregate`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/agents'
```

### GET /:id → `/api/admin/agents/:id`

Declared at source line 21. Route handler pipeline names: `getAgentById`.

```js
router.get("/:id", getAgentById)
```

- Imported handler/middleware `getAgentById`: [adminAgentController.js](../../../../server/controllers/adminAgentController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getAgentById`

Handler starts at [controller line 140](../../../../server/controllers/adminAgentController.js#L140). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “Agent not found”.
- Database operations detected: `Agent.findOne`.
- Input/validation source lines to inspect:
  - [Line 143](../../../../server/controllers/adminAgentController.js#L143): `const agentId = toObjectId(req.params.id, "agent ID");`
  - [Line 147](../../../../server/controllers/adminAgentController.js#L147): `if (!agent) return res.status(404).json({ success: false, message: "Agent not found" });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/agents/<id>'
```

### PUT /:id/approve → `/api/admin/agents/:id/approve`

Declared at source line 22. Route handler pipeline names: `approveAgent`.

```js
router.put("/:id/approve", approveAgent)
```

- Imported handler/middleware `approveAgent`: [adminAgentController.js](../../../../server/controllers/adminAgentController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `approveAgent`

Handler starts at [controller line 155](../../../../server/controllers/adminAgentController.js#L155). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `422`.
- JSON envelope keys observed: `success`, `code`, `message`, `data`.
- Literal messages include: “Agent not found in the current tenant.”; “The agent”; “The linked agent user account could not be activated.”; “The agent approval could not be completed.”; “Agent approved successfully”.
- Database operations detected: `Agent.findOne`, `User.findOne`, `User.findOneAndUpdate`, `Agent.findOneAndUpdate`, `User.updateOne`.
- Input/validation source lines to inspect:
  - [Line 158](../../../../server/controllers/adminAgentController.js#L158): `const agentId = toObjectId(req.params.id, "agent ID");`
  - [Line 163](../../../../server/controllers/adminAgentController.js#L163): `if (!agent) return res.status(404).json({ success: false, code: "AGENT_NOT_FOUND", message: "Agent not found in the current tenant." });`
  - [Line 169](../../../../server/controllers/adminAgentController.js#L169): `if (!linkedUser) return res.status(422).json({ success: false, code: "AGENT_USER_NOT_FOUND", message: "The agent's linked user account could not be found in this tenant."`
  - [Line 176](../../../../server/controllers/adminAgentController.js#L176): `if (!activatedUser) return res.status(422).json({ success: false, code: "AGENT_USER_ACTIVATION_FAILED", message: "The linked agent user account could not be activated." }`
  - [Line 190](../../../../server/controllers/adminAgentController.js#L190): `return res.status(422).json({ success: false, code: "AGENT_APPROVAL_UPDATE_FAILED", message: "The agent approval could not be completed." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PUT 'http://localhost:5000/api/admin/agents/<id>/approve'
```

### PUT /:id/status → `/api/admin/agents/:id/status`

Declared at source line 23. Route handler pipeline names: `updateAgentStatus`.

```js
router.put("/:id/status", updateAgentStatus)
```

- Imported handler/middleware `updateAgentStatus`: [adminAgentController.js](../../../../server/controllers/adminAgentController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `updateAgentStatus`

Handler starts at [controller line 205](../../../../server/controllers/adminAgentController.js#L205). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `status`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `422`.
- JSON envelope keys observed: `success`, `message`, `code`, `data`.
- Literal messages include: “Invalid agent status”; “Agent not found”; “The agent”; “Agent status and access updated”.
- Database operations detected: `Agent.findOne`, `User.findOneAndUpdate`, `Agent.findOneAndUpdate`.
- Input/validation source lines to inspect:
  - [Line 208](../../../../server/controllers/adminAgentController.js#L208): `const status = String(req.body?.status || "").trim().toLowerCase();`
  - [Line 209](../../../../server/controllers/adminAgentController.js#L209): `if (!["active", "inactive", "suspended"].includes(status)) return res.status(400).json({ success: false, message: "Invalid agent status" });`
  - [Line 210](../../../../server/controllers/adminAgentController.js#L210): `const agentId = toObjectId(req.params.id, "agent ID");`
  - [Line 214](../../../../server/controllers/adminAgentController.js#L214): `if (!agent) return res.status(404).json({ success: false, message: "Agent not found" });`
  - [Line 227](../../../../server/controllers/adminAgentController.js#L227): `return res.status(422).json({`
  - [Line 241](../../../../server/controllers/adminAgentController.js#L241): `if (!updatedAgent) return res.status(404).json({ success: false, message: "Agent not found" });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PUT 'http://localhost:5000/api/admin/agents/<id>/status'
```

