# Route module: taxRoutes.js

**Source:** [server/routes/taxRoutes.js](../../../../server/routes/taxRoutes.js)

Observed mount prefixes include `/api/admin/tax/rules`, `/api/admin/tax/rules/initialize`, `/api/admin/tax/rules/:code`, `/api/admin/tax/calculate`.

## Router-wide middleware

- `router.use(resolveTenant, protect);`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET /rules → `/api/admin/tax/rules`

Declared at source line 9. Route handler pipeline names: `authorize`, `listTaxRules`.

```js
router.get("/rules", authorize("finance.view"), listTaxRules)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `listTaxRules`: [taxController.js](../../../../server/controllers/taxController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `listTaxRules`

Handler starts at [controller line 7](../../../../server/controllers/taxController.js#L7). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `data`.
- Database operations detected: none directly detected (may be delegated to service/helper).

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/tax/rules'
```

### POST /rules/initialize → `/api/admin/tax/rules/initialize`

Declared at source line 10. Route handler pipeline names: `authorize`, `initializeTaxRules`.

```js
router.post("/rules/initialize", authorize("finance.manage"), initializeTaxRules)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `initializeTaxRules`: [taxController.js](../../../../server/controllers/taxController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `initializeTaxRules`

Handler starts at [controller line 17](../../../../server/controllers/taxController.js#L17). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `201`.
- JSON envelope keys observed: `success`, `data`.
- Database operations detected: none directly detected (may be delegated to service/helper).

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/admin/tax/rules/initialize'
```

### PUT /rules/:code → `/api/admin/tax/rules/:code`

Declared at source line 11. Route handler pipeline names: `authorize`.

```js
router.put("/rules/:code", authorize("finance.manage"), (req, res, next) => { req.body = { ...(req.body || {}), code: req.params.code }; return upsertTaxRule(req, res, next); })
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PUT 'http://localhost:5000/api/admin/tax/rules/<code>'
```

### POST /calculate → `/api/admin/tax/calculate`

Declared at source line 12. Route handler pipeline names: `authorize`, `calculateTaxQuote`.

```js
router.post("/calculate", authorize("finance.view"), calculateTaxQuote)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `calculateTaxQuote`: [taxController.js](../../../../server/controllers/taxController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `calculateTaxQuote`

Handler starts at [controller line 38](../../../../server/controllers/taxController.js#L38). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: none directly detected (may be delegated to service/helper).
- Input/validation source lines to inspect:
  - [Line 39](../../../../server/controllers/taxController.js#L39): `try { return res.json({ success: true, data: await calculateTenantTax(req.body || {}) }); }`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/admin/tax/calculate'
```

