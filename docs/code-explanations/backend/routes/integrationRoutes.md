# Route module: integrationRoutes.js

**Source:** [server/routes/integrationRoutes.js](../../../../server/routes/integrationRoutes.js)

Observed mount prefixes include `/api/integrations/keys`, `/api/integrations/keys/:id`, `/api/integrations/v1/config`, `/api/integrations/v1/tours`, `/api/integrations/v1/widget.js`, `/api/integrations/v1/bookings`, `/api/integrations/v1/leads`, `/api/integrations/v1/server/bookings`, `/api/integrations/leads`, `/api/integrations/leads/:id`.

## Router-wide middleware

- `router.use("/v1", integrationLimiter);`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### POST /keys → `/api/integrations/keys`

Declared at source line 20. Route handler pipeline names: `protect`, `authorize`, `createIntegrationKey`.

```js
router.post("/keys", protect, authorize("settings.manage"), createIntegrationKey)
```

- Imported handler/middleware `protect`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `createIntegrationKey`: [integrationController.js](../../../../server/controllers/integrationController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `createIntegrationKey`

Handler starts at [controller line 28](../../../../server/controllers/integrationController.js#L28). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `allowedOrigins`, `permissions`, `environment`, `name`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `403`, `400`, `201`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “You do not have permission to manage integrations.”; “At least one allowed website origin is required for a live browser connector.”; “Integration key created. Store the secret now; it cannot be shown again.”.
- Database operations detected: `WebsiteIntegrationKey.create`.
- Input/validation source lines to inspect:
  - [Line 28](../../../../server/controllers/integrationController.js#L28): `async(req,res,next)=>{try{requireTenantId();if(!canManage(req))return res.status(403).json({success:false,message:"You do not have permission to manage integrations."});c`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/integrations/keys'
```

### GET /keys → `/api/integrations/keys`

Declared at source line 21. Route handler pipeline names: `protect`, `authorize`, `listIntegrationKeys`.

```js
router.get("/keys", protect, authorize("settings.manage"), listIntegrationKeys)
```

- Imported handler/middleware `protect`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `listIntegrationKeys`: [integrationController.js](../../../../server/controllers/integrationController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `listIntegrationKeys`

Handler starts at [controller line 29](../../../../server/controllers/integrationController.js#L29). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `403`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “You do not have permission to manage integrations.”.
- Database operations detected: `WebsiteIntegrationKey.find`.
- Input/validation source lines to inspect:
  - [Line 29](../../../../server/controllers/integrationController.js#L29): `async(req,res,next)=>{try{requireTenantId();if(!canManage(req))return res.status(403).json({success:false,message:"You do not have permission to manage integrations."});c`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/integrations/keys'
```

### DELETE /keys/:id → `/api/integrations/keys/:id`

Declared at source line 22. Route handler pipeline names: `protect`, `authorize`, `revokeIntegrationKey`.

```js
router.delete("/keys/:id", protect, authorize("settings.manage"), revokeIntegrationKey)
```

- Imported handler/middleware `protect`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `revokeIntegrationKey`: [integrationController.js](../../../../server/controllers/integrationController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `revokeIntegrationKey`

Handler starts at [controller line 30](../../../../server/controllers/integrationController.js#L30). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `403`, `404`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “You do not have permission to manage integrations.”; “Integration key not found or already revoked.”; “Integration key revoked.”.
- Database operations detected: `WebsiteIntegrationKey.findOneAndUpdate`.
- Input/validation source lines to inspect:
  - [Line 30](../../../../server/controllers/integrationController.js#L30): `async(req,res,next)=>{try{requireTenantId();if(!canManage(req))return res.status(403).json({success:false,message:"You do not have permission to manage integrations."});c`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X DELETE 'http://localhost:5000/api/integrations/keys/<id>'
```

### GET /v1/config → `/api/integrations/v1/config`

Declared at source line 25. Route handler pipeline names: `requirePublicIntegrationKey`, `requireIntegrationPermission`, `getIntegrationConfig`.

```js
router.get("/v1/config", requirePublicIntegrationKey, requireIntegrationPermission("tour:read"), getIntegrationConfig)
```

- Imported handler/middleware `requirePublicIntegrationKey`: [integrationAuth.js](../../../../server/middleware/integrationAuth.js)
- Imported handler/middleware `requireIntegrationPermission`: [integrationAuth.js](../../../../server/middleware/integrationAuth.js)
- Imported handler/middleware `getIntegrationConfig`: [integrationController.js](../../../../server/controllers/integrationController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getIntegrationConfig`

Handler starts at [controller line 31](../../../../server/controllers/integrationController.js#L31). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `Organization.findById`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/integrations/v1/config'
```

### GET /v1/tours → `/api/integrations/v1/tours`

Declared at source line 26. Route handler pipeline names: `requirePublicIntegrationKey`, `requireIntegrationPermission`, `listIntegrationTours`.

```js
router.get("/v1/tours", requirePublicIntegrationKey, requireIntegrationPermission("tour:read"), listIntegrationTours)
```

- Imported handler/middleware `requirePublicIntegrationKey`: [integrationAuth.js](../../../../server/middleware/integrationAuth.js)
- Imported handler/middleware `requireIntegrationPermission`: [integrationAuth.js](../../../../server/middleware/integrationAuth.js)
- Imported handler/middleware `listIntegrationTours`: [integrationController.js](../../../../server/controllers/integrationController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `listIntegrationTours`

Handler starts at [controller line 32](../../../../server/controllers/integrationController.js#L32). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `limit`, `search`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `count`.
- Database operations detected: `Tour.find`.
- Input/validation source lines to inspect:
  - [Line 32](../../../../server/controllers/integrationController.js#L32): `async(req,res,next)=>{try{requireTenantId();const limit=Math.min(Math.max(Number(req.query.limit)||50,1),100);const search=clean(req.query.search,120);const filter={statu`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/integrations/v1/tours'
```

### GET /v1/widget.js → `/api/integrations/v1/widget.js`

Declared at source line 27. Route handler pipeline names: `requirePublicIntegrationKey`, `requireIntegrationPermission`, `getIntegrationWidget`.

```js
router.get("/v1/widget.js", requirePublicIntegrationKey, requireIntegrationPermission("booking:create"), getIntegrationWidget)
```

- Imported handler/middleware `requirePublicIntegrationKey`: [integrationAuth.js](../../../../server/middleware/integrationAuth.js)
- Imported handler/middleware `requireIntegrationPermission`: [integrationAuth.js](../../../../server/middleware/integrationAuth.js)
- Imported handler/middleware `getIntegrationWidget`: [integrationController.js](../../../../server/controllers/integrationController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getIntegrationWidget`

Handler starts at [controller line 35](../../../../server/controllers/integrationController.js#L35). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `siteKey`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: none directly detected (may be delegated to service/helper).
- Input/validation source lines to inspect:
  - [Line 35](../../../../server/controllers/integrationController.js#L35): `async(req,res,next)=>{try{const api=\`${req.protocol}://${req.get("host")}\`,key=String(req.query?.siteKey||"");res.type("application/javascript").set("Cache-Control","no`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/integrations/v1/widget.js'
```

### POST /v1/bookings → `/api/integrations/v1/bookings`

Declared at source line 28. Route handler pipeline names: `requirePublicIntegrationKey`, `requireIntegrationPermission`, `createExternalBooking`.

```js
router.post("/v1/bookings", requirePublicIntegrationKey, requireIntegrationPermission("booking:create"), createExternalBooking)
```

- Imported handler/middleware `requirePublicIntegrationKey`: [integrationAuth.js](../../../../server/middleware/integrationAuth.js)
- Imported handler/middleware `requireIntegrationPermission`: [integrationAuth.js](../../../../server/middleware/integrationAuth.js)
- Imported handler/middleware `createExternalBooking`: [integrationController.js](../../../../server/controllers/integrationController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `createExternalBooking`

Handler starts at [controller line 37](../../../../server/controllers/integrationController.js#L37). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `externalBookingId`, `bookingId`, `reference`, `source`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `409`, `201`.
- JSON envelope keys observed: `success`, `message`, `duplicate`, `booking`.
- Literal messages include: “tourId or tourSlug is required.”; “A valid travelDate is required.”; “Travel date cannot be in the past.”; “Booking already received.”; “Tour not found or not available.”; “Customer phone number is required.”; “Not enough available tour slots for this booking.”; “Booking captured automatically.”.
- Database operations detected: `WebsiteIntegrationEvent.findOne`, `Booking.findOne`, `WebsiteIntegrationEvent.create`, `Tour.findOne`, `Customer.findOne`, `Customer.create`, `Booking.create`, `Invoice.findOneAndUpdate`, `Customer.updateOne`, `User.find`.
- Input/validation source lines to inspect:
  - [Line 37](../../../../server/controllers/integrationController.js#L37): `async(req,res,next)=>{let reserved=false,tourId=null,count=1;try{requireTenantId();const body=req.body||{};tourId=body.tourId||body.tour||null;const slug=clean(body.tourS`
  - [Line 38](../../../../server/controllers/integrationController.js#L38): `const filter={status:{$in:["scheduled","upcoming","ongoing"]},published:true,available:true,isDeleted:false};if(tourId)filter._id=tourId;else filter.slug=slug;const tour=`
  - [Line 39](../../../../server/controllers/integrationController.js#L39): `const travelers=Array.isArray(body.travelers)&&body.travelers.length?body.travelers.slice(0,count).map(t=>({name:clean(t.name||\`${t.firstName||''} ${t.lastName||''}\`),a`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/integrations/v1/bookings'
```

### POST /v1/leads → `/api/integrations/v1/leads`

Declared at source line 29. Route handler pipeline names: `requirePublicIntegrationKey`, `requireIntegrationPermission`, `createWebsiteLead`.

```js
router.post("/v1/leads", requirePublicIntegrationKey, requireIntegrationPermission("lead:create"), createWebsiteLead)
```

- Imported handler/middleware `requirePublicIntegrationKey`: [integrationAuth.js](../../../../server/middleware/integrationAuth.js)
- Imported handler/middleware `requireIntegrationPermission`: [integrationAuth.js](../../../../server/middleware/integrationAuth.js)
- Imported handler/middleware `createWebsiteLead`: [websiteLeadController.js](../../../../server/controllers/websiteLeadController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `createWebsiteLead`

Handler starts at [controller line 28](../../../../server/controllers/websiteLeadController.js#L28). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `201`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Customer phone number is required.”; “Enter a valid email address.”; “Lead captured successfully.”.
- Database operations detected: `Tour.findOne`, `Lead.create`.
- Input/validation source lines to inspect:
  - [Line 31](../../../../server/controllers/websiteLeadController.js#L31): `const body = req.body || {};`
  - [Line 40](../../../../server/controllers/websiteLeadController.js#L40): `if (!phone) return res.status(400).json({ success: false, message: "Customer phone number is required." });`
  - [Line 41](../../../../server/controllers/websiteLeadController.js#L41): `if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ success: false, message: "Enter a valid email address." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/integrations/v1/leads'
```

### POST /v1/server/bookings → `/api/integrations/v1/server/bookings`

Declared at source line 30. Route handler pipeline names: `requireIntegrationKey`, `requireIntegrationPermission`, `createExternalBooking`.

```js
router.post("/v1/server/bookings", requireIntegrationKey, requireIntegrationPermission("booking:create"), createExternalBooking)
```

- Imported handler/middleware `requireIntegrationKey`: [integrationAuth.js](../../../../server/middleware/integrationAuth.js)
- Imported handler/middleware `requireIntegrationPermission`: [integrationAuth.js](../../../../server/middleware/integrationAuth.js)
- Imported handler/middleware `createExternalBooking`: [integrationController.js](../../../../server/controllers/integrationController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `createExternalBooking`

Handler starts at [controller line 37](../../../../server/controllers/integrationController.js#L37). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `externalBookingId`, `bookingId`, `reference`, `source`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `409`, `201`.
- JSON envelope keys observed: `success`, `message`, `duplicate`, `booking`.
- Literal messages include: “tourId or tourSlug is required.”; “A valid travelDate is required.”; “Travel date cannot be in the past.”; “Booking already received.”; “Tour not found or not available.”; “Customer phone number is required.”; “Not enough available tour slots for this booking.”; “Booking captured automatically.”.
- Database operations detected: `WebsiteIntegrationEvent.findOne`, `Booking.findOne`, `WebsiteIntegrationEvent.create`, `Tour.findOne`, `Customer.findOne`, `Customer.create`, `Booking.create`, `Invoice.findOneAndUpdate`, `Customer.updateOne`, `User.find`.
- Input/validation source lines to inspect:
  - [Line 37](../../../../server/controllers/integrationController.js#L37): `async(req,res,next)=>{let reserved=false,tourId=null,count=1;try{requireTenantId();const body=req.body||{};tourId=body.tourId||body.tour||null;const slug=clean(body.tourS`
  - [Line 38](../../../../server/controllers/integrationController.js#L38): `const filter={status:{$in:["scheduled","upcoming","ongoing"]},published:true,available:true,isDeleted:false};if(tourId)filter._id=tourId;else filter.slug=slug;const tour=`
  - [Line 39](../../../../server/controllers/integrationController.js#L39): `const travelers=Array.isArray(body.travelers)&&body.travelers.length?body.travelers.slice(0,count).map(t=>({name:clean(t.name||\`${t.firstName||''} ${t.lastName||''}\`),a`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/integrations/v1/server/bookings'
```

### GET /leads → `/api/integrations/leads`

Declared at source line 32. Route handler pipeline names: `protect`, `authorize`, `listWebsiteLeads`.

```js
router.get("/leads", protect, authorize("settings.manage"), listWebsiteLeads)
```

- Imported handler/middleware `protect`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `listWebsiteLeads`: [websiteLeadController.js](../../../../server/controllers/websiteLeadController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `listWebsiteLeads`

Handler starts at [controller line 84](../../../../server/controllers/websiteLeadController.js#L84). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `limit`, `status`, `search`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `count`.
- Database operations detected: `Lead.find`.
- Input/validation source lines to inspect:
  - [Line 87](../../../../server/controllers/websiteLeadController.js#L87): `const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);`
  - [Line 89](../../../../server/controllers/websiteLeadController.js#L89): `if (req.query.status) filter.status = clean(req.query.status, 30);`
  - [Line 90](../../../../server/controllers/websiteLeadController.js#L90): `if (req.query.search) {`
  - [Line 91](../../../../server/controllers/websiteLeadController.js#L91): `const search = clean(req.query.search, 120);`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/integrations/leads'
```

### PATCH /leads/:id → `/api/integrations/leads/:id`

Declared at source line 33. Route handler pipeline names: `protect`, `authorize`, `updateWebsiteLead`.

```js
router.patch("/leads/:id", protect, authorize("settings.manage"), updateWebsiteLead)
```

- Imported handler/middleware `protect`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `authorize`: [permissionMiddleware.js](../../../../server/middleware/permissionMiddleware.js)
- Imported handler/middleware `updateWebsiteLead`: [websiteLeadController.js](../../../../server/controllers/websiteLeadController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `updateWebsiteLead`

Handler starts at [controller line 99](../../../../server/controllers/websiteLeadController.js#L99). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Lead not found.”.
- Database operations detected: `Lead.findOneAndUpdate`.
- Input/validation source lines to inspect:
  - [Line 103](../../../../server/controllers/websiteLeadController.js#L103): `for (const key of ["status", "message", "lastContactedAt", "convertedBooking"]) if (req.body?.[key] !== undefined) updates[key] = req.body[key];`
  - [Line 104](../../../../server/controllers/websiteLeadController.js#L104): `const lead = await Lead.findOneAndUpdate({ _id: req.params.id, tenantId: req.tenantId }, { $set: updates }, { new: true, runValidators: true }).lean();`
  - [Line 105](../../../../server/controllers/websiteLeadController.js#L105): `if (!lead) return res.status(404).json({ success: false, message: "Lead not found." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PATCH 'http://localhost:5000/api/integrations/leads/<id>'
```

