# Route module: cashPaymentRoutes.js

**Source:** [server/routes/cashPaymentRoutes.js](../../../../server/routes/cashPaymentRoutes.js)

Observed mount prefixes include `/api/payments/cash`.

## Router-wide middleware

- `router.use(resolveTenant, protect);`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### POST / → `/api/payments/cash`

Declared at source line 9. Route handler pipeline names: `rateLimit`, `createCashPayment`.

```js
router.post("/", rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false }), createCashPayment)
```

- Imported handler/middleware `rateLimit`: external dependency `express-rate-limit`
- Imported handler/middleware `createCashPayment`: [cashPaymentController.js](../../../../server/controllers/cashPaymentController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `createCashPayment`

Handler starts at [controller line 10](../../../../server/controllers/cashPaymentController.js#L10). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `bookingId`, `amount`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `409`, `404`, `403`, `400`, `200`, `201`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Cash payments are disabled or not configured for this tenant.”; “Booking not found.”; “You cannot create a cash payment for this booking.”; “This booking cannot receive another payment.”; “Enter a valid amount up to the outstanding booking balance.”; “Cash payment is awaiting staff confirmation.”; “Cash payment recorded as pending. Staff must confirm receipt before the booking is marked paid.”.
- Database operations detected: `Booking.findOne`, `Payment.findOne`, `Payment.create`.
- Input/validation source lines to inspect:
  - [Line 14](../../../../server/controllers/cashPaymentController.js#L14): `if (!isTenantPaymentMethodAvailable(settings, "CASH")) return res.status(409).json({ success: false, message: "Cash payments are disabled or not configured for this tenan`
  - [Line 15](../../../../server/controllers/cashPaymentController.js#L15): `const booking = await Booking.findOne(mergeTenantFilter(req, { _id: req.body?.bookingId }));`
  - [Line 16](../../../../server/controllers/cashPaymentController.js#L16): `if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });`
  - [Line 17](../../../../server/controllers/cashPaymentController.js#L17): `if (!ownsBooking(booking, req.user)) return res.status(403).json({ success: false, message: "You cannot create a cash payment for this booking." });`
  - [Line 18](../../../../server/controllers/cashPaymentController.js#L18): `if (["cancelled", "refunded"].includes(String(booking.status).toLowerCase()) || booking.paymentStatus === "paid") return res.status(409).json({ success: false, message: "`
  - [Line 20](../../../../server/controllers/cashPaymentController.js#L20): `const amount = req.body?.amount === undefined ? payableAmount : Number(req.body.amount);`
  - [Line 21](../../../../server/controllers/cashPaymentController.js#L21): `if (!Number.isFinite(amount) || amount <= 0 || amount > payableAmount) return res.status(400).json({ success: false, message: "Enter a valid amount up to the outstanding `

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/payments/cash'
```

