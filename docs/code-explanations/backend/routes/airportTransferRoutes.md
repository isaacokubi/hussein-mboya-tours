# Route module: airportTransferRoutes.js

**Source:** [server/routes/airportTransferRoutes.js](../../../../server/routes/airportTransferRoutes.js)

Observed mount prefixes include `/api/airport-transfers`, `/api/airport-transfers/admin/catalog`, `/api/airport-transfers/admin/catalog/:id`, `/api/airport-transfers/bookings`, `/api/airport-transfers/bookings/:id`, `/api/airport-transfers/:id`.

## Router-wide middleware

No router.use declaration was found at module scope.

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET / → `/api/airport-transfers`

Declared at source line 9. Route handler pipeline names: `listTransfers`.

```js
router.get("/", listTransfers)
```

- Imported handler/middleware `listTransfers`: [airportTransferController.js](../../../../server/controllers/airportTransferController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `listTransfers`

Handler starts at [controller line 6](../../../../server/controllers/airportTransferController.js#L6). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `airportCode`, `direction`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `AirportTransfer.find`.
- Input/validation source lines to inspect:
  - [Line 6](../../../../server/controllers/airportTransferController.js#L6): `async(req,res,next)=>{try{const filter={tenantId:tenantIdOf(req),status:"active"};if(req.query.airportCode)filter.airportCode=clean(req.query.airportCode).toUpperCase();i`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/airport-transfers'
```

### GET /admin/catalog → `/api/airport-transfers/admin/catalog`

Declared at source line 10. Route handler pipeline names: `protect`, `managerOnly`, `listAdminTransfersSafe`.

```js
router.get("/admin/catalog", protect, managerOnly, listAdminTransfersSafe)
```

- Imported handler/middleware `protect`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `managerOnly`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `listAdminTransfersSafe`: [hospitalityAdminController.js](../../../../server/controllers/hospitalityAdminController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `listAdminTransfersSafe`

Handler starts at [controller line 57](../../../../server/controllers/hospitalityAdminController.js#L57). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `status`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `data`.
- Database operations detected: `AirportTransfer.find`.
- Input/validation source lines to inspect:
  - [Line 62](../../../../server/controllers/hospitalityAdminController.js#L62): `if (req.query.status) filter.status = req.query.status;`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/airport-transfers/admin/catalog'
```

### POST /admin/catalog → `/api/airport-transfers/admin/catalog`

Declared at source line 11. Route handler pipeline names: `protect`, `managerOnly`, `createTransfer`.

```js
router.post("/admin/catalog", protect, managerOnly, createTransfer)
```

- Imported handler/middleware `protect`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `managerOnly`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `createTransfer`: [airportTransferController.js](../../../../server/controllers/airportTransferController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `createTransfer`

Handler starts at [controller line 9](../../../../server/controllers/airportTransferController.js#L9). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `name`, `vehicleType`, `passengerCapacity`, `price`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `201`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “Name, vehicle capacity and valid price are required.”.
- Database operations detected: `AirportTransfer.create`.
- Input/validation source lines to inspect:
  - [Line 9](../../../../server/controllers/airportTransferController.js#L9): `async(req,res,next)=>{try{const name=clean(req.body.name),vehicleType=clean(req.body.vehicleType);if(!name||!vehicleType||Number(req.body.passengerCapacity)<1||Number(req`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/airport-transfers/admin/catalog'
```

### PATCH /admin/catalog/:id → `/api/airport-transfers/admin/catalog/:id`

Declared at source line 12. Route handler pipeline names: `protect`, `managerOnly`, `updateTransfer`.

```js
router.patch("/admin/catalog/:id", protect, managerOnly, updateTransfer)
```

- Imported handler/middleware `protect`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `managerOnly`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `updateTransfer`: [airportTransferController.js](../../../../server/controllers/airportTransferController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `updateTransfer`

Handler starts at [controller line 10](../../../../server/controllers/airportTransferController.js#L10). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “Transfer service not found.”.
- Database operations detected: `AirportTransfer.findOne`.
- Input/validation source lines to inspect:
  - [Line 10](../../../../server/controllers/airportTransferController.js#L10): `async(req,res,next)=>{try{const item=await AirportTransfer.findOne({_id:req.params.id,tenantId:tenantIdOf(req)});if(!item)return res.status(404).json({success:false,messa`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PATCH 'http://localhost:5000/api/airport-transfers/admin/catalog/<id>'
```

### POST /bookings → `/api/airport-transfers/bookings`

Declared at source line 13. Route handler pipeline names: `protect`, `createEnhancedTransferBooking`.

```js
router.post("/bookings", protect, createEnhancedTransferBooking)
```

- Imported handler/middleware `protect`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `createEnhancedTransferBooking`: [enhancedAirportTransferBookingController.js](../../../../server/controllers/enhancedAirportTransferBookingController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `createEnhancedTransferBooking`

Handler starts at [controller line 38](../../../../server/controllers/enhancedAirportTransferBookingController.js#L38). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `passengers`, `luggage`, `pickupDateTime`, `flightArrivalDateTime`, `flightDepartureDateTime`, `childSeats`, `boosterSeats`, `taxes`, `fees`, `linkedBooking`, `pickupLocation`, `dropoffLocation`, `flightNumber`, `airline`, `terminal`, `meetAndGreet`, `signboardName`, `passengerName`, `whatsappContact`, `passengerPhone`, `wheelchairAccessible`, `accommodationName`, `passengerEmail`, `specialRequests`, `source`, `notes`, `transferId`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `201`.
- JSON envelope keys observed: `success`, `message`, `data`, `invoice`, `paymentRequired`.
- Literal messages include: “Transfer and tenant context are required.”; “Transfer service not found.”; “A valid pickup date and time are required.”; “Enter a valid flight arrival time.”; “Enter a valid flight departure time.”; “Child and booster seats cannot exceed passenger count.”; “A passenger phone number is required to complete the booking.”.
- Database operations detected: `AirportTransfer.findOne`, `AirportTransferBooking.create`.
- Input/validation source lines to inspect:
  - [Line 41](../../../../server/controllers/enhancedAirportTransferBookingController.js#L41): `const { transferId } = req.body;`
  - [Line 44](../../../../server/controllers/enhancedAirportTransferBookingController.js#L44): `return res.status(400).json({`
  - [Line 57](../../../../server/controllers/enhancedAirportTransferBookingController.js#L57): `return res.status(404).json({ success: false, message: "Transfer service not found." });`
  - [Line 60](../../../../server/controllers/enhancedAirportTransferBookingController.js#L60): `const passengers = Number(req.body.passengers || 1);`
  - [Line 61](../../../../server/controllers/enhancedAirportTransferBookingController.js#L61): `const luggage = Number(req.body.luggage || 0);`
  - [Line 62](../../../../server/controllers/enhancedAirportTransferBookingController.js#L62): `const pickupDateTime = new Date(req.body.pickupDateTime);`
  - [Line 63](../../../../server/controllers/enhancedAirportTransferBookingController.js#L63): `const arrivalDateTime = req.body.flightArrivalDateTime`
  - [Line 64](../../../../server/controllers/enhancedAirportTransferBookingController.js#L64): `? new Date(req.body.flightArrivalDateTime)`
  - [Line 66](../../../../server/controllers/enhancedAirportTransferBookingController.js#L66): `const departureDateTime = req.body.flightDepartureDateTime`
  - [Line 67](../../../../server/controllers/enhancedAirportTransferBookingController.js#L67): `? new Date(req.body.flightDepartureDateTime)`
  - [Line 69](../../../../server/controllers/enhancedAirportTransferBookingController.js#L69): `const childSeats = Number(req.body.childSeats || 0);`
  - [Line 70](../../../../server/controllers/enhancedAirportTransferBookingController.js#L70): `const boosterSeats = Number(req.body.boosterSeats || 0);`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/airport-transfers/bookings'
```

### GET /bookings → `/api/airport-transfers/bookings`

Declared at source line 14. Route handler pipeline names: `protect`, `listTransferBookingsSafe`.

```js
router.get("/bookings", protect, listTransferBookingsSafe)
```

- Imported handler/middleware `protect`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `listTransferBookingsSafe`: [hospitalityAdminController.js](../../../../server/controllers/hospitalityAdminController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `listTransferBookingsSafe`

Handler starts at [controller line 122](../../../../server/controllers/hospitalityAdminController.js#L122). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `status`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `data`.
- Database operations detected: `AirportTransferBooking.find`, `AirportTransfer.find`, `Customer.find`, `User.find`, `Vehicle.find`.
- Input/validation source lines to inspect:
  - [Line 129](../../../../server/controllers/hospitalityAdminController.js#L129): `if (req.query.status) filter.status = req.query.status;`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/airport-transfers/bookings'
```

### PATCH /bookings/:id → `/api/airport-transfers/bookings/:id`

Declared at source line 15. Route handler pipeline names: `protect`, `paymentMutationGuard`, `updateTransferBooking`.

```js
router.patch("/bookings/:id", protect, paymentMutationGuard, updateTransferBooking)
```

- Imported handler/middleware `protect`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `paymentMutationGuard`: [paymentMutationGuard.js](../../../../server/middleware/paymentMutationGuard.js)
- Imported handler/middleware `updateTransferBooking`: [airportTransferController.js](../../../../server/controllers/airportTransferController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `updateTransferBooking`

Handler starts at [controller line 25](../../../../server/controllers/airportTransferController.js#L25). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `status`, `assignedVehicle`, `assignedDriver`, `specialRequests`, `notes`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `403`, `409`, `400`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “Transfer booking not found.”; “Not allowed.”; “Only authorized booking operations staff may modify this reservation.”; “Customers may only update special requests on an existing reservation.”; “Customers cannot change transfer status.”; “Customers cannot assign operational resources.”; “Invalid vehicle ID.”; “Selected vehicle is unavailable or does not belong to this tenant.”; “Invalid driver ID.”; “Selected driver is unavailable or does not belong to this tenant.”; “Customers cannot modify internal transfer notes.”.
- Database operations detected: `AirportTransferBooking.findOne`, `Vehicle.findOne`, `User.findOne`.
- Input/validation source lines to inspect:
  - [Line 27](../../../../server/controllers/airportTransferController.js#L27): `const booking=await AirportTransferBooking.findOne({_id:req.params.id,tenantId});`
  - [Line 28](../../../../server/controllers/airportTransferController.js#L28): `if(!booking)return res.status(404).json({success:false,message:"Transfer booking not found."});`
  - [Line 32](../../../../server/controllers/airportTransferController.js#L32): `if(isCustomer&&String(booking.user)!==String(req.user._id))return res.status(403).json({success:false,message:"Not allowed."});`
  - [Line 33](../../../../server/controllers/airportTransferController.js#L33): `if(!isCustomer&&!staffRoles.has(role))return res.status(403).json({success:false,message:"Only authorized booking operations staff may modify this reservation."});`
  - [Line 35](../../../../server/controllers/airportTransferController.js#L35): `const requestedKeys=Object.keys(req.body||{});`
  - [Line 37](../../../../server/controllers/airportTransferController.js#L37): `return res.status(403).json({success:false,message:"Customers may only update special requests on an existing reservation."});`
  - [Line 40](../../../../server/controllers/airportTransferController.js#L40): `if(req.body.status!==undefined){`
  - [Line 41](../../../../server/controllers/airportTransferController.js#L41): `if(isCustomer)return res.status(403).json({success:false,message:"Customers cannot change transfer status."});`
  - [Line 42](../../../../server/controllers/airportTransferController.js#L42): `const nextStatus=clean(req.body.status).toLowerCase();`
  - [Line 44](../../../../server/controllers/airportTransferController.js#L44): `if(!allowed.has(nextStatus))return res.status(409).json({success:false,message:\`Invalid transfer status transition: ${booking.status} → ${nextStatus}.\`});`
  - [Line 48](../../../../server/controllers/airportTransferController.js#L48): `if(req.body.assignedVehicle!==undefined||req.body.assignedDriver!==undefined){`
  - [Line 49](../../../../server/controllers/airportTransferController.js#L49): `if(isCustomer)return res.status(403).json({success:false,message:"Customers cannot assign operational resources."});`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PATCH 'http://localhost:5000/api/airport-transfers/bookings/<id>'
```

### GET /:id → `/api/airport-transfers/:id`

Declared at source line 16. Route handler pipeline names: `getTransfer`.

```js
router.get("/:id", getTransfer)
```

- Imported handler/middleware `getTransfer`: [airportTransferController.js](../../../../server/controllers/airportTransferController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `getTransfer`

Handler starts at [controller line 7](../../../../server/controllers/airportTransferController.js#L7). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “Transfer service not found.”.
- Database operations detected: `AirportTransfer.findOne`.
- Input/validation source lines to inspect:
  - [Line 7](../../../../server/controllers/airportTransferController.js#L7): `async(req,res,next)=>{try{const item=await AirportTransfer.findOne({_id:req.params.id,tenantId:tenantIdOf(req),status:"active"}).lean();if(!item)return res.status(404).js`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/airport-transfers/<id>'
```

