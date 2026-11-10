# Route module: tenantRoutes.js

**Source:** [server/routes/tenantRoutes.js](../../../../server/routes/tenantRoutes.js)

Observed mount prefixes include `/api/tenants`, `/api/tenants/:id`.

## Router-wide middleware

- `router.use(resolveTenant);`
- `router.use(protect, superAdminOnly);`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET / → `/api/tenants`

Declared at source line 10. Route handler pipeline names: `listTenants`.

```js
router.get("/", listTenants)
```

- Imported handler/middleware `listTenants`: [tenantController.js](../../../../server/controllers/tenantController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `listTenants`

Handler starts at [controller line 22](../../../../server/controllers/tenantController.js#L22). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `data`.
- Database operations detected: `Organization.find`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/tenants'
```

### POST / → `/api/tenants`

Declared at source line 11. Route handler pipeline names: `createTenant`.

```js
router.post("/", createTenant)
```

- Imported handler/middleware `createTenant`: [tenantController.js](../../../../server/controllers/tenantController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `createTenant`

Handler starts at [controller line 29](../../../../server/controllers/tenantController.js#L29). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `admin`, `name`, `slug`, `country`, `timezone`, `currency`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `409`, `201`.
- JSON envelope keys observed: `success`, `message`, `tenant`, `admin`.
- Literal messages include: “Company name is required.”; “A valid company slug is required.”; “That company slug is already in use.”; “A user with the administrator email already exists.”.
- Database operations detected: `Organization.findOne`, `Organization.create`, `User.create`, `User.deleteOne`, `Organization.deleteOne`.
- Input/validation source lines to inspect:
  - [Line 33](../../../../server/controllers/tenantController.js#L33): `const { name, slug, country = "Kenya", timezone = "Africa/Nairobi", currency = "KES" } = req.body || {};`
  - [Line 34](../../../../server/controllers/tenantController.js#L34): `if (!name?.trim()) return res.status(400).json({ success: false, message: "Company name is required." });`
  - [Line 35](../../../../server/controllers/tenantController.js#L35): `const admin = validateAdmin(req.body?.admin);`
  - [Line 37](../../../../server/controllers/tenantController.js#L37): `if (!tenantSlug) return res.status(400).json({ success: false, message: "A valid company slug is required." });`
  - [Line 40](../../../../server/controllers/tenantController.js#L40): `if (duplicateSlug) return res.status(409).json({ success: false, message: "That company slug is already in use." });`
  - [Line 42](../../../../server/controllers/tenantController.js#L42): `return res.status(409).json({ success: false, message: "A user with the administrator email already exists." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/tenants'
```

### GET /:id → `/api/tenants/:id`

Declared at source line 12. Route handler pipeline names: `getTenant`.

```js
router.get("/:id", getTenant)
```

- Imported handler/middleware `getTenant`: [tenantController.js](../../../../server/controllers/tenantController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getTenant`

Handler starts at [controller line 68](../../../../server/controllers/tenantController.js#L68). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Invalid tenant ID.”; “Tenant not found.”.
- Database operations detected: `Organization.findOne`.
- Input/validation source lines to inspect:
  - [Line 70](../../../../server/controllers/tenantController.js#L70): `if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid tenant ID." });`
  - [Line 73](../../../../server/controllers/tenantController.js#L73): `_id:req.params.id`
  - [Line 76](../../../../server/controllers/tenantController.js#L76): `if (!tenant) return res.status(404).json({ success: false, message: "Tenant not found." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/tenants/<id>'
```

### PATCH /:id → `/api/tenants/:id`

Declared at source line 13. Route handler pipeline names: `updateTenant`.

```js
router.patch("/:id", updateTenant)
```

- Imported handler/middleware `updateTenant`: [tenantController.js](../../../../server/controllers/tenantController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `updateTenant`

Handler starts at [controller line 81](../../../../server/controllers/tenantController.js#L81). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Tenant not found.”.
- Database operations detected: `Organization.findOneAndUpdate`.
- Input/validation source lines to inspect:
  - [Line 84](../../../../server/controllers/tenantController.js#L84): `const updates = Object.fromEntries(Object.entries(req.body || {}).filter(([key]) => allowed.includes(key)));`
  - [Line 87](../../../../server/controllers/tenantController.js#L87): `_id:req.params.id`
  - [Line 89](../../../../server/controllers/tenantController.js#L89): `if (!tenant) return res.status(404).json({ success: false, message: "Tenant not found." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PATCH 'http://localhost:5000/api/tenants/<id>'
```

