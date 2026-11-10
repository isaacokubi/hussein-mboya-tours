# Route module: hospitalityPaymentRoutes.js

**Source:** [server/routes/hospitalityPaymentRoutes.js](../../../../server/routes/hospitalityPaymentRoutes.js)

Observed mount prefixes include `/api/hospitality-payments/mpesa`, `/api/hospitality-payments/card`, `/api/hospitality-payments/card/verify/:sessionId`, `/api/hospitality-payments/bank`, `/api/hospitality-payments/bank/:paymentId/confirm`, `/api/hospitality-payments/:bookingId`.

## Router-wide middleware

No router.use declaration was found at module scope.

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### POST /mpesa → `/api/hospitality-payments/mpesa`

Declared at source line 6. Route handler pipeline names: `protect`, `initiateHospitalityMpesa`.

```js
router.post("/mpesa", protect, initiateHospitalityMpesa)
```

- Imported handler/middleware `protect`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `initiateHospitalityMpesa`: [hospitalityPaymentController.js](../../../../server/controllers/hospitalityPaymentController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `initiateHospitalityMpesa`

Handler starts at [controller line 15](../../../../server/controllers/hospitalityPaymentController.js#L15). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `amount`, `phoneNumber`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `403`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Invalid hospitality booking type.”; “Hospitality booking not found.”; “You do not have permission to pay this reservation.”; “No balance remains for this reservation.”; “A payment request is already waiting for confirmation.”; “A valid Kenyan phone number is required for M-Pesa.”.
- Database operations detected: `Payment.findOne`, `Payment.create`.
- Input/validation source lines to inspect:
  - [Line 17](../../../../server/controllers/hospitalityPaymentController.js#L17): `const { type, Model, booking } = await getBooking(req); if (!Model) return res.status(400).json({ success: false, message: "Invalid hospitality booking type." }); if (!bo`
  - [Line 18](../../../../server/controllers/hospitalityPaymentController.js#L18): `const payable = await getHospitalityPayableAmount(booking); if (payable <= 0) return res.status(400).json({ success: false, message: "No balance remains for this reservat`
  - [Line 20](../../../../server/controllers/hospitalityPaymentController.js#L20): `const phone = String(req.body.phoneNumber || booking.passengerPhone || req.user?.phone || "").trim(); if (!phone) return res.status(400).json({ success: false, message: "`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/hospitality-payments/mpesa'
```

### POST /card → `/api/hospitality-payments/card`

Declared at source line 7. Route handler pipeline names: `protect`, `initiateHospitalityCard`.

```js
router.post("/card", protect, initiateHospitalityCard)
```

- Imported handler/middleware `protect`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `initiateHospitalityCard`: [hospitalityPaymentController.js](../../../../server/controllers/hospitalityPaymentController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `initiateHospitalityCard`

Handler starts at [controller line 26](../../../../server/controllers/hospitalityPaymentController.js#L26). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `403`, `201`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Invalid hospitality booking type.”; “Hospitality booking not found.”; “Not allowed.”; “No balance remains for this reservation.”.
- Database operations detected: `Payment.create`.
- Input/validation source lines to inspect:
  - [Line 28](../../../../server/controllers/hospitalityPaymentController.js#L28): `const { type, Model, booking } = await getBooking(req); if (!Model) return res.status(400).json({ success: false, message: "Invalid hospitality booking type." }); if (!bo`
  - [Line 29](../../../../server/controllers/hospitalityPaymentController.js#L29): `const amount = await getHospitalityPayableAmount(booking); if (amount <= 0) return res.status(400).json({ success: false, message: "No balance remains for this reservatio`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/hospitality-payments/card'
```

### GET /card/verify/:sessionId → `/api/hospitality-payments/card/verify/:sessionId`

Declared at source line 8. Route handler pipeline names: `protect`, `verifyHospitalityCard`.

```js
router.get("/card/verify/:sessionId", protect, verifyHospitalityCard)
```

- Imported handler/middleware `protect`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `verifyHospitalityCard`: [hospitalityPaymentController.js](../../../../server/controllers/hospitalityPaymentController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `verifyHospitalityCard`

Handler starts at [controller line 36](../../../../server/controllers/hospitalityPaymentController.js#L36). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `sessionId`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `403`, `404`.
- JSON envelope keys observed: `success`, `message`, `paid`, `status`.
- Literal messages include: “Stripe session ID is required.”; “Stripe session is missing hospitality metadata.”; “Stripe session does not belong to this user.”; “Hospitality booking not found.”; “Not allowed.”; “Stripe payment record not found.”; “Stripe amount does not match the reservation balance.”.
- Database operations detected: `Model.findOne`, `Payment.findOne`.
- Input/validation source lines to inspect:
  - [Line 38](../../../../server/controllers/hospitalityPaymentController.js#L38): `const sessionId = clean(req.params.sessionId); if (!sessionId) return res.status(400).json({ success: false, message: "Stripe session ID is required." }); const session =`
  - [Line 39](../../../../server/controllers/hospitalityPaymentController.js#L39): `const booking = await Model.findOne({ tenantId: req.tenantId, _id: bookingId }); if (!booking) return res.status(404).json({ success: false, message: "Hospitality booking`
  - [Line 41](../../../../server/controllers/hospitalityPaymentController.js#L41): `const expected = await getHospitalityPayableAmount(booking); const actual = Number(session.amount_total || 0) / 100; if (Math.round(actual * 100) !== Math.round(expected `

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/hospitality-payments/card/verify/<sessionId>'
```

### POST /bank → `/api/hospitality-payments/bank`

Declared at source line 9. Route handler pipeline names: `protect`, `submitHospitalityBank`.

```js
router.post("/bank", protect, submitHospitalityBank)
```

- Imported handler/middleware `protect`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `submitHospitalityBank`: [hospitalityPaymentController.js](../../../../server/controllers/hospitalityPaymentController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `submitHospitalityBank`

Handler starts at [controller line 46](../../../../server/controllers/hospitalityPaymentController.js#L46). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `amount`, `reference`, `notes`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `403`, `201`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Invalid hospitality booking type.”; “Hospitality booking not found.”; “Not allowed.”; “Invalid bank payment amount.”; “Bank transfer reference is required.”; “Bank payment submitted for verification.”.
- Database operations detected: `Payment.create`.
- Input/validation source lines to inspect:
  - [Line 48](../../../../server/controllers/hospitalityPaymentController.js#L48): `const { type, Model, booking } = await getBooking(req); if (!Model) return res.status(400).json({ success: false, message: "Invalid hospitality booking type." }); if (!bo`
  - [Line 49](../../../../server/controllers/hospitalityPaymentController.js#L49): `const payment = await Payment.create({ tenantId: booking.tenantId, user: booking.user || req.user._id, customer: booking.user || req.user._id, hospitalityBooking: booking`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/hospitality-payments/bank'
```

### POST /bank/:paymentId/confirm → `/api/hospitality-payments/bank/:paymentId/confirm`

Declared at source line 10. Route handler pipeline names: `protect`, `confirmHospitalityBank`.

```js
router.post("/bank/:paymentId/confirm", protect, confirmHospitalityBank)
```

- Imported handler/middleware `protect`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `confirmHospitalityBank`: [hospitalityPaymentController.js](../../../../server/controllers/hospitalityPaymentController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `confirmHospitalityBank`

Handler starts at [controller line 53](../../../../server/controllers/hospitalityPaymentController.js#L53). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `approved`, `reason`, `transactionId`.
- Path parameters read: `paymentId`; query parameters read: none detected.
- Literal HTTP statuses in handler: `403`, `404`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Staff authorization is required.”; “Hospitality bank payment not found.”; “Hospitality booking not found.”.
- Database operations detected: `Payment.findOne`, `Model.findOne`.
- Input/validation source lines to inspect:
  - [Line 55](../../../../server/controllers/hospitalityPaymentController.js#L55): `if (!staff(req.user)) return res.status(403).json({ success: false, message: "Staff authorization is required." }); const payment = await Payment.findOne({ tenantId: req.`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/hospitality-payments/bank/<paymentId>/confirm'
```

### GET /:bookingId → `/api/hospitality-payments/:bookingId`

Declared at source line 11. Route handler pipeline names: `protect`, `getHospitalityPayments`.

```js
router.get("/:bookingId", protect, getHospitalityPayments)
```

- Imported handler/middleware `protect`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `getHospitalityPayments`: [hospitalityPaymentController.js](../../../../server/controllers/hospitalityPaymentController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `getHospitalityPayments`

Handler starts at [controller line 59](../../../../server/controllers/hospitalityPaymentController.js#L59). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `bookingId`; query parameters read: `type`.
- Literal HTTP statuses in handler: `400`, `404`, `403`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Invalid hospitality booking type.”; “Hospitality booking not found.”; “Not allowed.”.
- Database operations detected: `Model.findOne`, `Payment.find`.
- Input/validation source lines to inspect:
  - [Line 61](../../../../server/controllers/hospitalityPaymentController.js#L61): `const type = String(req.query?.type || "").toLowerCase(); const Model = getHospitalityModel(type); if (!Model) return res.status(400).json({ success: false, message: "Inv`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/hospitality-payments/<bookingId>'
```

