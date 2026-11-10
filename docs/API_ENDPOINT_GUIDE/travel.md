# API endpoints: travel

This guide contains 6 mounted method/path inventory entries in the **travel** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.

## endpoint-600 — POST /api/travel/vouchers

**Contract status:** PARTIALLY VERIFIED<br>
**Router:** [travelLifecycleRoutes.js](../../server/routes/travelLifecycleRoutes.js) · [route module explanation](../code-explanations/backend/routes/travelLifecycleRoutes.md)<br>
**Mounted inventory entry:** 600 of 629<br>
**Route declaration pipeline:** `managerOnly`, `issueVoucher`
**Router-wide middleware:** protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly`

**Source declaration:**

```js
router.post("/vouchers", managerOnly, issueVoucher)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `name`, `bookingId`, `tourId`, `expiresAt`, `issuedFor`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `201`.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-601 — POST /api/travel/vouchers/redeem

**Contract status:** PARTIALLY VERIFIED<br>
**Router:** [travelLifecycleRoutes.js](../../server/routes/travelLifecycleRoutes.js) · [route module explanation](../code-explanations/backend/routes/travelLifecycleRoutes.md)<br>
**Mounted inventory entry:** 601 of 629<br>
**Route declaration pipeline:** `redeemVoucher`
**Router-wide middleware:** protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.post("/vouchers/redeem", redeemVoucher)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `token`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `410`, `409`.
- JSON envelope keys observed: `success`, `message`, `data`.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-602 — POST /api/travel/pricing/calculate

**Contract status:** PARTIALLY VERIFIED<br>
**Router:** [travelLifecycleRoutes.js](../../server/routes/travelLifecycleRoutes.js) · [route module explanation](../code-explanations/backend/routes/travelLifecycleRoutes.md)<br>
**Mounted inventory entry:** 602 of 629<br>
**Route declaration pipeline:** `calculateDynamicPrice`
**Router-wide middleware:** protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.post("/pricing/calculate", calculateDynamicPrice)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `tourId`, `tour`, `travelDate`, `date`, `guests`, `numberOfGuests`, `basePrice`, `currency`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `400`.
- JSON envelope keys observed: `success`, `message`.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-603 — GET /api/travel/loyalty/:customerId

**Contract status:** PARTIALLY VERIFIED<br>
**Router:** [travelLifecycleRoutes.js](../../server/routes/travelLifecycleRoutes.js) · [route module explanation](../code-explanations/backend/routes/travelLifecycleRoutes.md)<br>
**Mounted inventory entry:** 603 of 629<br>
**Route declaration pipeline:** `loyaltyBalance`
**Router-wide middleware:** protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.get("/loyalty/:customerId", loyaltyBalance)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `customerId`; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: response shape is dynamic or not a literal object.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-604 — POST /api/travel/loyalty/earn

**Contract status:** PARTIALLY VERIFIED<br>
**Router:** [travelLifecycleRoutes.js](../../server/routes/travelLifecycleRoutes.js) · [route module explanation](../code-explanations/backend/routes/travelLifecycleRoutes.md)<br>
**Mounted inventory entry:** 604 of 629<br>
**Route declaration pipeline:** `managerOnly`, `earnLoyalty`
**Router-wide middleware:** protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** managerOnly`

**Source declaration:**

```js
router.post("/loyalty/earn", managerOnly, earnLoyalty)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `points`, `customerId`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`.
- JSON envelope keys observed: `success`, `message`, `data`.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-605 — POST /api/travel/loyalty/redeem

**Contract status:** PARTIALLY VERIFIED<br>
**Router:** [travelLifecycleRoutes.js](../../server/routes/travelLifecycleRoutes.js) · [route module explanation](../code-explanations/backend/routes/travelLifecycleRoutes.md)<br>
**Mounted inventory entry:** 605 of 629<br>
**Route declaration pipeline:** `redeemLoyalty`
**Router-wide middleware:** protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.post("/loyalty/redeem", redeemLoyalty)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `points`, `customerId`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `409`.
- JSON envelope keys observed: `success`, `message`, `data`.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

