# Route module: adminDestinationRoutes.js

**Source:** [server/routes/adminDestinationRoutes.js](../../../../server/routes/adminDestinationRoutes.js)

Observed mount prefixes include `/api/admin/destinations`, `/api/admin/destinations/:id`.

## Router-wide middleware

- `router.use(resolveTenant);`
- `router.use(protect);`
- `router.use(adminMiddleware);`
- `router.use(authorize("manage_destinations"));`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET / → `/api/admin/destinations`

Declared at source line 56. Route handler pipeline names: `getAdminDestinations`.

```js
router.get(
  "/",
  getAdminDestinations
)
```

- Imported handler/middleware `getAdminDestinations`: [adminDestinationController.js](../../../../server/controllers/adminDestinationController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getAdminDestinations`

Handler starts at [controller line 111](../../../../server/controllers/adminDestinationController.js#L111). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: `success`, `count`.
- Database operations detected: `Destination.find`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/destinations'
```

### GET /:id → `/api/admin/destinations/:id`

Declared at source line 65. Route handler pipeline names: `getDestinationById`.

```js
router.get(
  "/:id",
  getDestinationById
)
```

- Imported handler/middleware `getDestinationById`: [adminDestinationController.js](../../../../server/controllers/adminDestinationController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getDestinationById`

Handler starts at [controller line 224](../../../../server/controllers/adminDestinationController.js#L224). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`.
- JSON envelope keys observed: `success`, `message`, `code`, `data`.
- Literal messages include: “Invalid destination ID.”; “Destination not found in the current tenant.”.
- Database operations detected: `Destination.findOne`.
- Input/validation source lines to inspect:
  - [Line 228](../../../../server/controllers/adminDestinationController.js#L228): `if (!mongoose.Types.ObjectId.isValid(req.params.id)) {`
  - [Line 229](../../../../server/controllers/adminDestinationController.js#L229): `return res.status(400).json({ success: false, message: "Invalid destination ID." });`
  - [Line 232](../../../../server/controllers/adminDestinationController.js#L232): `const destination = await Destination.findOne({ _id: req.params.id, tenantId }).lean();`
  - [Line 234](../../../../server/controllers/adminDestinationController.js#L234): `return res.status(404).json({`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/destinations/<id>'
```

### POST / → `/api/admin/destinations`

Declared at source line 77. Route handler pipeline names: `createDestination`.

```js
router.post(
  "/",
  upload.array("images", 10),
  createDestination
)
```

- Imported handler/middleware `createDestination`: [adminDestinationController.js](../../../../server/controllers/adminDestinationController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `createDestination`

Handler starts at [controller line 9](../../../../server/controllers/adminDestinationController.js#L9). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `name`, `slug`, `description`, `country`, `city`, `featured`, `seo`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `409`, `201`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Name and slug are required.”; “Destination already exists in this tenant.”; “Invalid SEO data.”; “Destination created successfully.”.
- Database operations detected: `Destination.findOne`, `Destination.create`.
- Input/validation source lines to inspect:
  - [Line 12](../../../../server/controllers/adminDestinationController.js#L12): `const { name, slug, description, country, city, featured, seo } = req.body;`
  - [Line 15](../../../../server/controllers/adminDestinationController.js#L15): `return res.status(400).json({ success: false, message: "Name and slug are required." });`
  - [Line 30](../../../../server/controllers/adminDestinationController.js#L30): `return res.status(409).json({ success: false, message: "Destination already exists in this tenant." });`
  - [Line 38](../../../../server/controllers/adminDestinationController.js#L38): `return res.status(400).json({ success: false, message: "Invalid SEO data." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/admin/destinations'
```

### PUT /:id → `/api/admin/destinations/:id`

Declared at source line 90. Route handler pipeline names: `updateDestination`.

```js
router.put(
  "/:id",
  upload.array("images", 10),
  updateDestination
)
```

- Imported handler/middleware `updateDestination`: [adminDestinationController.js](../../../../server/controllers/adminDestinationController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `updateDestination`

Handler starts at [controller line 120](../../../../server/controllers/adminDestinationController.js#L120). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `name`, `slug`, `description`, `country`, `city`, `featured`, `status`, `seo`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `409`, `200`.
- JSON envelope keys observed: `success`, `message`, `code`.
- Literal messages include: “Invalid destination ID.”; “Destination not found in the current tenant.”; “Slug cannot be empty.”; “Another destination already uses this slug in the current tenant.”; “Invalid destination status.”; “Invalid SEO data.”; “Destination updated successfully.”.
- Database operations detected: `Destination.findOne`.
- Input/validation source lines to inspect:
  - [Line 124](../../../../server/controllers/adminDestinationController.js#L124): `if (!mongoose.Types.ObjectId.isValid(req.params.id)) {`
  - [Line 125](../../../../server/controllers/adminDestinationController.js#L125): `return res.status(400).json({ success: false, message: "Invalid destination ID." });`
  - [Line 128](../../../../server/controllers/adminDestinationController.js#L128): `const destination = await Destination.findOne({ _id: req.params.id, tenantId });`
  - [Line 130](../../../../server/controllers/adminDestinationController.js#L130): `return res.status(404).json({`
  - [Line 137](../../../../server/controllers/adminDestinationController.js#L137): `if (req.body.name !== undefined) destination.name = String(req.body.name).trim();`
  - [Line 139](../../../../server/controllers/adminDestinationController.js#L139): `if (req.body.slug !== undefined) {`
  - [Line 140](../../../../server/controllers/adminDestinationController.js#L140): `const normalizedSlug = String(req.body.slug).trim().toLowerCase();`
  - [Line 141](../../../../server/controllers/adminDestinationController.js#L141): `if (!normalizedSlug) return res.status(400).json({ success: false, message: "Slug cannot be empty." });`
  - [Line 151](../../../../server/controllers/adminDestinationController.js#L151): `return res.status(409).json({`
  - [Line 160](../../../../server/controllers/adminDestinationController.js#L160): `if (req.body.description !== undefined) destination.description = req.body.description;`
  - [Line 161](../../../../server/controllers/adminDestinationController.js#L161): `if (req.body.country !== undefined) destination.country = req.body.country;`
  - [Line 162](../../../../server/controllers/adminDestinationController.js#L162): `if (req.body.city !== undefined) destination.city = req.body.city;`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PUT 'http://localhost:5000/api/admin/destinations/<id>'
```

### DELETE /:id → `/api/admin/destinations/:id`

Declared at source line 100. Route handler pipeline names: `deleteDestination`.

```js
router.delete(
  "/:id",
  deleteDestination
)
```

- Imported handler/middleware `deleteDestination`: [adminDestinationController.js](../../../../server/controllers/adminDestinationController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `deleteDestination`

Handler starts at [controller line 196](../../../../server/controllers/adminDestinationController.js#L196). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `503`, `200`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Invalid destination ID.”; “Destination not found.”; “Destination images cannot be deleted because Cloudinary is not configured.”; “Destination deleted successfully.”.
- Database operations detected: `Destination.findOne`.
- Input/validation source lines to inspect:
  - [Line 198](../../../../server/controllers/adminDestinationController.js#L198): `if (!mongoose.Types.ObjectId.isValid(req.params.id)) {`
  - [Line 199](../../../../server/controllers/adminDestinationController.js#L199): `return res.status(400).json({ success: false, message: "Invalid destination ID." });`
  - [Line 202](../../../../server/controllers/adminDestinationController.js#L202): `const destination = await Destination.findOne(mergeTenantFilter(req, { _id: req.params.id }));`
  - [Line 203](../../../../server/controllers/adminDestinationController.js#L203): `if (!destination) return res.status(404).json({ success: false, message: "Destination not found." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X DELETE 'http://localhost:5000/api/admin/destinations/<id>'
```

