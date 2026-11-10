# Route module: operationalAssetRoutes.js

**Source:** [server/routes/operationalAssetRoutes.js](../../../../server/routes/operationalAssetRoutes.js)

Observed mount prefixes include `/api/operational-assets`, `/api/operational-assets/:id`.

## Router-wide middleware

- `router.use(protect);`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET / → `/api/operational-assets`

Declared at source line 7. Route handler pipeline names: `listOperationalAssets`.

```js
router.get("/", listOperationalAssets)
```

- Imported handler/middleware `listOperationalAssets`: [operationalAssetController.js](../../../../server/controllers/operationalAssetController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `listOperationalAssets`

Handler starts at [controller line 5](../../../../server/controllers/operationalAssetController.js#L5). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `type`, `status`, `bookingId`, `tourId`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `data`.
- Database operations detected: `OperationalAsset.find`.
- Input/validation source lines to inspect:
  - [Line 7](../../../../server/controllers/operationalAssetController.js#L7): `const { type, status, bookingId, tourId } = req.query;`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/operational-assets'
```

### POST / → `/api/operational-assets`

Declared at source line 8. Route handler pipeline names: `createOperationalAsset`.

```js
router.post("/", createOperationalAsset)
```

- Imported handler/middleware `createOperationalAsset`: [operationalAssetController.js](../../../../server/controllers/operationalAssetController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `createOperationalAsset`

Handler starts at [controller line 18](../../../../server/controllers/operationalAssetController.js#L18). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `type`, `name`, `code`, `status`, `bookingId`, `tourId`, `assignedTo`, `startAt`, `endAt`, `metadata`, `notes`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `201`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “type and name are required”; “endAt must be after startAt”.
- Database operations detected: `OperationalAsset.create`.
- Input/validation source lines to inspect:
  - [Line 20](../../../../server/controllers/operationalAssetController.js#L20): `const { type, name, code, status, bookingId, tourId, assignedTo, startAt, endAt, metadata, notes } = req.body;`
  - [Line 21](../../../../server/controllers/operationalAssetController.js#L21): `if (!allowedTypes.has(type) || !name) return res.status(400).json({ success: false, message: "type and name are required" });`
  - [Line 22](../../../../server/controllers/operationalAssetController.js#L22): `if (startAt && endAt && new Date(endAt) <= new Date(startAt)) return res.status(400).json({ success: false, message: "endAt must be after startAt" });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/operational-assets'
```

### PATCH /:id → `/api/operational-assets/:id`

Declared at source line 9. Route handler pipeline names: `updateOperationalAsset`.

```js
router.patch("/:id", updateOperationalAsset)
```

- Imported handler/middleware `updateOperationalAsset`: [operationalAssetController.js](../../../../server/controllers/operationalAssetController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `updateOperationalAsset`

Handler starts at [controller line 28](../../../../server/controllers/operationalAssetController.js#L28). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `400`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “Operational record not found”; “endAt must be after startAt”.
- Database operations detected: `OperationalAsset.findOne`.
- Input/validation source lines to inspect:
  - [Line 30](../../../../server/controllers/operationalAssetController.js#L30): `const item = await OperationalAsset.findOne({ _id: req.params.id, tenantId: req.user.tenantId });`
  - [Line 31](../../../../server/controllers/operationalAssetController.js#L31): `if (!item) return res.status(404).json({ success: false, message: "Operational record not found" });`
  - [Line 33](../../../../server/controllers/operationalAssetController.js#L33): `for (const key of allowed) if (req.body[key] !== undefined) item[key] = req.body[key];`
  - [Line 34](../../../../server/controllers/operationalAssetController.js#L34): `if (item.startAt && item.endAt && item.endAt <= item.startAt) return res.status(400).json({ success: false, message: "endAt must be after startAt" });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PATCH 'http://localhost:5000/api/operational-assets/<id>'
```

### DELETE /:id → `/api/operational-assets/:id`

Declared at source line 10. Route handler pipeline names: `deleteOperationalAsset`.

```js
router.delete("/:id", deleteOperationalAsset)
```

- Imported handler/middleware `deleteOperationalAsset`: [operationalAssetController.js](../../../../server/controllers/operationalAssetController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `deleteOperationalAsset`

Handler starts at [controller line 41](../../../../server/controllers/operationalAssetController.js#L41). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Operational record not found”.
- Database operations detected: `OperationalAsset.deleteOne`.
- Input/validation source lines to inspect:
  - [Line 43](../../../../server/controllers/operationalAssetController.js#L43): `const result = await OperationalAsset.deleteOne({ _id: req.params.id, tenantId: req.user.tenantId });`
  - [Line 44](../../../../server/controllers/operationalAssetController.js#L44): `if (!result.deletedCount) return res.status(404).json({ success: false, message: "Operational record not found" });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X DELETE 'http://localhost:5000/api/operational-assets/<id>'
```

