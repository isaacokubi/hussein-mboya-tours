# Route module: guideRoutes.js

**Source:** [server/routes/guideRoutes.js](../../../../server/routes/guideRoutes.js)

Observed mount prefixes include `/api/guide/dashboard`, `/api/guide/assigned-tours`, `/api/guide/tours/:id`, `/api/guide/tours/:id/guests`, `/api/guide/tours/:id/status`, `/api/guide/tours/:id/report`.

## Router-wide middleware

- `router.use(protect);`
- `router.use(resolveTenant);`
- `router.use(guideOnly);`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET /dashboard → `/api/guide/dashboard`

Declared at source line 22. Route handler pipeline names: `guideDashboard`.

```js
router.get("/dashboard", guideDashboard)
```

- Imported handler/middleware `guideDashboard`: [guideController.js](../../../../server/controllers/guideController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `guideDashboard`

Handler starts at [controller line 118](../../../../server/controllers/guideController.js#L118). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `Tour.find`, `Booking.aggregate`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/guide/dashboard'
```

### GET /assigned-tours → `/api/guide/assigned-tours`

Declared at source line 23. Route handler pipeline names: `getAssignedTours`.

```js
router.get("/assigned-tours", getAssignedTours)
```

- Imported handler/middleware `getAssignedTours`: [guideController.js](../../../../server/controllers/guideController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getAssignedTours`

Handler starts at [controller line 143](../../../../server/controllers/guideController.js#L143). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: `success`, `count`, `data`.
- Database operations detected: `Tour.find`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/guide/assigned-tours'
```

### GET /tours/:id → `/api/guide/tours/:id`

Declared at source line 24. Route handler pipeline names: `getTourDetails`.

```js
router.get("/tours/:id", getTourDetails)
```

- Imported handler/middleware `getTourDetails`: [guideController.js](../../../../server/controllers/guideController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getTourDetails`

Handler starts at [controller line 154](../../../../server/controllers/guideController.js#L154). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `200`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Tour not found”.
- Database operations detected: `Tour.findOne`.
- Input/validation source lines to inspect:
  - [Line 159](../../../../server/controllers/guideController.js#L159): `const tour = await Tour.findOne(scope(req, { $and: [guideTourFilter(req, guide), { _id: req.params.id }] }))`
  - [Line 161](../../../../server/controllers/guideController.js#L161): `if (!tour) return res.status(404).json({ success: false, message: "Tour not found" });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/guide/tours/<id>'
```

### GET /tours/:id/guests → `/api/guide/tours/:id/guests`

Declared at source line 25. Route handler pipeline names: `getTourGuests`.

```js
router.get("/tours/:id/guests", getTourGuests)
```

- Imported handler/middleware `getTourGuests`: [guideController.js](../../../../server/controllers/guideController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getTourGuests`

Handler starts at [controller line 166](../../../../server/controllers/guideController.js#L166). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `403`, `200`.
- JSON envelope keys observed: `success`, `message`, `count`, `guests`, `data`.
- Literal messages include: “You are not assigned to this tour”.
- Database operations detected: `Tour.findOne`, `Booking.find`.
- Input/validation source lines to inspect:
  - [Line 171](../../../../server/controllers/guideController.js#L171): `const assignedTour = await Tour.findOne(scope(req, { $and: [guideTourFilter(req, guide), { _id: req.params.id }] }));`
  - [Line 172](../../../../server/controllers/guideController.js#L172): `if (!assignedTour) return res.status(403).json({ success: false, message: "You are not assigned to this tour" });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/guide/tours/<id>/guests'
```

### PUT /tours/:id/status → `/api/guide/tours/:id/status`

Declared at source line 26. Route handler pipeline names: `updateTourStatus`.

```js
router.put("/tours/:id/status", updateTourStatus)
```

- Imported handler/middleware `updateTourStatus`: [guideController.js](../../../../server/controllers/guideController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `updateTourStatus`

Handler starts at [controller line 180](../../../../server/controllers/guideController.js#L180). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `status`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Invalid tour status”; “Tour not found or not assigned to you”; “This tour cannot be completed before its final day.”; “Tour status updated successfully”.
- Database operations detected: `Tour.findOne`, `Tour.findOneAndUpdate`.
- Input/validation source lines to inspect:
  - [Line 183](../../../../server/controllers/guideController.js#L183): `const { status } = req.body;`
  - [Line 184](../../../../server/controllers/guideController.js#L184): `if (!TOUR_STATUSES.includes(status)) return res.status(400).json({ success: false, message: "Invalid tour status" });`
  - [Line 187](../../../../server/controllers/guideController.js#L187): `const assignedTourForDate = await Tour.findOne(scope(req, { $and: [guideTourFilter(req, guide), { _id: req.params.id }] })).lean();`
  - [Line 188](../../../../server/controllers/guideController.js#L188): `if (!assignedTourForDate) return res.status(404).json({ success: false, message: "Tour not found or not assigned to you" });`
  - [Line 192](../../../../server/controllers/guideController.js#L192): `if (status === "ongoing" && today.getTime() !== start.getTime()) return res.status(400).json({ success: false, message: \`This tour can only be started on ${start.toLocal`
  - [Line 193](../../../../server/controllers/guideController.js#L193): `if (status === "completed" && today < end) return res.status(400).json({ success: false, message: "This tour cannot be completed before its final day." });`
  - [Line 197](../../../../server/controllers/guideController.js#L197): `const tour = await Tour.findOneAndUpdate(scope(req, { $and: [guideTourFilter(req, guide), { _id: req.params.id }] }), { $set: update }, { new: true, runValidators: true }`
  - [Line 198](../../../../server/controllers/guideController.js#L198): `if (!tour) return res.status(404).json({ success: false, message: "Tour not found or not assigned to you" });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PUT 'http://localhost:5000/api/guide/tours/<id>/status'
```

### POST /tours/:id/report → `/api/guide/tours/:id/report`

Declared at source line 27. Route handler pipeline names: `submitTourReport`.

```js
router.post("/tours/:id/report", submitTourReport)
```

- Imported handler/middleware `submitTourReport`: [guideController.js](../../../../server/controllers/guideController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `submitTourReport`

Handler starts at [controller line 203](../../../../server/controllers/guideController.js#L203). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `summary`, `issues`, `photos`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `403`, `201`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “You are not assigned to this tour”; “Tour report submitted successfully”.
- Database operations detected: `Tour.findOne`, `TourReport.create`.
- Input/validation source lines to inspect:
  - [Line 208](../../../../server/controllers/guideController.js#L208): `const assignedTour = await Tour.findOne(scope(req, { $and: [guideTourFilter(req, guide), { _id: req.params.id }] }));`
  - [Line 209](../../../../server/controllers/guideController.js#L209): `if (!assignedTour) return res.status(403).json({ success: false, message: "You are not assigned to this tour" });`
  - [Line 210](../../../../server/controllers/guideController.js#L210): `const report = await TourReport.create({ tenantId: req.tenantId, tour: assignedTour._id, guide: guide._id, summary: req.body.summary, issues: req.body.issues || [], photo`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/guide/tours/<id>/report'
```

