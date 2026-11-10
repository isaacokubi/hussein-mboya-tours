# API endpoints: subscription

This guide contains 3 mounted method/path inventory entries in the **subscription** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.

## endpoint-512 — GET /api/subscription

**Contract status:** PARTIALLY VERIFIED<br>
**Router:** [tenantSubscriptionRoutes.js](../../server/routes/tenantSubscriptionRoutes.js) · [route module explanation](../code-explanations/backend/routes/tenantSubscriptionRoutes.md)<br>
**Mounted inventory entry:** 512 of 629<br>
**Route declaration pipeline:** `getTenantSubscription`
**Router-wide middleware:** protect, resolveTenant
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.get("/", getTenantSubscription)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`.
- JSON envelope keys observed: `success`, `message`, `tenant`, `subscription`, `amountDue`, `featureCatalog`.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-513 — POST /api/subscription/mpesa

**Contract status:** PARTIALLY VERIFIED<br>
**Router:** [tenantSubscriptionRoutes.js](../../server/routes/tenantSubscriptionRoutes.js) · [route module explanation](../code-explanations/backend/routes/tenantSubscriptionRoutes.md)<br>
**Mounted inventory entry:** 513 of 629<br>
**Route declaration pipeline:** `startTenantSubscriptionPayment`
**Router-wide middleware:** protect, resolveTenant
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.post("/mpesa", startTenantSubscriptionPayment)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `plan`, `phone`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `403`, `400`, `200`.
- JSON envelope keys observed: `success`, `message`.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-514 — GET /api/subscription/payment/:checkoutRequestId

**Contract status:** PARTIALLY VERIFIED<br>
**Router:** [tenantSubscriptionRoutes.js](../../server/routes/tenantSubscriptionRoutes.js) · [route module explanation](../code-explanations/backend/routes/tenantSubscriptionRoutes.md)<br>
**Mounted inventory entry:** 514 of 629<br>
**Route declaration pipeline:** `getTenantSubscriptionPaymentStatus`
**Router-wide middleware:** protect, resolveTenant
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.get("/payment/:checkoutRequestId", getTenantSubscriptionPaymentStatus)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `checkoutRequestId`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

