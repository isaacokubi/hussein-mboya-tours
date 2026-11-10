# Route module: adminGalleryRoutes.js

**Source:** [server/routes/adminGalleryRoutes.js](../../../../server/routes/adminGalleryRoutes.js)

Observed mount prefixes include `/api/admin/gallery/upload`, `/api/admin/gallery`, `/api/admin/gallery/:id`.

## Router-wide middleware

- `router.use(resolveTenant, protect, contentManagerMiddleware);`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### POST /upload → `/api/admin/gallery/upload`

Declared at source line 17. Route handler pipeline names: `uploadSingle`, `uploadGalleryImage`.

```js
router.post("/upload", uploadSingle("image"), uploadGalleryImage)
```

- Imported handler/middleware `uploadSingle`: [uploadMiddleware.js](../../../../server/middleware/uploadMiddleware.js)
- Imported handler/middleware `uploadGalleryImage`: [adminGalleryController.js](../../../../server/controllers/adminGalleryController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `uploadGalleryImage`

Handler starts at [controller line 15](../../../../server/controllers/adminGalleryController.js#L15). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Please upload an image”.
- Database operations detected: none directly detected (may be delegated to service/helper).
- Input/validation source lines to inspect:
  - [Line 17](../../../../server/controllers/adminGalleryController.js#L17): `if (!req.file) return res.status(400).json({ success: false, message: "Please upload an image" });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/admin/gallery/upload'
```

### GET / → `/api/admin/gallery`

Declared at source line 18. Route handler pipeline names: `getAdminGallery`.

```js
router.get("/", getAdminGallery)
```

- Imported handler/middleware `getAdminGallery`: [adminGalleryController.js](../../../../server/controllers/adminGalleryController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getAdminGallery`

Handler starts at [controller line 5](../../../../server/controllers/adminGalleryController.js#L5). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `count`.
- Database operations detected: `Gallery.find`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/gallery'
```

### POST / → `/api/admin/gallery`

Declared at source line 19. Route handler pipeline names: `createAdminGallery`.

```js
router.post("/", createAdminGallery)
```

- Imported handler/middleware `createAdminGallery`: [adminGalleryController.js](../../../../server/controllers/adminGalleryController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `createAdminGallery`

Handler starts at [controller line 24](../../../../server/controllers/adminGalleryController.js#L24). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `title`, `category`, `featured`, `active`, `imageUrl`, `publicId`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `201`.
- JSON envelope keys observed: `success`, `message`, `gallery`.
- Literal messages include: “Title is required”; “Image URL is required”.
- Database operations detected: `Gallery.create`.
- Input/validation source lines to inspect:
  - [Line 27](../../../../server/controllers/adminGalleryController.js#L27): `const { title, category, featured, active, imageUrl, publicId } = req.body;`
  - [Line 28](../../../../server/controllers/adminGalleryController.js#L28): `if (!title?.trim()) return res.status(400).json({ success: false, message: "Title is required" });`
  - [Line 29](../../../../server/controllers/adminGalleryController.js#L29): `if (!imageUrl?.trim()) return res.status(400).json({ success: false, message: "Image URL is required" });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/admin/gallery'
```

### PUT /:id → `/api/admin/gallery/:id`

Declared at source line 20. Route handler pipeline names: `updateAdminGallery`.

```js
router.put("/:id", updateAdminGallery)
```

- Imported handler/middleware `updateAdminGallery`: [adminGalleryController.js](../../../../server/controllers/adminGalleryController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `updateAdminGallery`

Handler starts at [controller line 45](../../../../server/controllers/adminGalleryController.js#L45). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `title`, `category`, `featured`, `active`, `imageUrl`, `publicId`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`, `gallery`.
- Literal messages include: “Gallery item not found”.
- Database operations detected: `Gallery.findOneAndUpdate`.
- Input/validation source lines to inspect:
  - [Line 48](../../../../server/controllers/adminGalleryController.js#L48): `const { title, category, featured, active, imageUrl, publicId } = req.body;`
  - [Line 58](../../../../server/controllers/adminGalleryController.js#L58): `mergeTenantFilter(req, { _id: req.params.id }),`
  - [Line 62](../../../../server/controllers/adminGalleryController.js#L62): `if (!item) return res.status(404).json({ success: false, message: "Gallery item not found" });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PUT 'http://localhost:5000/api/admin/gallery/<id>'
```

### DELETE /:id → `/api/admin/gallery/:id`

Declared at source line 21. Route handler pipeline names: `deleteAdminGallery`.

```js
router.delete("/:id", deleteAdminGallery)
```

- Imported handler/middleware `deleteAdminGallery`: [adminGalleryController.js](../../../../server/controllers/adminGalleryController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `deleteAdminGallery`

Handler starts at [controller line 69](../../../../server/controllers/adminGalleryController.js#L69). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Gallery item not found”; “Gallery item deleted”.
- Database operations detected: none directly detected (may be delegated to service/helper).
- Input/validation source lines to inspect:
  - [Line 72](../../../../server/controllers/adminGalleryController.js#L72): `const item = await Gallery.findOneAndDelete(mergeTenantFilter(req, { _id: req.params.id }));`
  - [Line 73](../../../../server/controllers/adminGalleryController.js#L73): `if (!item) return res.status(404).json({ success: false, message: "Gallery item not found" });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X DELETE 'http://localhost:5000/api/admin/gallery/<id>'
```

