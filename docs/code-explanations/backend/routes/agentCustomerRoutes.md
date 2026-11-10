# Route module: agentCustomerRoutes.js

**Source:** [server/routes/agentCustomerRoutes.js](../../../../server/routes/agentCustomerRoutes.js)

Observed mount prefixes include `/api/agents/customers`, `/api/agent/customers`, `/api/agents/customers/stats`, `/api/agent/customers/stats`, `/api/agents/customers/:id`, `/api/agent/customers/:id`.

## Router-wide middleware

- `router.use(resolveTenant);`
- `router.use(protect);`
- `router.use(agentMiddleware);`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET / → `/api/agents/customers`, `/api/agent/customers`

Declared at source line 23. Route handler pipeline names: `getCustomers`.

```js
router.get("/", getCustomers)
```

- Imported handler/middleware `getCustomers`: [agentCustomerController.js](../../../../server/controllers/agentCustomerController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getCustomers`

Handler starts at [controller line 136](../../../../server/controllers/agentCustomerController.js#L136). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `page`, `limit`, `status`, `search`.
- Literal HTTP statuses in handler: `404`, `200`.
- JSON envelope keys observed: `success`, `message`, `pages`, `count`.
- Literal messages include: “Agent profile not found.”.
- Database operations detected: `Customer.find`, `Customer.countDocuments`.
- Input/validation source lines to inspect:
  - [Line 142](../../../../server/controllers/agentCustomerController.js#L142): `return res.status(404).json({`
  - [Line 148](../../../../server/controllers/agentCustomerController.js#L148): `const page = Math.max(Number(req.query.page) || 1, 1);`
  - [Line 149](../../../../server/controllers/agentCustomerController.js#L149): `const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);`
  - [Line 157](../../../../server/controllers/agentCustomerController.js#L157): `if (req.query.status) {`
  - [Line 158](../../../../server/controllers/agentCustomerController.js#L158): `filter.status = req.query.status;`
  - [Line 161](../../../../server/controllers/agentCustomerController.js#L161): `if (req.query.search) {`
  - [Line 162](../../../../server/controllers/agentCustomerController.js#L162): `const search = String(req.query.search).trim();`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/agents/customers'
```

### GET /stats → `/api/agents/customers/stats`, `/api/agent/customers/stats`

Declared at source line 24. Route handler pipeline names: `getCustomerStats`.

```js
router.get("/stats", getCustomerStats)
```

- Imported handler/middleware `getCustomerStats`: [agentCustomerController.js](../../../../server/controllers/agentCustomerController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getCustomerStats`

Handler starts at [controller line 365](../../../../server/controllers/agentCustomerController.js#L365). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `200`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Agent profile not found.”.
- Database operations detected: `Customer.countDocuments`.
- Input/validation source lines to inspect:
  - [Line 370](../../../../server/controllers/agentCustomerController.js#L370): `return res.status(404).json({`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/agents/customers/stats'
```

### GET /:id → `/api/agents/customers/:id`, `/api/agent/customers/:id`

Declared at source line 25. Route handler pipeline names: `getCustomer`.

```js
router.get("/:id", getCustomer)
```

- Imported handler/middleware `getCustomer`: [agentCustomerController.js](../../../../server/controllers/agentCustomerController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getCustomer`

Handler starts at [controller line 203](../../../../server/controllers/agentCustomerController.js#L203). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Invalid customer ID.”; “Agent profile not found.”; “Customer not found.”.
- Database operations detected: `Customer.findOne`.
- Input/validation source lines to inspect:
  - [Line 206](../../../../server/controllers/agentCustomerController.js#L206): `if (!isValidId(req.params.id)) {`
  - [Line 207](../../../../server/controllers/agentCustomerController.js#L207): `return res.status(400).json({`
  - [Line 216](../../../../server/controllers/agentCustomerController.js#L216): `return res.status(404).json({`
  - [Line 224](../../../../server/controllers/agentCustomerController.js#L224): `_id: req.params.id,`
  - [Line 231](../../../../server/controllers/agentCustomerController.js#L231): `return res.status(404).json({`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/agents/customers/<id>'
```

### POST / → `/api/agents/customers`, `/api/agent/customers`

Declared at source line 26. Route handler pipeline names: `createCustomer`.

```js
router.post("/", createCustomer)
```

- Imported handler/middleware `createCustomer`: [agentCustomerController.js](../../../../server/controllers/agentCustomerController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `createCustomer`

Handler starts at [controller line 68](../../../../server/controllers/agentCustomerController.js#L68). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `400`, `409`, `201`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Agent profile not found.”; “First name and last name are required.”; “Phone number is required.”; “Customer already exists.”; “Customer created successfully.”.
- Database operations detected: `Customer.findOne`, `Customer.create`.
- Input/validation source lines to inspect:
  - [Line 74](../../../../server/controllers/agentCustomerController.js#L74): `return res.status(404).json({`
  - [Line 80](../../../../server/controllers/agentCustomerController.js#L80): `const customerData = normalizeCustomerInput(req.body);`
  - [Line 83](../../../../server/controllers/agentCustomerController.js#L83): `return res.status(400).json({`
  - [Line 90](../../../../server/controllers/agentCustomerController.js#L90): `return res.status(400).json({`
  - [Line 106](../../../../server/controllers/agentCustomerController.js#L106): `return res.status(409).json({`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/agents/customers'
```

### PUT /:id → `/api/agents/customers/:id`, `/api/agent/customers/:id`

Declared at source line 27. Route handler pipeline names: `updateCustomer`.

```js
router.put("/:id", updateCustomer)
```

- Imported handler/middleware `updateCustomer`: [agentCustomerController.js](../../../../server/controllers/agentCustomerController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `updateCustomer`

Handler starts at [controller line 252](../../../../server/controllers/agentCustomerController.js#L252). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Invalid customer ID.”; “Agent profile not found.”; “Customer not found.”; “Customer updated successfully.”.
- Database operations detected: `Customer.findOneAndUpdate`.
- Input/validation source lines to inspect:
  - [Line 254](../../../../server/controllers/agentCustomerController.js#L254): `if (!isValidId(req.params.id)) {`
  - [Line 255](../../../../server/controllers/agentCustomerController.js#L255): `return res.status(400).json({`
  - [Line 264](../../../../server/controllers/agentCustomerController.js#L264): `return res.status(404).json({`
  - [Line 270](../../../../server/controllers/agentCustomerController.js#L270): `const update = normalizeCustomerInput(req.body);`
  - [Line 275](../../../../server/controllers/agentCustomerController.js#L275): `_id: req.params.id,`
  - [Line 287](../../../../server/controllers/agentCustomerController.js#L287): `return res.status(404).json({`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PUT 'http://localhost:5000/api/agents/customers/<id>'
```

### DELETE /:id → `/api/agents/customers/:id`, `/api/agent/customers/:id`

Declared at source line 28. Route handler pipeline names: `deleteCustomer`.

```js
router.delete("/:id", deleteCustomer)
```

- Imported handler/middleware `deleteCustomer`: [agentCustomerController.js](../../../../server/controllers/agentCustomerController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `deleteCustomer`

Handler starts at [controller line 309](../../../../server/controllers/agentCustomerController.js#L309). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Invalid customer ID.”; “Agent profile not found.”; “Customer not found.”; “Customer deleted successfully.”.
- Database operations detected: `Customer.findOneAndUpdate`.
- Input/validation source lines to inspect:
  - [Line 311](../../../../server/controllers/agentCustomerController.js#L311): `if (!isValidId(req.params.id)) {`
  - [Line 312](../../../../server/controllers/agentCustomerController.js#L312): `return res.status(400).json({`
  - [Line 321](../../../../server/controllers/agentCustomerController.js#L321): `return res.status(404).json({`
  - [Line 329](../../../../server/controllers/agentCustomerController.js#L329): `_id: req.params.id,`
  - [Line 344](../../../../server/controllers/agentCustomerController.js#L344): `return res.status(404).json({`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X DELETE 'http://localhost:5000/api/agents/customers/<id>'
```

