# Route module: travelOperationsRoutes.js

**Source:** [server/routes/travelOperationsRoutes.js](../../../../server/routes/travelOperationsRoutes.js)

Observed mount prefixes include `/api/operations`, `/api/operations/:id`, `/api/operations/rules/list`, `/api/operations/rules`, `/api/operations/rules/:id`.

## Router-wide middleware

- `router.use(protect);`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET / → `/api/operations`

Declared at source line 7. Route handler pipeline names: `listOperations`.

```js
router.get("/", listOperations)
```

- Imported handler/middleware `listOperations`: [travelOperationsController.js](../../../../server/controllers/travelOperationsController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `listOperations`

Handler starts at [controller line 8](../../../../server/controllers/travelOperationsController.js#L8). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `OperationalAsset.find`.
- Input/validation source lines to inspect:
  - [Line 11](../../../../server/controllers/travelOperationsController.js#L11): `for (const key of ["type", "status", "bookingId", "tourId", "assignedTo"]) if (req.query[key]) filter[key] = req.query[key];`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/operations'
```

### POST / → `/api/operations`

Declared at source line 8. Route handler pipeline names: `managerOnly`, `createOperation`.

```js
router.post("/", managerOnly, createOperation)
```

- Imported handler/middleware `managerOnly`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `createOperation`: [travelOperationsController.js](../../../../server/controllers/travelOperationsController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `createOperation`

Handler starts at [controller line 16](../../../../server/controllers/travelOperationsController.js#L16). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `type`, `name`, `startAt`, `endAt`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `201`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “Valid type and name are required.”; “End time must be after start time.”.
- Database operations detected: none directly detected (may be delegated to service/helper).
- Input/validation source lines to inspect:
  - [Line 18](../../../../server/controllers/travelOperationsController.js#L18): `if (!TYPES.has(req.body.type) || !req.body.name) return res.status(400).json({ success: false, message: "Valid type and name are required." });`
  - [Line 19](../../../../server/controllers/travelOperationsController.js#L19): `if (req.body.startAt && req.body.endAt && new Date(req.body.endAt) <= new Date(req.body.startAt)) return res.status(400).json({ success: false, message: "End time must be`
  - [Line 20](../../../../server/controllers/travelOperationsController.js#L20): `const item = await createScheduledOperation({ ...req.body, tenantId: req.user.tenantId, createdBy: req.user._id });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/operations'
```

### PATCH /:id → `/api/operations/:id`

Declared at source line 9. Route handler pipeline names: `managerOnly`, `updateOperation`.

```js
router.patch("/:id", managerOnly, updateOperation)
```

- Imported handler/middleware `managerOnly`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `updateOperation`: [travelOperationsController.js](../../../../server/controllers/travelOperationsController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `updateOperation`

Handler starts at [controller line 25](../../../../server/controllers/travelOperationsController.js#L25). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “Operation not found.”.
- Database operations detected: `OperationalAsset.findOne`.
- Input/validation source lines to inspect:
  - [Line 27](../../../../server/controllers/travelOperationsController.js#L27): `const item = await OperationalAsset.findOne({ _id: req.params.id, tenantId: req.user.tenantId });`
  - [Line 28](../../../../server/controllers/travelOperationsController.js#L28): `if (!item) return res.status(404).json({ success: false, message: "Operation not found." });`
  - [Line 30](../../../../server/controllers/travelOperationsController.js#L30): `const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PATCH 'http://localhost:5000/api/operations/<id>'
```

### DELETE /:id → `/api/operations/:id`

Declared at source line 10. Route handler pipeline names: `managerOnly`, `deleteOperation`.

```js
router.delete("/:id", managerOnly, deleteOperation)
```

- Imported handler/middleware `managerOnly`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `deleteOperation`: [travelOperationsController.js](../../../../server/controllers/travelOperationsController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `deleteOperation`

Handler starts at [controller line 37](../../../../server/controllers/travelOperationsController.js#L37). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Operation not found.”.
- Database operations detected: `OperationalAsset.deleteOne`.
- Input/validation source lines to inspect:
  - [Line 39](../../../../server/controllers/travelOperationsController.js#L39): `const result = await OperationalAsset.deleteOne({ _id: req.params.id, tenantId: req.user.tenantId });`
  - [Line 40](../../../../server/controllers/travelOperationsController.js#L40): `if (!result.deletedCount) return res.status(404).json({ success: false, message: "Operation not found." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X DELETE 'http://localhost:5000/api/operations/<id>'
```

### GET /rules/list → `/api/operations/rules/list`

Declared at source line 11. Route handler pipeline names: `listRules`.

```js
router.get("/rules/list", listRules)
```

- Imported handler/middleware `listRules`: [travelOperationsController.js](../../../../server/controllers/travelOperationsController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `listRules`

Handler starts at [controller line 45](../../../../server/controllers/travelOperationsController.js#L45). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `type`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `TravelCommercialRule.find`.
- Input/validation source lines to inspect:
  - [Line 48](../../../../server/controllers/travelOperationsController.js#L48): `if (req.query.type && RULES.has(req.query.type)) filter.type = req.query.type;`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/operations/rules/list'
```

### POST /rules → `/api/operations/rules`

Declared at source line 12. Route handler pipeline names: `managerOnly`, `createRule`.

```js
router.post("/rules", managerOnly, createRule)
```

- Imported handler/middleware `managerOnly`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `createRule`: [travelOperationsController.js](../../../../server/controllers/travelOperationsController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `createRule`

Handler starts at [controller line 53](../../../../server/controllers/travelOperationsController.js#L53). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `type`, `name`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `201`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “Valid rule type and name are required.”.
- Database operations detected: `TravelCommercialRule.create`.
- Input/validation source lines to inspect:
  - [Line 55](../../../../server/controllers/travelOperationsController.js#L55): `if (!RULES.has(req.body.type) || !req.body.name) return res.status(400).json({ success: false, message: "Valid rule type and name are required." });`
  - [Line 56](../../../../server/controllers/travelOperationsController.js#L56): `const rule = await TravelCommercialRule.create({ ...req.body, tenantId: req.user.tenantId });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/operations/rules'
```

### PATCH /rules/:id → `/api/operations/rules/:id`

Declared at source line 13. Route handler pipeline names: `managerOnly`, `updateRule`.

```js
router.patch("/rules/:id", managerOnly, updateRule)
```

- Imported handler/middleware `managerOnly`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `updateRule`: [travelOperationsController.js](../../../../server/controllers/travelOperationsController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `updateRule`

Handler starts at [controller line 61](../../../../server/controllers/travelOperationsController.js#L61). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “Rule not found.”.
- Database operations detected: `TravelCommercialRule.findOneAndUpdate`.
- Input/validation source lines to inspect:
  - [Line 63](../../../../server/controllers/travelOperationsController.js#L63): `const rule = await TravelCommercialRule.findOneAndUpdate({ _id: req.params.id, tenantId: req.user.tenantId }, { $set: req.body }, { new: true, runValidators: true });`
  - [Line 64](../../../../server/controllers/travelOperationsController.js#L64): `if (!rule) return res.status(404).json({ success: false, message: "Rule not found." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PATCH 'http://localhost:5000/api/operations/rules/<id>'
```

### DELETE /rules/:id → `/api/operations/rules/:id`

Declared at source line 14. Route handler pipeline names: `managerOnly`, `deleteRule`.

```js
router.delete("/rules/:id", managerOnly, deleteRule)
```

- Imported handler/middleware `managerOnly`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `deleteRule`: [travelOperationsController.js](../../../../server/controllers/travelOperationsController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `deleteRule`

Handler starts at [controller line 69](../../../../server/controllers/travelOperationsController.js#L69). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Rule not found.”.
- Database operations detected: `TravelCommercialRule.deleteOne`.
- Input/validation source lines to inspect:
  - [Line 71](../../../../server/controllers/travelOperationsController.js#L71): `const result = await TravelCommercialRule.deleteOne({ _id: req.params.id, tenantId: req.user.tenantId });`
  - [Line 72](../../../../server/controllers/travelOperationsController.js#L72): `if (!result.deletedCount) return res.status(404).json({ success: false, message: "Rule not found." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X DELETE 'http://localhost:5000/api/operations/rules/<id>'
```

