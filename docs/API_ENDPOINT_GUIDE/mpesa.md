# API endpoints: mpesa

This guide contains 8 mounted method/path inventory entries in the **mpesa** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.

## endpoint-318 — POST /api/mpesa/stkpush

**Contract status:** SOURCE-TRACED<br>
**Router:** [mpesaRoutes.js](../../server/routes/mpesaRoutes.js) · [route module explanation](../code-explanations/backend/routes/mpesaRoutes.md)<br>
**Mounted inventory entry:** 318 of 629<br>
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

## endpoint-320 — POST /api/mpesa/mpesa

**Contract status:** SOURCE-TRACED<br>
**Router:** [mpesaRoutes.js](../../server/routes/mpesaRoutes.js) · [route module explanation](../code-explanations/backend/routes/mpesaRoutes.md)<br>
**Mounted inventory entry:** 320 of 629<br>
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

## endpoint-322 — POST /api/mpesa/callback

**Contract status:** SOURCE-TRACED<br>
**Router:** [mpesaRoutes.js](../../server/routes/mpesaRoutes.js) · [route module explanation](../code-explanations/backend/routes/mpesaRoutes.md)<br>
**Mounted inventory entry:** 322 of 629<br>
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

## endpoint-324 — GET /api/mpesa/status/:checkoutRequestId

**Contract status:** SOURCE-TRACED<br>
**Router:** [mpesaRoutes.js](../../server/routes/mpesaRoutes.js) · [route module explanation](../code-explanations/backend/routes/mpesaRoutes.md)<br>
**Mounted inventory entry:** 324 of 629<br>
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

## endpoint-326 — GET /api/mpesa/query/:checkoutRequestId

**Contract status:** SOURCE-TRACED<br>
**Router:** [mpesaRoutes.js](../../server/routes/mpesaRoutes.js) · [route module explanation](../code-explanations/backend/routes/mpesaRoutes.md)<br>
**Mounted inventory entry:** 326 of 629<br>
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


**Source-traced contract:** See [M-Pesa status and refund contracts](../API_DOMAIN_CONTRACTS/mpesa-status-refunds.md) for provider-query, authorization and callback behavior.
## endpoint-328 — GET /api/mpesa/verify/:bookingId

**Contract status:** SOURCE-TRACED<br>
**Router:** [mpesaRoutes.js](../../server/routes/mpesaRoutes.js) · [route module explanation](../code-explanations/backend/routes/mpesaRoutes.md)<br>
**Mounted inventory entry:** 328 of 629<br>
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


**Source-traced contract:** See [M-Pesa status and refund contracts](../API_DOMAIN_CONTRACTS/mpesa-status-refunds.md) for provider-query, authorization and callback behavior.
## endpoint-330 — POST /api/mpesa/refund/result

**Contract status:** SOURCE-TRACED<br>
**Router:** [mpesaRoutes.js](../../server/routes/mpesaRoutes.js) · [route module explanation](../code-explanations/backend/routes/mpesaRoutes.md)<br>
**Mounted inventory entry:** 330 of 629<br>
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


**Source-traced contract:** See [M-Pesa status and refund contracts](../API_DOMAIN_CONTRACTS/mpesa-status-refunds.md) for provider-query, authorization and callback behavior.
## endpoint-332 — POST /api/mpesa/refund/timeout

**Contract status:** SOURCE-TRACED<br>
**Router:** [mpesaRoutes.js](../../server/routes/mpesaRoutes.js) · [route module explanation](../code-explanations/backend/routes/mpesaRoutes.md)<br>
**Mounted inventory entry:** 332 of 629<br>
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


**Source-traced contract:** See [M-Pesa status and refund contracts](../API_DOMAIN_CONTRACTS/mpesa-status-refunds.md) for provider-query, authorization and callback behavior.