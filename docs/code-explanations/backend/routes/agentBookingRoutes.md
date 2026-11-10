# Route module: agentBookingRoutes.js

**Source:** [server/routes/agentBookingRoutes.js](../../../../server/routes/agentBookingRoutes.js)

Observed mount prefixes include `/api/agents/bookings`, `/api/agent/bookings`, `/api/agents/bookings/:id`, `/api/agent/bookings/:id`, `/api/agents/bookings/:id/status`, `/api/agent/bookings/:id/status`, `/api/agents/bookings/:id/cancel`, `/api/agent/bookings/:id/cancel`.

## Router-wide middleware

- `router.use(resolveTenant);`
- `router.use(protect);`
- `router.use(agentMiddleware);`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET / → `/api/agents/bookings`, `/api/agent/bookings`

Declared at source line 22. Route handler pipeline names: `getAgentBookings`.

```js
router.get("/", getAgentBookings)
```

- Imported handler/middleware `getAgentBookings`: [agentBookingController.js](../../../../server/controllers/agentBookingController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getAgentBookings`

Handler starts at [controller line 403](../../../../server/controllers/agentBookingController.js#L403). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `page`, `limit`, `status`, `paymentStatus`, `search`.
- Literal HTTP statuses in handler: `404`, `200`.
- JSON envelope keys observed: `success`, `message`, `pages`, `count`.
- Literal messages include: “Agent profile not found.”.
- Database operations detected: `Agent.findOne`, `Booking.find`, `Booking.countDocuments`.
- Input/validation source lines to inspect:
  - [Line 415](../../../../server/controllers/agentBookingController.js#L415): `return res.status(404).json({`
  - [Line 422](../../../../server/controllers/agentBookingController.js#L422): `Number(req.query.page) || 1,`
  - [Line 428](../../../../server/controllers/agentBookingController.js#L428): `Number(req.query.limit) || 20,`
  - [Line 443](../../../../server/controllers/agentBookingController.js#L443): `req.query.status &&`
  - [Line 445](../../../../server/controllers/agentBookingController.js#L445): `req.query.status`
  - [Line 449](../../../../server/controllers/agentBookingController.js#L449): `req.query.status;`
  - [Line 452](../../../../server/controllers/agentBookingController.js#L452): `if (req.query.paymentStatus) {`
  - [Line 454](../../../../server/controllers/agentBookingController.js#L454): `req.query.paymentStatus;`
  - [Line 457](../../../../server/controllers/agentBookingController.js#L457): `if (req.query.search) {`
  - [Line 459](../../../../server/controllers/agentBookingController.js#L459): `String(req.query.search)`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/agents/bookings'
```

### GET /:id → `/api/agents/bookings/:id`, `/api/agent/bookings/:id`

Declared at source line 23. Route handler pipeline names: `getAgentBooking`.

```js
router.get("/:id", getAgentBooking)
```

- Imported handler/middleware `getAgentBooking`: [agentBookingController.js](../../../../server/controllers/agentBookingController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getAgentBooking`

Handler starts at [controller line 536](../../../../server/controllers/agentBookingController.js#L536). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Invalid booking ID.”; “Agent profile not found.”; “Booking not found.”.
- Database operations detected: `Agent.findOne`, `Booking.findOne`.
- Input/validation source lines to inspect:
  - [Line 543](../../../../server/controllers/agentBookingController.js#L543): `!isValidId(req.params.id)`
  - [Line 545](../../../../server/controllers/agentBookingController.js#L545): `return res.status(400).json({`
  - [Line 557](../../../../server/controllers/agentBookingController.js#L557): `return res.status(404).json({`
  - [Line 565](../../../../server/controllers/agentBookingController.js#L565): `_id: req.params.id,`
  - [Line 581](../../../../server/controllers/agentBookingController.js#L581): `return res.status(404).json({`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/agents/bookings/<id>'
```

### POST / → `/api/agents/bookings`, `/api/agent/bookings`

Declared at source line 24. Route handler pipeline names: `createBooking`.

```js
router.post("/", createBooking)
```

- Imported handler/middleware `createBooking`: [agentBookingController.js](../../../../server/controllers/agentBookingController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `createBooking`

Handler starts at [controller line 29](../../../../server/controllers/agentBookingController.js#L29). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `customer`, `tour`, `travelDate`, `travelers`, `pickupLocation`, `pickupTime`, `hotelName`, `roomNumber`, `emergencyContact`, `specialRequests`, `paymentMethod`, `customerNotes`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `403`, `400`, `201`.
- JSON envelope keys observed: `success`, `message`, `booking`.
- Literal messages include: “Agent profile not found.”; “Agent account is not approved or active.”; “Invalid customer or tour.”; “A valid travel date is required.”; “At least one traveler is required.”; “Tour not found.”; “Customer not found or does not belong to this agent.”; “This tour is not currently available.”; “Invalid tour price.”; “Agent booking created successfully.”.
- Database operations detected: `Agent.findOne`, `Tour.findOne`, `Customer.findOne`, `Booking.create`.
- Input/validation source lines to inspect:
  - [Line 49](../../../../server/controllers/agentBookingController.js#L49): `return res.status(404).json({`
  - [Line 61](../../../../server/controllers/agentBookingController.js#L61): `return res.status(403).json({`
  - [Line 87](../../../../server/controllers/agentBookingController.js#L87): `} = req.body;`
  - [Line 101](../../../../server/controllers/agentBookingController.js#L101): `return res.status(400).json({`
  - [Line 116](../../../../server/controllers/agentBookingController.js#L116): `return res.status(400).json({`
  - [Line 134](../../../../server/controllers/agentBookingController.js#L134): `return res.status(400).json({`
  - [Line 169](../../../../server/controllers/agentBookingController.js#L169): `return res.status(404).json({`
  - [Line 184](../../../../server/controllers/agentBookingController.js#L184): `return res.status(404).json({`
  - [Line 203](../../../../server/controllers/agentBookingController.js#L203): `return res.status(400).json({`
  - [Line 227](../../../../server/controllers/agentBookingController.js#L227): `return res.status(400).json({`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/agents/bookings'
```

### PATCH /:id/status → `/api/agents/bookings/:id/status`, `/api/agent/bookings/:id/status`

Declared at source line 25. Route handler pipeline names: `updateBookingStatus`.

```js
router.patch("/:id/status", updateBookingStatus)
```

- Imported handler/middleware `updateBookingStatus`: [agentBookingController.js](../../../../server/controllers/agentBookingController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `updateBookingStatus`

Handler starts at [controller line 603](../../../../server/controllers/agentBookingController.js#L603). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `status`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `409`, `200`.
- JSON envelope keys observed: `success`, `message`, `code`.
- Literal messages include: “Invalid booking ID.”; “Invalid booking status.”; “Agent profile not found.”; “Booking not found.”; “Only fully paid bookings can be moved into an active or completed trip state.”; “Booking status updated successfully.”.
- Database operations detected: `Agent.findOne`, `Booking.findOne`.
- Input/validation source lines to inspect:
  - [Line 610](../../../../server/controllers/agentBookingController.js#L610): `!isValidId(req.params.id)`
  - [Line 612](../../../../server/controllers/agentBookingController.js#L612): `return res.status(400).json({`
  - [Line 619](../../../../server/controllers/agentBookingController.js#L619): `req.body;`
  - [Line 626](../../../../server/controllers/agentBookingController.js#L626): `return res.status(400).json({`
  - [Line 639](../../../../server/controllers/agentBookingController.js#L639): `return res.status(404).json({`
  - [Line 647](../../../../server/controllers/agentBookingController.js#L647): `_id: req.params.id,`
  - [Line 653](../../../../server/controllers/agentBookingController.js#L653): `return res.status(404).json({`
  - [Line 660](../../../../server/controllers/agentBookingController.js#L660): `return res.status(400).json({`
  - [Line 667](../../../../server/controllers/agentBookingController.js#L667): `return res.status(409).json({`
  - [Line 676](../../../../server/controllers/agentBookingController.js#L676): `return res.status(409).json({`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PATCH 'http://localhost:5000/api/agents/bookings/<id>/status'
```

### PATCH /:id/cancel → `/api/agents/bookings/:id/cancel`, `/api/agent/bookings/:id/cancel`

Declared at source line 26. Route handler pipeline names: `cancelAgentBooking`.

```js
router.patch("/:id/cancel", cancelAgentBooking)
```

- Imported handler/middleware `cancelAgentBooking`: [agentBookingController.js](../../../../server/controllers/agentBookingController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `cancelAgentBooking`

Handler starts at [controller line 708](../../../../server/controllers/agentBookingController.js#L708). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `reason`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Invalid booking ID.”; “Agent profile not found.”; “Booking not found.”; “Completed bookings cannot be cancelled.”; “Booking cancelled successfully.”.
- Database operations detected: `Agent.findOne`, `Booking.findOne`.
- Input/validation source lines to inspect:
  - [Line 715](../../../../server/controllers/agentBookingController.js#L715): `!isValidId(req.params.id)`
  - [Line 717](../../../../server/controllers/agentBookingController.js#L717): `return res.status(400).json({`
  - [Line 729](../../../../server/controllers/agentBookingController.js#L729): `return res.status(404).json({`
  - [Line 737](../../../../server/controllers/agentBookingController.js#L737): `_id: req.params.id,`
  - [Line 743](../../../../server/controllers/agentBookingController.js#L743): `return res.status(404).json({`
  - [Line 752](../../../../server/controllers/agentBookingController.js#L752): `return res.status(400).json({`
  - [Line 769](../../../../server/controllers/agentBookingController.js#L769): `req.body.reason || "";`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PATCH 'http://localhost:5000/api/agents/bookings/<id>/cancel'
```

### DELETE /:id → `/api/agents/bookings/:id`, `/api/agent/bookings/:id`

Declared at source line 27. Route handler pipeline names: `cancelAgentBooking`.

```js
router.delete("/:id", cancelAgentBooking)
```

- Imported handler/middleware `cancelAgentBooking`: [agentBookingController.js](../../../../server/controllers/agentBookingController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `cancelAgentBooking`

Handler starts at [controller line 708](../../../../server/controllers/agentBookingController.js#L708). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `reason`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Invalid booking ID.”; “Agent profile not found.”; “Booking not found.”; “Completed bookings cannot be cancelled.”; “Booking cancelled successfully.”.
- Database operations detected: `Agent.findOne`, `Booking.findOne`.
- Input/validation source lines to inspect:
  - [Line 715](../../../../server/controllers/agentBookingController.js#L715): `!isValidId(req.params.id)`
  - [Line 717](../../../../server/controllers/agentBookingController.js#L717): `return res.status(400).json({`
  - [Line 729](../../../../server/controllers/agentBookingController.js#L729): `return res.status(404).json({`
  - [Line 737](../../../../server/controllers/agentBookingController.js#L737): `_id: req.params.id,`
  - [Line 743](../../../../server/controllers/agentBookingController.js#L743): `return res.status(404).json({`
  - [Line 752](../../../../server/controllers/agentBookingController.js#L752): `return res.status(400).json({`
  - [Line 769](../../../../server/controllers/agentBookingController.js#L769): `req.body.reason || "";`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X DELETE 'http://localhost:5000/api/agents/bookings/<id>'
```

