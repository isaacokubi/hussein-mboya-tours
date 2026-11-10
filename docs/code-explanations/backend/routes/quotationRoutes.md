# Route module: quotationRoutes.js

**Source:** [server/routes/quotationRoutes.js](../../../../server/routes/quotationRoutes.js)

Observed mount prefixes include `/api/agents/quotes`, `/api/agent/quotes`, `/api/agents/quotes/:id`, `/api/agent/quotes/:id`, `/api/agents/quotes/:id/status`, `/api/agent/quotes/:id/status`.

## Router-wide middleware

- `router.use(resolveTenant);`
- `router.use(protect);`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### POST / → `/api/agents/quotes`, `/api/agent/quotes`

Declared at source line 43. Route handler pipeline names: `createQuotation`.

```js
router.post(
  "/",
  createQuotation
)
```

- Imported handler/middleware `createQuotation`: [quotationController.js](../../../../server/controllers/quotationController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `createQuotation`

Handler starts at [controller line 14](../../../../server/controllers/quotationController.js#L14). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `customer`, `tourPackage`, `items`, `discount`, `taxRate`, `notes`, `validUntil`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `400`, `201`.
- JSON envelope keys observed: `success`, `message`, `quotation`.
- Literal messages include: “Agent profile not found”; “Customer, tour package and quotation items are required.”; “Quotation created successfully.”.
- Database operations detected: `Agent.findOne`, `Quotation.create`, `Quotation.findById`.
- Input/validation source lines to inspect:
  - [Line 22](../../../../server/controllers/quotationController.js#L22): `return res.status(404).json({`
  - [Line 36](../../../../server/controllers/quotationController.js#L36): `} = req.body;`
  - [Line 39](../../../../server/controllers/quotationController.js#L39): `return res.status(400).json({`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/agents/quotes'
```

### GET / → `/api/agents/quotes`, `/api/agent/quotes`

Declared at source line 52. Route handler pipeline names: `getAgentQuotations`.

```js
router.get(
  "/",
  getAgentQuotations
)
```

- Imported handler/middleware `getAgentQuotations`: [quotationController.js](../../../../server/controllers/quotationController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getAgentQuotations`

Handler starts at [controller line 87](../../../../server/controllers/quotationController.js#L87). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `200`.
- JSON envelope keys observed: `success`, `message`, `count`.
- Literal messages include: “Agent profile not found”.
- Database operations detected: `Agent.findOne`, `Quotation.find`.
- Input/validation source lines to inspect:
  - [Line 94](../../../../server/controllers/quotationController.js#L94): `return res.status(404).json({`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/agents/quotes'
```

### GET /:id → `/api/agents/quotes/:id`, `/api/agent/quotes/:id`

Declared at source line 56. Route handler pipeline names: `getQuotationById`.

```js
router.get(
  "/:id",
  getQuotationById
)
```

- Imported handler/middleware `getQuotationById`: [quotationController.js](../../../../server/controllers/quotationController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getQuotationById`

Handler starts at [controller line 128](../../../../server/controllers/quotationController.js#L128). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `200`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Agent profile not found”; “Quotation not found”.
- Database operations detected: `Agent.findOne`, `Quotation.findOne`.
- Input/validation source lines to inspect:
  - [Line 135](../../../../server/controllers/quotationController.js#L135): `return res.status(404).json({`
  - [Line 142](../../../../server/controllers/quotationController.js#L142): `_id: req.params.id,`
  - [Line 149](../../../../server/controllers/quotationController.js#L149): `return res.status(404).json({`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/agents/quotes/<id>'
```

### PATCH /:id/status → `/api/agents/quotes/:id/status`, `/api/agent/quotes/:id/status`

Declared at source line 65. Route handler pipeline names: `updateQuotationStatus`.

```js
router.patch(
  "/:id/status",
  updateQuotationStatus
)
```

- Imported handler/middleware `updateQuotationStatus`: [quotationController.js](../../../../server/controllers/quotationController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `updateQuotationStatus`

Handler starts at [controller line 173](../../../../server/controllers/quotationController.js#L173). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `status`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `400`, `200`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Agent profile not found”; “Invalid quotation status.”; “Quotation not found.”; “Quotation status updated successfully.”.
- Database operations detected: `Agent.findOne`, `Quotation.findOneAndUpdate`.
- Input/validation source lines to inspect:
  - [Line 180](../../../../server/controllers/quotationController.js#L180): `return res.status(404).json({`
  - [Line 186](../../../../server/controllers/quotationController.js#L186): `const { status } = req.body;`
  - [Line 197](../../../../server/controllers/quotationController.js#L197): `return res.status(400).json({`
  - [Line 205](../../../../server/controllers/quotationController.js#L205): `_id: req.params.id,`
  - [Line 220](../../../../server/controllers/quotationController.js#L220): `return res.status(404).json({`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PATCH 'http://localhost:5000/api/agents/quotes/<id>/status'
```

