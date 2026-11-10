# Route module: privacyRoutes.js

**Source:** [server/routes/privacyRoutes.js](../../../../server/routes/privacyRoutes.js)

Observed mount prefixes include `/api/privacy/requests`, `/api/privacy/admin/requests`, `/api/privacy/admin/summary`, `/api/privacy/admin/requests/:id`.

## Router-wide middleware

- `router.use(resolveTenant);`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### POST /requests → `/api/privacy/requests`

Declared at source line 12. Route handler pipeline names: `publicLimiter`, `createPrivacyRequest`.

```js
router.post("/requests", publicLimiter, createPrivacyRequest)
```

- Imported handler/middleware `createPrivacyRequest`: [privacyController.js](../../../../server/controllers/privacyController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `createPrivacyRequest`

Handler starts at [controller line 11](../../../../server/controllers/privacyController.js#L11). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `type`, `requesterName`, `customer`, `requesterEmail`, `requesterPhone`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `201`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Valid request type and requester name are required.”; “Invalid customer ID.”; “Customer not found in this tenant.”.
- Database operations detected: `Customer.findOne`, `PrivacyRequest.create`.
- Input/validation source lines to inspect:
  - [Line 14](../../../../server/controllers/privacyController.js#L14): `const type = String(req.body?.type || "").toLowerCase();`
  - [Line 15](../../../../server/controllers/privacyController.js#L15): `const requesterName = String(req.body?.requesterName || "").trim();`
  - [Line 16](../../../../server/controllers/privacyController.js#L16): `if (!TYPES.includes(type) || requesterName.length < 2) return res.status(400).json({ success: false, message: "Valid request type and requester name are required." });`
  - [Line 18](../../../../server/controllers/privacyController.js#L18): `if (req.body?.customer) {`
  - [Line 19](../../../../server/controllers/privacyController.js#L19): `if (!mongoose.isValidObjectId(req.body.customer)) return res.status(400).json({ success: false, message: "Invalid customer ID." });`
  - [Line 20](../../../../server/controllers/privacyController.js#L20): `customer = await Customer.findOne(mergeTenantFilter(req, { _id: req.body.customer })).select("_id").lean();`
  - [Line 21](../../../../server/controllers/privacyController.js#L21): `if (!customer) return res.status(404).json({ success: false, message: "Customer not found in this tenant." });`
  - [Line 23](../../../../server/controllers/privacyController.js#L23): `const request = await PrivacyRequest.create({ tenantId, type, requesterName, requesterEmail: String(req.body?.requesterEmail || "").trim().toLowerCase(), requesterPhone: `

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/privacy/requests'
```

### GET /admin/requests → `/api/privacy/admin/requests`

Declared at source line 13. Route handler pipeline names: `protect`, `authorize`, `listPrivacyRequests`.

```js
router.get("/admin/requests", protect, authorize("finance.view"), listPrivacyRequests)
```

- Imported handler/middleware `protect`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `listPrivacyRequests`: [privacyController.js](../../../../server/controllers/privacyController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `listPrivacyRequests`

Handler starts at [controller line 28](../../../../server/controllers/privacyController.js#L28). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `status`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`.
- Database operations detected: `PrivacyRequest.find`.
- Input/validation source lines to inspect:
  - [Line 29](../../../../server/controllers/privacyController.js#L29): `try { requireTenantId(); const data = await PrivacyRequest.find(mergeTenantFilter(req, req.query?.status ? { status: req.query.status } : {})).populate("customer", "name `

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/privacy/admin/requests'
```

### GET /admin/summary → `/api/privacy/admin/summary`

Declared at source line 14. Route handler pipeline names: `protect`, `authorize`, `getPrivacyComplianceSummary`.

```js
router.get("/admin/summary", protect, authorize("finance.view"), getPrivacyComplianceSummary)
```

- Imported handler/middleware `protect`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `getPrivacyComplianceSummary`: [privacyComplianceController.js](../../../../server/controllers/privacyComplianceController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getPrivacyComplianceSummary`

Handler starts at [controller line 4](../../../../server/controllers/privacyComplianceController.js#L4). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `PrivacyRequest.countDocuments`, `PrivacyRequest.aggregate`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/privacy/admin/summary'
```

### PATCH /admin/requests/:id → `/api/privacy/admin/requests/:id`

Declared at source line 15. Route handler pipeline names: `protect`, `authorize`, `updatePrivacyRequest`.

```js
router.patch("/admin/requests/:id", protect, authorize("finance.manage"), updatePrivacyRequest)
```

- Imported handler/middleware `protect`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `updatePrivacyRequest`: [privacyController.js](../../../../server/controllers/privacyController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `updatePrivacyRequest`

Handler starts at [controller line 32](../../../../server/controllers/privacyController.js#L32). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `status`, `assignedTo`, `resolutionNotes`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `409`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “Invalid privacy request ID.”; “Privacy request not found.”; “Invalid privacy request status.”; “Invalid assignee ID.”; “Assignee not found in this tenant.”.
- Database operations detected: `PrivacyRequest.findOne`, `PrivacyRequest.findOneAndUpdate`.
- Input/validation source lines to inspect:
  - [Line 35](../../../../server/controllers/privacyController.js#L35): `if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid privacy request ID." });`
  - [Line 36](../../../../server/controllers/privacyController.js#L36): `const request = await PrivacyRequest.findOne(mergeTenantFilter(req, { _id: req.params.id }));`
  - [Line 37](../../../../server/controllers/privacyController.js#L37): `if (!request) return res.status(404).json({ success: false, message: "Privacy request not found." });`
  - [Line 39](../../../../server/controllers/privacyController.js#L39): `if (req.body?.status !== undefined) {`
  - [Line 40](../../../../server/controllers/privacyController.js#L40): `const status = String(req.body.status).toLowerCase();`
  - [Line 41](../../../../server/controllers/privacyController.js#L41): `if (!STATUSES.includes(status)) return res.status(400).json({ success: false, message: "Invalid privacy request status." });`
  - [Line 42](../../../../server/controllers/privacyController.js#L42): `if (status !== request.status && !TRANSITIONS[request.status]?.includes(status)) return res.status(409).json({ success: false, message: \`Privacy request cannot transitio`
  - [Line 45](../../../../server/controllers/privacyController.js#L45): `if (req.body?.assignedTo !== undefined) {`
  - [Line 46](../../../../server/controllers/privacyController.js#L46): `if (req.body.assignedTo && !mongoose.isValidObjectId(req.body.assignedTo)) return res.status(400).json({ success: false, message: "Invalid assignee ID." });`
  - [Line 47](../../../../server/controllers/privacyController.js#L47): `if (req.body.assignedTo && !(await User.exists(mergeTenantFilter(req, { _id: req.body.assignedTo })))) return res.status(404).json({ success: false, message: "Assignee no`
  - [Line 48](../../../../server/controllers/privacyController.js#L48): `update.assignedTo = req.body.assignedTo || null;`
  - [Line 50](../../../../server/controllers/privacyController.js#L50): `if (req.body?.resolutionNotes !== undefined) update.resolutionNotes = String(req.body.resolutionNotes || "").trim();`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PATCH 'http://localhost:5000/api/privacy/admin/requests/<id>'
```

