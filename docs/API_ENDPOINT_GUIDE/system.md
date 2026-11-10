# API endpoints: system

This guide contains 4 mounted method/path inventory entries in the **system** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.

## endpoint-496 — GET /api/system/health

**Contract status:** PARTIALLY VERIFIED<br>
**Router:** [systemHealthRoutes.js](../../server/routes/systemHealthRoutes.js) · [route module explanation](../code-explanations/backend/routes/systemHealthRoutes.md)<br>
**Mounted inventory entry:** 496 of 629<br>
**Route declaration pipeline:** `getSystemHealth`
**Router-wide middleware:** resolveTenant; protect; adminMiddleware; authorize("system.security")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("system.security"

**Source declaration:**

```js
router.get("/health", getSystemHealth)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `500`.
- JSON envelope keys observed: `success`, `message`.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-497 — GET /api/system/health

**Contract status:** PARTIALLY VERIFIED<br>
**Router:** [systemHealthRoutes.js](../../server/routes/systemHealthRoutes.js) · [route module explanation](../code-explanations/backend/routes/systemHealthRoutes.md)<br>
**Mounted inventory entry:** 497 of 629<br>
**Route declaration pipeline:** `getSystemHealth`
**Router-wide middleware:** resolveTenant; protect; adminMiddleware; authorize("system.security")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("system.security"

**Source declaration:**

```js
router.get("/health", getSystemHealth)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `500`.
- JSON envelope keys observed: `success`, `message`.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-498 — GET /api/system/admin/system-health

**Contract status:** PARTIALLY VERIFIED<br>
**Router:** [systemHealthRoutes.js](../../server/routes/systemHealthRoutes.js) · [route module explanation](../code-explanations/backend/routes/systemHealthRoutes.md)<br>
**Mounted inventory entry:** 498 of 629<br>
**Route declaration pipeline:** `getSystemHealth`
**Router-wide middleware:** resolveTenant; protect; adminMiddleware; authorize("system.security")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("system.security"

**Source declaration:**

```js
router.get("/admin/system-health", getSystemHealth)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `500`.
- JSON envelope keys observed: `success`, `message`.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-499 — GET /api/system/admin/system-health

**Contract status:** PARTIALLY VERIFIED<br>
**Router:** [systemHealthRoutes.js](../../server/routes/systemHealthRoutes.js) · [route module explanation](../code-explanations/backend/routes/systemHealthRoutes.md)<br>
**Mounted inventory entry:** 499 of 629<br>
**Route declaration pipeline:** `getSystemHealth`
**Router-wide middleware:** resolveTenant; protect; adminMiddleware; authorize("system.security")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("system.security"

**Source declaration:**

```js
router.get("/admin/system-health", getSystemHealth)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `500`.
- JSON envelope keys observed: `success`, `message`.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

