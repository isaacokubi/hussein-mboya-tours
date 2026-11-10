# Route module: complianceRoutes.js

**Source:** [server/routes/complianceRoutes.js](../../../../server/routes/complianceRoutes.js)

Observed mount prefixes include `/api/admin/compliance`, `/api/admin/compliance/summary`, `/api/admin/compliance/:type`, `/api/admin/compliance/etims/invoices/:id/queue`, `/api/admin/compliance/etims/invoices/:id/status`.

## Router-wide middleware

- `router.use(resolveTenant, protect);`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET / → `/api/admin/compliance`

Declared at source line 9. Route handler pipeline names: `authorize`, `listComplianceRecords`.

```js
router.get("/", authorize("finance.view"), listComplianceRecords)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `listComplianceRecords`: [complianceController.js](../../../../server/controllers/complianceController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `listComplianceRecords`

Handler starts at [controller line 10](../../../../server/controllers/complianceController.js#L10). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `type`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`.
- Database operations detected: `ComplianceRecord.find`.
- Input/validation source lines to inspect:
  - [Line 10](../../../../server/controllers/complianceController.js#L10): `async function listComplianceRecords(req, res, next) { try { requireTenantId(); const data = await ComplianceRecord.find(mergeTenantFilter(req, req.query?.type ? { type: `

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/compliance'
```

### GET /summary → `/api/admin/compliance/summary`

Declared at source line 10. Route handler pipeline names: `authorize`, `getComplianceSummary`.

```js
router.get("/summary", authorize("finance.view"), getComplianceSummary)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `getComplianceSummary`: [complianceController.js](../../../../server/controllers/complianceController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getComplianceSummary`

Handler starts at [controller line 12](../../../../server/controllers/complianceController.js#L12). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `ComplianceRecord.find`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/compliance/summary'
```

### PUT /:type → `/api/admin/compliance/:type`

Declared at source line 11. Route handler pipeline names: `authorize`.

```js
router.put("/:type", authorize("finance.manage"), (req, res, next) => { req.body = { ...(req.body || {}), type: req.params.type }; return upsertComplianceRecord(req, res, next); })
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PUT 'http://localhost:5000/api/admin/compliance/<type>'
```

### POST /etims/invoices/:id/queue → `/api/admin/compliance/etims/invoices/:id/queue`

Declared at source line 12. Route handler pipeline names: `authorize`, `queueEtimsInvoice`.

```js
router.post("/etims/invoices/:id/queue", authorize("finance.manage"), queueEtimsInvoice)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `queueEtimsInvoice`: [complianceController.js](../../../../server/controllers/complianceController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `queueEtimsInvoice`

Handler starts at [controller line 13](../../../../server/controllers/complianceController.js#L13). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `202`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Invalid invoice ID.”; “Invoice not found.”; “Invoice queued for eTIMS adapter submission.”.
- Database operations detected: `Invoice.findOne`.
- Input/validation source lines to inspect:
  - [Line 13](../../../../server/controllers/complianceController.js#L13): `async function queueEtimsInvoice(req, res, next) { try { const tenantId = requireTenantId(); if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ s`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/admin/compliance/etims/invoices/<id>/queue'
```

### GET /etims/invoices/:id/status → `/api/admin/compliance/etims/invoices/:id/status`

Declared at source line 13. Route handler pipeline names: `authorize`, `getEtimsInvoiceStatus`.

```js
router.get("/etims/invoices/:id/status", authorize("finance.view"), getEtimsInvoiceStatus)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `getEtimsInvoiceStatus`: [complianceController.js](../../../../server/controllers/complianceController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getEtimsInvoiceStatus`

Handler starts at [controller line 14](../../../../server/controllers/complianceController.js#L14). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Invalid invoice ID.”; “Invoice not found.”.
- Database operations detected: `Invoice.findOne`, `EtimsSubmission.find`.
- Input/validation source lines to inspect:
  - [Line 14](../../../../server/controllers/complianceController.js#L14): `async function getEtimsInvoiceStatus(req, res, next) { try { requireTenantId(); if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/compliance/etims/invoices/<id>/status'
```

