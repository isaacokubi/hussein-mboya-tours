# Route module: tourRoutes.js

**Source:** [server/routes/tourRoutes.js](../../../../server/routes/tourRoutes.js)

Observed mount prefixes include `/api/tours`, `/api/tours/featured`, `/api/tours/search`, `/api/tours/slug/:slug`, `/api/tours/:id/availability`, `/api/tours/:id`, `/api/tours/manager`, `/api/tours/:id/publication`, `/api/tours/:id/assign`, `/api/tours/:id/assign-vehicle`, `/api/tours/:id/remove-vehicle`.

## Router-wide middleware

- `router.use(protect);`
- `router.use(tourManagerOnly);`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET / → `/api/tours`

Declared at source line 37. Route handler pipeline names: `getTours`.

```js
router.get("/", getTours)
```

- Imported handler/middleware `getTours`: [tourController.js](../../../../server/controllers/tourController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getTours`

Handler starts at [controller line 69](../../../../server/controllers/tourController.js#L69). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `page`, `limit`, `search`, `destination`, `category`, `featured`, `duration`, `travellers`, `sort`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `Tour.find`, `Tour.countDocuments`.
- Input/validation source lines to inspect:
  - [Line 72](../../../../server/controllers/tourController.js#L72): `const { page = 1, limit = 12, search, destination, category, featured, duration, travellers, sort } = req.query;`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/tours'
```

### GET /featured → `/api/tours/featured`

Declared at source line 41. Route handler pipeline names: `getFeaturedTours`.

```js
router.get("/featured", getFeaturedTours)
```

- Imported handler/middleware `getFeaturedTours`: [tourController.js](../../../../server/controllers/tourController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getFeaturedTours`

Handler starts at [controller line 110](../../../../server/controllers/tourController.js#L110). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `Tour.find`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/tours/featured'
```

### GET /search → `/api/tours/search`

Declared at source line 45. Route handler pipeline names: `searchTours`.

```js
router.get("/search", searchTours)
```

- Imported handler/middleware `searchTours`: [tourController.js](../../../../server/controllers/tourController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `searchTours`

Handler starts at [controller line 120](../../../../server/controllers/tourController.js#L120). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `keyword`, `search`, `category`, `country`, `destination`, `page`, `limit`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `Tour.find`, `Tour.countDocuments`.
- Input/validation source lines to inspect:
  - [Line 123](../../../../server/controllers/tourController.js#L123): `const { keyword, search, category, country, destination, page = 1, limit = 12 } = req.query;`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/tours/search'
```

### GET /slug/:slug → `/api/tours/slug/:slug`

Declared at source line 49. Route handler pipeline names: `getTourBySlug`.

```js
router.get("/slug/:slug", getTourBySlug)
```

- Imported handler/middleware `getTourBySlug`: [tourController.js](../../../../server/controllers/tourController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getTourBySlug`

Handler starts at [controller line 156](../../../../server/controllers/tourController.js#L156). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `slug`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Tour slug is required”; “Tour not found”.
- Database operations detected: `Tour.findOne`.
- Input/validation source lines to inspect:
  - [Line 159](../../../../server/controllers/tourController.js#L159): `const slug = String(req.params.slug || "").trim().toLowerCase();`
  - [Line 160](../../../../server/controllers/tourController.js#L160): `if (!slug) return res.status(400).json({ success: false, message: "Tour slug is required" });`
  - [Line 163](../../../../server/controllers/tourController.js#L163): `if (!tour) return res.status(404).json({ success: false, message: "Tour not found" });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/tours/slug/<slug>'
```

### GET /:id/availability → `/api/tours/:id/availability`

Declared at source line 55. Route handler pipeline names: `getTourAvailability`.

```js
router.get("/:id/availability", getTourAvailability)
```

- Imported handler/middleware `getTourAvailability`: [tourAvailabilityController.js](../../../../server/controllers/tourAvailabilityController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getTourAvailability`

Handler starts at [controller line 13](../../../../server/controllers/tourAvailabilityController.js#L13). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: `travelDate`.
- Literal HTTP statuses in handler: `404`, `400`, `200`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Tour not found”; “The requested travel date is not offered for this tour.”.
- Database operations detected: `Tour.findOne`, `Booking.aggregate`.
- Input/validation source lines to inspect:
  - [Line 16](../../../../server/controllers/tourAvailabilityController.js#L16): `const tour = await Tour.findOne(mergeTenantFilter(req, { _id: req.params.id, isDeleted: { $ne: true } })).lean();`
  - [Line 17](../../../../server/controllers/tourAvailabilityController.js#L17): `if (!tour) return res.status(404).json({ success: false, message: "Tour not found" });`
  - [Line 20](../../../../server/controllers/tourAvailabilityController.js#L20): `const requestedDate = req.query?.travelDate ? normalize(req.query.travelDate) : null;`
  - [Line 24](../../../../server/controllers/tourAvailabilityController.js#L24): `if (requestedDate && entries.length && !selected) return res.status(400).json({ success:false, message:"The requested travel date is not offered for this tour." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/tours/<id>/availability'
```

### GET /:id → `/api/tours/:id`

Declared at source line 60. Route handler pipeline names: `getTourById`.

```js
router.get("/:id", getTourById)
```

- Imported handler/middleware `getTourById`: [tourController.js](../../../../server/controllers/tourController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getTourById`

Handler starts at [controller line 145](../../../../server/controllers/tourController.js#L145). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Tour not found”.
- Database operations detected: `Tour.findOne`.
- Input/validation source lines to inspect:
  - [Line 148](../../../../server/controllers/tourController.js#L148): `const filter = platformWide ? { _id: req.params.id, ...publicTourFilter } : mergeTenantFilter({ _id: req.params.id, ...publicTourFilter });`
  - [Line 150](../../../../server/controllers/tourController.js#L150): `if (!tour) return res.status(404).json({ success: false, message: "Tour not found" });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/tours/<id>'
```

### GET /manager → `/api/tours/manager`

Declared at source line 78. Route handler pipeline names: `getManagerTours`.

```js
router.get("/manager", getManagerTours)
```

- Imported handler/middleware `getManagerTours`: [tourController.js](../../../../server/controllers/tourController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getManagerTours`

Handler starts at [controller line 169](../../../../server/controllers/tourController.js#L169). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `Tour.find`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/tours/manager'
```

### POST / → `/api/tours`

Declared at source line 82. Route handler pipeline names: `validateTourCommand`, `createTour`.

```js
router.post("/", validateTourCommand(), upload.array("images", 10), createTour)
```

- Imported handler/middleware `validateTourCommand`: [validateTourCommand.js](../../../../server/middleware/validateTourCommand.js)
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
curl -i -X POST 'http://localhost:5000/api/tours'
```

### PATCH /:id/availability → `/api/tours/:id/availability`

Declared at source line 91. Route handler pipeline names: `updateTourAvailability`.

```js
router.patch("/:id/availability", updateTourAvailability)
```

- Imported handler/middleware `updateTourAvailability`: [tourAvailabilityController.js](../../../../server/controllers/tourAvailabilityController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `updateTourAvailability`

Handler starts at [controller line 67](../../../../server/controllers/tourAvailabilityController.js#L67). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `totalSlots`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Total slots must be a positive whole number.”; “Tour not found”; “Tour capacity updated successfully.”.
- Database operations detected: `Tour.findOne`, `Booking.aggregate`.
- Input/validation source lines to inspect:
  - [Line 70](../../../../server/controllers/tourAvailabilityController.js#L70): `const requestedSlots = Number(req.body?.totalSlots);`
  - [Line 71](../../../../server/controllers/tourAvailabilityController.js#L71): `if (!Number.isFinite(requestedSlots) || requestedSlots <= 0 || !Number.isInteger(requestedSlots)) return res.status(400).json({ success: false, message: "Total slots must`
  - [Line 73](../../../../server/controllers/tourAvailabilityController.js#L73): `const tour = await Tour.findOne(mergeTenantFilter(req, { _id: req.params.id, isDeleted: { $ne: true } }));`
  - [Line 74](../../../../server/controllers/tourAvailabilityController.js#L74): `if (!tour) return res.status(404).json({ success: false, message: "Tour not found" });`
  - [Line 81](../../../../server/controllers/tourAvailabilityController.js#L81): `if (requestedSlots < bookedGuests) return res.status(400).json({ success: false, message: \`Cannot reduce capacity below the current booked guests (${bookedGuests}).\` })`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PATCH 'http://localhost:5000/api/tours/<id>/availability'
```

### PUT /:id → `/api/tours/:id`

Declared at source line 101. Route handler pipeline names: `validateTourCommand`, `updateTour`.

```js
router.put("/:id", validateTourCommand({ allowPast: true }), upload.array("images", 10), updateTour)
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
curl -i -X PUT 'http://localhost:5000/api/tours/<id>'
```

### DELETE /:id → `/api/tours/:id`

Declared at source line 105. Route handler pipeline names: `deleteTour`.

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
curl -i -X DELETE 'http://localhost:5000/api/tours/<id>'
```

### PATCH /:id/publication → `/api/tours/:id/publication`

Declared at source line 106. Route handler pipeline names: `setPublication`.

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
curl -i -X PATCH 'http://localhost:5000/api/tours/<id>/publication'
```

### PUT /:id/assign → `/api/tours/:id/assign`

Declared at source line 116. Route handler pipeline names: `assignTourResourcesSafe`.

```js
router.put("/:id/assign", assignTourResourcesSafe)
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
curl -i -X PUT 'http://localhost:5000/api/tours/<id>/assign'
```

### PATCH /:id/assign-vehicle → `/api/tours/:id/assign-vehicle`

Declared at source line 119. Route handler pipeline names: `assignTourResourcesSafe`.

```js
router.patch("/:id/assign-vehicle", assignTourResourcesSafe)
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
curl -i -X PATCH 'http://localhost:5000/api/tours/<id>/assign-vehicle'
```

### PATCH /:id/remove-vehicle → `/api/tours/:id/remove-vehicle`

Declared at source line 122. Route handler pipeline names: inline callback.

```js
router.patch("/:id/remove-vehicle", (req, res, next) => { req.body = { ...(req.body || {}), vehicleId: null }; return assignTourResourcesSafe(req, res, next); })
```

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PATCH 'http://localhost:5000/api/tours/<id>/remove-vehicle'
```

