# Route module: driverRoutes.js

**Source:** [server/routes/driverRoutes.js](../../../../server/routes/driverRoutes.js)

Observed mount prefixes include `/api/driver/dashboard`, `/api/driver/assigned-tours`, `/api/driver/tours/:id`, `/api/driver/tours/:id/guests`, `/api/driver/tours/:id/status`.

## Router-wide middleware

- `router.use(protect);`
- `router.use(resolveTenant);`
- `router.use(driverOnly);`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET /dashboard → `/api/driver/dashboard`

Declared at source line 15. Route handler pipeline names: `driverDashboard`.

```js
router.get("/dashboard", driverDashboard)
```

- Imported handler/middleware `driverDashboard`: [driverController.js](../../../../server/controllers/driverController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `driverDashboard`

Handler starts at [controller line 87](../../../../server/controllers/driverController.js#L87). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `200`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Driver profile not found. Ask an administrator to complete the driver account.”.
- Database operations detected: `Tour.find`, `Booking.aggregate`.
- Input/validation source lines to inspect:
  - [Line 92](../../../../server/controllers/driverController.js#L92): `return res.status(404).json({ success: false, message: "Driver profile not found. Ask an administrator to complete the driver account." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/driver/dashboard'
```

### GET /assigned-tours → `/api/driver/assigned-tours`

Declared at source line 16. Route handler pipeline names: `getAssignedTours`.

```js
router.get("/assigned-tours", getAssignedTours)
```

- Imported handler/middleware `getAssignedTours`: [driverTourController.js](../../../../server/controllers/driverTourController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getAssignedTours`

Handler starts at [controller line 23](../../../../server/controllers/driverTourController.js#L23). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`, `count`, `tours`, `data`.
- Literal messages include: “Driver profile not found”.
- Database operations detected: `Tour.find`.
- Input/validation source lines to inspect:
  - [Line 25](../../../../server/controllers/driverTourController.js#L25): `try { const driver = await resolveDriver(req.user); if (!driver) return res.status(404).json({ success:false, message:"Driver profile not found" }); const tours = await T`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/driver/assigned-tours'
```

### GET /tours/:id → `/api/driver/tours/:id`

Declared at source line 17. Route handler pipeline names: `getTourDetails`.

```js
router.get("/tours/:id", getTourDetails)
```

- Imported handler/middleware `getTourDetails`: [driverTourController.js](../../../../server/controllers/driverTourController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getTourDetails`

Handler starts at [controller line 28](../../../../server/controllers/driverTourController.js#L28). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Driver profile not found”; “Tour not found or not assigned to you”.
- Database operations detected: `Tour.findOne`.
- Input/validation source lines to inspect:
  - [Line 30](../../../../server/controllers/driverTourController.js#L30): `try { const driver = await resolveDriver(req.user); if (!driver) return res.status(404).json({ success:false, message:"Driver profile not found" }); const tour = await To`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/driver/tours/<id>'
```

### GET /tours/:id/guests → `/api/driver/tours/:id/guests`

Declared at source line 18. Route handler pipeline names: `getTourGuests`.

```js
router.get("/tours/:id/guests", getTourGuests)
```

- Imported handler/middleware `getTourGuests`: [driverTourController.js](../../../../server/controllers/driverTourController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getTourGuests`

Handler starts at [controller line 33](../../../../server/controllers/driverTourController.js#L33). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `403`.
- JSON envelope keys observed: `success`, `message`, `count`, `guests`, `data`.
- Literal messages include: “Driver profile not found”; “You are not assigned to this tour”.
- Database operations detected: `Tour.findOne`, `Booking.find`.
- Input/validation source lines to inspect:
  - [Line 35](../../../../server/controllers/driverTourController.js#L35): `try { const driver = await resolveDriver(req.user); if (!driver) return res.status(404).json({ success:false, message:"Driver profile not found" }); const tour = await To`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/driver/tours/<id>/guests'
```

### PUT /tours/:id/status → `/api/driver/tours/:id/status`

Declared at source line 19. Route handler pipeline names: `updateTourStatus`.

```js
router.put("/tours/:id/status", updateTourStatus)
```

- Imported handler/middleware `updateTourStatus`: [driverTourController.js](../../../../server/controllers/driverTourController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `updateTourStatus`

Handler starts at [controller line 38](../../../../server/controllers/driverTourController.js#L38). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `status`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Driver may only start or complete a tour”; “Driver profile not found”; “Tour not found or not assigned to you”; “Only scheduled or upcoming tours can be started.”; “This tour cannot be completed before its final day.”; “Only an ongoing tour can be completed.”; “Tour status updated successfully”.
- Database operations detected: `Tour.findOne`.
- Input/validation source lines to inspect:
  - [Line 41](../../../../server/controllers/driverTourController.js#L41): `const { status } = req.body; if (!["ongoing","completed"].includes(status)) return res.status(400).json({ success:false, message:"Driver may only start or complete a tour`
  - [Line 42](../../../../server/controllers/driverTourController.js#L42): `const driver = await resolveDriver(req.user); if (!driver) return res.status(404).json({ success:false, message:"Driver profile not found" });`
  - [Line 43](../../../../server/controllers/driverTourController.js#L43): `const tour = await Tour.findOne(assigned(driver, req.params.id)); if (!tour) return res.status(404).json({ success:false, message:"Tour not found or not assigned to you" `
  - [Line 45](../../../../server/controllers/driverTourController.js#L45): `if (status === "ongoing") { if (today.getTime() !== start.getTime()) return res.status(400).json({ success:false, message:\`This tour can only be started on ${start.toLoc`
  - [Line 46](../../../../server/controllers/driverTourController.js#L46): `if (status === "completed") { if (today < end) return res.status(400).json({ success:false, message:"This tour cannot be completed before its final day." }); if (tour.sta`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PUT 'http://localhost:5000/api/driver/tours/<id>/status'
```

