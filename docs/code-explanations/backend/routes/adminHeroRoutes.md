# Route module: adminHeroRoutes.js

**Source:** [server/routes/adminHeroRoutes.js](../../../../server/routes/adminHeroRoutes.js)

Observed mount prefixes include `/api/admin/hero`, `/api/admin/hero/:id`.

## Router-wide middleware

- `router.use(resolveTenant, protect, contentManagerMiddleware);`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET / → `/api/admin/hero`

Declared at source line 9. Route handler pipeline names: `listHeroSlides`.

```js
router.get("/", listHeroSlides)
```

- Imported handler/middleware `listHeroSlides`: [adminHeroController.js](../../../../server/controllers/adminHeroController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `listHeroSlides`

Handler starts at [controller line 15](../../../../server/controllers/adminHeroController.js#L15). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `HeroSlide.find`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/hero'
```

### POST / → `/api/admin/hero`

Declared at source line 10. Route handler pipeline names: `createHeroSlide`.

```js
router.post("/", createHeroSlide)
```

- Imported handler/middleware `createHeroSlide`: [adminHeroController.js](../../../../server/controllers/adminHeroController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `createHeroSlide`

Handler starts at [controller line 16](../../../../server/controllers/adminHeroController.js#L16). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `201`.
- JSON envelope keys observed: `success`.
- Database operations detected: `HeroSlide.create`.
- Input/validation source lines to inspect:
  - [Line 16](../../../../server/controllers/adminHeroController.js#L16): `async (req, res) => { const slide = await HeroSlide.create({ tenantId: tenant(), ...payload(req.body) }); return res.status(201).json({ success: true, slide }); }`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/admin/hero'
```

### PUT /:id → `/api/admin/hero/:id`

Declared at source line 11. Route handler pipeline names: `updateHeroSlide`.

```js
router.put("/:id", updateHeroSlide)
```

- Imported handler/middleware `updateHeroSlide`: [adminHeroController.js](../../../../server/controllers/adminHeroController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `updateHeroSlide`

Handler starts at [controller line 17](../../../../server/controllers/adminHeroController.js#L17). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Invalid hero slide id”; “Hero slide not found”.
- Database operations detected: `HeroSlide.findOneAndUpdate`.
- Input/validation source lines to inspect:
  - [Line 17](../../../../server/controllers/adminHeroController.js#L17): `async (req, res) => { const tenantId = tenant(); if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid hero slide `

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PUT 'http://localhost:5000/api/admin/hero/<id>'
```

### DELETE /:id → `/api/admin/hero/:id`

Declared at source line 12. Route handler pipeline names: `deleteHeroSlide`.

```js
router.delete("/:id", deleteHeroSlide)
```

- Imported handler/middleware `deleteHeroSlide`: [adminHeroController.js](../../../../server/controllers/adminHeroController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `deleteHeroSlide`

Handler starts at [controller line 18](../../../../server/controllers/adminHeroController.js#L18). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Hero slide not found”; “Hero slide deleted”.
- Database operations detected: none directly detected (may be delegated to service/helper).
- Input/validation source lines to inspect:
  - [Line 18](../../../../server/controllers/adminHeroController.js#L18): `async (req, res) => { const deleted = await HeroSlide.findOneAndDelete({ _id: req.params.id, tenantId: tenant() }); if (!deleted) return res.status(404).json({ success: f`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X DELETE 'http://localhost:5000/api/admin/hero/<id>'
```

