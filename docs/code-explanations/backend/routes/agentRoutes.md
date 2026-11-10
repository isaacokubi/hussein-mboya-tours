# Route module: agentRoutes.js

**Source:** [server/routes/agentRoutes.js](../../../../server/routes/agentRoutes.js)

Observed mount prefixes include `/api/agents/dashboard`, `/api/agent/dashboard`, `/api/agents/bookings`, `/api/agent/bookings`, `/api/agents/customers`, `/api/agent/customers`, `/api/agents/quotes`, `/api/agent/quotes`, `/api/agents/commission`, `/api/agent/commission`, `/api/agents/tours`, `/api/agent/tours`, `/api/agents/tours/:id`, `/api/agent/tours/:id`.

## Router-wide middleware

- `router.use(protect);`
- `router.use(resolveTenant);`
- `router.use(agentMiddleware);`
- `router.use(requireApprovedAgent);`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET /dashboard → `/api/agents/dashboard`, `/api/agent/dashboard`

Declared at source line 19. Route handler pipeline names: `getAgentDashboard`.

```js
router.get("/dashboard", getAgentDashboard)
```

- Imported handler/middleware `getAgentDashboard`: [agentController.js](../../../../server/controllers/agentController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getAgentDashboard`

Handler starts at [controller line 50](../../../../server/controllers/agentController.js#L50). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `Agent.create`, `Agent.updateOne`, `Booking.countDocuments`, `Booking.aggregate`, `Commission.aggregate`, `Booking.find`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/agents/dashboard'
```

### GET /bookings → `/api/agents/bookings`, `/api/agent/bookings`

Declared at source line 22. Route handler pipeline names: `getAgentBookings`.

```js
router.get("/bookings", getAgentBookings)
```

- Imported handler/middleware `getAgentBookings`: [agentController.js](../../../../server/controllers/agentController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getAgentBookings`

Handler starts at [controller line 145](../../../../server/controllers/agentController.js#L145). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `page`, `limit`, `status`.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Agent profile not found.”.
- Database operations detected: `Booking.find`, `Booking.countDocuments`.
- Input/validation source lines to inspect:
  - [Line 148](../../../../server/controllers/agentController.js#L148): `if (!agent) return res.status(404).json({ success: false, message: "Agent profile not found." });`
  - [Line 149](../../../../server/controllers/agentController.js#L149): `const page = Math.max(1, Number(req.query.page) || 1);`
  - [Line 150](../../../../server/controllers/agentController.js#L150): `const limit = Math.min(10, Math.max(1, Number(req.query.limit) || 10));`
  - [Line 152](../../../../server/controllers/agentController.js#L152): `if (req.query.status) filter.status = req.query.status;`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/agents/bookings'
```

### GET /customers → `/api/agents/customers`, `/api/agent/customers`

Declared at source line 23. Route handler pipeline names: `getAgentCustomers`.

```js
router.get("/customers", getAgentCustomers)
```

- Imported handler/middleware `getAgentCustomers`: [agentController.js](../../../../server/controllers/agentController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getAgentCustomers`

Handler starts at [controller line 169](../../../../server/controllers/agentController.js#L169). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “Agent profile not found.”.
- Database operations detected: `Booking.find`.
- Input/validation source lines to inspect:
  - [Line 172](../../../../server/controllers/agentController.js#L172): `if (!agent) return res.status(404).json({ success: false, message: "Agent profile not found." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/agents/customers'
```

### GET /quotes → `/api/agents/quotes`, `/api/agent/quotes`

Declared at source line 24. Route handler pipeline names: `getAgentQuotations`.

```js
router.get("/quotes", getAgentQuotations)
```

- Imported handler/middleware `getAgentQuotations`: [quotationController.js](../../../../server/controllers/quotationController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getAgentQuotations`

Handler starts at [controller line 87](../../../../server/controllers/quotationController.js#L87). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `200`.
- JSON envelope keys observed: `success`, `message`, `count`.
- Literal messages include: “Agent profile not found”.
- Database operations detected: `Agent.findOne`, `Quotation.find`.
- Input/validation source lines to inspect:
  - [Line 94](../../../../server/controllers/quotationController.js#L94): `return res.status(404).json({`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/agents/quotes'
```

### GET /commission → `/api/agents/commission`, `/api/agent/commission`

Declared at source line 25. Route handler pipeline names: `getMyAgentCommission`.

```js
router.get("/commission", getMyAgentCommission)
```

- Imported handler/middleware `getMyAgentCommission`: [agentController.js](../../../../server/controllers/agentController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getMyAgentCommission`

Handler starts at [controller line 190](../../../../server/controllers/agentController.js#L190). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `200`.
- JSON envelope keys observed: `success`, `message`, `commissionRate`, `data`.
- Literal messages include: “Agent profile not found.”.
- Database operations detected: `Commission.find`.
- Input/validation source lines to inspect:
  - [Line 193](../../../../server/controllers/agentController.js#L193): `if (!agent) return res.status(404).json({ success: false, message: "Agent profile not found." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/agents/commission'
```

### GET /tours → `/api/agents/tours`, `/api/agent/tours`

Declared at source line 27. Route handler pipeline names: `authorize`, `getAgentTours`.

```js
router.get("/tours", authorize("view_agent_tours"), getAgentTours)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `getAgentTours`: [agentTourController.js](../../../../server/controllers/agentTourController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getAgentTours`

Handler starts at [controller line 52](../../../../server/controllers/agentTourController.js#L52). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `status`.
- Literal HTTP statuses in handler: `401`, `200`.
- JSON envelope keys observed: `success`, `message`, `count`.
- Literal messages include: “Unauthorized.”.
- Database operations detected: `Tour.find`.
- Input/validation source lines to inspect:
  - [Line 55](../../../../server/controllers/agentTourController.js#L55): `if (!req.user || !isValidId(req.user._id)) return res.status(401).json({ success: false, message: "Unauthorized." });`
  - [Line 57](../../../../server/controllers/agentTourController.js#L57): `if (req.query.status) filter.status = req.query.status;`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/agents/tours'
```

### GET /tours/:id → `/api/agents/tours/:id`, `/api/agent/tours/:id`

Declared at source line 28. Route handler pipeline names: `authorize`, `getAgentTour`.

```js
router.get("/tours/:id", authorize("view_agent_tours"), getAgentTour)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `getAgentTour`: [agentTourController.js](../../../../server/controllers/agentTourController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getAgentTour`

Handler starts at [controller line 63](../../../../server/controllers/agentTourController.js#L63). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Invalid tour ID.”; “Tour not found.”.
- Database operations detected: `Tour.findOne`.
- Input/validation source lines to inspect:
  - [Line 66](../../../../server/controllers/agentTourController.js#L66): `if (!isValidId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid tour ID." });`
  - [Line 67](../../../../server/controllers/agentTourController.js#L67): `const tour = await Tour.findOne(scope(req, { _id: req.params.id, createdBy: req.user._id, isDeleted: false }));`
  - [Line 68](../../../../server/controllers/agentTourController.js#L68): `if (!tour) return res.status(404).json({ success: false, message: "Tour not found." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/agents/tours/<id>'
```

### POST /tours → `/api/agents/tours`, `/api/agent/tours`

Declared at source line 29. Route handler pipeline names: `authorize`, `createAgentTour`.

```js
router.post("/tours", authorize("create_agent_tour"), upload.array("images", 10), createAgentTour)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `createAgentTour`: [agentTourController.js](../../../../server/controllers/agentTourController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `createAgentTour`

Handler starts at [controller line 18](../../../../server/controllers/agentTourController.js#L18). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `title`, `destination`, `price`, `agentPrice`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `401`, `404`, `403`, `400`, `409`, `201`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Unauthorized.”; “Agent profile not found.”; “Agent account is not approved or active.”; “Tour title is required.”; “Destination is required.”; “Tour price is required.”; “A tour with this title already exists.”; “Tour created successfully.”.
- Database operations detected: `Tour.create`.
- Input/validation source lines to inspect:
  - [Line 21](../../../../server/controllers/agentTourController.js#L21): `if (!req.user || !isValidId(req.user._id)) return res.status(401).json({ success: false, message: "Unauthorized." });`
  - [Line 23](../../../../server/controllers/agentTourController.js#L23): `if (!agentProfile) return res.status(404).json({ success: false, message: "Agent profile not found." });`
  - [Line 24](../../../../server/controllers/agentTourController.js#L24): `if (!agentProfile.isApproved || agentProfile.status !== "active") return res.status(403).json({ success: false, message: "Agent account is not approved or active." });`
  - [Line 25](../../../../server/controllers/agentTourController.js#L25): `if (!req.body.title) return res.status(400).json({ success: false, message: "Tour title is required." });`
  - [Line 26](../../../../server/controllers/agentTourController.js#L26): `if (!req.body.destination) return res.status(400).json({ success: false, message: "Destination is required." });`
  - [Line 27](../../../../server/controllers/agentTourController.js#L27): `if (req.body.price === undefined && req.body.agentPrice === undefined) return res.status(400).json({ success: false, message: "Tour price is required." });`
  - [Line 29](../../../../server/controllers/agentTourController.js#L29): `const title = cleanString(req.body.title);`
  - [Line 32](../../../../server/controllers/agentTourController.js#L32): `if (exists) return res.status(409).json({ success: false, message: "A tour with this title already exists." });`
  - [Line 35](../../../../server/controllers/agentTourController.js#L35): `for (const field of allowedFields) if (req.body[field] !== undefined) tourData[field] = req.body[field];`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/agents/tours'
```

### PUT /tours/:id → `/api/agents/tours/:id`, `/api/agent/tours/:id`

Declared at source line 30. Route handler pipeline names: `authorize`, `updateAgentTour`.

```js
router.put("/tours/:id", authorize("edit_agent_tour"), upload.array("images", 10), updateAgentTour)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `updateAgentTour`: [agentTourController.js](../../../../server/controllers/agentTourController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `updateAgentTour`

Handler starts at [controller line 73](../../../../server/controllers/agentTourController.js#L73). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `title`, `price`, `agentPrice`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Invalid tour ID.”; “Tour not found.”; “Tour updated successfully.”.
- Database operations detected: `Tour.findOne`.
- Input/validation source lines to inspect:
  - [Line 76](../../../../server/controllers/agentTourController.js#L76): `if (!isValidId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid tour ID." });`
  - [Line 77](../../../../server/controllers/agentTourController.js#L77): `const tour = await Tour.findOne(scope(req, { _id: req.params.id, createdBy: req.user._id, isDeleted: false }));`
  - [Line 78](../../../../server/controllers/agentTourController.js#L78): `if (!tour) return res.status(404).json({ success: false, message: "Tour not found." });`
  - [Line 80](../../../../server/controllers/agentTourController.js#L80): `for (const field of allowedFields) if (req.body[field] !== undefined) tour[field] = req.body[field];`
  - [Line 81](../../../../server/controllers/agentTourController.js#L81): `if (req.body.title) tour.title = cleanString(req.body.title);`
  - [Line 82](../../../../server/controllers/agentTourController.js#L82): `if (req.body.title && tour.isModified("title")) {`
  - [Line 89](../../../../server/controllers/agentTourController.js#L89): `if (req.body.price !== undefined) tour.price = Number(req.body.price);`
  - [Line 90](../../../../server/controllers/agentTourController.js#L90): `if (req.body.agentPrice !== undefined) tour.agentPrice = Number(req.body.agentPrice);`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PUT 'http://localhost:5000/api/agents/tours/<id>'
```

### DELETE /tours/:id → `/api/agents/tours/:id`, `/api/agent/tours/:id`

Declared at source line 31. Route handler pipeline names: `authorize`, `deleteAgentTour`.

```js
router.delete("/tours/:id", authorize("delete_agent_tour"), deleteAgentTour)
```

- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `deleteAgentTour`: [agentTourController.js](../../../../server/controllers/agentTourController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `deleteAgentTour`

Handler starts at [controller line 98](../../../../server/controllers/agentTourController.js#L98). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Invalid tour ID.”; “Tour not found.”; “Tour deleted successfully.”.
- Database operations detected: `Tour.findOne`.
- Input/validation source lines to inspect:
  - [Line 101](../../../../server/controllers/agentTourController.js#L101): `if (!isValidId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid tour ID." });`
  - [Line 102](../../../../server/controllers/agentTourController.js#L102): `const tour = await Tour.findOne(scope(req, { _id: req.params.id, createdBy: req.user._id, isDeleted: false }));`
  - [Line 103](../../../../server/controllers/agentTourController.js#L103): `if (!tour) return res.status(404).json({ success: false, message: "Tour not found." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X DELETE 'http://localhost:5000/api/agents/tours/<id>'
```

