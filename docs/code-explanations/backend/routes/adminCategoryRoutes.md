# Route module: adminCategoryRoutes.js

**Source:** [server/routes/adminCategoryRoutes.js](../../../../server/routes/adminCategoryRoutes.js)

Observed mount prefixes include `/api/admin/experiences`, `/api/admin/experiences/:id`.

## Router-wide middleware

- `router.use(resolveTenant, protect, contentManagerMiddleware);`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET / → `/api/admin/experiences`

Declared at source line 15. Route handler pipeline names: `getAdminCategories`.

```js
router.get("/", getAdminCategories)
```

- Imported handler/middleware `getAdminCategories`: [categoryController.js](../../../../server/controllers/categoryController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getAdminCategories`

Handler starts at [controller line 16](../../../../server/controllers/categoryController.js#L16). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`.
- Database operations detected: `TourCategory.find`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/experiences'
```

### POST / → `/api/admin/experiences`

Declared at source line 16. Route handler pipeline names: `createCategory`.

```js
router.post("/", createCategory)
```

- Imported handler/middleware `createCategory`: [categoryController.js](../../../../server/controllers/categoryController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `createCategory`

Handler starts at [controller line 33](../../../../server/controllers/categoryController.js#L33). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `name`, `slug`, `icon`, `description`, `image`, `active`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `201`, `409`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Name is required”; “Description is required”; “A travel experience with this slug already exists”.
- Database operations detected: `TourCategory.create`.
- Input/validation source lines to inspect:
  - [Line 36](../../../../server/controllers/categoryController.js#L36): `const { name, slug, icon, description, image, active } = req.body;`
  - [Line 37](../../../../server/controllers/categoryController.js#L37): `if (!name?.trim()) return res.status(400).json({ success: false, message: "Name is required" });`
  - [Line 38](../../../../server/controllers/categoryController.js#L38): `if (!description?.trim()) return res.status(400).json({ success: false, message: "Description is required" });`
  - [Line 42](../../../../server/controllers/categoryController.js#L42): `} catch (error) { if (error?.code === 11000) return res.status(409).json({ success: false, message: "A travel experience with this slug already exists" }); next(error); }`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/admin/experiences'
```

### PUT /:id → `/api/admin/experiences/:id`

Declared at source line 17. Route handler pipeline names: `updateCategory`.

```js
router.put("/:id", updateCategory)
```

- Imported handler/middleware `updateCategory`: [categoryController.js](../../../../server/controllers/categoryController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `updateCategory`

Handler starts at [controller line 45](../../../../server/controllers/categoryController.js#L45). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `name`, `slug`, `icon`, `description`, `image`, `active`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `409`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Travel experience not found”; “A travel experience with this slug already exists”.
- Database operations detected: `TourCategory.findOneAndUpdate`.
- Input/validation source lines to inspect:
  - [Line 48](../../../../server/controllers/categoryController.js#L48): `const { name, slug, icon, description, image, active } = req.body;`
  - [Line 57](../../../../server/controllers/categoryController.js#L57): `const category = await TourCategory.findOneAndUpdate(mergeTenantFilter(req, { _id: req.params.id }), update, { new: true, runValidators: true });`
  - [Line 58](../../../../server/controllers/categoryController.js#L58): `if (!category) return res.status(404).json({ success: false, message: "Travel experience not found" });`
  - [Line 60](../../../../server/controllers/categoryController.js#L60): `} catch (error) { if (error?.code === 11000) return res.status(409).json({ success: false, message: "A travel experience with this slug already exists" }); next(error); }`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PUT 'http://localhost:5000/api/admin/experiences/<id>'
```

### DELETE /:id → `/api/admin/experiences/:id`

Declared at source line 18. Route handler pipeline names: `deleteCategory`.

```js
router.delete("/:id", deleteCategory)
```

- Imported handler/middleware `deleteCategory`: [categoryController.js](../../../../server/controllers/categoryController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `deleteCategory`

Handler starts at [controller line 63](../../../../server/controllers/categoryController.js#L63). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Travel experience not found”; “Travel experience deleted”.
- Database operations detected: none directly detected (may be delegated to service/helper).
- Input/validation source lines to inspect:
  - [Line 64](../../../../server/controllers/categoryController.js#L64): `try { requireTenantId(); const category = await TourCategory.findOneAndDelete(mergeTenantFilter(req, { _id: req.params.id })); if (!category) return res.status(404).json(`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X DELETE 'http://localhost:5000/api/admin/experiences/<id>'
```

