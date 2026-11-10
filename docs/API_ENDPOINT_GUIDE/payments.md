# API endpoints: payments

This guide contains 16 mounted method/path inventory entries in the **payments** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.

## endpoint-198 — POST /api/payments/cash

**Contract status:** SOURCE-TRACED<br>
**Router:** [cashPaymentRoutes.js](../../server/routes/cashPaymentRoutes.js) · [route module explanation](../code-explanations/backend/routes/cashPaymentRoutes.md)<br>
**Mounted inventory entry:** 198 of 629<br>
**Route declaration pipeline:** `rateLimit`, `createCashPayment`
**Router-wide middleware:** resolveTenant, protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.post("/", rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false }), createCashPayment)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `bookingId`, `amount`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `409`, `404`, `403`, `400`, `200`, `201`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [Cash payment initiation](../API_DOMAIN_CONTRACTS/cash-payment.md).

## endpoint-319 — POST /api/payments/stkpush

**Contract status:** SOURCE-TRACED<br>
**Router:** [mpesaRoutes.js](../../server/routes/mpesaRoutes.js) · [route module explanation](../code-explanations/backend/routes/mpesaRoutes.md)<br>
**Mounted inventory entry:** 319 of 629<br>
**Route declaration pipeline:** `protect`, `paymentInitiationLimit`, `prepareBookingForMpesa`, `stkPush`
**Router-wide middleware:** resolveTenant
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.post("/stkpush", protect, paymentInitiationLimit, prepareBookingForMpesa, stkPush)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `amount`, `phoneNumber`, `phone`, `bookingId`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `409`, `400`, `404`, `403`, `202`, `200`.
- JSON envelope keys observed: `success`, `message`.

**Request, response, effects and failure contract:** see the corresponding fully source-traced entry in [API_VERIFIED_CONTRACTS.md](../API_VERIFIED_CONTRACTS.md). The same alias handler contract applies to this path. Templates are source-shape reviewed but were not executed.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-321 — POST /api/payments/mpesa

**Contract status:** SOURCE-TRACED<br>
**Router:** [mpesaRoutes.js](../../server/routes/mpesaRoutes.js) · [route module explanation](../code-explanations/backend/routes/mpesaRoutes.md)<br>
**Mounted inventory entry:** 321 of 629<br>
**Route declaration pipeline:** `protect`, `paymentInitiationLimit`, `prepareBookingForMpesa`, `stkPush`
**Router-wide middleware:** resolveTenant
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.post("/mpesa", protect, paymentInitiationLimit, prepareBookingForMpesa, stkPush)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `amount`, `phoneNumber`, `phone`, `bookingId`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `409`, `400`, `404`, `403`, `202`, `200`.
- JSON envelope keys observed: `success`, `message`.

**Request, response, effects and failure contract:** see the corresponding fully source-traced entry in [API_VERIFIED_CONTRACTS.md](../API_VERIFIED_CONTRACTS.md). The same alias handler contract applies to this path. Templates are source-shape reviewed but were not executed.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-323 — POST /api/payments/callback

**Contract status:** SOURCE-TRACED<br>
**Router:** [mpesaRoutes.js](../../server/routes/mpesaRoutes.js) · [route module explanation](../code-explanations/backend/routes/mpesaRoutes.md)<br>
**Mounted inventory entry:** 323 of 629<br>
**Route declaration pipeline:** `validateMpesaCallbackPayload`, `resolveMpesaCallbackTenant`, `verifyMpesaCallbackIntegrity`, `subscriptionMpesaCallback`
**Router-wide middleware:** resolveTenant
**Authentication evidence:** No standard `protect` guard is visible in route/router middleware. This alone does not prove public access; inspect handler-level checks and global middleware.

**Source declaration:**

```js
router.post("/callback", validateMpesaCallbackPayload, resolveMpesaCallbackTenant, verifyMpesaCallbackIntegrity, subscriptionMpesaCallback)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `Body`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `ResultCode`, `ResultDesc`.

**Request, response, effects and failure contract:** see the corresponding fully source-traced entry in [API_VERIFIED_CONTRACTS.md](../API_VERIFIED_CONTRACTS.md). The same alias handler contract applies to this path. Templates are source-shape reviewed but were not executed.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-325 — GET /api/payments/status/:checkoutRequestId

**Contract status:** SOURCE-TRACED<br>
**Router:** [mpesaRoutes.js](../../server/routes/mpesaRoutes.js) · [route module explanation](../code-explanations/backend/routes/mpesaRoutes.md)<br>
**Mounted inventory entry:** 325 of 629<br>
**Route declaration pipeline:** `protect`, `checkCheckoutStatus`
**Router-wide middleware:** resolveTenant
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.get("/status/:checkoutRequestId", protect, checkCheckoutStatus)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `checkoutRequestId`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `403`, `200`.
- JSON envelope keys observed: `success`, `message`.

**Request, response, effects and failure contract:** see the corresponding fully source-traced entry in [API_VERIFIED_CONTRACTS.md](../API_VERIFIED_CONTRACTS.md). The same alias handler contract applies to this path. Templates are source-shape reviewed but were not executed.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-327 — GET /api/payments/query/:checkoutRequestId

**Contract status:** SOURCE-TRACED<br>
**Router:** [mpesaRoutes.js](../../server/routes/mpesaRoutes.js) · [route module explanation](../code-explanations/backend/routes/mpesaRoutes.md)<br>
**Mounted inventory entry:** 327 of 629<br>
**Route declaration pipeline:** `protect`, `queryMpesaPayment`
**Router-wide middleware:** resolveTenant
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.get("/query/:checkoutRequestId", protect, queryMpesaPayment)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `checkoutRequestId`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `403`.
- JSON envelope keys observed: `success`, `message`.


**Source-traced contract:** The `/api/payments` mount is an alias of the M-Pesa router; see [M-Pesa status and refund contracts](../API_DOMAIN_CONTRACTS/mpesa-status-refunds.md) for the shared handler behavior.
## endpoint-329 — GET /api/payments/verify/:bookingId

**Contract status:** SOURCE-TRACED<br>
**Router:** [mpesaRoutes.js](../../server/routes/mpesaRoutes.js) · [route module explanation](../code-explanations/backend/routes/mpesaRoutes.md)<br>
**Mounted inventory entry:** 329 of 629<br>
**Route declaration pipeline:** `protect`, `verifyBookingPayment`
**Router-wide middleware:** resolveTenant
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.get("/verify/:bookingId", protect, verifyBookingPayment)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `bookingId`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `403`, `200`.
- JSON envelope keys observed: `success`, `message`.


**Source-traced contract:** The `/api/payments` mount is an alias of the M-Pesa router; see [M-Pesa status and refund contracts](../API_DOMAIN_CONTRACTS/mpesa-status-refunds.md) for the shared handler behavior.
## endpoint-331 — POST /api/payments/refund/result

**Contract status:** SOURCE-TRACED<br>
**Router:** [mpesaRoutes.js](../../server/routes/mpesaRoutes.js) · [route module explanation](../code-explanations/backend/routes/mpesaRoutes.md)<br>
**Mounted inventory entry:** 331 of 629<br>
**Route declaration pipeline:** `resolveMpesaRefundTenant`, `mpesaRefundResult`
**Router-wide middleware:** resolveTenant
**Authentication evidence:** No standard `protect` guard is visible in route/router middleware. This alone does not prove public access; inspect handler-level checks and global middleware.

**Source declaration:**

```js
router.post("/refund/result", resolveMpesaRefundTenant, mpesaRefundResult)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `Result`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `ResultCode`, `ResultDesc`.


**Source-traced contract:** The `/api/payments` mount is an alias of the M-Pesa router; see [M-Pesa status and refund contracts](../API_DOMAIN_CONTRACTS/mpesa-status-refunds.md) for the shared handler behavior.
## endpoint-333 — POST /api/payments/refund/timeout

**Contract status:** SOURCE-TRACED<br>
**Router:** [mpesaRoutes.js](../../server/routes/mpesaRoutes.js) · [route module explanation](../code-explanations/backend/routes/mpesaRoutes.md)<br>
**Mounted inventory entry:** 333 of 629<br>
**Route declaration pipeline:** `resolveMpesaRefundTenant`, `mpesaRefundTimeout`
**Router-wide middleware:** resolveTenant
**Authentication evidence:** No standard `protect` guard is visible in route/router middleware. This alone does not prove public access; inspect handler-level checks and global middleware.

**Source declaration:**

```js
router.post("/refund/timeout", resolveMpesaRefundTenant, mpesaRefundTimeout)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `Result`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `ResultCode`, `ResultDesc`.


**Source-traced contract:** The `/api/payments` mount is an alias of the M-Pesa router; see [M-Pesa status and refund contracts](../API_DOMAIN_CONTRACTS/mpesa-status-refunds.md) for the shared handler behavior.
## endpoint-359 — POST /api/payments/paypal/webhooks/:tenantId/:environment

**Contract status:** SOURCE-TRACED<br>
**Router:** [paypalRoutes.js](../../server/routes/paypalRoutes.js) · [route module explanation](../code-explanations/backend/routes/paypalRoutes.md)<br>
**Mounted inventory entry:** 359 of 629<br>
**Route declaration pipeline:** `paypalWebhook`
**Router-wide middleware:** resolveTenant, protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.post("/webhooks/:tenantId/:environment", paypalWebhook)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `id`, `event_type`, `resource`.
- Path parameters read: `tenantId`, `environment`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`, `500`.
- JSON envelope keys observed: `success`, `message`, `duplicate`, `ignored`.


**Source-traced contract:** See [PayPal booking payment contracts](../API_DOMAIN_CONTRACTS/paypal-payments.md) for provider verification and state handling.
## endpoint-360 — POST /api/payments/paypal/orders

**Contract status:** SOURCE-TRACED<br>
**Router:** [paypalRoutes.js](../../server/routes/paypalRoutes.js) · [route module explanation](../code-explanations/backend/routes/paypalRoutes.md)<br>
**Mounted inventory entry:** 360 of 629<br>
**Route declaration pipeline:** `initiationLimit`, `createPaypalOrder`
**Router-wide middleware:** resolveTenant, protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.post("/orders", initiationLimit, createPaypalOrder)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `bookingId`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `409`, `400`, `404`, `403`, `200`, `201`.
- JSON envelope keys observed: `success`, `message`, `orderId`, `url`, `status`, `reused`.


**Source-traced contract:** See [PayPal booking payment contracts](../API_DOMAIN_CONTRACTS/paypal-payments.md) for provider verification and state handling.
## endpoint-361 — POST /api/payments/paypal/orders/capture

**Contract status:** SOURCE-TRACED<br>
**Router:** [paypalRoutes.js](../../server/routes/paypalRoutes.js) · [route module explanation](../code-explanations/backend/routes/paypalRoutes.md)<br>
**Mounted inventory entry:** 361 of 629<br>
**Route declaration pipeline:** `initiationLimit`, `capturePaypalOrder`
**Router-wide middleware:** resolveTenant, protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.post("/orders/capture", initiationLimit, capturePaypalOrder)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `orderId`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `403`, `409`, `202`.
- JSON envelope keys observed: `success`, `message`, `paid`, `alreadyCompleted`, `status`, `paymentId`.


**Source-traced contract:** See [PayPal booking payment contracts](../API_DOMAIN_CONTRACTS/paypal-payments.md) for provider verification and state handling.
## endpoint-394 — POST /api/payments/stripe/webhook

**Contract status:** PARTIALLY VERIFIED<br>
**Router:** [stripeRoutes.js](../../server/routes/stripeRoutes.js) · [route module explanation](../code-explanations/backend/routes/stripeRoutes.md)<br>
**Mounted inventory entry:** 394 of 629<br>
**Route declaration pipeline:** `stripeWebhook`
**Router-wide middleware:** resolveTenant; protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.post("/webhook", stripeWebhook)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `503`, `400`, `200`, `500`.
- JSON envelope keys observed: `success`, `message`, `duplicate`, `ignored`.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-395 — POST /api/payments/stripe/checkout

**Contract status:** PARTIALLY VERIFIED<br>
**Router:** [stripeRoutes.js](../../server/routes/stripeRoutes.js) · [route module explanation](../code-explanations/backend/routes/stripeRoutes.md)<br>
**Mounted inventory entry:** 395 of 629<br>
**Route declaration pipeline:** `paymentInitiationLimit`, `createStripeSession`
**Router-wide middleware:** resolveTenant; protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.post("/checkout",paymentInitiationLimit,createStripeSession)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `bookingId`, `amount`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `409`, `401`, `400`, `404`, `200`, `201`.
- JSON envelope keys observed: `success`, `message`, `sessionId`, `url`, `reused`.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-396 — GET /api/payments/stripe/verify/:sessionId

**Contract status:** PARTIALLY VERIFIED<br>
**Router:** [stripeRoutes.js](../../server/routes/stripeRoutes.js) · [route module explanation](../code-explanations/backend/routes/stripeRoutes.md)<br>
**Mounted inventory entry:** 396 of 629<br>
**Route declaration pipeline:** `verifyStripeSession`
**Router-wide middleware:** resolveTenant; protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.get("/verify/:sessionId",verifyStripeSession)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `sessionId`; query parameters read: none detected.
- Literal HTTP statuses in handler: `401`, `400`, `403`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-397 — POST /api/payments/stripe/bank-transfer

**Contract status:** PARTIALLY VERIFIED<br>
**Router:** [stripeRoutes.js](../../server/routes/stripeRoutes.js) · [route module explanation](../code-explanations/backend/routes/stripeRoutes.md)<br>
**Mounted inventory entry:** 397 of 629<br>
**Route declaration pipeline:** `paymentInitiationLimit`, `createBankTransferPayment`
**Router-wide middleware:** resolveTenant; protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.post("/bank-transfer",paymentInitiationLimit,createBankTransferPayment)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `bookingId`, `amount`, `reference`, `notes`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `409`, `401`, `400`, `404`, `200`, `201`.
- JSON envelope keys observed: `success`, `message`, `payment`.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

