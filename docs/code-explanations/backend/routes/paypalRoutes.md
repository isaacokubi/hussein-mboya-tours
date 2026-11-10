# Route module: paypalRoutes.js

**Source:** [server/routes/paypalRoutes.js](../../../../server/routes/paypalRoutes.js)

Observed mount prefixes include `/api/payments/paypal/webhooks/:tenantId/:environment`, `/api/payments/paypal/orders`, `/api/payments/paypal/orders/capture`.

## Router-wide middleware

- `router.use(resolveTenant, protect);`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### POST /webhooks/:tenantId/:environment → `/api/payments/paypal/webhooks/:tenantId/:environment`

Declared at source line 9. Route handler pipeline names: `paypalWebhook`.

```js
router.post("/webhooks/:tenantId/:environment", paypalWebhook)
```

- Imported handler/middleware `paypalWebhook`: [paypalController.js](../../../../server/controllers/paypalController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `paypalWebhook`

Handler starts at [controller line 150](../../../../server/controllers/paypalController.js#L150). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `id`, `event_type`, `resource`.
- Path parameters read: `tenantId`, `environment`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`, `500`.
- JSON envelope keys observed: `success`, `message`, `duplicate`, `ignored`.
- Literal messages include: “Webhook signature was not verified.”.
- Database operations detected: `Organization.findById`, `PaymentGatewayConfig.findOne`, `PaypalWebhookEvent.findOneAndUpdate`, `PaypalWebhookEvent.create`, `PaypalWebhookEvent.findOne`, `Payment.findOne`, `Booking.findOne`, `PaymentGatewayConfig.updateOne`.
- Input/validation source lines to inspect:
  - [Line 151](../../../../server/controllers/paypalController.js#L151): `const tenantId = String(req.params?.tenantId || "");`
  - [Line 152](../../../../server/controllers/paypalController.js#L152): `const environment = normalizePaypalEnvironment(req.params?.environment);`
  - [Line 153](../../../../server/controllers/paypalController.js#L153): `if (!/^[a-f\d]{24}$/i.test(tenantId) || !environment || !req.body?.id || !req.body?.event_type) return res.status(400).json({ success: false });`
  - [Line 159](../../../../server/controllers/paypalController.js#L159): `if (!tenant || !selected.configured) return res.status(404).json({ success: false });`
  - [Line 160](../../../../server/controllers/paypalController.js#L160): `const verified = await verifyPaypalWebhook({ config: { ...selected, environment }, headers: req.headers, event: req.body });`
  - [Line 161](../../../../server/controllers/paypalController.js#L161): `if (!verified) return res.status(400).json({ success: false, message: "Webhook signature was not verified." });`
  - [Line 162](../../../../server/controllers/paypalController.js#L162): `const eventId = String(req.body.id).slice(0, 160);`
  - [Line 163](../../../../server/controllers/paypalController.js#L163): `const eventType = String(req.body.event_type).slice(0, 160);`
  - [Line 178](../../../../server/controllers/paypalController.js#L178): `const resource = req.body.resource || {};`
  - [Line 201](../../../../server/controllers/paypalController.js#L201): `if (!unit || !capture || String(unit.amount?.currency_code || "").toUpperCase() !== String(payment.currency).toUpperCase() || Number(unit.amount?.value) !== Number(paymen`
  - [Line 203](../../../../server/controllers/paypalController.js#L203): `if (!booking) throw new Error("PayPal booking not found.");`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/payments/paypal/webhooks/<tenantId>/<environment>'
```

### POST /orders → `/api/payments/paypal/orders`

Declared at source line 11. Route handler pipeline names: `initiationLimit`, `createPaypalOrder`.

```js
router.post("/orders", initiationLimit, createPaypalOrder)
```

- Imported handler/middleware `createPaypalOrder`: [paypalController.js](../../../../server/controllers/paypalController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `createPaypalOrder`

Handler starts at [controller line 48](../../../../server/controllers/paypalController.js#L48). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `bookingId`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `409`, `400`, `404`, `403`, `200`, `201`.
- JSON envelope keys observed: `success`, `message`, `orderId`, `url`, `status`, `reused`.
- Literal messages include: “PayPal is disabled or not validated for this tenant.”; “A booking ID and authenticated customer are required.”; “Booking not found.”; “You cannot pay this booking.”; “This booking cannot receive another payment.”; “No amount is due for this booking.”; “A PayPal order is already being processed. Refresh payment status before retrying.”; “PayPal could not create the order. Check payment status before retrying.”.
- Database operations detected: `Booking.findOne`, `Payment.findOne`, `Payment.create`.
- Input/validation source lines to inspect:
  - [Line 52](../../../../server/controllers/paypalController.js#L52): `if (settings.paypalAvailable !== true) return res.status(409).json({ success: false, message: "PayPal is disabled or not validated for this tenant." });`
  - [Line 53](../../../../server/controllers/paypalController.js#L53): `const bookingId = String(req.body?.bookingId || "").trim();`
  - [Line 54](../../../../server/controllers/paypalController.js#L54): `if (!bookingId || !req.user?._id) return res.status(400).json({ success: false, message: "A booking ID and authenticated customer are required." });`
  - [Line 56](../../../../server/controllers/paypalController.js#L56): `if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });`
  - [Line 57](../../../../server/controllers/paypalController.js#L57): `if (!userOwnsBooking(booking, req.user)) return res.status(403).json({ success: false, message: "You cannot pay this booking." });`
  - [Line 58](../../../../server/controllers/paypalController.js#L58): `if (booking.isDeleted || ["cancelled", "refunded"].includes(String(booking.status).toLowerCase()) || booking.paymentStatus === "paid") return res.status(409).json({ succe`
  - [Line 60](../../../../server/controllers/paypalController.js#L60): `if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ success: false, message: "No amount is due for this booking." });`
  - [Line 61](../../../../server/controllers/paypalController.js#L61): `if (!PAYPAL_PAYMENT_CURRENCIES.has(currency)) return res.status(409).json({ success: false, message: \`PayPal does not support this tenant's configured payment currency (`
  - [Line 64](../../../../server/controllers/paypalController.js#L64): `if (existing) return res.status(409).json({ success: false, message: "A PayPal order is already being processed. Refresh payment status before retrying." });`
  - [Line 79](../../../../server/controllers/paypalController.js#L79): `if (!order?.id || !approvalUrl || order.status !== "CREATED") throw new Error("PayPal returned an incomplete order response.");`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/payments/paypal/orders'
```

### POST /orders/capture → `/api/payments/paypal/orders/capture`

Declared at source line 12. Route handler pipeline names: `initiationLimit`, `capturePaypalOrder`.

```js
router.post("/orders/capture", initiationLimit, capturePaypalOrder)
```

- Imported handler/middleware `capturePaypalOrder`: [paypalController.js](../../../../server/controllers/paypalController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `capturePaypalOrder`

Handler starts at [controller line 114](../../../../server/controllers/paypalController.js#L114). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `orderId`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `403`, `409`, `202`.
- JSON envelope keys observed: `success`, `message`, `paid`, `alreadyCompleted`, `status`, `paymentId`.
- Literal messages include: “A valid PayPal order ID is required.”; “PayPal order not found.”; “This PayPal order belongs to another customer.”; “Booking not found.”; “PayPal did not complete the payment.”; “PayPal has not confirmed a completed capture.”; “PayPal capture amount does not match the saved payment.”; “PayPal capture result is pending. Refresh payment status before retrying.”.
- Database operations detected: `Payment.findOne`, `Booking.findOne`.
- Input/validation source lines to inspect:
  - [Line 117](../../../../server/controllers/paypalController.js#L117): `const orderId = String(req.body?.orderId || "").trim();`
  - [Line 118](../../../../server/controllers/paypalController.js#L118): `if (!orderId || orderId.length > 80) return res.status(400).json({ success: false, message: "A valid PayPal order ID is required." });`
  - [Line 120](../../../../server/controllers/paypalController.js#L120): `if (!payment) return res.status(404).json({ success: false, message: "PayPal order not found." });`
  - [Line 121](../../../../server/controllers/paypalController.js#L121): `if (payment.customer && String(payment.customer) !== String(req.user?._id)) return res.status(403).json({ success: false, message: "This PayPal order belongs to another c`
  - [Line 123](../../../../server/controllers/paypalController.js#L123): `if (!booking || !userOwnsBooking(booking, req.user)) return res.status(404).json({ success: false, message: "Booking not found." });`
  - [Line 134](../../../../server/controllers/paypalController.js#L134): `return res.status(409).json({ success: false, paid: false, status: payment.status, message: "PayPal did not complete the payment." });`
  - [Line 138](../../../../server/controllers/paypalController.js#L138): `if (String(captureAmount?.currency_code || "").toUpperCase() !== String(payment.currency).toUpperCase() || Number(captureAmount?.value) !== Number(payment.amount)) return`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/payments/paypal/orders/capture'
```

