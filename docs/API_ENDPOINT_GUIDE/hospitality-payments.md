# API endpoints: hospitality-payments

This guide contains 6 mounted method/path inventory entries in the **hospitality-payments** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.

## endpoint-283 — POST /api/hospitality-payments/mpesa

**Contract status:** SOURCE-TRACED<br>
**Router:** [hospitalityPaymentRoutes.js](../../server/routes/hospitalityPaymentRoutes.js) · [route module explanation](../code-explanations/backend/routes/hospitalityPaymentRoutes.md)<br>
**Mounted inventory entry:** 283 of 629<br>
**Route declaration pipeline:** `protect`, `initiateHospitalityMpesa`
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.post("/mpesa", protect, initiateHospitalityMpesa)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `amount`, `phoneNumber`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `403`.
- JSON envelope keys observed: `success`, `message`.


**Source-traced contract:** See [hospitality payment contracts](../API_DOMAIN_CONTRACTS/hospitality-payments.md) for route-specific behavior, lifecycle and financial side effects.
## endpoint-284 — POST /api/hospitality-payments/card

**Contract status:** SOURCE-TRACED<br>
**Router:** [hospitalityPaymentRoutes.js](../../server/routes/hospitalityPaymentRoutes.js) · [route module explanation](../code-explanations/backend/routes/hospitalityPaymentRoutes.md)<br>
**Mounted inventory entry:** 284 of 629<br>
**Route declaration pipeline:** `protect`, `initiateHospitalityCard`
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.post("/card", protect, initiateHospitalityCard)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `403`, `201`.
- JSON envelope keys observed: `success`, `message`.


**Source-traced contract:** See [hospitality payment contracts](../API_DOMAIN_CONTRACTS/hospitality-payments.md) for route-specific behavior, lifecycle and financial side effects.
## endpoint-285 — GET /api/hospitality-payments/card/verify/:sessionId

**Contract status:** SOURCE-TRACED<br>
**Router:** [hospitalityPaymentRoutes.js](../../server/routes/hospitalityPaymentRoutes.js) · [route module explanation](../code-explanations/backend/routes/hospitalityPaymentRoutes.md)<br>
**Mounted inventory entry:** 285 of 629<br>
**Route declaration pipeline:** `protect`, `verifyHospitalityCard`
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.get("/card/verify/:sessionId", protect, verifyHospitalityCard)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `sessionId`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `403`, `404`.
- JSON envelope keys observed: `success`, `message`, `paid`, `status`.


**Source-traced contract:** See [hospitality payment contracts](../API_DOMAIN_CONTRACTS/hospitality-payments.md) for route-specific behavior, lifecycle and financial side effects.
## endpoint-286 — POST /api/hospitality-payments/bank

**Contract status:** SOURCE-TRACED<br>
**Router:** [hospitalityPaymentRoutes.js](../../server/routes/hospitalityPaymentRoutes.js) · [route module explanation](../code-explanations/backend/routes/hospitalityPaymentRoutes.md)<br>
**Mounted inventory entry:** 286 of 629<br>
**Route declaration pipeline:** `protect`, `submitHospitalityBank`
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.post("/bank", protect, submitHospitalityBank)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `amount`, `reference`, `notes`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `403`, `201`.
- JSON envelope keys observed: `success`, `message`.


**Source-traced contract:** See [hospitality payment contracts](../API_DOMAIN_CONTRACTS/hospitality-payments.md) for route-specific behavior, lifecycle and financial side effects.
## endpoint-287 — POST /api/hospitality-payments/bank/:paymentId/confirm

**Contract status:** SOURCE-TRACED<br>
**Router:** [hospitalityPaymentRoutes.js](../../server/routes/hospitalityPaymentRoutes.js) · [route module explanation](../code-explanations/backend/routes/hospitalityPaymentRoutes.md)<br>
**Mounted inventory entry:** 287 of 629<br>
**Route declaration pipeline:** `protect`, `confirmHospitalityBank`
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.post("/bank/:paymentId/confirm", protect, confirmHospitalityBank)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `approved`, `reason`, `transactionId`.
- Path parameters read: `paymentId`; query parameters read: none detected.
- Literal HTTP statuses in handler: `403`, `404`.
- JSON envelope keys observed: `success`, `message`.


**Source-traced contract:** See [hospitality payment contracts](../API_DOMAIN_CONTRACTS/hospitality-payments.md) for route-specific behavior, lifecycle and financial side effects.
## endpoint-288 — GET /api/hospitality-payments/:bookingId

**Contract status:** SOURCE-TRACED<br>
**Router:** [hospitalityPaymentRoutes.js](../../server/routes/hospitalityPaymentRoutes.js) · [route module explanation](../code-explanations/backend/routes/hospitalityPaymentRoutes.md)<br>
**Mounted inventory entry:** 288 of 629<br>
**Route declaration pipeline:** `protect`, `getHospitalityPayments`
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.get("/:bookingId", protect, getHospitalityPayments)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `bookingId`; query parameters read: `type`.
- Literal HTTP statuses in handler: `400`, `404`, `403`.
- JSON envelope keys observed: `success`, `message`.


**Source-traced contract:** See [hospitality payment contracts](../API_DOMAIN_CONTRACTS/hospitality-payments.md) for route-specific behavior, lifecycle and financial side effects.