# Route module: adminBookingRoutes.js

**Source:** [server/routes/adminBookingRoutes.js](../../../../server/routes/adminBookingRoutes.js)

Observed mount prefixes include `/api/admin/bookings`, `/api/admin/bookings/:id`, `/api/admin/bookings/:id/status`, `/api/admin/bookings/:id/assign`, `/api/admin/bookings/:id/payment`, `/api/admin/bookings/:id/timeline`, `/api/admin/bookings/:id/invoice`, `/api/admin/bookings/:id/notify`.

## Router-wide middleware

- `router.use(resolveTenant);`
- `router.use(protect);`
- `router.use(adminMiddleware);`
- `router.use(authorize("booking.manage"));`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET / → `/api/admin/bookings`

Declared at source line 17. Route handler pipeline names: `getBookings`.

```js
router.get("/", getBookings)
```

- Imported handler/middleware `getBookings`: [tenantBookingAdminController.js](../../../../server/controllers/tenantBookingAdminController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/bookings'
```

### GET /:id → `/api/admin/bookings/:id`

Declared at source line 18. Route handler pipeline names: `getBooking`.

```js
router.get("/:id", getBooking)
```

- Imported handler/middleware `getBooking`: [tenantBookingAdminController.js](../../../../server/controllers/tenantBookingAdminController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getBooking`

Handler starts at [controller line 175](../../../../server/controllers/tenantBookingAdminController.js#L175). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`, `data`, `booking`.
- Literal messages include: “Invalid booking ID.”; “Booking not found.”.
- Database operations detected: `Booking.findOne`.
- Input/validation source lines to inspect:
  - [Line 177](../../../../server/controllers/tenantBookingAdminController.js#L177): `const { id } = req.params;`
  - [Line 178](../../../../server/controllers/tenantBookingAdminController.js#L178): `if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid booking ID." });`
  - [Line 183](../../../../server/controllers/tenantBookingAdminController.js#L183): `if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });`
  - [Line 185](../../../../server/controllers/tenantBookingAdminController.js#L185): `if (!safeBookings.length) return res.status(404).json({ success: false, message: "Booking not found." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/bookings/<id>'
```

### PUT /:id/status → `/api/admin/bookings/:id/status`

Declared at source line 19. Route handler pipeline names: `updateBookingStatus`.

```js
router.put("/:id/status", updateBookingStatus)
```

- Imported handler/middleware `updateBookingStatus`: [bookingAdminController.js](../../../../server/controllers/bookingAdminController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `updateBookingStatus`

Handler starts at [controller line 332](../../../../server/controllers/bookingAdminController.js#L332). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `reason`, `status`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`, `allowedStatuses`, `paymentStatus`, `data`.
- Literal messages include: “Invalid booking ID.”; “Invalid booking status.”; “Booking not found.”; “A booking must have paid payment status before it can be completed.”; “Booking status updated successfully.”.
- Database operations detected: `Booking.findOne`, `Booking.findOneAndUpdate`.
- Input/validation source lines to inspect:
  - [Line 338](../../../../server/controllers/bookingAdminController.js#L338): `const { status } = req.body;`
  - [Line 346](../../../../server/controllers/bookingAdminController.js#L346): `if (!isValidId(req.params.id)) {`
  - [Line 347](../../../../server/controllers/bookingAdminController.js#L347): `return res.status(400).json({`
  - [Line 360](../../../../server/controllers/bookingAdminController.js#L360): `return res.status(400).json({`
  - [Line 376](../../../../server/controllers/bookingAdminController.js#L376): `_id:req.params.id`
  - [Line 381](../../../../server/controllers/bookingAdminController.js#L381): `return res.status(404).json({`
  - [Line 394](../../../../server/controllers/bookingAdminController.js#L394): `return res.status(400).json({`
  - [Line 412](../../../../server/controllers/bookingAdminController.js#L412): `return res.status(400).json({`
  - [Line 435](../../../../server/controllers/bookingAdminController.js#L435): `return res.status(400).json({`
  - [Line 454](../../../../server/controllers/bookingAdminController.js#L454): `_id:req.params.id`
  - [Line 487](../../../../server/controllers/bookingAdminController.js#L487): `return res.status(404).json({`
  - [Line 493](../../../../server/controllers/bookingAdminController.js#L493): `await sendEmailBestEffort(() => sendBookingStatusEmail(booking, status, req.body?.reason || ""), "Booking status");`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PUT 'http://localhost:5000/api/admin/bookings/<id>/status'
```

### PUT /:id/assign → `/api/admin/bookings/:id/assign`

Declared at source line 20. Route handler pipeline names: `guardBookingResources`, `assignResources`.

```js
router.put("/:id/assign", guardBookingResources, assignResources)
```

- Imported handler/middleware `guardBookingResources`: [resourceTenantGuard.js](../../../../server/middleware/resourceTenantGuard.js)
- Imported handler/middleware `assignResources`: [bookingAdminController.js](../../../../server/controllers/bookingAdminController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `assignResources`

Handler starts at [controller line 596](../../../../server/controllers/bookingAdminController.js#L596). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `guide`, `driver`, `vehicle`, `agent`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`, `paymentStatus`, `data`.
- Literal messages include: “Invalid booking ID.”; “Invalid guide ID.”; “Invalid driver ID.”; “Invalid vehicle ID.”; “Invalid agent ID.”; “Booking not found.”; “Only paid bookings can be assigned.”; “Resources assigned successfully.”.
- Database operations detected: `Booking.findOne`, `Booking.findOneAndUpdate`.
- Input/validation source lines to inspect:
  - [Line 607](../../../../server/controllers/bookingAdminController.js#L607): `} = req.body;`
  - [Line 615](../../../../server/controllers/bookingAdminController.js#L615): `if (!isValidId(req.params.id)) {`
  - [Line 616](../../../../server/controllers/bookingAdminController.js#L616): `return res.status(400).json({`
  - [Line 629](../../../../server/controllers/bookingAdminController.js#L629): `return res.status(400).json({`
  - [Line 636](../../../../server/controllers/bookingAdminController.js#L636): `return res.status(400).json({`
  - [Line 643](../../../../server/controllers/bookingAdminController.js#L643): `return res.status(400).json({`
  - [Line 650](../../../../server/controllers/bookingAdminController.js#L650): `return res.status(400).json({`
  - [Line 665](../../../../server/controllers/bookingAdminController.js#L665): `_id:req.params.id`
  - [Line 670](../../../../server/controllers/bookingAdminController.js#L670): `return res.status(404).json({`
  - [Line 686](../../../../server/controllers/bookingAdminController.js#L686): `return res.status(400).json({`
  - [Line 718](../../../../server/controllers/bookingAdminController.js#L718): `return res.status(400).json({`
  - [Line 738](../../../../server/controllers/bookingAdminController.js#L738): `_id:req.params.id`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PUT 'http://localhost:5000/api/admin/bookings/<id>/assign'
```

### PUT /:id/payment → `/api/admin/bookings/:id/payment`

Declared at source line 21. Route handler pipeline names: `updatePaymentStatus`.

```js
router.put("/:id/payment", updatePaymentStatus)
```

- Imported handler/middleware `updatePaymentStatus`: [bookingAdminController.js](../../../../server/controllers/bookingAdminController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `updatePaymentStatus`

Handler starts at [controller line 805](../../../../server/controllers/bookingAdminController.js#L805). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `410`.
- JSON envelope keys observed: `success`, `code`, `message`.
- Literal messages include: “Booking payment status is derived from the verified Payment ledger. Use the payment lifecycle workflow instead of editing booking.paymentStatus directly.”.
- Database operations detected: none directly detected (may be delegated to service/helper).

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X PUT 'http://localhost:5000/api/admin/bookings/<id>/payment'
```

### GET /:id/timeline → `/api/admin/bookings/:id/timeline`

Declared at source line 22. Route handler pipeline names: `getBookingTimeline`.

```js
router.get("/:id/timeline", getBookingTimeline)
```

- Imported handler/middleware `getBookingTimeline`: [bookingAdminController.js](../../../../server/controllers/bookingAdminController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getBookingTimeline`

Handler starts at [controller line 822](../../../../server/controllers/bookingAdminController.js#L822). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Booking not found”.
- Database operations detected: `Booking.findOne`, `Payment.findOne`.
- Input/validation source lines to inspect:
  - [Line 833](../../../../server/controllers/bookingAdminController.js#L833): `_id:req.params.id`
  - [Line 849](../../../../server/controllers/bookingAdminController.js#L849): `return res.status(404).json({`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/bookings/<id>/timeline'
```

### GET /:id/invoice → `/api/admin/bookings/:id/invoice`

Declared at source line 23. Route handler pipeline names: `downloadBookingInvoice`.

```js
router.get("/:id/invoice", downloadBookingInvoice)
```

- Imported handler/middleware `downloadBookingInvoice`: [bookingAdminController.js](../../../../server/controllers/bookingAdminController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `downloadBookingInvoice`

Handler starts at [controller line 931](../../../../server/controllers/bookingAdminController.js#L931). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Booking not found”.
- Database operations detected: `Booking.findOne`.
- Input/validation source lines to inspect:
  - [Line 938](../../../../server/controllers/bookingAdminController.js#L938): `_id:req.params.id`
  - [Line 953](../../../../server/controllers/bookingAdminController.js#L953): `return res.status(404).json({`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/admin/bookings/<id>/invoice'
```

### POST /:id/notify → `/api/admin/bookings/:id/notify`

Declared at source line 24. Route handler pipeline names: `sendBookingNotification`.

```js
router.post("/:id/notify", sendBookingNotification)
```

- Imported handler/middleware `sendBookingNotification`: [bookingAdminController.js](../../../../server/controllers/bookingAdminController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `sendBookingNotification`

Handler starts at [controller line 1011](../../../../server/controllers/bookingAdminController.js#L1011). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `message`.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`, `channel`.
- Literal messages include: “Invalid booking ID.”; “Notification message is required.”; “Booking not found.”; “This booking does not have a customer user account for in-app notifications.”; “Booking notification sent successfully.”.
- Database operations detected: `Booking.findOne`, `Notification.create`.
- Input/validation source lines to inspect:
  - [Line 1014](../../../../server/controllers/bookingAdminController.js#L1014): `if (!isValidId(req.params.id)) return res.status(400).json({ success:false, message:"Invalid booking ID." });`
  - [Line 1015](../../../../server/controllers/bookingAdminController.js#L1015): `const message = String(req.body?.message || "").trim();`
  - [Line 1016](../../../../server/controllers/bookingAdminController.js#L1016): `if (!message) return res.status(400).json({ success:false, message:"Notification message is required." });`
  - [Line 1018](../../../../server/controllers/bookingAdminController.js#L1018): `const booking = await Booking.findOne(mergeTenantFilter(req, { _id: req.params.id }))`
  - [Line 1022](../../../../server/controllers/bookingAdminController.js#L1022): `if (!booking) return res.status(404).json({ success:false, message:"Booking not found." });`
  - [Line 1025](../../../../server/controllers/bookingAdminController.js#L1025): `if (!recipient) return res.status(400).json({ success:false, message:"This booking does not have a customer user account for in-app notifications." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/admin/bookings/<id>/notify'
```

