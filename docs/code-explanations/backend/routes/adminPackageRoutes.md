# Route module: adminPackageRoutes.js

**Source:** [server/routes/adminPackageRoutes.js](../../../../server/routes/adminPackageRoutes.js)

Observed mount prefixes include `/api/admin/packages`, `/api/admin/packages/:id`.

## Router-wide middleware

- `router.use(resolveTenant, protect, adminMiddleware, authorize("tour.manage"));`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET / → `/api/admin/packages`

Declared at source line 10. Route handler pipeline names: `listAdminPackages`.

```js
router.get("/", listAdminPackages)
```

- Imported handler/middleware `listAdminPackages`: [adminPackageController.js](../../../../server/controllers/adminPackageController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `listAdminPackages`

Handler starts at [controller line 55](../../../../server/controllers/adminPackageController.js#L55). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `count`.
- Database operations detected: `TourPackage.find`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/packages'
```

### POST / → `/api/admin/packages`

Declared at source line 11. Route handler pipeline names: `createAdminPackage`.

```js
router.post("/", createAdminPackage)
```

- Imported handler/middleware `createAdminPackage`: [adminPackageController.js](../../../../server/controllers/adminPackageController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `createAdminPackage`

Handler starts at [controller line 79](../../../../server/controllers/adminPackageController.js#L79). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `201`, `409`.
- JSON envelope keys observed: `success`, `package`, `message`.
- Literal messages include: “A package with this slug already exists in this tenant.”.
- Database operations detected: `TourPackage.create`.
- Input/validation source lines to inspect:
  - [Line 82](../../../../server/controllers/adminPackageController.js#L82): `const payload = packagePayload(req.body);`
  - [Line 86](../../../../server/controllers/adminPackageController.js#L86): `if (error?.code === 11000) return res.status(409).json({ success: false, message: "A package with this slug already exists in this tenant." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/admin/packages'
```

### PUT /:id → `/api/admin/packages/:id`

Declared at source line 12. Route handler pipeline names: `updateAdminPackage`.

```js
router.put("/:id", updateAdminPackage)
```

- Imported handler/middleware `updateAdminPackage`: [adminPackageController.js](../../../../server/controllers/adminPackageController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `updateAdminPackage`

Handler starts at [controller line 91](../../../../server/controllers/adminPackageController.js#L91). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `slug`, `status`, `published`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `409`.
- JSON envelope keys observed: `success`, `message`, `package`.
- Literal messages include: “Invalid package ID.”; “Package not found.”; “Invalid package status.”; “A package with this slug already exists in this tenant.”.
- Database operations detected: `TourPackage.findOne`, `TourPackage.findOneAndUpdate`.
- Input/validation source lines to inspect:
  - [Line 94](../../../../server/controllers/adminPackageController.js#L94): `if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid package ID." });`
  - [Line 95](../../../../server/controllers/adminPackageController.js#L95): `const existing = await TourPackage.findOne(mergeTenantFilter(req, { _id: req.params.id, isDeleted: { $ne: true } }));`
  - [Line 96](../../../../server/controllers/adminPackageController.js#L96): `if (!existing) return res.status(404).json({ success: false, message: "Package not found." });`
  - [Line 97](../../../../server/controllers/adminPackageController.js#L97): `const payload = packagePayload(req.body, existing);`
  - [Line 98](../../../../server/controllers/adminPackageController.js#L98): `if (req.body?.slug !== undefined) payload.slug = slugify(req.body.slug);`
  - [Line 99](../../../../server/controllers/adminPackageController.js#L99): `if (req.body?.status !== undefined) {`
  - [Line 100](../../../../server/controllers/adminPackageController.js#L100): `if (!allowedStatuses.has(String(req.body.status))) return res.status(400).json({ success: false, message: "Invalid package status." });`
  - [Line 101](../../../../server/controllers/adminPackageController.js#L101): `payload.status = req.body.status;`
  - [Line 103](../../../../server/controllers/adminPackageController.js#L103): `if (req.body?.published !== undefined) payload.published = req.body.published === true;`
  - [Line 110](../../../../server/controllers/adminPackageController.js#L110): `if (error?.code === 11000) return res.status(409).json({ success: false, message: "A package with this slug already exists in this tenant." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PUT 'http://localhost:5000/api/admin/packages/<id>'
```

### DELETE /:id → `/api/admin/packages/:id`

Declared at source line 13. Route handler pipeline names: `deleteAdminPackage`.

```js
router.delete("/:id", deleteAdminPackage)
```

- Imported handler/middleware `deleteAdminPackage`: [adminPackageController.js](../../../../server/controllers/adminPackageController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `deleteAdminPackage`

Handler starts at [controller line 115](../../../../server/controllers/adminPackageController.js#L115). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`.
- JSON envelope keys observed: `success`, `message`, `deleted`, `packageId`.
- Literal messages include: “Invalid package ID.”; “Package not found.”.
- Database operations detected: `TourPackage.findOneAndUpdate`.
- Input/validation source lines to inspect:
  - [Line 118](../../../../server/controllers/adminPackageController.js#L118): `if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid package ID." });`
  - [Line 120](../../../../server/controllers/adminPackageController.js#L120): `mergeTenantFilter(req, { _id: req.params.id, isDeleted: { $ne: true } }),`
  - [Line 123](../../../../server/controllers/adminPackageController.js#L123): `if (!deleted) return res.status(404).json({ success: false, message: "Package not found." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X DELETE 'http://localhost:5000/api/admin/packages/<id>'
```

