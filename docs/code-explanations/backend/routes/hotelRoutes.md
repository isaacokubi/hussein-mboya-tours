# Route module: hotelRoutes.js

**Source:** [server/routes/hotelRoutes.js](../../../../server/routes/hotelRoutes.js)

Observed mount prefixes include `/api/hotels`, `/api/hotels/availability`, `/api/hotels/admin/catalog`, `/api/hotels/admin/catalog/:id`, `/api/hotels/admin/catalog/:hotelId/rooms`, `/api/hotels/admin/rooms/:id`, `/api/hotels/admin/sync-inventory`, `/api/hotels/bookings`, `/api/hotels/bookings/:id`, `/api/hotels/:id`.

## Router-wide middleware

No router.use declaration was found at module scope.

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET / → `/api/hotels`

Declared at source line 12. Route handler pipeline names: `listHotels`.

```js
router.get("/", listHotels)
```

- Imported handler/middleware `listHotels`: [hotelController.js](../../../../server/controllers/hotelController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `listHotels`

Handler starts at [controller line 12](../../../../server/controllers/hotelController.js#L12). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `city`, `featured`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`.
- Database operations detected: `Hotel.find`, `HotelRoomType.find`.
- Input/validation source lines to inspect:
  - [Line 17](../../../../server/controllers/hotelController.js#L17): `if (req.query.city) {`
  - [Line 18](../../../../server/controllers/hotelController.js#L18): `const city = escapeRegex(clean(req.query.city));`
  - [Line 21](../../../../server/controllers/hotelController.js#L21): `if (req.query.featured === "true") filter.featured = true;`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/hotels'
```

### GET /availability → `/api/hotels/availability`

Declared at source line 13. Route handler pipeline names: `checkHotelAvailability`.

```js
router.get("/availability", checkHotelAvailability)
```

- Imported handler/middleware `checkHotelAvailability`: [hotelAvailabilityController.js](../../../../server/controllers/hotelAvailabilityController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `checkHotelAvailability`

Handler starts at [controller line 10](../../../../server/controllers/hotelAvailabilityController.js#L10). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `hotelId`, `checkIn`, `checkOut`, `ratePlanId`.
- Literal HTTP statuses in handler: `400`, `404`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Tenant context is required.”; “Valid hotel, check-in and check-out dates are required.”; “Hotel not found.”.
- Database operations detected: `Hotel.findOne`, `HotelRoomType.find`, `HotelBooking.aggregate`, `HospitalityRoomBlock.aggregate`, `HospitalityRatePlan.find`.
- Input/validation source lines to inspect:
  - [Line 13](../../../../server/controllers/hotelAvailabilityController.js#L13): `const { hotelId, checkIn, checkOut, ratePlanId } = req.query;`
  - [Line 16](../../../../server/controllers/hotelAvailabilityController.js#L16): `if (!tenantId) return res.status(400).json({ success: false, message: "Tenant context is required." });`
  - [Line 17](../../../../server/controllers/hotelAvailabilityController.js#L17): `if (!hotelId || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return res.status(400).json({ success: false, message: "Valid hotel, check-i`
  - [Line 20](../../../../server/controllers/hotelAvailabilityController.js#L20): `if (!hotel) return res.status(404).json({ success: false, message: "Hotel not found." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/hotels/availability'
```

### GET /admin/catalog → `/api/hotels/admin/catalog`

Declared at source line 14. Route handler pipeline names: `protect`, `managerOnly`, `listAdminHotelsSafe`.

```js
router.get("/admin/catalog", protect, managerOnly, listAdminHotelsSafe)
```

- Imported handler/middleware `protect`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `managerOnly`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `listAdminHotelsSafe`: [hospitalityAdminController.js](../../../../server/controllers/hospitalityAdminController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `listAdminHotelsSafe`

Handler starts at [controller line 34](../../../../server/controllers/hospitalityAdminController.js#L34). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `status`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `data`.
- Database operations detected: `Hotel.find`, `HotelRoomType.find`.
- Input/validation source lines to inspect:
  - [Line 39](../../../../server/controllers/hospitalityAdminController.js#L39): `if (req.query.status) filter.status = req.query.status;`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/hotels/admin/catalog'
```

### POST /admin/catalog → `/api/hotels/admin/catalog`

Declared at source line 15. Route handler pipeline names: `protect`, `managerOnly`, `createAdminHotel`.

```js
router.post("/admin/catalog", protect, managerOnly, createAdminHotel)
```

- Imported handler/middleware `protect`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `managerOnly`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `createAdminHotel`: [adminHotelCreationController.js](../../../../server/controllers/adminHotelCreationController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `createAdminHotel`

Handler starts at [controller line 22](../../../../server/controllers/adminHotelCreationController.js#L22). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `201`, `409`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “A valid company/tenant context is required before creating a hotel.”; “Hotel name is required.”; “City is required.”; “Location is required.”; “Star rating must be a whole number from 1 to 5.”; “Latitude must be between -90 and 90.”; “Longitude must be between -180 and 180.”; “Enter a valid reservations email address.”; “A hotel with that identifier already exists for this company. Please use a different name.”.
- Database operations detected: `Hotel.create`.
- Input/validation source lines to inspect:
  - [Line 26](../../../../server/controllers/adminHotelCreationController.js#L26): `return res.status(400).json({`
  - [Line 32](../../../../server/controllers/adminHotelCreationController.js#L32): `const body = req.body || {};`
  - [Line 37](../../../../server/controllers/adminHotelCreationController.js#L37): `if (!name) return res.status(400).json({ success: false, message: "Hotel name is required." });`
  - [Line 38](../../../../server/controllers/adminHotelCreationController.js#L38): `if (!city) return res.status(400).json({ success: false, message: "City is required." });`
  - [Line 39](../../../../server/controllers/adminHotelCreationController.js#L39): `if (!location) return res.status(400).json({ success: false, message: "Location is required." });`
  - [Line 43](../../../../server/controllers/adminHotelCreationController.js#L43): `return res.status(400).json({ success: false, message: "Star rating must be a whole number from 1 to 5." });`
  - [Line 49](../../../../server/controllers/adminHotelCreationController.js#L49): `return res.status(400).json({ success: false, message: "Latitude must be between -90 and 90." });`
  - [Line 52](../../../../server/controllers/adminHotelCreationController.js#L52): `return res.status(400).json({ success: false, message: "Longitude must be between -180 and 180." });`
  - [Line 57](../../../../server/controllers/adminHotelCreationController.js#L57): `return res.status(400).json({ success: false, message: "Enter a valid reservations email address." });`
  - [Line 103](../../../../server/controllers/adminHotelCreationController.js#L103): `return res.status(409).json({`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/hotels/admin/catalog'
```

### PATCH /admin/catalog/:id → `/api/hotels/admin/catalog/:id`

Declared at source line 16. Route handler pipeline names: `protect`, `managerOnly`, `updateHotel`.

```js
router.patch("/admin/catalog/:id", protect, managerOnly, updateHotel)
```

- Imported handler/middleware `protect`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `managerOnly`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `updateHotel`: [hotelController.js](../../../../server/controllers/hotelController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `updateHotel`

Handler starts at [controller line 64](../../../../server/controllers/hotelController.js#L64). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `name`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `400`, `409`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “Hotel not found.”; “Hotel name, city and location are required.”; “Star rating must be an integer from 1 to 5.”; “Reservations email is invalid.”; “Latitude must be between -90 and 90.”; “Longitude must be between -180 and 180.”; “Property updated successfully.”; “A property with that name already exists for this tenant.”.
- Database operations detected: `Hotel.findOne`.
- Input/validation source lines to inspect:
  - [Line 64](../../../../server/controllers/hotelController.js#L64): `async(req,res,next)=>{try{const tenantId=requireTenant(req,res);if(!tenantId)return;const hotel=await Hotel.findOne({_id:req.params.id,tenantId});if(!hotel)return res.sta`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PATCH 'http://localhost:5000/api/hotels/admin/catalog/<id>'
```

### POST /admin/catalog/:hotelId/rooms → `/api/hotels/admin/catalog/:hotelId/rooms`

Declared at source line 17. Route handler pipeline names: `protect`, `managerOnly`, `createRoomType`.

```js
router.post("/admin/catalog/:hotelId/rooms", protect, managerOnly, createRoomType)
```

- Imported handler/middleware `protect`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `managerOnly`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `createRoomType`: [hotelController.js](../../../../server/controllers/hotelController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `createRoomType`

Handler starts at [controller line 65](../../../../server/controllers/hotelController.js#L65). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `hotelId`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `201`, `409`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Select a valid property before creating a room type.”; “The selected property was not found in your tenant.”; “Room type name is required.”; “Total rooms must be at least 1.”; “Available rooms cannot exceed total rooms.”; “Nightly rate must be zero or greater.”; “Room guest capacity is invalid.”; “A room type with this name already exists for this property.”.
- Database operations detected: `Hotel.findOne`, `HotelRoomType.create`.
- Input/validation source lines to inspect:
  - [Line 65](../../../../server/controllers/hotelController.js#L65): `async(req,res,next)=>{try{const tenantId=requireTenant(req,res);if(!tenantId)return;const hotelId=clean(req.params.hotelId);if(!mongoose.isValidObjectId(hotelId))return r`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/hotels/admin/catalog/<hotelId>/rooms'
```

### PATCH /admin/rooms/:id → `/api/hotels/admin/rooms/:id`

Declared at source line 18. Route handler pipeline names: `protect`, `managerOnly`, `updateRoomType`.

```js
router.patch("/admin/rooms/:id", protect, managerOnly, updateRoomType)
```

- Imported handler/middleware `protect`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `managerOnly`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `updateRoomType`: [hotelController.js](../../../../server/controllers/hotelController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `updateRoomType`

Handler starts at [controller line 66](../../../../server/controllers/hotelController.js#L66). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `400`, `409`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “Room type not found.”; “Room type name is required.”; “Available rooms cannot exceed total rooms.”; “Nightly rate must be zero or greater.”; “Room guest capacity is invalid.”; “Room type updated successfully.”; “A room type with this name already exists for this property.”.
- Database operations detected: `HotelRoomType.findOne`.
- Input/validation source lines to inspect:
  - [Line 66](../../../../server/controllers/hotelController.js#L66): `async(req,res,next)=>{try{const tenantId=requireTenant(req,res);if(!tenantId)return;const room=await HotelRoomType.findOne({_id:req.params.id,tenantId});if(!room)return r`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PATCH 'http://localhost:5000/api/hotels/admin/rooms/<id>'
```

### POST /admin/sync-inventory → `/api/hotels/admin/sync-inventory`

Declared at source line 19. Route handler pipeline names: `protect`, `managerOnly`, `syncAccommodationInventoryToHotelPms`.

```js
router.post("/admin/sync-inventory", protect, managerOnly, syncAccommodationInventoryToHotelPms)
```

- Imported handler/middleware `protect`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `managerOnly`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `syncAccommodationInventoryToHotelPms`: [hospitalityInventorySyncController.js](../../../../server/controllers/hospitalityInventorySyncController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `syncAccommodationInventoryToHotelPms`

Handler starts at [controller line 8](../../../../server/controllers/hospitalityInventorySyncController.js#L8). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Tenant context is required.”.
- Database operations detected: `AccommodationInventory.find`, `Hotel.findOne`, `Hotel.create`, `HotelRoomType.findOne`, `HotelRoomType.create`.
- Input/validation source lines to inspect:
  - [Line 11](../../../../server/controllers/hospitalityInventorySyncController.js#L11): `if (!tenantId) return res.status(400).json({ success: false, message: "Tenant context is required." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/hotels/admin/sync-inventory'
```

### POST /bookings → `/api/hotels/bookings`

Declared at source line 20. Route handler pipeline names: `protect`, `createConcurrentSafeHotelBooking`.

```js
router.post("/bookings", protect, createConcurrentSafeHotelBooking)
```

- Imported handler/middleware `protect`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `createConcurrentSafeHotelBooking`: [hospitalityInventoryConcurrencyController.js](../../../../server/controllers/hospitalityInventoryConcurrencyController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `createConcurrentSafeHotelBooking`

Handler starts at [controller line 38](../../../../server/controllers/hospitalityInventoryConcurrencyController.js#L38). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `checkIn`, `checkOut`, `rooms`, `adults`, `children`, `ratePlanId`, `taxes`, `fees`, `linkedBooking`, `estimatedArrivalTime`, `guests`, `mealPlan`, `bedPreference`, `dietaryRequirements`, `accessibilityNeeds`, `airportTransferRequired`, `specialRequests`, `source`, `hotelId`, `roomTypeId`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `409`, `201`.
- JSON envelope keys observed: `success`, `message`, `data`, `invoice`, `paymentRequired`.
- Literal messages include: “Hotel, room type and tenant context are required.”; “Hotel or room type not found.”; “Valid check-in, check-out, rooms and guests are required.”; “Guest count exceeds the selected room capacity.”; “Room inventory changed while this booking was being processed. Please retry.”; “The selected rate plan is not valid for this room and stay dates.”; “This rate plan is currently stop-sold for the selected stay.”; “A customer phone number is required to complete the booking.”.
- Database operations detected: `Hotel.findOne`, `HotelRoomType.findOne`, `HotelBooking.aggregate`, `HospitalityRoomBlock.aggregate`, `HospitalityRatePlan.find`, `HotelBooking.create`.
- Input/validation source lines to inspect:
  - [Line 41](../../../../server/controllers/hospitalityInventoryConcurrencyController.js#L41): `const { hotelId, roomTypeId } = req.body;`
  - [Line 42](../../../../server/controllers/hospitalityInventoryConcurrencyController.js#L42): `if (!tenantId || !hotelId || !roomTypeId) return res.status(400).json({ success: false, message: "Hotel, room type and tenant context are required." });`
  - [Line 48](../../../../server/controllers/hospitalityInventoryConcurrencyController.js#L48): `if (!hotel || !room) return res.status(404).json({ success: false, message: "Hotel or room type not found." });`
  - [Line 50](../../../../server/controllers/hospitalityInventoryConcurrencyController.js#L50): `const checkIn = new Date(req.body.checkIn);`
  - [Line 51](../../../../server/controllers/hospitalityInventoryConcurrencyController.js#L51): `const checkOut = new Date(req.body.checkOut);`
  - [Line 52](../../../../server/controllers/hospitalityInventoryConcurrencyController.js#L52): `const rooms = Number(req.body.rooms || 1);`
  - [Line 53](../../../../server/controllers/hospitalityInventoryConcurrencyController.js#L53): `const adults = Number(req.body.adults || 1);`
  - [Line 54](../../../../server/controllers/hospitalityInventoryConcurrencyController.js#L54): `const children = Number(req.body.children || 0);`
  - [Line 55](../../../../server/controllers/hospitalityInventoryConcurrencyController.js#L55): `if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime()) || checkOut <= checkIn || !Number.isInteger(rooms) || rooms < 1 || !Number.isInteger(adults) || ad`
  - [Line 58](../../../../server/controllers/hospitalityInventoryConcurrencyController.js#L58): `if (adults > rooms * Number(room.maxAdults || 1) || children > rooms * Number(room.maxChildren || 0)) return res.status(400).json({ success: false, message: "Guest count `
  - [Line 61](../../../../server/controllers/hospitalityInventoryConcurrencyController.js#L61): `if (!guard) return res.status(409).json({ success: false, message: "Room inventory changed while this booking was being processed. Please retry." });`
  - [Line 72](../../../../server/controllers/hospitalityInventoryConcurrencyController.js#L72): `const requestedRateId = clean(req.body.ratePlanId);`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/hotels/bookings'
```

### GET /bookings → `/api/hotels/bookings`

Declared at source line 21. Route handler pipeline names: `protect`, `listHotelBookingsSafe`.

```js
router.get("/bookings", protect, listHotelBookingsSafe)
```

- Imported handler/middleware `protect`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `listHotelBookingsSafe`: [hospitalityAdminController.js](../../../../server/controllers/hospitalityAdminController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `listHotelBookingsSafe`

Handler starts at [controller line 70](../../../../server/controllers/hospitalityAdminController.js#L70). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `status`, `customerId`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `data`.
- Database operations detected: `HotelBooking.find`, `Hotel.find`, `HotelRoomType.find`, `Customer.find`, `User.find`.
- Input/validation source lines to inspect:
  - [Line 77](../../../../server/controllers/hospitalityAdminController.js#L77): `if (req.query.status) filter.status = req.query.status;`
  - [Line 78](../../../../server/controllers/hospitalityAdminController.js#L78): `if (req.query.customerId) filter.customer = req.query.customerId;`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/hotels/bookings'
```

### PATCH /bookings/:id → `/api/hotels/bookings/:id`

Declared at source line 22. Route handler pipeline names: `protect`, `paymentMutationGuard`, `updateHotelBooking`.

```js
router.patch("/bookings/:id", protect, paymentMutationGuard, updateHotelBooking)
```

- Imported handler/middleware `protect`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `paymentMutationGuard`: [paymentMutationGuard.js](../../../../server/middleware/paymentMutationGuard.js)
- Imported handler/middleware `updateHotelBooking`: [hotelController.js](../../../../server/controllers/hotelController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `updateHotelBooking`

Handler starts at [controller line 79](../../../../server/controllers/hotelController.js#L79). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `status`, `specialRequests`, `notes`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `403`, `409`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “Hotel booking not found.”; “Not allowed.”; “Only authorized booking operations staff may modify this reservation.”; “Customers may only update special requests on an existing reservation.”; “Customers cannot change reservation status.”; “Customers cannot modify internal reservation notes.”.
- Database operations detected: `HotelBooking.findOne`.
- Input/validation source lines to inspect:
  - [Line 81](../../../../server/controllers/hotelController.js#L81): `const booking=await HotelBooking.findOne({_id:req.params.id,tenantId});`
  - [Line 82](../../../../server/controllers/hotelController.js#L82): `if(!booking)return res.status(404).json({success:false,message:"Hotel booking not found."});`
  - [Line 86](../../../../server/controllers/hotelController.js#L86): `if(isCustomer&&String(booking.user)!==String(req.user._id))return res.status(403).json({success:false,message:"Not allowed."});`
  - [Line 87](../../../../server/controllers/hotelController.js#L87): `if(!isCustomer&&!staffRoles.has(role))return res.status(403).json({success:false,message:"Only authorized booking operations staff may modify this reservation."});`
  - [Line 89](../../../../server/controllers/hotelController.js#L89): `const requestedKeys=Object.keys(req.body||{});`
  - [Line 91](../../../../server/controllers/hotelController.js#L91): `return res.status(403).json({success:false,message:"Customers may only update special requests on an existing reservation."});`
  - [Line 94](../../../../server/controllers/hotelController.js#L94): `if(req.body.status!==undefined){`
  - [Line 95](../../../../server/controllers/hotelController.js#L95): `if(isCustomer)return res.status(403).json({success:false,message:"Customers cannot change reservation status."});`
  - [Line 96](../../../../server/controllers/hotelController.js#L96): `const nextStatus=clean(req.body.status).toLowerCase();`
  - [Line 98](../../../../server/controllers/hotelController.js#L98): `if(!allowed.has(nextStatus))return res.status(409).json({success:false,message:\`Invalid hotel reservation status transition: ${booking.status} → ${nextStatus}.\`});`
  - [Line 102](../../../../server/controllers/hotelController.js#L102): `if(req.body.specialRequests!==undefined)booking.specialRequests=clean(req.body.specialRequests);`
  - [Line 103](../../../../server/controllers/hotelController.js#L103): `if(req.body.notes!==undefined){`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PATCH 'http://localhost:5000/api/hotels/bookings/<id>'
```

### GET /:id → `/api/hotels/:id`

Declared at source line 23. Route handler pipeline names: `getHotel`.

```js
router.get("/:id", getHotel)
```

- Imported handler/middleware `getHotel`: [hotelController.js](../../../../server/controllers/hotelController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `getHotel`

Handler starts at [controller line 37](../../../../server/controllers/hotelController.js#L37). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Hotel not found.”.
- Database operations detected: `Hotel.findOne`, `HotelRoomType.find`.
- Input/validation source lines to inspect:
  - [Line 41](../../../../server/controllers/hotelController.js#L41): `const key = clean(req.params.id);`
  - [Line 50](../../../../server/controllers/hotelController.js#L50): `if (!hotel) return res.status(404).json({ success: false, message: "Hotel not found." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/hotels/<id>'
```

