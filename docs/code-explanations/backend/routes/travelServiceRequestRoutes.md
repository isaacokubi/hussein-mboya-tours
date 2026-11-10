# Route module: travelServiceRequestRoutes.js

**Source:** [server/routes/travelServiceRequestRoutes.js](../../../../server/routes/travelServiceRequestRoutes.js)

No observed mount was found in the main API or app setup; the declarations are not assumed reachable.

## Router-wide middleware

- `router.use(resolveTenant, protect, checkPermission("booking.manage"));`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET /summary (unmounted declaration)

Declared at source line 8. Route handler pipeline names: `getTravelServiceSummary`.

```js
router.get("/summary", getTravelServiceSummary)
```

- Imported handler/middleware `getTravelServiceSummary`: [travelServiceRequestController.js](../../../../server/controllers/travelServiceRequestController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getTravelServiceSummary`

Handler starts at [controller line 60](../../../../server/controllers/travelServiceRequestController.js#L60). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `TravelServiceRequest.aggregate`, `TravelServiceRequest.countDocuments`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/summary'
```

### GET / (unmounted declaration)

Declared at source line 9. Route handler pipeline names: `listTravelServiceRequests`.

```js
router.get("/", listTravelServiceRequests)
```

- Imported handler/middleware `listTravelServiceRequests`: [travelServiceRequestController.js](../../../../server/controllers/travelServiceRequestController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `listTravelServiceRequests`

Handler starts at [controller line 10](../../../../server/controllers/travelServiceRequestController.js#L10). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `type`, `status`, `priority`, `booking`, `limit`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`.
- Database operations detected: `TravelServiceRequest.find`.
- Input/validation source lines to inspect:
  - [Line 13](../../../../server/controllers/travelServiceRequestController.js#L13): `if (req.query.type) filter.type = req.query.type;`
  - [Line 14](../../../../server/controllers/travelServiceRequestController.js#L14): `if (req.query.status) filter.status = req.query.status;`
  - [Line 15](../../../../server/controllers/travelServiceRequestController.js#L15): `if (req.query.priority) filter.priority = req.query.priority;`
  - [Line 16](../../../../server/controllers/travelServiceRequestController.js#L16): `if (req.query.booking) filter.booking = req.query.booking;`
  - [Line 17](../../../../server/controllers/travelServiceRequestController.js#L17): `const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 250);`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/'
```

### POST / (unmounted declaration)

Declared at source line 10. Route handler pipeline names: `createTravelServiceRequest`.

```js
router.post("/", createTravelServiceRequest)
```

- Imported handler/middleware `createTravelServiceRequest`: [travelServiceRequestController.js](../../../../server/controllers/travelServiceRequestController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `createTravelServiceRequest`

Handler starts at [controller line 28](../../../../server/controllers/travelServiceRequestController.js#L28). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `type`, `title`, `priority`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `201`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Invalid travel service type.”; “A request title is required.”.
- Database operations detected: `TravelServiceRequest.create`.
- Input/validation source lines to inspect:
  - [Line 30](../../../../server/controllers/travelServiceRequestController.js#L30): `const type = clean(req.body.type);`
  - [Line 31](../../../../server/controllers/travelServiceRequestController.js#L31): `const title = clean(req.body.title);`
  - [Line 32](../../../../server/controllers/travelServiceRequestController.js#L32): `if (!allowedTypes.has(type)) return res.status(400).json({ success: false, message: "Invalid travel service type." });`
  - [Line 33](../../../../server/controllers/travelServiceRequestController.js#L33): `if (!title) return res.status(400).json({ success: false, message: "A request title is required." });`
  - [Line 35](../../../../server/controllers/travelServiceRequestController.js#L35): `...req.body, tenantId: req.tenantId, type, title,`
  - [Line 37](../../../../server/controllers/travelServiceRequestController.js#L37): `priority: allowedPriorities.has(req.body.priority) ? req.body.priority : "normal",`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/'
```

### PATCH /:id (unmounted declaration)

Declared at source line 11. Route handler pipeline names: `updateTravelServiceRequest`.

```js
router.patch("/:id", updateTravelServiceRequest)
```

- Imported handler/middleware `updateTravelServiceRequest`: [travelServiceRequestController.js](../../../../server/controllers/travelServiceRequestController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `updateTravelServiceRequest`

Handler starts at [controller line 44](../../../../server/controllers/travelServiceRequestController.js#L44). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Invalid request status.”; “Invalid request priority.”; “Invalid travel service type.”; “Service request not found.”.
- Database operations detected: `TravelServiceRequest.findOneAndUpdate`.
- Input/validation source lines to inspect:
  - [Line 46](../../../../server/controllers/travelServiceRequestController.js#L46): `const patch = { ...req.body, updatedBy: uid(req) };`
  - [Line 47](../../../../server/controllers/travelServiceRequestController.js#L47): `if (patch.status && !allowedStatuses.has(patch.status)) return res.status(400).json({ success: false, message: "Invalid request status." });`
  - [Line 48](../../../../server/controllers/travelServiceRequestController.js#L48): `if (patch.priority && !allowedPriorities.has(patch.priority)) return res.status(400).json({ success: false, message: "Invalid request priority." });`
  - [Line 49](../../../../server/controllers/travelServiceRequestController.js#L49): `if (patch.type && !allowedTypes.has(patch.type)) return res.status(400).json({ success: false, message: "Invalid travel service type." });`
  - [Line 51](../../../../server/controllers/travelServiceRequestController.js#L51): `const data = await TravelServiceRequest.findOneAndUpdate({ ...tenantFilter(req), _id: req.params.id }, patch, { new: true, runValidators: true })`
  - [Line 55](../../../../server/controllers/travelServiceRequestController.js#L55): `if (!data) return res.status(404).json({ success: false, message: "Service request not found." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PATCH 'http://localhost:5000/<id>'
```

