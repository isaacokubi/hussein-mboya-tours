# API endpoints: payment-links

This guide contains 4 mounted method/path inventory entries in the **payment-links** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.

## endpoint-352 — GET /api/payment-links/public/:token

**Contract status:** SOURCE-TRACED<br>
**Router:** [paymentLinkRoutes.js](../../server/routes/paymentLinkRoutes.js) · [route module explanation](../code-explanations/backend/routes/paymentLinkRoutes.md)<br>
**Mounted inventory entry:** 352 of 629<br>
**Route declaration pipeline:** `resolveTenant`, `getPaymentLink`
**Router-wide middleware:** resolveTenant, protect, authorize("finance.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("finance.manage"

**Source declaration:**

```js
router.get("/public/:token", resolveTenant, getPaymentLink)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `token`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`, `data`.


**Source-traced contract:** See [payment link contracts](../API_DOMAIN_CONTRACTS/payment-links.md) for bearer-token exposure, balance checks and cancellation.
## endpoint-354 — GET /api/payment-links

**Contract status:** SOURCE-TRACED<br>
**Router:** [paymentLinkRoutes.js](../../server/routes/paymentLinkRoutes.js) · [route module explanation](../code-explanations/backend/routes/paymentLinkRoutes.md)<br>
**Mounted inventory entry:** 354 of 629<br>
**Route declaration pipeline:** `listPaymentLinks`
**Router-wide middleware:** resolveTenant, protect, authorize("finance.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("finance.manage"

**Source declaration:**

```js
router.get("/", listPaymentLinks)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `data`.


**Source-traced contract:** See [payment link contracts](../API_DOMAIN_CONTRACTS/payment-links.md) for bearer-token exposure, balance checks and cancellation.
## endpoint-356 — POST /api/payment-links

**Contract status:** SOURCE-TRACED<br>
**Router:** [paymentLinkRoutes.js](../../server/routes/paymentLinkRoutes.js) · [route module explanation](../code-explanations/backend/routes/paymentLinkRoutes.md)<br>
**Mounted inventory entry:** 356 of 629<br>
**Route declaration pipeline:** `createPaymentLink`
**Router-wide middleware:** resolveTenant, protect, authorize("finance.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("finance.manage"

**Source declaration:**

```js
router.post("/", createPaymentLink)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `bookingId`, `amount`, `expiresAt`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `400`, `201`.
- JSON envelope keys observed: `success`, `message`.


**Source-traced contract:** See [payment link contracts](../API_DOMAIN_CONTRACTS/payment-links.md) for bearer-token exposure, balance checks and cancellation.
## endpoint-358 — POST /api/payment-links/:id/cancel

**Contract status:** SOURCE-TRACED<br>
**Router:** [paymentLinkRoutes.js](../../server/routes/paymentLinkRoutes.js) · [route module explanation](../code-explanations/backend/routes/paymentLinkRoutes.md)<br>
**Mounted inventory entry:** 358 of 629<br>
**Route declaration pipeline:** `cancelPaymentLink`
**Router-wide middleware:** resolveTenant, protect, authorize("finance.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("finance.manage"

**Source declaration:**

```js
router.post("/:id/cancel", cancelPaymentLink)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `409`.
- JSON envelope keys observed: `success`, `message`, `data`.


**Source-traced contract:** See [payment link contracts](../API_DOMAIN_CONTRACTS/payment-links.md) for bearer-token exposure, balance checks and cancellation.