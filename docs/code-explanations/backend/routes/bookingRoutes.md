# Route module: bookingRoutes.js

**Source:** [server/routes/bookingRoutes.js](../../../../server/routes/bookingRoutes.js)

Observed mount prefixes include `/api/bookings/test`, `/api/bookings`, `/api/bookings/my-bookings`, `/api/bookings/cancel/:id`, `/api/bookings/reschedule/:id`, `/api/bookings/:id/travel-date`, `/api/bookings/confirmed`, `/api/bookings/admin`, `/api/bookings/admin/all`, `/api/bookings/:id/status`, `/api/bookings/:id`.

## Router-wide middleware

- `router.use(resolveTenant);`
- `router.use(protect);`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET /test → `/api/bookings/test`

Declared at source line 19. Route handler pipeline names: inline callback.

```js
router.get("/test", (req, res) => res.status(200).json({ success: true, message: "Booking routes are loaded" }))
```

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/bookings/test'
```

### POST / → `/api/bookings`

Declared at source line 20. Route handler pipeline names: `customerOnly`, `validateBookingTravelDate`, `createCustomerBooking`.

```js
router.post("/", customerOnly, validateBookingTravelDate, createCustomerBooking)
```

- Imported handler/middleware `customerOnly`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `validateBookingTravelDate`: [validateBookingTravelDate.js](../../../../server/middleware/validateBookingTravelDate.js)
- Imported handler/middleware `createCustomerBooking`: [customerBookingController.js](../../../../server/controllers/customerBookingController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `createCustomerBooking`

Handler starts at [controller line 13](../../../../server/controllers/customerBookingController.js#L13). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `tour`, `travelDate`, `travelers`, `numberOfGuests`, `contact`, `paymentMethod`, `pickupLocation`, `pickupTime`, `hotelName`, `roomNumber`, `emergencyContact`, `specialRequests`, `bookingType`, `groupReference`, `corporateAccount`, `corporateCompanyName`, `corporatePin`, `purchaseOrderNumber`, `paymentTerms`, `billingContact`, `roomingListReference`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `409`, `404`, `201`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Tour and travel date are required.”; “This payment method is not currently available for this tenant. Choose another method or contact the tenant administrator.”; “Invalid booking type.”; “Tour not found.”; “Group bookings require at least two guests.”; “Not enough available tour slots for this booking.”; “This tour does not have a valid price.”; “Corporate account is required.”; “Corporate account is inactive or the booking exceeds its credit limit.”; “This corporate account requires a purchase order number.”; “Corporate credit was no longer available. Please retry the booking.”; “Booking created successfully”.
- Database operations detected: `Tour.findOne`, `CorporateAccount.findOne`, `CorporateAccount.findOneAndUpdate`, `Booking.create`, `User.find`, `CorporateAccount.updateOne`.
- Input/validation source lines to inspect:
  - [Line 24](../../../../server/controllers/customerBookingController.js#L24): `} = req.body || {};`
  - [Line 26](../../../../server/controllers/customerBookingController.js#L26): `if (!tour || !travelDate) return res.status(400).json({ success: false, message: "Tour and travel date are required." });`
  - [Line 29](../../../../server/controllers/customerBookingController.js#L29): `if (!normalizedPaymentMethod || !isTenantPaymentMethodAvailable(tenantSettings, normalizedPaymentMethod)) return res.status(409).json({ success: false, message: "This pay`
  - [Line 31](../../../../server/controllers/customerBookingController.js#L31): `if (!["individual", "group", "corporate"].includes(normalizedType)) return res.status(400).json({ success: false, message: "Invalid booking type." });`
  - [Line 34](../../../../server/controllers/customerBookingController.js#L34): `if (!tourData) return res.status(404).json({ success: false, message: "Tour not found." });`
  - [Line 37](../../../../server/controllers/customerBookingController.js#L37): `if (normalizedType === "group" && guests < 2) return res.status(400).json({ success: false, message: "Group bookings require at least two guests." });`
  - [Line 39](../../../../server/controllers/customerBookingController.js#L39): `if (!capacityAvailable) return res.status(409).json({ success: false, message: "Not enough available tour slots for this booking." });`
  - [Line 43](../../../../server/controllers/customerBookingController.js#L43): `if (!Number.isFinite(totalAmount) || totalAmount <= 0) return res.status(409).json({ success: false, message: "This tour does not have a valid price." });`
  - [Line 47](../../../../server/controllers/customerBookingController.js#L47): `if (!corporateAccountId) return res.status(400).json({ success: false, message: "Corporate account is required." });`
  - [Line 49](../../../../server/controllers/customerBookingController.js#L49): `if (!account) return res.status(409).json({ success: false, message: "Corporate account is inactive or the booking exceeds its credit limit." });`
  - [Line 50](../../../../server/controllers/customerBookingController.js#L50): `if (account.requiresPurchaseOrder && !String(purchaseOrderNumber || "").trim()) return res.status(400).json({ success: false, message: "This corporate account requires a `
  - [Line 52](../../../../server/controllers/customerBookingController.js#L52): `if (!reserved) return res.status(409).json({ success: false, message: "Corporate credit was no longer available. Please retry the booking." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/bookings'
```

### GET /my-bookings → `/api/bookings/my-bookings`

Declared at source line 21. Route handler pipeline names: `customerOnly`, `getCustomerBookings`.

```js
router.get("/my-bookings", customerOnly, getCustomerBookings)
```

- Imported handler/middleware `customerOnly`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `getCustomerBookings`: [customerDashboardController.js](../../../../server/controllers/customerDashboardController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getCustomerBookings`

Handler starts at [controller line 35](../../../../server/controllers/customerDashboardController.js#L35). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `page`, `limit`.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `Booking.countDocuments`, `Booking.find`.
- Input/validation source lines to inspect:
  - [Line 37](../../../../server/controllers/customerDashboardController.js#L37): `const page = Math.max(Number(req.query.page) || 1, 1);`
  - [Line 38](../../../../server/controllers/customerDashboardController.js#L38): `const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/bookings/my-bookings'
```

### PUT /cancel/:id → `/api/bookings/cancel/:id`

Declared at source line 22. Route handler pipeline names: `customerOnly`, `cancelBooking`.

```js
router.put("/cancel/:id", customerOnly, cancelBooking)
```

- Imported handler/middleware `customerOnly`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `cancelBooking`: [bookingController.js](../../../../server/controllers/bookingController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `cancelBooking`

Handler starts at [controller line 1195](../../../../server/controllers/bookingController.js#L1195). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `403`, `200`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Invalid booking ID”; “Booking not found”; “You do not have permission to cancel this booking”; “Booking has already been cancelled”; “Completed bookings cannot be cancelled”; “Booking cancelled successfully”.
- Database operations detected: `Booking.findOne`.
- Input/validation source lines to inspect:
  - [Line 1204](../../../../server/controllers/bookingController.js#L1204): `if (!mongoose.Types.ObjectId.isValid(req.params.id)) {`
  - [Line 1205](../../../../server/controllers/bookingController.js#L1205): `return res.status(400).json({`
  - [Line 1214](../../../../server/controllers/bookingController.js#L1214): `_id: req.params.id,`
  - [Line 1222](../../../../server/controllers/bookingController.js#L1222): `return res.status(404).json({`
  - [Line 1240](../../../../server/controllers/bookingController.js#L1240): `return res.status(403).json({`
  - [Line 1250](../../../../server/controllers/bookingController.js#L1250): `return res.status(400).json({`
  - [Line 1268](../../../../server/controllers/bookingController.js#L1268): `return res.status(400).json({`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PUT 'http://localhost:5000/api/bookings/cancel/<id>'
```

### PUT /reschedule/:id → `/api/bookings/reschedule/:id`

Declared at source line 23. Route handler pipeline names: `customerOnly`, `rescheduleBooking`.

```js
router.put("/reschedule/:id", customerOnly, rescheduleBooking)
```

- Imported handler/middleware `customerOnly`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `rescheduleBooking`: [bookingController.js](../../../../server/controllers/bookingController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `rescheduleBooking`

Handler starts at [controller line 1365](../../../../server/controllers/bookingController.js#L1365). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `newTravelDate`, `reason`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `409`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “A valid future travel date is required.”; “The rescheduled date must be in the future.”; “Booking not found.”; “This booking cannot be rescheduled.”; “Choose a different travel date.”; “This tour has no configured travel-date range.”; “Booking rescheduled successfully.”.
- Database operations detected: `Booking.findOne`, `Notification.create`, `User.find`.
- Input/validation source lines to inspect:
  - [Line 1367](../../../../server/controllers/bookingController.js#L1367): `const { newTravelDate, reason = "" } = req.body || {};`
  - [Line 1368](../../../../server/controllers/bookingController.js#L1368): `if (!newTravelDate || Number.isNaN(new Date(newTravelDate).getTime())) return res.status(400).json({ success:false, message:"A valid future travel date is required." });`
  - [Line 1371](../../../../server/controllers/bookingController.js#L1371): `if (target <= today) return res.status(400).json({ success:false, message:"The rescheduled date must be in the future." });`
  - [Line 1374](../../../../server/controllers/bookingController.js#L1374): `_id: req.params.id,`
  - [Line 1381](../../../../server/controllers/bookingController.js#L1381): `if (!booking) return res.status(404).json({ success:false, message:"Booking not found." });`
  - [Line 1382](../../../../server/controllers/bookingController.js#L1382): `if (["cancelled","completed","refunded"].includes(booking.status)) return res.status(400).json({ success:false, message:"This booking cannot be rescheduled." });`
  - [Line 1383](../../../../server/controllers/bookingController.js#L1383): `if (booking.travelDate && target.getTime() === new Date(booking.travelDate).setHours(0,0,0,0)) return res.status(400).json({ success:false, message:"Choose a different tr`
  - [Line 1386](../../../../server/controllers/bookingController.js#L1386): `return res.status(409).json({ success:false, message:"This tour has no configured travel-date range." });`
  - [Line 1389](../../../../server/controllers/bookingController.js#L1389): `return res.status(400).json({`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PUT 'http://localhost:5000/api/bookings/reschedule/<id>'
```

### PUT /:id/travel-date → `/api/bookings/:id/travel-date`

Declared at source line 24. Route handler pipeline names: `customerOnly`, `updateBookingTravelDate`.

```js
router.put("/:id/travel-date", customerOnly, updateBookingTravelDate)
```

- Imported handler/middleware `customerOnly`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `updateBookingTravelDate`: [bookingTravelDateController.js](../../../../server/controllers/bookingTravelDateController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `updateBookingTravelDate`

Handler starts at [controller line 54](../../../../server/controllers/bookingTravelDateController.js#L54). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `travelDate`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `400`, `409`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Booking not found.”; “This booking cannot be changed.”; “A valid travel date is required.”; “This booking has no configured travel-date range.”; “Travel date updated successfully.”.
- Database operations detected: `Booking.findOne`.
- Input/validation source lines to inspect:
  - [Line 59](../../../../server/controllers/bookingTravelDateController.js#L59): `_id: req.params.id,`
  - [Line 63](../../../../server/controllers/bookingTravelDateController.js#L63): `if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });`
  - [Line 65](../../../../server/controllers/bookingTravelDateController.js#L65): `return res.status(400).json({ success: false, message: "This booking cannot be changed." });`
  - [Line 68](../../../../server/controllers/bookingTravelDateController.js#L68): `const target = startOfDay(req.body?.travelDate);`
  - [Line 69](../../../../server/controllers/bookingTravelDateController.js#L69): `if (!target) return res.status(400).json({ success: false, message: "A valid travel date is required." });`
  - [Line 73](../../../../server/controllers/bookingTravelDateController.js#L73): `return res.status(409).json({ success: false, message: "This booking has no configured travel-date range." });`
  - [Line 77](../../../../server/controllers/bookingTravelDateController.js#L77): `return res.status(400).json({`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PUT 'http://localhost:5000/api/bookings/<id>/travel-date'
```

### GET /confirmed → `/api/bookings/confirmed`

Declared at source line 25. Route handler pipeline names: `managerOnly`, `getConfirmedBookings`.

```js
router.get("/confirmed", managerOnly, getConfirmedBookings)
```

- Imported handler/middleware `managerOnly`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `getConfirmedBookings`: [tenantBookingAdminController.js](../../../../server/controllers/tenantBookingAdminController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getConfirmedBookings`

Handler starts at [controller line 192](../../../../server/controllers/tenantBookingAdminController.js#L192). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `page`, `limit`.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: `success`, `page`, `pages`, `count`, `data`.
- Database operations detected: `Booking.find`.
- Input/validation source lines to inspect:
  - [Line 195](../../../../server/controllers/tenantBookingAdminController.js#L195): `const currentPage = Math.max(Number(req.query.page) || 1, 1);`
  - [Line 196](../../../../server/controllers/tenantBookingAdminController.js#L196): `const pageSize = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/bookings/confirmed'
```

### GET /admin → `/api/bookings/admin`

Declared at source line 26. Route handler pipeline names: `managerOnly`, `getAllBookings`.

```js
router.get("/admin", managerOnly, getAllBookings)
```

- Imported handler/middleware `managerOnly`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `getAllBookings`: [tenantBookingAdminController.js](../../../../server/controllers/tenantBookingAdminController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getAllBookings`

Handler starts at [controller line 134](../../../../server/controllers/tenantBookingAdminController.js#L134). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `page`, `limit`, `search`, `status`, `paymentStatus`.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `Booking.find`.
- Input/validation source lines to inspect:
  - [Line 137](../../../../server/controllers/tenantBookingAdminController.js#L137): `const { page = 1, limit = 20, search, status, paymentStatus } = req.query;`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/bookings/admin'
```

### GET /admin/all → `/api/bookings/admin/all`

Declared at source line 27. Route handler pipeline names: `adminOnly`, `getAllBookings`.

```js
router.get("/admin/all", adminOnly, getAllBookings)
```

- Imported handler/middleware `adminOnly`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `getAllBookings`: [tenantBookingAdminController.js](../../../../server/controllers/tenantBookingAdminController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getAllBookings`

Handler starts at [controller line 134](../../../../server/controllers/tenantBookingAdminController.js#L134). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: `page`, `limit`, `search`, `status`, `paymentStatus`.
- Literal HTTP statuses in handler: `200`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.
- Database operations detected: `Booking.find`.
- Input/validation source lines to inspect:
  - [Line 137](../../../../server/controllers/tenantBookingAdminController.js#L137): `const { page = 1, limit = 20, search, status, paymentStatus } = req.query;`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/bookings/admin/all'
```

### PUT /:id/status → `/api/bookings/:id/status`

Declared at source line 28. Route handler pipeline names: `adminOnly`, `requireFullPaymentForTrip`, `updateBookingStatus`.

```js
router.put("/:id/status", adminOnly, requireFullPaymentForTrip, updateBookingStatus)
```

- Imported handler/middleware `adminOnly`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `requireFullPaymentForTrip`: [requireFullPaymentForTrip.js](../../../../server/middleware/requireFullPaymentForTrip.js)
- Imported handler/middleware `updateBookingStatus`: [bookingController.js](../../../../server/controllers/bookingController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `updateBookingStatus`

Handler starts at [controller line 1133](../../../../server/controllers/bookingController.js#L1133). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `status`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `400`, `409`, `200`.
- JSON envelope keys observed: `success`, `message`, `allowedStatuses`, `code`.
- Literal messages include: “Booking not found”; “Invalid booking status”; “Only fully paid bookings can be moved into an active or completed trip state.”; “Booking status updated successfully”.
- Database operations detected: `Booking.findOne`.
- Input/validation source lines to inspect:
  - [Line 1136](../../../../server/controllers/bookingController.js#L1136): `mergeTenantFilter({ _id: req.params.id })`
  - [Line 1140](../../../../server/controllers/bookingController.js#L1140): `return res.status(404).json({ success: false, message: "Booking not found" });`
  - [Line 1143](../../../../server/controllers/bookingController.js#L1143): `const requestedStatus = String(req.body?.status || "").trim().toLowerCase();`
  - [Line 1145](../../../../server/controllers/bookingController.js#L1145): `return res.status(400).json({`
  - [Line 1153](../../../../server/controllers/bookingController.js#L1153): `return res.status(400).json({`
  - [Line 1160](../../../../server/controllers/bookingController.js#L1160): `return res.status(409).json({`
  - [Line 1169](../../../../server/controllers/bookingController.js#L1169): `return res.status(409).json({`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PUT 'http://localhost:5000/api/bookings/<id>/status'
```

### GET /:id → `/api/bookings/:id`

Declared at source line 29. Route handler pipeline names: `getBookingByIdOptimized`.

```js
router.get("/:id", getBookingByIdOptimized)
```

- Imported handler/middleware `getBookingByIdOptimized`: [bookingRetrievalController.js](../../../../server/controllers/bookingRetrievalController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/bookings/<id>'
```

