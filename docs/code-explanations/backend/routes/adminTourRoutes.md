# Route module: adminTourRoutes.js

**Source:** [server/routes/adminTourRoutes.js](../../../../server/routes/adminTourRoutes.js)

Observed mount prefixes include `/api/admin/tours`, `/api/admin/tours/:id`, `/api/admin/tours/:id/publication`, `/api/admin/tours/:id/restore`, `/api/admin/tours/:id/guide`, `/api/admin/tours/:id/driver`, `/api/admin/tours/:id/vehicle`.

## Router-wide middleware

- `router.use(resolveTenant);`
- `router.use(protect);`
- `router.use(adminMiddleware);`
- `router.use(authorize("tour.manage"));`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET / → `/api/admin/tours`

Declared at source line 23. Route handler pipeline names: `getAllTours`.

```js
router.get("/", getAllTours)
```

- Imported handler/middleware `getAllTours`: [adminTourController.js](../../../../server/controllers/adminTourController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getAllTours`

Handler starts at [controller line 103](../../../../server/controllers/adminTourController.js#L103). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `page`, `limit`, `status`, `category`, `featured`, `destination`, `available`, `search`.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: `success`, `pages`, `count`.
- Database operations detected: `Tour.find`, `Tour.countDocuments`.
- Input/validation source lines to inspect:
  - [Line 111](../../../../server/controllers/adminTourController.js#L111): `const page = Math.max(Number(req.query.page) || 1, 1);`
  - [Line 113](../../../../server/controllers/adminTourController.js#L113): `const limit = Math.min(Number(req.query.limit) || 10, 10);`
  - [Line 127](../../../../server/controllers/adminTourController.js#L127): `if (req.query.status) {`
  - [Line 128](../../../../server/controllers/adminTourController.js#L128): `filter.status = req.query.status;`
  - [Line 131](../../../../server/controllers/adminTourController.js#L131): `if (req.query.category) {`
  - [Line 132](../../../../server/controllers/adminTourController.js#L132): `filter.category = req.query.category;`
  - [Line 135](../../../../server/controllers/adminTourController.js#L135): `if (req.query.featured === "true") {`
  - [Line 139](../../../../server/controllers/adminTourController.js#L139): `if (req.query.destination) {`
  - [Line 140](../../../../server/controllers/adminTourController.js#L140): `filter.destination = req.query.destination;`
  - [Line 143](../../../../server/controllers/adminTourController.js#L143): `if (req.query.available === "true") {`
  - [Line 153](../../../../server/controllers/adminTourController.js#L153): `if (req.query.search) {`
  - [Line 157](../../../../server/controllers/adminTourController.js#L157): `$regex: req.query.search,`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/tours'
```

### GET /:id → `/api/admin/tours/:id`

Declared at source line 24. Route handler pipeline names: `getTour`.

```js
router.get("/:id", getTour)
```

- Imported handler/middleware `getTour`: [adminTourController.js](../../../../server/controllers/adminTourController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getTour`

Handler starts at [controller line 229](../../../../server/controllers/adminTourController.js#L229). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Invalid tour ID.”; “Tour not found.”.
- Database operations detected: `Tour.findOne`.
- Input/validation source lines to inspect:
  - [Line 237](../../../../server/controllers/adminTourController.js#L237): `if (!isValidId(req.params.id)) {`
  - [Line 238](../../../../server/controllers/adminTourController.js#L238): `return res.status(400).json({`
  - [Line 251](../../../../server/controllers/adminTourController.js#L251): `_id: req.params.id,`
  - [Line 271](../../../../server/controllers/adminTourController.js#L271): `return res.status(404).json({`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/tours/<id>'
```

### POST / → `/api/admin/tours`

Declared at source line 25. Route handler pipeline names: `validateFutureTourDate`, `createTour`.

```js
router.post("/", validateFutureTourDate, upload.array("images", 10), createTour)
```

- Imported handler/middleware `validateFutureTourDate`: [validateFutureTourDate.js](../../../../server/middleware/validateFutureTourDate.js)
- Imported handler/middleware `createTour`: [tourCrudController.js](../../../../server/controllers/tourCrudController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `createTour`

Handler starts at [controller line 146](../../../../server/controllers/tourCrudController.js#L146). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `assignedGuide`, `guide`, `assignedDriver`, `driver`, `assignedVehicle`, `vehicle`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `201`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “Tour created successfully.”.
- Database operations detected: `Destination.findOne`, `Tour.create`, `Tour.findOne`.
- Input/validation source lines to inspect:
  - [Line 152](../../../../server/controllers/tourCrudController.js#L152): `const payload = normalizedPayload(req.body || {}, req.files || [], req.user?._id);`
  - [Line 156](../../../../server/controllers/tourCrudController.js#L156): `guideId: req.body?.assignedGuide || req.body?.guide || null,`
  - [Line 157](../../../../server/controllers/tourCrudController.js#L157): `driverId: req.body?.assignedDriver || req.body?.driver || null,`
  - [Line 158](../../../../server/controllers/tourCrudController.js#L158): `vehicleId: req.body?.assignedVehicle || req.body?.vehicle || null,`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/admin/tours'
```

### PUT /:id → `/api/admin/tours/:id`

Declared at source line 26. Route handler pipeline names: `validateTourCommand`, `updateTour`.

```js
router.put("/:id", validateTourCommand(), upload.array("images", 10), updateTour)
```

- Imported handler/middleware `validateTourCommand`: [validateTourCommand.js](../../../../server/middleware/validateTourCommand.js)
- Imported handler/middleware `updateTour`: [tourCrudController.js](../../../../server/controllers/tourCrudController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `updateTour`

Handler starts at [controller line 175](../../../../server/controllers/tourCrudController.js#L175). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`.
- JSON envelope keys observed: `success`, `message`, `data`, `tour`.
- Literal messages include: “Invalid tour ID.”; “Tour not found.”; “Use the dedicated tour resource assignment endpoint to change guides, drivers or vehicles.”; “Tour updated successfully.”.
- Database operations detected: `Tour.findOne`, `Tour.findOneAndUpdate`.
- Input/validation source lines to inspect:
  - [Line 178](../../../../server/controllers/tourCrudController.js#L178): `if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid tour ID." });`
  - [Line 179](../../../../server/controllers/tourCrudController.js#L179): `const existing = await Tour.findOne(mergeTenantFilter({ _id: req.params.id, isDeleted: { $ne: true } }));`
  - [Line 180](../../../../server/controllers/tourCrudController.js#L180): `if (!existing) return res.status(404).json({ success: false, message: "Tour not found." });`
  - [Line 181](../../../../server/controllers/tourCrudController.js#L181): `if (["assignedGuide","assignedDriver","assignedVehicle","guide","driver","vehicle"].some((key) => req.body?.[key] !== undefined)) return res.status(400).json({ success: f`
  - [Line 182](../../../../server/controllers/tourCrudController.js#L182): `const payload = normalizedPayload(req.body || {}, req.files || [], req.user?._id, existing);`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PUT 'http://localhost:5000/api/admin/tours/<id>'
```

### DELETE /:id → `/api/admin/tours/:id`

Declared at source line 27. Route handler pipeline names: `deleteTour`.

```js
router.delete("/:id", deleteTour)
```

- Imported handler/middleware `deleteTour`: [tourCrudController.js](../../../../server/controllers/tourCrudController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `deleteTour`

Handler starts at [controller line 190](../../../../server/controllers/tourCrudController.js#L190). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `reason`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`.
- JSON envelope keys observed: `success`, `message`, `data`, `bookingsAffected`.
- Literal messages include: “Invalid tour ID.”; “Tour deleted after cancelling/reconciling active bookings.”.
- Database operations detected: none directly detected (may be delegated to service/helper).
- Input/validation source lines to inspect:
  - [Line 193](../../../../server/controllers/tourCrudController.js#L193): `if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid tour ID." });`
  - [Line 194](../../../../server/controllers/tourCrudController.js#L194): `const result = await cancelTourAndBookings({ tourId: req.params.id, reason: req.body?.reason || "Tour deleted/cancelled", deleted: true, userId: req.user?._id || null });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X DELETE 'http://localhost:5000/api/admin/tours/<id>'
```

### PATCH /:id/publication → `/api/admin/tours/:id/publication`

Declared at source line 28. Route handler pipeline names: `setPublication`.

```js
router.patch("/:id/publication", setPublication)
```

- Imported handler/middleware `setPublication`: [tourCrudController.js](../../../../server/controllers/tourCrudController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `setPublication`

Handler starts at [controller line 199](../../../../server/controllers/tourCrudController.js#L199). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `published`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Invalid tour ID.”; “published must be a boolean.”; “Tour not found.”.
- Database operations detected: `Tour.findOneAndUpdate`.
- Input/validation source lines to inspect:
  - [Line 202](../../../../server/controllers/tourCrudController.js#L202): `if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid tour ID." });`
  - [Line 203](../../../../server/controllers/tourCrudController.js#L203): `const published = req.body?.published;`
  - [Line 204](../../../../server/controllers/tourCrudController.js#L204): `if (typeof published !== "boolean" && !["true","false"].includes(String(published))) return res.status(400).json({ success: false, message: "published must be a boolean."`
  - [Line 205](../../../../server/controllers/tourCrudController.js#L205): `const tour = await Tour.findOneAndUpdate(mergeTenantFilter({ _id: req.params.id, isDeleted: { $ne: true } }), { $set: { published: String(published) === "true" } }, { new`
  - [Line 206](../../../../server/controllers/tourCrudController.js#L206): `if (!tour) return res.status(404).json({ success: false, message: "Tour not found." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PATCH 'http://localhost:5000/api/admin/tours/<id>/publication'
```

### PATCH /:id/restore → `/api/admin/tours/:id/restore`

Declared at source line 29. Route handler pipeline names: `restoreTour`.

```js
router.patch("/:id/restore", restoreTour)
```

- Imported handler/middleware `restoreTour`: [adminTourController.js](../../../../server/controllers/adminTourController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `restoreTour`

Handler starts at [controller line 297](../../../../server/controllers/adminTourController.js#L297). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Invalid tour ID.”; “Deleted tour not found.”; “Tour restored successfully.”.
- Database operations detected: `Tour.findOne`, `Vehicle.findById`.
- Input/validation source lines to inspect:
  - [Line 305](../../../../server/controllers/adminTourController.js#L305): `if (!isValidId(req.params.id)) {`
  - [Line 306](../../../../server/controllers/adminTourController.js#L306): `return res.status(400).json({`
  - [Line 319](../../../../server/controllers/adminTourController.js#L319): `_id: req.params.id,`
  - [Line 324](../../../../server/controllers/adminTourController.js#L324): `return res.status(404).json({`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PATCH 'http://localhost:5000/api/admin/tours/<id>/restore'
```

### PATCH /:id/guide → `/api/admin/tours/:id/guide`

Declared at source line 30. Route handler pipeline names: `assignTourResourcesSafe`.

```js
router.patch("/:id/guide", assignTourResourcesSafe)
```

- Imported handler/middleware `assignTourResourcesSafe`: [tourResourceAssignmentController.js](../../../../server/controllers/tourResourceAssignmentController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `assignTourResourcesSafe`

Handler starts at [controller line 75](../../../../server/controllers/tourResourceAssignmentController.js#L75). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `guideId`, `driverId`, `vehicleId`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `Tour.findOne`, `Staff.findOne`, `Vehicle.findOneAndUpdate`, `Staff.findOneAndUpdate`.
- Input/validation source lines to inspect:
  - [Line 82](../../../../server/controllers/tourResourceAssignmentController.js#L82): `const tourId = req.params.id;`
  - [Line 93](../../../../server/controllers/tourResourceAssignmentController.js#L93): `const nextGuideId = idOrNull(req.body?.guideId === undefined ? tour.assignedGuide : req.body.guideId);`
  - [Line 94](../../../../server/controllers/tourResourceAssignmentController.js#L94): `const nextDriverId = idOrNull(req.body?.driverId === undefined ? tour.assignedDriver : req.body.driverId);`
  - [Line 95](../../../../server/controllers/tourResourceAssignmentController.js#L95): `const nextVehicleId = idOrNull(req.body?.vehicleId === undefined ? tour.assignedVehicle : req.body.vehicleId);`
  - [Line 174](../../../../server/controllers/tourResourceAssignmentController.js#L174): `sourceId: String(req.params.id),`
  - [Line 176](../../../../server/controllers/tourResourceAssignmentController.js#L176): `tourId: req.params.id,`
  - [Line 177](../../../../server/controllers/tourResourceAssignmentController.js#L177): `guideId: req.body?.guideId || null,`
  - [Line 178](../../../../server/controllers/tourResourceAssignmentController.js#L178): `driverId: req.body?.driverId || null,`
  - [Line 179](../../../../server/controllers/tourResourceAssignmentController.js#L179): `vehicleId: req.body?.vehicleId || null,`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PATCH 'http://localhost:5000/api/admin/tours/<id>/guide'
```

### PATCH /:id/driver → `/api/admin/tours/:id/driver`

Declared at source line 31. Route handler pipeline names: `assignTourResourcesSafe`.

```js
router.patch("/:id/driver", assignTourResourcesSafe)
```

- Imported handler/middleware `assignTourResourcesSafe`: [tourResourceAssignmentController.js](../../../../server/controllers/tourResourceAssignmentController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `assignTourResourcesSafe`

Handler starts at [controller line 75](../../../../server/controllers/tourResourceAssignmentController.js#L75). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `guideId`, `driverId`, `vehicleId`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `Tour.findOne`, `Staff.findOne`, `Vehicle.findOneAndUpdate`, `Staff.findOneAndUpdate`.
- Input/validation source lines to inspect:
  - [Line 82](../../../../server/controllers/tourResourceAssignmentController.js#L82): `const tourId = req.params.id;`
  - [Line 93](../../../../server/controllers/tourResourceAssignmentController.js#L93): `const nextGuideId = idOrNull(req.body?.guideId === undefined ? tour.assignedGuide : req.body.guideId);`
  - [Line 94](../../../../server/controllers/tourResourceAssignmentController.js#L94): `const nextDriverId = idOrNull(req.body?.driverId === undefined ? tour.assignedDriver : req.body.driverId);`
  - [Line 95](../../../../server/controllers/tourResourceAssignmentController.js#L95): `const nextVehicleId = idOrNull(req.body?.vehicleId === undefined ? tour.assignedVehicle : req.body.vehicleId);`
  - [Line 174](../../../../server/controllers/tourResourceAssignmentController.js#L174): `sourceId: String(req.params.id),`
  - [Line 176](../../../../server/controllers/tourResourceAssignmentController.js#L176): `tourId: req.params.id,`
  - [Line 177](../../../../server/controllers/tourResourceAssignmentController.js#L177): `guideId: req.body?.guideId || null,`
  - [Line 178](../../../../server/controllers/tourResourceAssignmentController.js#L178): `driverId: req.body?.driverId || null,`
  - [Line 179](../../../../server/controllers/tourResourceAssignmentController.js#L179): `vehicleId: req.body?.vehicleId || null,`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PATCH 'http://localhost:5000/api/admin/tours/<id>/driver'
```

### PATCH /:id/vehicle → `/api/admin/tours/:id/vehicle`

Declared at source line 32. Route handler pipeline names: `assignTourResourcesSafe`.

```js
router.patch("/:id/vehicle", assignTourResourcesSafe)
```

- Imported handler/middleware `assignTourResourcesSafe`: [tourResourceAssignmentController.js](../../../../server/controllers/tourResourceAssignmentController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `assignTourResourcesSafe`

Handler starts at [controller line 75](../../../../server/controllers/tourResourceAssignmentController.js#L75). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `guideId`, `driverId`, `vehicleId`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `Tour.findOne`, `Staff.findOne`, `Vehicle.findOneAndUpdate`, `Staff.findOneAndUpdate`.
- Input/validation source lines to inspect:
  - [Line 82](../../../../server/controllers/tourResourceAssignmentController.js#L82): `const tourId = req.params.id;`
  - [Line 93](../../../../server/controllers/tourResourceAssignmentController.js#L93): `const nextGuideId = idOrNull(req.body?.guideId === undefined ? tour.assignedGuide : req.body.guideId);`
  - [Line 94](../../../../server/controllers/tourResourceAssignmentController.js#L94): `const nextDriverId = idOrNull(req.body?.driverId === undefined ? tour.assignedDriver : req.body.driverId);`
  - [Line 95](../../../../server/controllers/tourResourceAssignmentController.js#L95): `const nextVehicleId = idOrNull(req.body?.vehicleId === undefined ? tour.assignedVehicle : req.body.vehicleId);`
  - [Line 174](../../../../server/controllers/tourResourceAssignmentController.js#L174): `sourceId: String(req.params.id),`
  - [Line 176](../../../../server/controllers/tourResourceAssignmentController.js#L176): `tourId: req.params.id,`
  - [Line 177](../../../../server/controllers/tourResourceAssignmentController.js#L177): `guideId: req.body?.guideId || null,`
  - [Line 178](../../../../server/controllers/tourResourceAssignmentController.js#L178): `driverId: req.body?.driverId || null,`
  - [Line 179](../../../../server/controllers/tourResourceAssignmentController.js#L179): `vehicleId: req.body?.vehicleId || null,`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PATCH 'http://localhost:5000/api/admin/tours/<id>/vehicle'
```

