# Route module: customTourRequestRoutes.js

**Source:** [server/routes/customTourRequestRoutes.js](../../../../server/routes/customTourRequestRoutes.js)

Observed mount prefixes include `/api/custom-tour-requests`, `/api/custom-tour-requests/mine`, `/api/custom-tour-requests/admin`, `/api/custom-tour-requests/admin/:id/quote`, `/api/custom-tour-requests/admin/:id/assign`, `/api/custom-tour-requests/:id/convert`.

## Router-wide middleware

- `router.use(resolveTenant);`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### POST / → `/api/custom-tour-requests`

Declared at source line 13. Route handler pipeline names: `optionalProtect`, `createCustomTourRequest`.

```js
router.post("/", optionalProtect, createCustomTourRequest)
```

- Imported handler/middleware `optionalProtect`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `createCustomTourRequest`: [customTourRequestController.js](../../../../server/controllers/customTourRequestController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `createCustomTourRequest`

Handler starts at [controller line 10](../../../../server/controllers/customTourRequestController.js#L10). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `destination`, `durationDays`, `people`, `startDate`, `budget`, `requirements`, `pickupLocation`, `pickupDate`, `pickupTime`, `adults`, `children`, `accommodationPreference`, `mealPreference`, `transportPreference`, `emergencyContact`, `specialRequests`, `guestName`, `guestEmail`, `guestPhone`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `201`.
- JSON envelope keys observed: `success`, `message`, `request`.
- Literal messages include: “Destination, duration and number of people are required.”; “Name and email are required for guest custom-tour requests.”; “Custom tour request submitted. The company will review it and send you a total cost.”.
- Database operations detected: `CustomTourRequest.create`, `User.find`.
- Input/validation source lines to inspect:
  - [Line 13](../../../../server/controllers/customTourRequestController.js#L13): `const { destination,durationDays,people,startDate,budget,requirements,pickupLocation,pickupDate,pickupTime,adults,children,accommodationPreference,mealPreference,transpor`
  - [Line 14](../../../../server/controllers/customTourRequestController.js#L14): `if(!destination||Number(durationDays)<1||Number(people)<1) return res.status(400).json({success:false,message:"Destination, duration and number of people are required."})`
  - [Line 19](../../../../server/controllers/customTourRequestController.js#L19): `if(!isAuthenticated && (!name||!email)) return res.status(400).json({success:false,message:"Name and email are required for guest custom-tour requests."});`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/custom-tour-requests'
```

### GET /mine → `/api/custom-tour-requests/mine`

Declared at source line 14. Route handler pipeline names: `protect`, `getMyCustomTourRequests`.

```js
router.get("/mine", protect, getMyCustomTourRequests)
```

- Imported handler/middleware `protect`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `getMyCustomTourRequests`: [customTourRequestController.js](../../../../server/controllers/customTourRequestController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getMyCustomTourRequests`

Handler starts at [controller line 27](../../../../server/controllers/customTourRequestController.js#L27). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`.
- Database operations detected: `CustomTourRequest.find`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/custom-tour-requests/mine'
```

### GET /admin → `/api/custom-tour-requests/admin`

Declared at source line 15. Route handler pipeline names: `protect`, `adminMiddleware`, `getAdminCustomTourRequests`.

```js
router.get("/admin", protect, adminMiddleware, getAdminCustomTourRequests)
```

- Imported handler/middleware `protect`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `adminMiddleware`: [adminMiddleware.js](../../../../server/middleware/adminMiddleware.js)
- Imported handler/middleware `getAdminCustomTourRequests`: [customTourRequestController.js](../../../../server/controllers/customTourRequestController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getAdminCustomTourRequests`

Handler starts at [controller line 28](../../../../server/controllers/customTourRequestController.js#L28). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`.
- Database operations detected: `CustomTourRequest.find`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/custom-tour-requests/admin'
```

### PATCH /admin/:id/quote → `/api/custom-tour-requests/admin/:id/quote`

Declared at source line 16. Route handler pipeline names: `protect`, `adminMiddleware`, `quoteCustomTourRequest`.

```js
router.patch("/admin/:id/quote", protect, adminMiddleware, quoteCustomTourRequest)
```

- Imported handler/middleware `protect`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `adminMiddleware`: [adminMiddleware.js](../../../../server/middleware/adminMiddleware.js)
- Imported handler/middleware `quoteCustomTourRequest`: [customTourRequestController.js](../../../../server/controllers/customTourRequestController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `quoteCustomTourRequest`

Handler starts at [controller line 29](../../../../server/controllers/customTourRequestController.js#L29). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `status`, `quotedAmount`, `adminNotes`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `409`.
- JSON envelope keys observed: `success`, `message`, `request`.
- Literal messages include: “Invalid request status.”; “A quoted amount greater than zero is required.”; “Request not found.”.
- Database operations detected: `CustomTourRequest.findOne`, `CustomTourRequest.findOneAndUpdate`, `Notification.create`.
- Input/validation source lines to inspect:
  - [Line 29](../../../../server/controllers/customTourRequestController.js#L29): `async(req,res,next)=>{try{const {status="quoted",quotedAmount,adminNotes=""}=req.body||{};const amount=Number(quotedAmount);if(!["approved","quoted","rejected"].includes(`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PATCH 'http://localhost:5000/api/custom-tour-requests/admin/<id>/quote'
```

### PATCH /admin/:id/assign → `/api/custom-tour-requests/admin/:id/assign`

Declared at source line 17. Route handler pipeline names: `protect`, `adminMiddleware`, `assignCustomTourResources`.

```js
router.patch("/admin/:id/assign", protect, adminMiddleware, assignCustomTourResources)
```

- Imported handler/middleware `protect`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `adminMiddleware`: [adminMiddleware.js](../../../../server/middleware/adminMiddleware.js)
- Imported handler/middleware `assignCustomTourResources`: [customTourRequestController.js](../../../../server/controllers/customTourRequestController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `assignCustomTourResources`

Handler starts at [controller line 30](../../../../server/controllers/customTourRequestController.js#L30). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `guide`, `driver`, `agent`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `409`, `400`.
- JSON envelope keys observed: `success`, `message`, `request`.
- Literal messages include: “Request not found.”; “Selected guide is invalid, inactive, unavailable or belongs to another tenant.”; “Selected driver is invalid, inactive, unavailable or belongs to another tenant.”; “Selected agent is invalid, inactive, unapproved or belongs to another tenant.”.
- Database operations detected: `CustomTourRequest.findOne`, `Staff.findOne`, `Agent.findOne`.
- Input/validation source lines to inspect:
  - [Line 30](../../../../server/controllers/customTourRequestController.js#L30): `async(req,res,next)=>{try{const item=await CustomTourRequest.findOne(mergeTenantFilter({_id:req.params.id}));if(!item)return res.status(404).json({success:false,message:"`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PATCH 'http://localhost:5000/api/custom-tour-requests/admin/<id>/assign'
```

### POST /:id/convert → `/api/custom-tour-requests/:id/convert`

Declared at source line 18. Route handler pipeline names: `protect`, `convertCustomTourToBooking`.

```js
router.post("/:id/convert", protect, convertCustomTourToBooking)
```

- Imported handler/middleware `protect`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `convertCustomTourToBooking`: [customTourRequestController.js](../../../../server/controllers/customTourRequestController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `convertCustomTourToBooking`

Handler starts at [controller line 32](../../../../server/controllers/customTourRequestController.js#L32). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`, `booking`.
- Literal messages include: “Quoted custom tour request not found”; “Custom tour booking already exists.”.
- Database operations detected: `CustomTourRequest.findOne`, `Booking.findOne`, `Destination.findOne`, `Destination.create`, `Tour.findOne`, `Tour.create`, `Booking.create`.
- Input/validation source lines to inspect:
  - [Line 35](../../../../server/controllers/customTourRequestController.js#L35): `const item=await CustomTourRequest.findOne(mergeTenantFilter({_id:req.params.id,customer:req.user._id,status:{$in:["quoted","approved"]}}));`
  - [Line 36](../../../../server/controllers/customTourRequestController.js#L36): `if(!item)return res.status(404).json({success:false,message:"Quoted custom tour request not found"});`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/custom-tour-requests/<id>/convert'
```

