# Route module: mpesaRoutes.js

**Source:** [server/routes/mpesaRoutes.js](../../../../server/routes/mpesaRoutes.js)

Observed mount prefixes include `/api/mpesa/stkpush`, `/api/payments/stkpush`, `/api/mpesa/mpesa`, `/api/payments/mpesa`, `/api/mpesa/callback`, `/api/payments/callback`, `/api/mpesa/status/:checkoutRequestId`, `/api/payments/status/:checkoutRequestId`, `/api/mpesa/query/:checkoutRequestId`, `/api/payments/query/:checkoutRequestId`, `/api/mpesa/verify/:bookingId`, `/api/payments/verify/:bookingId`, `/api/mpesa/refund/result`, `/api/payments/refund/result`, `/api/mpesa/refund/timeout`, `/api/payments/refund/timeout`.

## Router-wide middleware

- `router.use(resolveTenant);`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### POST /stkpush → `/api/mpesa/stkpush`, `/api/payments/stkpush`

Declared at source line 17. Route handler pipeline names: `protect`, `paymentInitiationLimit`, `prepareBookingForMpesa`, `stkPush`.

```js
router.post("/stkpush", protect, paymentInitiationLimit, prepareBookingForMpesa, stkPush)
```

- Imported handler/middleware `protect`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `prepareBookingForMpesa`: [prepareBookingForMpesa.js](../../../../server/middleware/prepareBookingForMpesa.js)
- Imported handler/middleware `stkPush`: [mpesaController.js](../../../../server/controllers/mpesaController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `stkPush`

Handler starts at [controller line 18](../../../../server/controllers/mpesaController.js#L18). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `amount`, `phoneNumber`, `phone`, `bookingId`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `409`, `400`, `404`, `403`, `202`, `200`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “M-Pesa is disabled for this tenant.”; “Phone number and booking ID are required.”; “Booking not found.”; “You do not have permission to pay this booking.”; “This booking has no outstanding balance.”; “M-Pesa request status is uncertain. Do not retry until an administrator reconciles this attempt.”; “A payment request is already waiting for confirmation.”; “M-Pesa prompt sent. Waiting for payment confirmation.”; “A M-Pesa payment attempt is already being processed for this booking.”.
- Database operations detected: `Booking.findOne`, `Payment.findOne`, `Payment.create`.
- Input/validation source lines to inspect:
  - [Line 23](../../../../server/controllers/mpesaController.js#L23): `if (tenantSettings.enableMpesa === false) return res.status(409).json({ success: false, message: "M-Pesa is disabled for this tenant." });`
  - [Line 24](../../../../server/controllers/mpesaController.js#L24): `const { phoneNumber, phone, bookingId } = req.body || {};`
  - [Line 25](../../../../server/controllers/mpesaController.js#L25): `if (!bookingId || !(phoneNumber || phone)) return res.status(400).json({ success: false, message: "Phone number and booking ID are required." });`
  - [Line 27](../../../../server/controllers/mpesaController.js#L27): `if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });`
  - [Line 28](../../../../server/controllers/mpesaController.js#L28): `if (!canAccessBookingPayment(booking, req.user)) return res.status(403).json({ success: false, message: "You do not have permission to pay this booking." });`
  - [Line 30](../../../../server/controllers/mpesaController.js#L30): `if (!Number.isFinite(payableAmount) || payableAmount <= 0) return res.status(400).json({ success: false, message: "This booking has no outstanding balance." });`
  - [Line 31](../../../../server/controllers/mpesaController.js#L31): `const paymentAmount = resolveMpesaPaymentAmount(req.body?.amount, payableAmount);`
  - [Line 53](../../../../server/controllers/mpesaController.js#L53): `if (error?.code === 11000 && !payment) return res.status(409).json({ success: false, message: "A M-Pesa payment attempt is already being processed for this booking." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/mpesa/stkpush'
```

### POST /mpesa → `/api/mpesa/mpesa`, `/api/payments/mpesa`

Declared at source line 18. Route handler pipeline names: `protect`, `paymentInitiationLimit`, `prepareBookingForMpesa`, `stkPush`.

```js
router.post("/mpesa", protect, paymentInitiationLimit, prepareBookingForMpesa, stkPush)
```

- Imported handler/middleware `protect`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `prepareBookingForMpesa`: [prepareBookingForMpesa.js](../../../../server/middleware/prepareBookingForMpesa.js)
- Imported handler/middleware `stkPush`: [mpesaController.js](../../../../server/controllers/mpesaController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `stkPush`

Handler starts at [controller line 18](../../../../server/controllers/mpesaController.js#L18). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `amount`, `phoneNumber`, `phone`, `bookingId`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `409`, `400`, `404`, `403`, `202`, `200`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “M-Pesa is disabled for this tenant.”; “Phone number and booking ID are required.”; “Booking not found.”; “You do not have permission to pay this booking.”; “This booking has no outstanding balance.”; “M-Pesa request status is uncertain. Do not retry until an administrator reconciles this attempt.”; “A payment request is already waiting for confirmation.”; “M-Pesa prompt sent. Waiting for payment confirmation.”; “A M-Pesa payment attempt is already being processed for this booking.”.
- Database operations detected: `Booking.findOne`, `Payment.findOne`, `Payment.create`.
- Input/validation source lines to inspect:
  - [Line 23](../../../../server/controllers/mpesaController.js#L23): `if (tenantSettings.enableMpesa === false) return res.status(409).json({ success: false, message: "M-Pesa is disabled for this tenant." });`
  - [Line 24](../../../../server/controllers/mpesaController.js#L24): `const { phoneNumber, phone, bookingId } = req.body || {};`
  - [Line 25](../../../../server/controllers/mpesaController.js#L25): `if (!bookingId || !(phoneNumber || phone)) return res.status(400).json({ success: false, message: "Phone number and booking ID are required." });`
  - [Line 27](../../../../server/controllers/mpesaController.js#L27): `if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });`
  - [Line 28](../../../../server/controllers/mpesaController.js#L28): `if (!canAccessBookingPayment(booking, req.user)) return res.status(403).json({ success: false, message: "You do not have permission to pay this booking." });`
  - [Line 30](../../../../server/controllers/mpesaController.js#L30): `if (!Number.isFinite(payableAmount) || payableAmount <= 0) return res.status(400).json({ success: false, message: "This booking has no outstanding balance." });`
  - [Line 31](../../../../server/controllers/mpesaController.js#L31): `const paymentAmount = resolveMpesaPaymentAmount(req.body?.amount, payableAmount);`
  - [Line 53](../../../../server/controllers/mpesaController.js#L53): `if (error?.code === 11000 && !payment) return res.status(409).json({ success: false, message: "A M-Pesa payment attempt is already being processed for this booking." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/mpesa/mpesa'
```

### POST /callback → `/api/mpesa/callback`, `/api/payments/callback`

Declared at source line 19. Route handler pipeline names: `validateMpesaCallbackPayload`, `resolveMpesaCallbackTenant`, `verifyMpesaCallbackIntegrity`, `subscriptionMpesaCallback`.

```js
router.post("/callback", validateMpesaCallbackPayload, resolveMpesaCallbackTenant, verifyMpesaCallbackIntegrity, subscriptionMpesaCallback)
```

- Imported handler/middleware `validateMpesaCallbackPayload`: [mpesaCallbackIntegrity.js](../../../../server/middleware/mpesaCallbackIntegrity.js)
- Imported handler/middleware `resolveMpesaCallbackTenant`: [resolveMpesaCallbackTenant.js](../../../../server/middleware/resolveMpesaCallbackTenant.js)
- Imported handler/middleware `verifyMpesaCallbackIntegrity`: [mpesaCallbackIntegrity.js](../../../../server/middleware/mpesaCallbackIntegrity.js)
- Imported handler/middleware `subscriptionMpesaCallback`: [subscriptionMpesaCallbackController.js](../../../../server/controllers/subscriptionMpesaCallbackController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `subscriptionMpesaCallback`

Handler starts at [controller line 7](../../../../server/controllers/subscriptionMpesaCallbackController.js#L7). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `Body`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `ResultCode`, `ResultDesc`.
- Database operations detected: `SubscriptionPayment.findOne`.
- Input/validation source lines to inspect:
  - [Line 9](../../../../server/controllers/subscriptionMpesaCallbackController.js#L9): `const stkCallback = req.body?.Body?.stkCallback;`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/mpesa/callback'
```

### GET /status/:checkoutRequestId → `/api/mpesa/status/:checkoutRequestId`, `/api/payments/status/:checkoutRequestId`

Declared at source line 20. Route handler pipeline names: `protect`, `checkCheckoutStatus`.

```js
router.get("/status/:checkoutRequestId", protect, checkCheckoutStatus)
```

- Imported handler/middleware `protect`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `checkCheckoutStatus`: [mpesaController.js](../../../../server/controllers/mpesaController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `checkCheckoutStatus`

Handler starts at [controller line 75](../../../../server/controllers/mpesaController.js#L75). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `checkoutRequestId`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `403`, `200`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Checkout request ID is required”; “Payment request not found”; “Booking not found”; “You do not have permission to view this payment.”.
- Database operations detected: `Payment.findOne`.
- Input/validation source lines to inspect:
  - [Line 75](../../../../server/controllers/mpesaController.js#L75): `async(req,res,next)=>{try{const checkoutRequestId=String(req.params.checkoutRequestId||"").trim();if(!checkoutRequestId)return res.status(400).json({success:false,message`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/mpesa/status/<checkoutRequestId>'
```

### GET /query/:checkoutRequestId → `/api/mpesa/query/:checkoutRequestId`, `/api/payments/query/:checkoutRequestId`

Declared at source line 21. Route handler pipeline names: `protect`, `queryMpesaPayment`.

```js
router.get("/query/:checkoutRequestId", protect, queryMpesaPayment)
```

- Imported handler/middleware `protect`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `queryMpesaPayment`: [mpesaStatusController.js](../../../../server/controllers/mpesaStatusController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `queryMpesaPayment`

Handler starts at [controller line 13](../../../../server/controllers/mpesaStatusController.js#L13). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `checkoutRequestId`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `403`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “CheckoutRequestID is required.”; “Payment request not found.”; “Booking not found.”; “You do not have permission to query this payment.”.
- Database operations detected: `Payment.findOne`, `Booking.findOne`.
- Input/validation source lines to inspect:
  - [Line 16](../../../../server/controllers/mpesaStatusController.js#L16): `const checkoutRequestID = String(req.params.checkoutRequestId || "").trim();`
  - [Line 17](../../../../server/controllers/mpesaStatusController.js#L17): `if (!checkoutRequestID) return res.status(400).json({ success: false, message: "CheckoutRequestID is required." });`
  - [Line 19](../../../../server/controllers/mpesaStatusController.js#L19): `if (!payment) return res.status(404).json({ success: false, message: "Payment request not found." });`
  - [Line 23](../../../../server/controllers/mpesaStatusController.js#L23): `if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });`
  - [Line 24](../../../../server/controllers/mpesaStatusController.js#L24): `if (!canAccess(booking, req.user)) return res.status(403).json({ success: false, message: "You do not have permission to query this payment." });`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/mpesa/query/<checkoutRequestId>'
```

### GET /verify/:bookingId → `/api/mpesa/verify/:bookingId`, `/api/payments/verify/:bookingId`

Declared at source line 22. Route handler pipeline names: `protect`, `verifyBookingPayment`.

```js
router.get("/verify/:bookingId", protect, verifyBookingPayment)
```

- Imported handler/middleware `protect`: [authMiddleware.js](../../../../server/middleware/authMiddleware.js)
- Imported handler/middleware `verifyBookingPayment`: [mpesaController.js](../../../../server/controllers/mpesaController.js)

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

#### Extracted contract cues for `verifyBookingPayment`

Handler starts at [controller line 76](../../../../server/controllers/mpesaController.js#L76). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `bookingId`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `403`, `200`.
- JSON envelope keys observed: `success`, `message`.
- Literal messages include: “Booking not found”; “You do not have permission to view this booking payment.”.
- Database operations detected: `Booking.findOne`, `Payment.findOne`.
- Input/validation source lines to inspect:
  - [Line 76](../../../../server/controllers/mpesaController.js#L76): `async(req,res,next)=>{try{const booking=await Booking.findOne(mergeTenantFilter(req,{_id:req.params.bookingId})).lean();if(!booking)return res.status(404).json({success:f`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/mpesa/verify/<bookingId>'
```

### POST /refund/result → `/api/mpesa/refund/result`, `/api/payments/refund/result`

Declared at source line 23. Route handler pipeline names: `resolveMpesaRefundTenant`, `mpesaRefundResult`.

```js
router.post("/refund/result", resolveMpesaRefundTenant, mpesaRefundResult)
```

- Imported handler/middleware `resolveMpesaRefundTenant`: [resolveMpesaRefundTenant.js](../../../../server/middleware/resolveMpesaRefundTenant.js)
- Imported handler/middleware `mpesaRefundResult`: [mpesaRefundController.js](../../../../server/controllers/mpesaRefundController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `mpesaRefundResult`

Handler starts at [controller line 12](../../../../server/controllers/mpesaRefundController.js#L12). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `Result`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `ResultCode`, `ResultDesc`.
- Database operations detected: none directly detected (may be delegated to service/helper).
- Input/validation source lines to inspect:
  - [Line 15](../../../../server/controllers/mpesaRefundController.js#L15): `const result = req.body?.Result;`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/mpesa/refund/result'
```

### POST /refund/timeout → `/api/mpesa/refund/timeout`, `/api/payments/refund/timeout`

Declared at source line 24. Route handler pipeline names: `resolveMpesaRefundTenant`, `mpesaRefundTimeout`.

```js
router.post("/refund/timeout", resolveMpesaRefundTenant, mpesaRefundTimeout)
```

- Imported handler/middleware `resolveMpesaRefundTenant`: [resolveMpesaRefundTenant.js](../../../../server/middleware/resolveMpesaRefundTenant.js)
- Imported handler/middleware `mpesaRefundTimeout`: [mpesaRefundController.js](../../../../server/controllers/mpesaRefundController.js)

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

#### Extracted contract cues for `mpesaRefundTimeout`

Handler starts at [controller line 55](../../../../server/controllers/mpesaRefundController.js#L55). These keys/statuses are observed directly in the handler; they are not a replacement for full route validation.

- Request body properties read: `Result`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `ResultCode`, `ResultDesc`.
- Database operations detected: none directly detected (may be delegated to service/helper).
- Input/validation source lines to inspect:
  - [Line 58](../../../../server/controllers/mpesaRefundController.js#L58): `const result = req.body?.Result || {};`

Request keys are discovered statically; optionality, nested structures, coercion, middleware transformations, and conditional requirements must be confirmed in the cited source. Response keys are likewise a static inventory, not a complete schema.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/mpesa/refund/timeout'
```

