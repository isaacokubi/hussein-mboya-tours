# Route module: stripeRoutes.js

**Source:** [server/routes/stripeRoutes.js](../../../../server/routes/stripeRoutes.js)

Observed mount prefixes include `/api/payments/stripe/webhook`, `/api/payments/stripe/checkout`, `/api/payments/stripe/verify/:sessionId`, `/api/payments/stripe/bank-transfer`.

## Router-wide middleware

- `router.use(resolveTenant);`
- `router.use(protect);`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### POST /webhook → `/api/payments/stripe/webhook`

Declared at source line 9. Route handler pipeline names: `stripeWebhook`.

```js
router.post("/webhook", stripeWebhook)
```

- Imported handler/middleware `stripeWebhook`: [stripeController.js](../../../../server/controllers/stripeController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `stripeWebhook`

Handler starts at [controller line 1304](../../../../server/controllers/stripeController.js#L1304). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `503`, `400`, `200`, `500`.
- JSON envelope keys observed: `success`, `message`, `duplicate`, `ignored`.
- Literal messages include: “Stripe webhook verification is not configured.”; “Stripe webhook signature verification failed.”; “Stripe event is missing payment correlation metadata.”.
- Database operations detected: `StripeWebhookEvent.findOneAndUpdate`, `StripeWebhookEvent.create`, `StripeWebhookEvent.findOne`, `Payment.findOne`, `Booking.findOne`.
- Input/validation source lines to inspect:
  - [Line 1307](../../../../server/controllers/stripeController.js#L1307): `if (!verifyStripeWebhookSignature({ payload: req.rawBody, signature: req.get("stripe-signature"), secret })) return res.status(400).json({ success: false, message: "Strip`
  - [Line 1308](../../../../server/controllers/stripeController.js#L1308): `const eventPayload = req.body || {};`
  - [Line 1313](../../../../server/controllers/stripeController.js#L1313): `if (!/^\w{24}$/.test(tenantId) || !eventId || !eventType) return res.status(400).json({ success: false, message: "Stripe event is missing payment correlation metadata." }`
  - [Line 1337](../../../../server/controllers/stripeController.js#L1337): `if (!session.id || String(session.metadata?.tenantId) !== tenantId) throw new Error("Stripe session tenant does not match the payment event.");`
  - [Line 1339](../../../../server/controllers/stripeController.js#L1339): `if (!payment) throw new Error("Stripe payment record is not available yet.");`
  - [Line 1340](../../../../server/controllers/stripeController.js#L1340): `if (String(session.metadata?.paymentId || "") !== String(payment._id)) throw new Error("Stripe payment correlation does not match the saved attempt.");`
  - [Line 1342](../../../../server/controllers/stripeController.js#L1342): `if (!booking) throw new Error("Stripe booking is not available.");`
  - [Line 1351](../../../../server/controllers/stripeController.js#L1351): `if (session.payment_status !== "paid") throw new Error("Stripe event does not confirm a paid Checkout session.");`
  - [Line 1353](../../../../server/controllers/stripeController.js#L1353): `if (!Number.isFinite(expectedAmount) || Number(session.amount_total) !== expectedAmount || String(session.currency || "").toUpperCase() !== String(payment.currency || "")`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/payments/stripe/webhook'
```

### POST /checkout → `/api/payments/stripe/checkout`

Declared at source line 12. Route handler pipeline names: `paymentInitiationLimit`, `createStripeSession`.

```js
router.post("/checkout",paymentInitiationLimit,createStripeSession)
```

- Imported handler/middleware `createStripeSession`: [stripeController.js](../../../../server/controllers/stripeController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `createStripeSession`

Handler starts at [controller line 285](../../../../server/controllers/stripeController.js#L285). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `bookingId`, `amount`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `409`, `401`, `400`, `404`, `200`, `201`.
- JSON envelope keys observed: `success`, `message`, `sessionId`, `url`, `reused`.
- Literal messages include: “Card payments are disabled or not configured for this tenant.”; “Authentication is required.”; “Booking ID is required.”; “Booking not found.”; “This booking is no longer available for payment.”; “Cancelled or refunded bookings cannot be paid.”; “No amount is due for this booking.”; “No valid payment amount is due for this booking.”; “Payment amount cannot exceed the booking balance.”; “A Stripe checkout request is processing or uncertain. Refresh payment status before retrying.”; “A Stripe checkout is already active or its status is uncertain. Refresh payment status before retrying.”; “The existing Stripe checkout status could not be verified. Refresh payment status before retrying.”.
- Database operations detected: `Payment.findOne`, `Payment.create`.
- Input/validation source lines to inspect:
  - [Line 296](../../../../server/controllers/stripeController.js#L296): `if (!isTenantPaymentMethodAvailable(tenantSettings, "CARD")) return res.status(409).json({ success: false, message: "Card payments are disabled or not configured for this`
  - [Line 300](../../../../server/controllers/stripeController.js#L300): `return res.status(401).json({`
  - [Line 309](../../../../server/controllers/stripeController.js#L309): `req.body?.bookingId || ""`
  - [Line 314](../../../../server/controllers/stripeController.js#L314): `return res.status(400).json({`
  - [Line 336](../../../../server/controllers/stripeController.js#L336): `return res.status(404).json({`
  - [Line 352](../../../../server/controllers/stripeController.js#L352): `return res.status(400).json({`
  - [Line 364](../../../../server/controllers/stripeController.js#L364): `return res.status(400).json({`
  - [Line 378](../../../../server/controllers/stripeController.js#L378): `return res.status(400).json({`
  - [Line 393](../../../../server/controllers/stripeController.js#L393): `const amount = req.body?.amount === undefined ? payableAmount : Number(req.body.amount);`
  - [Line 397](../../../../server/controllers/stripeController.js#L397): `return res.status(400).json({`
  - [Line 403](../../../../server/controllers/stripeController.js#L403): `if (amount > payableAmount) return res.status(400).json({ success: false, message: "Payment amount cannot exceed the booking balance." });`
  - [Line 447](../../../../server/controllers/stripeController.js#L447): `if (!existingPayment.transactionReference) return res.status(409).json({ success: false, message: "A Stripe checkout request is processing or uncertain. Refresh payment s`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/payments/stripe/checkout'
```

### GET /verify/:sessionId → `/api/payments/stripe/verify/:sessionId`

Declared at source line 13. Route handler pipeline names: `verifyStripeSession`.

```js
router.get("/verify/:sessionId",verifyStripeSession)
```

- Imported handler/middleware `verifyStripeSession`: [stripeController.js](../../../../server/controllers/stripeController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `verifyStripeSession`

Handler starts at [controller line 649](../../../../server/controllers/stripeController.js#L649). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `sessionId`; query parameters read: none detected.
- Literal HTTP statuses in handler: `401`, `400`, `403`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Authentication is required.”; “Stripe session ID is required.”; “Stripe session is missing booking metadata.”; “Stripe session does not belong to this user.”; “Booking not found.”; “Stripe payment record not found.”; “Payment does not belong to this user.”; “Stripe payment amount does not match the booking amount.”; “Stripe payment currency does not match the booking currency.”.
- Database operations detected: `Payment.findOne`.
- Input/validation source lines to inspect:
  - [Line 659](../../../../server/controllers/stripeController.js#L659): `return res.status(401).json({`
  - [Line 669](../../../../server/controllers/stripeController.js#L669): `req.params?.sessionId || ""`
  - [Line 674](../../../../server/controllers/stripeController.js#L674): `return res.status(400).json({`
  - [Line 712](../../../../server/controllers/stripeController.js#L712): `return res.status(400).json({`
  - [Line 732](../../../../server/controllers/stripeController.js#L732): `return res.status(403).json({`
  - [Line 754](../../../../server/controllers/stripeController.js#L754): `return res.status(404).json({`
  - [Line 769](../../../../server/controllers/stripeController.js#L769): `if (!payment) return res.status(404).json({ success: false, message: "Stripe payment record not found." });`
  - [Line 770](../../../../server/controllers/stripeController.js#L770): `if (payment.customer && String(payment.customer) !== String(req.user._id)) return res.status(403).json({ success: false, message: "Payment does not belong to this user." `
  - [Line 803](../../../../server/controllers/stripeController.js#L803): `return res.status(400).json({`
  - [Line 816](../../../../server/controllers/stripeController.js#L816): `return res.status(400).json({`
  - [Line 842](../../../../server/controllers/stripeController.js#L842): `return res.status(403).json({`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/payments/stripe/verify/<sessionId>'
```

### POST /bank-transfer → `/api/payments/stripe/bank-transfer`

Declared at source line 14. Route handler pipeline names: `paymentInitiationLimit`, `createBankTransferPayment`.

```js
router.post("/bank-transfer",paymentInitiationLimit,createBankTransferPayment)
```

- Imported handler/middleware `createBankTransferPayment`: [stripeController.js](../../../../server/controllers/stripeController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `createBankTransferPayment`

Handler starts at [controller line 1025](../../../../server/controllers/stripeController.js#L1025). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `bookingId`, `amount`, `reference`, `notes`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `409`, `401`, `400`, `404`, `200`, `201`.
- JSON envelope keys observed: `success`, `message`, `payment`.
- Literal messages include: “Bank transfer is disabled or not configured for this tenant.”; “Authentication is required.”; “Booking ID is required.”; “Booking not found.”; “This booking cannot receive payment.”; “This booking is already fully paid.”; “No valid amount is due for this booking.”; “Payment amount cannot exceed the booking balance.”; “A bank transfer payment is already awaiting verification.”; “Bank transfer recorded. The company will verify the transfer and confirm your booking.”.
- Database operations detected: `Payment.findOne`, `Payment.create`.
- Input/validation source lines to inspect:
  - [Line 1034](../../../../server/controllers/stripeController.js#L1034): `if (!isTenantPaymentMethodAvailable(tenantSettings, "BANK_TRANSFER")) return res.status(409).json({ success: false, message: "Bank transfer is disabled or not configured `
  - [Line 1038](../../../../server/controllers/stripeController.js#L1038): `return res.status(401).json({`
  - [Line 1048](../../../../server/controllers/stripeController.js#L1048): `req.body?.bookingId || ""`
  - [Line 1053](../../../../server/controllers/stripeController.js#L1053): `return res.status(400).json({`
  - [Line 1075](../../../../server/controllers/stripeController.js#L1075): `return res.status(404).json({`
  - [Line 1094](../../../../server/controllers/stripeController.js#L1094): `return res.status(400).json({`
  - [Line 1106](../../../../server/controllers/stripeController.js#L1106): `return res.status(400).json({`
  - [Line 1121](../../../../server/controllers/stripeController.js#L1121): `const amount = req.body?.amount === undefined ? payableAmount : Number(req.body.amount);`
  - [Line 1128](../../../../server/controllers/stripeController.js#L1128): `return res.status(400).json({`
  - [Line 1134](../../../../server/controllers/stripeController.js#L1134): `if (amount > payableAmount) return res.status(400).json({ success: false, message: "Payment amount cannot exceed the booking balance." });`
  - [Line 1157](../../../../server/controllers/stripeController.js#L1157): `req.body?.reference || ""`
  - [Line 1167](../../../../server/controllers/stripeController.js#L1167): `req.body?.notes ||`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/payments/stripe/bank-transfer'
```

