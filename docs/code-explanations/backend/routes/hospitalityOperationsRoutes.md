# Route module: hospitalityOperationsRoutes.js

**Source:** [server/routes/hospitalityOperationsRoutes.js](../../../../server/routes/hospitalityOperationsRoutes.js)

Observed mount prefixes include `/api/admin/hospitality-operations/dashboard`, `/api/admin/hospitality-operations/hotels/calendar`, `/api/admin/hospitality-operations/hotels/performance`, `/api/admin/hospitality-operations/hotels/bookings/:id/amend`, `/api/admin/hospitality-operations/hotels/bookings/:id/cancel`, `/api/admin/hospitality-operations/hotels/room-blocks`, `/api/admin/hospitality-operations/hotels/room-blocks/:id/release`, `/api/admin/hospitality-operations/rate-plans`, `/api/admin/hospitality-operations/rate-plans/:id`, `/api/admin/hospitality-operations/suppliers/contracts`, `/api/admin/hospitality-operations/suppliers/contracts/:id`, `/api/admin/hospitality-operations/deposits`, `/api/admin/hospitality-operations/deposits/:id`, `/api/admin/hospitality-operations/transfers/dispatch`, `/api/admin/hospitality-operations/transfers/:id/assign`, `/api/admin/hospitality-operations/transfers/:id/status`, `/api/admin/hospitality-operations/payments/reconciliation`, `/api/admin/hospitality-operations/drivers`, `/api/admin/hospitality-operations/vehicles`.

## Router-wide middleware

- `router.use(protect,managerOnly,ensureOpsAccess);`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET /dashboard → `/api/admin/hospitality-operations/dashboard`

Declared at source line 10. Route handler pipeline names: `hospitalityDashboard`.

```js
router.get("/dashboard",hospitalityDashboard)
```

- Imported handler/middleware `hospitalityDashboard`: [hospitalityOperationsController.js](../../../../server/controllers/hospitalityOperationsController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `hospitalityDashboard`

Handler starts at [controller line 51](../../../../server/controllers/hospitalityOperationsController.js#L51). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `Hotel.countDocuments`, `HotelRoomType.find`, `AirportTransferBooking.countDocuments`, `HotelBooking.countDocuments`, `Payment.aggregate`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/hospitality-operations/dashboard'
```

### GET /hotels/calendar → `/api/admin/hospitality-operations/hotels/calendar`

Declared at source line 11. Route handler pipeline names: `hotelCalendar`.

```js
router.get("/hotels/calendar",hotelCalendar)
```

- Imported handler/middleware `hotelCalendar`: [hospitalityOperationsController.js](../../../../server/controllers/hospitalityOperationsController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `hotelCalendar`

Handler starts at [controller line 22](../../../../server/controllers/hospitalityOperationsController.js#L22). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `hotelId`, `from`, `to`.
- Literal HTTP statuses in handler: `400`, `404`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Invalid calendar range.”; “Hotel not found.”.
- Database operations detected: `Hotel.findOne`, `HotelRoomType.find`, `HotelBooking.find`, `HospitalityRoomBlock.find`.
- Input/validation source lines to inspect:
  - [Line 22](../../../../server/controllers/hospitalityOperationsController.js#L22): `async(req,res,next)=>{try{const tenantId=tenantIdOf(req),hotelId=req.query.hotelId;const from=asDate(req.query.from)||new Date(),to=asDate(req.query.to)||new Date(Date.no`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/hospitality-operations/hotels/calendar'
```

### GET /hotels/performance → `/api/admin/hospitality-operations/hotels/performance`

Declared at source line 12. Route handler pipeline names: `hotelPerformance`.

```js
router.get("/hotels/performance",hotelPerformance)
```

- Imported handler/middleware `hotelPerformance`: [hospitalityOperationsController.js](../../../../server/controllers/hospitalityOperationsController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `hotelPerformance`

Handler starts at [controller line 24](../../../../server/controllers/hospitalityOperationsController.js#L24). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `hotelId`, `from`, `to`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `HotelRoomType.find`, `HotelBooking.find`.
- Input/validation source lines to inspect:
  - [Line 24](../../../../server/controllers/hospitalityOperationsController.js#L24): `async(req,res,next)=>{try{const tenantId=tenantIdOf(req),hotelId=req.query.hotelId,from=asDate(req.query.from)||new Date(Date.now()-30*86400000),to=asDate(req.query.to)||`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/hospitality-operations/hotels/performance'
```

### PATCH /hotels/bookings/:id/amend → `/api/admin/hospitality-operations/hotels/bookings/:id/amend`

Declared at source line 13. Route handler pipeline names: `amendHotelBookingProduction`.

```js
router.patch("/hotels/bookings/:id/amend",amendHotelBookingProduction)
```

- Imported handler/middleware `amendHotelBookingProduction`: [hospitalityBookingAmendmentController.js](../../../../server/controllers/hospitalityBookingAmendmentController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `amendHotelBookingProduction`

Handler starts at [controller line 32](../../../../server/controllers/hospitalityBookingAmendmentController.js#L32). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `checkIn`, `checkOut`, `rooms`, `adults`, `children`, `ratePlanId`, `mealPlan`, `specialRequests`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `409`, `400`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Hotel booking not found.”; “This booking can no longer be amended.”; “Invalid amended stay details.”; “The booked room type is no longer available.”; “Room inventory changed while this amendment was being processed. Please retry the amendment.”; “The selected rate plan is not valid for the amended stay.”; “The amended stay would oversell the selected room type.”; “The amended total is below the amount already paid. Process the required refund before reducing this reservation.”.
- Database operations detected: `HotelBooking.findOne`, `HotelRoomType.findOne`, `HospitalityRatePlan.find`, `HotelBooking.aggregate`, `HospitalityRoomBlock.aggregate`, `HotelBookingPayment.find`.
- Input/validation source lines to inspect:
  - [Line 35](../../../../server/controllers/hospitalityBookingAmendmentController.js#L35): `const booking = await HotelBooking.findOne({ _id: req.params.id, tenantId });`
  - [Line 36](../../../../server/controllers/hospitalityBookingAmendmentController.js#L36): `if (!booking) return res.status(404).json({ success: false, message: "Hotel booking not found." });`
  - [Line 38](../../../../server/controllers/hospitalityBookingAmendmentController.js#L38): `return res.status(409).json({ success: false, message: "This booking can no longer be amended." });`
  - [Line 41](../../../../server/controllers/hospitalityBookingAmendmentController.js#L41): `const checkIn = req.body.checkIn ? asDate(req.body.checkIn) : booking.checkIn;`
  - [Line 42](../../../../server/controllers/hospitalityBookingAmendmentController.js#L42): `const checkOut = req.body.checkOut ? asDate(req.body.checkOut) : booking.checkOut;`
  - [Line 43](../../../../server/controllers/hospitalityBookingAmendmentController.js#L43): `const rooms = req.body.rooms === undefined ? Number(booking.rooms || 1) : Number(req.body.rooms);`
  - [Line 44](../../../../server/controllers/hospitalityBookingAmendmentController.js#L44): `const adults = req.body.adults === undefined ? Number(booking.adults || 1) : Number(req.body.adults);`
  - [Line 45](../../../../server/controllers/hospitalityBookingAmendmentController.js#L45): `const children = req.body.children === undefined ? Number(booking.children || 0) : Number(req.body.children);`
  - [Line 47](../../../../server/controllers/hospitalityBookingAmendmentController.js#L47): `return res.status(400).json({ success: false, message: "Invalid amended stay details." });`
  - [Line 51](../../../../server/controllers/hospitalityBookingAmendmentController.js#L51): `if (!room) return res.status(404).json({ success: false, message: "The booked room type is no longer available." });`
  - [Line 56](../../../../server/controllers/hospitalityBookingAmendmentController.js#L56): `return res.status(409).json({ success: false, message: "Room inventory changed while this amendment was being processed. Please retry the amendment." });`
  - [Line 60](../../../../server/controllers/hospitalityBookingAmendmentController.js#L60): `const requestedRateId = clean(req.body.ratePlanId || booking.ratePlan);`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PATCH 'http://localhost:5000/api/admin/hospitality-operations/hotels/bookings/<id>/amend'
```

### PATCH /hotels/bookings/:id/cancel → `/api/admin/hospitality-operations/hotels/bookings/:id/cancel`

Declared at source line 14. Route handler pipeline names: `cancelHotelBooking`.

```js
router.patch("/hotels/bookings/:id/cancel",cancelHotelBooking)
```

- Imported handler/middleware `cancelHotelBooking`: [hospitalityOperationsController.js](../../../../server/controllers/hospitalityOperationsController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `cancelHotelBooking`

Handler starts at [controller line 28](../../../../server/controllers/hospitalityOperationsController.js#L28). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `reason`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `409`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “Hotel booking not found.”; “This booking can no longer be cancelled.”.
- Database operations detected: `HotelBooking.findOne`.
- Input/validation source lines to inspect:
  - [Line 28](../../../../server/controllers/hospitalityOperationsController.js#L28): `async(req,res,next)=>{try{const b=await HotelBooking.findOne({_id:req.params.id,tenantId:tenantIdOf(req)});if(!b)return res.status(404).json({success:false,message:"Hotel`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PATCH 'http://localhost:5000/api/admin/hospitality-operations/hotels/bookings/<id>/cancel'
```

### GET /hotels/room-blocks → `/api/admin/hospitality-operations/hotels/room-blocks`

Declared at source line 15. Route handler pipeline names: `roomBlocks`.

```js
router.get("/hotels/room-blocks",roomBlocks)
```

- Imported handler/middleware `roomBlocks`: [hospitalityOperationsController.js](../../../../server/controllers/hospitalityOperationsController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `roomBlocks`

Handler starts at [controller line 39](../../../../server/controllers/hospitalityOperationsController.js#L39). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `status`, `hotelId`, `roomTypeId`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `data`.
- Database operations detected: `HospitalityRoomBlock.find`.
- Input/validation source lines to inspect:
  - [Line 39](../../../../server/controllers/hospitalityOperationsController.js#L39): `async(req,res,next)=>{try{const filter={tenantId:tenantIdOf(req)};if(req.query.status)filter.status=req.query.status;if(req.query.hotelId)filter.hotel=req.query.hotelId;i`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/hospitality-operations/hotels/room-blocks'
```

### POST /hotels/room-blocks → `/api/admin/hospitality-operations/hotels/room-blocks`

Declared at source line 16. Route handler pipeline names: `createConcurrentSafeRoomBlock`.

```js
router.post("/hotels/room-blocks",createConcurrentSafeRoomBlock)
```

- Imported handler/middleware `createConcurrentSafeRoomBlock`: [hospitalityInventoryConcurrencyController.js](../../../../server/controllers/hospitalityInventoryConcurrencyController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `createConcurrentSafeRoomBlock`

Handler starts at [controller line 94](../../../../server/controllers/hospitalityInventoryConcurrencyController.js#L94). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `roomTypeId`, `startDate`, `endDate`, `quantity`, `reason`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `400`, `409`, `201`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “Room type not found.”; “Valid block dates and quantity are required.”; “Room inventory changed while the block was being processed. Please retry.”.
- Database operations detected: `HotelRoomType.findOne`, `HotelBooking.aggregate`, `HospitalityRoomBlock.aggregate`, `HospitalityRoomBlock.create`.
- Input/validation source lines to inspect:
  - [Line 97](../../../../server/controllers/hospitalityInventoryConcurrencyController.js#L97): `const room = await HotelRoomType.findOne({ _id: req.body.roomTypeId, tenantId, status: "active" }).lean();`
  - [Line 98](../../../../server/controllers/hospitalityInventoryConcurrencyController.js#L98): `if (!room) return res.status(404).json({ success: false, message: "Room type not found." });`
  - [Line 99](../../../../server/controllers/hospitalityInventoryConcurrencyController.js#L99): `const start = new Date(req.body.startDate), end = new Date(req.body.endDate), quantity = Number(req.body.quantity);`
  - [Line 100](../../../../server/controllers/hospitalityInventoryConcurrencyController.js#L100): `if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start || !Number.isInteger(quantity) || quantity < 1) return res.status(400).json({ success: fa`
  - [Line 102](../../../../server/controllers/hospitalityInventoryConcurrencyController.js#L102): `if (!guard) return res.status(409).json({ success: false, message: "Room inventory changed while the block was being processed. Please retry." });`
  - [Line 108](../../../../server/controllers/hospitalityInventoryConcurrencyController.js#L108): `if (used + quantity > Number(room.totalRooms || 0)) return res.status(409).json({ success: false, message: \`Only ${Math.max(Number(room.totalRooms || 0) - used, 0)} room`
  - [Line 109](../../../../server/controllers/hospitalityInventoryConcurrencyController.js#L109): `const block = await HospitalityRoomBlock.create({ tenantId, hotel: room.hotel, roomType: room._id, startDate: start, endDate: end, quantity, reason: clean(req.body.reason`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/admin/hospitality-operations/hotels/room-blocks'
```

### PATCH /hotels/room-blocks/:id/release → `/api/admin/hospitality-operations/hotels/room-blocks/:id/release`

Declared at source line 17. Route handler pipeline names: `releaseRoomBlock`.

```js
router.patch("/hotels/room-blocks/:id/release",releaseRoomBlock)
```

- Imported handler/middleware `releaseRoomBlock`: [hospitalityOperationsController.js](../../../../server/controllers/hospitalityOperationsController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `releaseRoomBlock`

Handler starts at [controller line 31](../../../../server/controllers/hospitalityOperationsController.js#L31). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “Room block not found.”.
- Database operations detected: `HospitalityRoomBlock.findOne`.
- Input/validation source lines to inspect:
  - [Line 31](../../../../server/controllers/hospitalityOperationsController.js#L31): `async(req,res,next)=>{try{const block=await HospitalityRoomBlock.findOne({_id:req.params.id,tenantId:tenantIdOf(req)});if(!block)return res.status(404).json({success:fals`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PATCH 'http://localhost:5000/api/admin/hospitality-operations/hotels/room-blocks/<id>/release'
```

### GET /rate-plans → `/api/admin/hospitality-operations/rate-plans`

Declared at source line 18. Route handler pipeline names: `ratePlans`.

```js
router.get("/rate-plans",ratePlans)
```

- Imported handler/middleware `ratePlans`: [hospitalityOperationsController.js](../../../../server/controllers/hospitalityOperationsController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `ratePlans`

Handler starts at [controller line 33](../../../../server/controllers/hospitalityOperationsController.js#L33). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `hotelId`, `roomTypeId`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `data`.
- Database operations detected: `HospitalityRatePlan.find`.
- Input/validation source lines to inspect:
  - [Line 33](../../../../server/controllers/hospitalityOperationsController.js#L33): `async(req,res,next)=>{try{const filter={tenantId:tenantIdOf(req)};if(req.query.hotelId)filter.hotel=req.query.hotelId;if(req.query.roomTypeId)filter.roomType=req.query.ro`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/hospitality-operations/rate-plans'
```

### POST /rate-plans → `/api/admin/hospitality-operations/rate-plans`

Declared at source line 19. Route handler pipeline names: `createCommercialRatePlan`.

```js
router.post("/rate-plans",createCommercialRatePlan)
```

- Imported handler/middleware `createCommercialRatePlan`: [hospitalityCommercialController.js](../../../../server/controllers/hospitalityCommercialController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `createCommercialRatePlan`

Handler starts at [controller line 17](../../../../server/controllers/hospitalityCommercialController.js#L17). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `hotel`, `roomType`, `nightlyRate`, `minNights`, `maxNights`, `name`, `validFrom`, `validTo`, `code`, `currency`, `mealPlan`, `refundable`, `cancellationPolicy`, `stopSell`, `status`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `201`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “Hotel and room type are required.”; “Rate plan name and a valid nightly rate are required.”; “Minimum and maximum nights are invalid.”; “Hotel not found in this tenant.”; “Room type does not belong to the selected hotel.”.
- Database operations detected: `Hotel.findOne`, `HotelRoomType.findOne`, `HospitalityRatePlan.create`.
- Input/validation source lines to inspect:
  - [Line 18](../../../../server/controllers/hospitalityCommercialController.js#L18): `const tenantId=tenantIdOf(req),hotelId=id(req.body.hotel),roomTypeId=id(req.body.roomType);`
  - [Line 19](../../../../server/controllers/hospitalityCommercialController.js#L19): `if(!tenantId||!hotelId||!roomTypeId)return res.status(400).json({success:false,message:"Hotel and room type are required."});`
  - [Line 20](../../../../server/controllers/hospitalityCommercialController.js#L20): `const nightlyRate=Number(req.body.nightlyRate); const minNights=Number(req.body.minNights||1); const maxNights=req.body.maxNights===undefined||req.body.maxNights===null||`
  - [Line 21](../../../../server/controllers/hospitalityCommercialController.js#L21): `const dateError=range(req.body.validFrom,req.body.validTo);if(dateError)return res.status(400).json({success:false,message:dateError});`
  - [Line 23](../../../../server/controllers/hospitalityCommercialController.js#L23): `if(!hotel)return res.status(404).json({success:false,message:"Hotel not found in this tenant."});`
  - [Line 24](../../../../server/controllers/hospitalityCommercialController.js#L24): `if(!roomType)return res.status(404).json({success:false,message:"Room type does not belong to the selected hotel."});`
  - [Line 25](../../../../server/controllers/hospitalityCommercialController.js#L25): `const row=await HospitalityRatePlan.create({tenantId,hotel:hotelId,roomType:roomTypeId,name:text(req.body.name),code:text(req.body.code),nightlyRate:Number(req.body.night`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/admin/hospitality-operations/rate-plans'
```

### PATCH /rate-plans/:id → `/api/admin/hospitality-operations/rate-plans/:id`

Declared at source line 20. Route handler pipeline names: `updateCommercialRatePlan`.

```js
router.patch("/rate-plans/:id",updateCommercialRatePlan)
```

- Imported handler/middleware `updateCommercialRatePlan`: [hospitalityCommercialController.js](../../../../server/controllers/hospitalityCommercialController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `updateCommercialRatePlan`

Handler starts at [controller line 29](../../../../server/controllers/hospitalityCommercialController.js#L29). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `hotel`, `roomType`, `validFrom`, `validTo`, `nightlyRate`, `minNights`, `maxNights`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `400`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “Rate plan not found.”; “Selected room type is not part of the selected hotel.”; “Nightly rate must be a valid non-negative number.”; “Minimum nights must be a whole number of at least 1.”; “Maximum nights must be a whole number and cannot be below minimum nights.”.
- Database operations detected: `HospitalityRatePlan.findOne`, `HotelRoomType.findOne`.
- Input/validation source lines to inspect:
  - [Line 30](../../../../server/controllers/hospitalityCommercialController.js#L30): `const tenantId=tenantIdOf(req),row=await HospitalityRatePlan.findOne({_id:req.params.id,tenantId});if(!row)return res.status(404).json({success:false,message:"Rate plan n`
  - [Line 31](../../../../server/controllers/hospitalityCommercialController.js#L31): `if(req.body.hotel||req.body.roomType){const hotelId=id(req.body.hotel||row.hotel),roomTypeId=id(req.body.roomType||row.roomType);const room=await HotelRoomType.findOne({_`
  - [Line 32](../../../../server/controllers/hospitalityCommercialController.js#L32): `const dateError=range(req.body.validFrom??row.validFrom,req.body.validTo??row.validTo);if(dateError)return res.status(400).json({success:false,message:dateError});`
  - [Line 34](../../../../server/controllers/hospitalityCommercialController.js#L34): `allowed.forEach(k=>{if(req.body[k]!==undefined)row[k]=req.body[k]});`
  - [Line 35](../../../../server/controllers/hospitalityCommercialController.js#L35): `if(req.body.nightlyRate!==undefined){const value=Number(req.body.nightlyRate);if(!Number.isFinite(value)||value<0)return res.status(400).json({success:false,message:"Nigh`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PATCH 'http://localhost:5000/api/admin/hospitality-operations/rate-plans/<id>'
```

### GET /suppliers/contracts → `/api/admin/hospitality-operations/suppliers/contracts`

Declared at source line 21. Route handler pipeline names: `supplierContracts`.

```js
router.get("/suppliers/contracts",supplierContracts)
```

- Imported handler/middleware `supplierContracts`: [hospitalityOperationsController.js](../../../../server/controllers/hospitalityOperationsController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `supplierContracts`

Handler starts at [controller line 36](../../../../server/controllers/hospitalityOperationsController.js#L36). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `status`, `supplierType`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `data`.
- Database operations detected: `HospitalitySupplierContract.find`.
- Input/validation source lines to inspect:
  - [Line 36](../../../../server/controllers/hospitalityOperationsController.js#L36): `async(req,res,next)=>{try{const filter={tenantId:tenantIdOf(req)};if(req.query.status)filter.status=req.query.status;if(req.query.supplierType)filter.supplierType=req.que`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/hospitality-operations/suppliers/contracts'
```

### POST /suppliers/contracts → `/api/admin/hospitality-operations/suppliers/contracts`

Declared at source line 22. Route handler pipeline names: `createCommercialSupplierContract`.

```js
router.post("/suppliers/contracts",createCommercialSupplierContract)
```

- Imported handler/middleware `createCommercialSupplierContract`: [hospitalityCommercialController.js](../../../../server/controllers/hospitalityCommercialController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `createCommercialSupplierContract`

Handler starts at [controller line 39](../../../../server/controllers/hospitalityCommercialController.js#L39). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `commissionPercent`, `depositPercent`, `supplierName`, `validFrom`, `validTo`, `hotel`, `contractNumber`, `currency`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `201`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “Commission and deposit percentages must be between 0 and 100.”; “Supplier name is required.”; “Invalid hotel reference.”; “Hotel not found in this tenant.”.
- Database operations detected: `Hotel.findOne`, `HospitalitySupplierContract.create`.
- Input/validation source lines to inspect:
  - [Line 40](../../../../server/controllers/hospitalityCommercialController.js#L40): `const tenantId=tenantIdOf(req); const commissionPercent=Number(req.body.commissionPercent||0); const depositPercent=Number(req.body.depositPercent||0); if(!Number.isFinit`
  - [Line 41](../../../../server/controllers/hospitalityCommercialController.js#L41): `const dateError=range(req.body.validFrom,req.body.validTo);if(dateError)return res.status(400).json({success:false,message:dateError});`
  - [Line 42](../../../../server/controllers/hospitalityCommercialController.js#L42): `let hotel=null;if(req.body.hotel){const hotelId=id(req.body.hotel);if(!hotelId)return res.status(400).json({success:false,message:"Invalid hotel reference."});hotel=await`
  - [Line 43](../../../../server/controllers/hospitalityCommercialController.js#L43): `const row=await HospitalitySupplierContract.create({...req.body,tenantId,hotel:hotel?hotel._id:null,supplierName:text(req.body.supplierName),contractNumber:text(req.body.`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/admin/hospitality-operations/suppliers/contracts'
```

### PATCH /suppliers/contracts/:id → `/api/admin/hospitality-operations/suppliers/contracts/:id`

Declared at source line 23. Route handler pipeline names: `updateCommercialSupplierContract`.

```js
router.patch("/suppliers/contracts/:id",updateCommercialSupplierContract)
```

- Imported handler/middleware `updateCommercialSupplierContract`: [hospitalityCommercialController.js](../../../../server/controllers/hospitalityCommercialController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `updateCommercialSupplierContract`

Handler starts at [controller line 47](../../../../server/controllers/hospitalityCommercialController.js#L47). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `hotel`, `validFrom`, `validTo`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `400`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “Supplier contract not found.”; “Invalid hotel reference.”; “Hotel not found in this tenant.”; “Percentages must be valid numbers between 0 and 100.”.
- Database operations detected: `HospitalitySupplierContract.findOne`.
- Input/validation source lines to inspect:
  - [Line 48](../../../../server/controllers/hospitalityCommercialController.js#L48): `const tenantId=tenantIdOf(req),row=await HospitalitySupplierContract.findOne({_id:req.params.id,tenantId});if(!row)return res.status(404).json({success:false,message:"Sup`
  - [Line 49](../../../../server/controllers/hospitalityCommercialController.js#L49): `if(req.body.hotel!==undefined){const hotelId=req.body.hotel?id(req.body.hotel):null;if(req.body.hotel&&!hotelId)return res.status(400).json({success:false,message:"Invali`
  - [Line 50](../../../../server/controllers/hospitalityCommercialController.js#L50): `const dateError=range(req.body.validFrom??row.validFrom,req.body.validTo??row.validTo);if(dateError)return res.status(400).json({success:false,message:dateError});`
  - [Line 51](../../../../server/controllers/hospitalityCommercialController.js#L51): `["supplierName","supplierType","contactName","contactPhone","contactEmail","contractNumber","currency","paymentTerms","cancellationTerms","status","notes"].forEach(k=>{if`
  - [Line 52](../../../../server/controllers/hospitalityCommercialController.js#L52): `["commissionPercent","depositPercent"].forEach(k=>{if(req.body[k]!==undefined)row[k]=Number(req.body[k])});`
  - [Line 53](../../../../server/controllers/hospitalityCommercialController.js#L53): `["validFrom","validTo"].forEach(k=>{if(req.body[k]!==undefined)row[k]=date(req.body[k])});`
  - [Line 54](../../../../server/controllers/hospitalityCommercialController.js#L54): `if(!Number.isFinite(Number(row.commissionPercent))||!Number.isFinite(Number(row.depositPercent))||row.commissionPercent<0||row.commissionPercent>100||row.depositPercent<0`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PATCH 'http://localhost:5000/api/admin/hospitality-operations/suppliers/contracts/<id>'
```

### GET /deposits → `/api/admin/hospitality-operations/deposits`

Declared at source line 24. Route handler pipeline names: `deposits`.

```js
router.get("/deposits",deposits)
```

- Imported handler/middleware `deposits`: [hospitalityOperationsController.js](../../../../server/controllers/hospitalityOperationsController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `deposits`

Handler starts at [controller line 40](../../../../server/controllers/hospitalityOperationsController.js#L40). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `status`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `data`.
- Database operations detected: `HospitalityDeposit.find`.
- Input/validation source lines to inspect:
  - [Line 40](../../../../server/controllers/hospitalityOperationsController.js#L40): `async(req,res,next)=>{try{const filter={tenantId:tenantIdOf(req)};if(req.query.status)filter.status=req.query.status;const rows=await HospitalityDeposit.find(filter).sort`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/hospitality-operations/deposits'
```

### POST /deposits → `/api/admin/hospitality-operations/deposits`

Declared at source line 25. Route handler pipeline names: `createCommercialDeposit`.

```js
router.post("/deposits",createCommercialDeposit)
```

- Imported handler/middleware `createCommercialDeposit`: [hospitalityCommercialController.js](../../../../server/controllers/hospitalityCommercialController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `createCommercialDeposit`

Handler starts at [controller line 58](../../../../server/controllers/hospitalityCommercialController.js#L58). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `hospitalityBooking`, `hospitalityType`, `amount`, `paidAmount`, `currency`, `dueDate`, `notes`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `409`, `201`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “A valid hospitality booking and booking type are required.”; “Reservation not found in this tenant.”; “Deposits cannot be created for cancelled or no-show reservations.”; “Deposit amount must be greater than zero.”.
- Database operations detected: `Booking.findOne`, `HospitalityDeposit.create`.
- Input/validation source lines to inspect:
  - [Line 59](../../../../server/controllers/hospitalityCommercialController.js#L59): `const tenantId=tenantIdOf(req),bookingId=id(req.body.hospitalityBooking),type=req.body.hospitalityType;`
  - [Line 60](../../../../server/controllers/hospitalityCommercialController.js#L60): `if(!bookingId||!["hotel","airport_transfer"].includes(type))return res.status(400).json({success:false,message:"A valid hospitality booking and booking type are required.`
  - [Line 61](../../../../server/controllers/hospitalityCommercialController.js#L61): `const Booking=type==="hotel"?HotelBooking:AirportTransferBooking;const booking=await Booking.findOne({_id:bookingId,tenantId}).lean();if(!booking)return res.status(404).j`
  - [Line 62](../../../../server/controllers/hospitalityCommercialController.js#L62): `const amount=Number(req.body.amount);if(!Number.isFinite(amount)||amount<=0)return res.status(400).json({success:false,message:"Deposit amount must be greater than zero."`
  - [Line 63](../../../../server/controllers/hospitalityCommercialController.js#L63): `const paidAmount=Math.max(0,Math.min(amount,Number(req.body.paidAmount||0)));const row=await HospitalityDeposit.create({tenantId,hospitalityType:type,hospitalityBooking:b`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/admin/hospitality-operations/deposits'
```

### PATCH /deposits/:id → `/api/admin/hospitality-operations/deposits/:id`

Declared at source line 26. Route handler pipeline names: `updateCommercialDeposit`.

```js
router.patch("/deposits/:id",updateCommercialDeposit)
```

- Imported handler/middleware `updateCommercialDeposit`: [hospitalityCommercialController.js](../../../../server/controllers/hospitalityCommercialController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `updateCommercialDeposit`

Handler starts at [controller line 67](../../../../server/controllers/hospitalityCommercialController.js#L67). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `paidAmount`, `dueDate`, `notes`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `400`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “Deposit not found.”; “Received amount must be between zero and the deposit amount.”.
- Database operations detected: `HospitalityDeposit.findOne`.
- Input/validation source lines to inspect:
  - [Line 68](../../../../server/controllers/hospitalityCommercialController.js#L68): `const tenantId=tenantIdOf(req),row=await HospitalityDeposit.findOne({_id:req.params.id,tenantId});if(!row)return res.status(404).json({success:false,message:"Deposit not `
  - [Line 69](../../../../server/controllers/hospitalityCommercialController.js#L69): `if(req.body.paidAmount!==undefined){const paid=Number(req.body.paidAmount);if(!Number.isFinite(paid)||paid<0||paid>Number(row.amount))return res.status(400).json({success`
  - [Line 70](../../../../server/controllers/hospitalityCommercialController.js#L70): `if(req.body.dueDate!==undefined)row.dueDate=date(req.body.dueDate);if(req.body.notes!==undefined)row.notes=text(req.body.notes);row.updatedBy=req.user?._id||null;await ro`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PATCH 'http://localhost:5000/api/admin/hospitality-operations/deposits/<id>'
```

### GET /transfers/dispatch → `/api/admin/hospitality-operations/transfers/dispatch`

Declared at source line 27. Route handler pipeline names: `transferDispatch`.

```js
router.get("/transfers/dispatch",transferDispatch)
```

- Imported handler/middleware `transferDispatch`: [hospitalityOperationsController.js](../../../../server/controllers/hospitalityOperationsController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `transferDispatch`

Handler starts at [controller line 43](../../../../server/controllers/hospitalityOperationsController.js#L43). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `date`, `from`, `to`, `status`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `data`.
- Database operations detected: `AirportTransferBooking.find`.
- Input/validation source lines to inspect:
  - [Line 43](../../../../server/controllers/hospitalityOperationsController.js#L43): `async(req,res,next)=>{try{const tenantId=tenantIdOf(req),bounds=kenyaDayBounds(req.query.date),from=asDate(req.query.from)||bounds.start,to=asDate(req.query.to)||bounds.e`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/hospitality-operations/transfers/dispatch'
```

### PATCH /transfers/:id/assign → `/api/admin/hospitality-operations/transfers/:id/assign`

Declared at source line 28. Route handler pipeline names: `assignTransfer`.

```js
router.patch("/transfers/:id/assign",assignTransfer)
```

- Imported handler/middleware `assignTransfer`: [hospitalityOperationsController.js](../../../../server/controllers/hospitalityOperationsController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `assignTransfer`

Handler starts at [controller line 45](../../../../server/controllers/hospitalityOperationsController.js#L45). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `vehicleId`, `driverId`, `status`, `notes`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “Transfer booking not found.”; “Vehicle not found.”; “Driver not found.”.
- Database operations detected: `AirportTransferBooking.findOne`, `Vehicle.findOne`, `User.findOne`.
- Input/validation source lines to inspect:
  - [Line 45](../../../../server/controllers/hospitalityOperationsController.js#L45): `async(req,res,next)=>{try{const tenantId=tenantIdOf(req),b=await AirportTransferBooking.findOne({_id:req.params.id,tenantId});if(!b)return res.status(404).json({success:f`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PATCH 'http://localhost:5000/api/admin/hospitality-operations/transfers/<id>/assign'
```

### PATCH /transfers/:id/status → `/api/admin/hospitality-operations/transfers/:id/status`

Declared at source line 29. Route handler pipeline names: `updateTransferStatus`.

```js
router.patch("/transfers/:id/status",updateTransferStatus)
```

- Imported handler/middleware `updateTransferStatus`: [hospitalityOperationsController.js](../../../../server/controllers/hospitalityOperationsController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `updateTransferStatus`

Handler starts at [controller line 47](../../../../server/controllers/hospitalityOperationsController.js#L47). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `status`, `delayMinutes`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `400`.
- JSON envelope keys observed: `success`, `message`, `data`.
- Literal messages include: “Transfer booking not found.”; “Invalid transfer status.”.
- Database operations detected: `AirportTransferBooking.findOne`.
- Input/validation source lines to inspect:
  - [Line 47](../../../../server/controllers/hospitalityOperationsController.js#L47): `async(req,res,next)=>{try{const allowed=["pending","confirmed","assigned","driver_en_route","picked_up","completed","cancelled","no_show"];const b=await AirportTransferBo`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PATCH 'http://localhost:5000/api/admin/hospitality-operations/transfers/<id>/status'
```

### GET /payments/reconciliation → `/api/admin/hospitality-operations/payments/reconciliation`

Declared at source line 30. Route handler pipeline names: `paymentReconciliation`.

```js
router.get("/payments/reconciliation",paymentReconciliation)
```

- Imported handler/middleware `paymentReconciliation`: [hospitalityOperationsController.js](../../../../server/controllers/hospitalityOperationsController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `paymentReconciliation`

Handler starts at [controller line 49](../../../../server/controllers/hospitalityOperationsController.js#L49). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `from`, `to`, `provider`.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `Payment.find`.
- Input/validation source lines to inspect:
  - [Line 49](../../../../server/controllers/hospitalityOperationsController.js#L49): `async(req,res,next)=>{try{const tenantId=tenantIdOf(req),from=asDate(req.query.from)||new Date(Date.now()-7*86400000),to=asDate(req.query.to)||new Date(),filter={tenantId`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/hospitality-operations/payments/reconciliation'
```

### GET /drivers → `/api/admin/hospitality-operations/drivers`

Declared at source line 31. Route handler pipeline names: `listDrivers`.

```js
router.get("/drivers",listDrivers)
```

- Imported handler/middleware `listDrivers`: [hospitalityOperationsController.js](../../../../server/controllers/hospitalityOperationsController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `listDrivers`

Handler starts at [controller line 53](../../../../server/controllers/hospitalityOperationsController.js#L53). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `data`.
- Database operations detected: `User.find`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/hospitality-operations/drivers'
```

### GET /vehicles → `/api/admin/hospitality-operations/vehicles`

Declared at source line 32. Route handler pipeline names: `listVehicles`.

```js
router.get("/vehicles",listVehicles)
```

- Imported handler/middleware `listVehicles`: [hospitalityOperationsController.js](../../../../server/controllers/hospitalityOperationsController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `listVehicles`

Handler starts at [controller line 54](../../../../server/controllers/hospitalityOperationsController.js#L54). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `data`.
- Database operations detected: `Vehicle.find`.

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/hospitality-operations/vehicles'
```

