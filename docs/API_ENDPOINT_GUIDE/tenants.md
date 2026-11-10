# API endpoints: tenants

This guide contains 4 mounted method/path inventory entries in the **tenants** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.

## endpoint-508 — GET /api/tenants

**Contract status:** PARTIALLY VERIFIED<br>
**Router:** [tenantRoutes.js](../../server/routes/tenantRoutes.js) · [route module explanation](../code-explanations/backend/routes/tenantRoutes.md)<br>
**Mounted inventory entry:** 508 of 629<br>
**Route declaration pipeline:** `listTenants`
**Router-wide middleware:** resolveTenant; protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.get("/", listTenants)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: no literal status code detected; Express default or delegated error handler may apply.
- JSON envelope keys observed: `success`, `data`.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-509 — POST /api/tenants

**Contract status:** PARTIALLY VERIFIED<br>
**Router:** [tenantRoutes.js](../../server/routes/tenantRoutes.js) · [route module explanation](../code-explanations/backend/routes/tenantRoutes.md)<br>
**Mounted inventory entry:** 509 of 629<br>
**Route declaration pipeline:** `createTenant`
**Router-wide middleware:** resolveTenant; protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.post("/", createTenant)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `admin`, `name`, `slug`, `country`, `timezone`, `currency`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `409`, `201`.
- JSON envelope keys observed: `success`, `message`, `tenant`, `admin`.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-510 — GET /api/tenants/:id

**Contract status:** PARTIALLY VERIFIED<br>
**Router:** [tenantRoutes.js](../../server/routes/tenantRoutes.js) · [route module explanation](../code-explanations/backend/routes/tenantRoutes.md)<br>
**Mounted inventory entry:** 510 of 629<br>
**Route declaration pipeline:** `getTenant`
**Router-wide middleware:** resolveTenant; protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.get("/:id", getTenant)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`.
- JSON envelope keys observed: `success`, `message`.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-511 — PATCH /api/tenants/:id

**Contract status:** PARTIALLY VERIFIED<br>
**Router:** [tenantRoutes.js](../../server/routes/tenantRoutes.js) · [route module explanation](../code-explanations/backend/routes/tenantRoutes.md)<br>
**Mounted inventory entry:** 511 of 629<br>
**Route declaration pipeline:** `updateTenant`
**Router-wide middleware:** resolveTenant; protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.patch("/:id", updateTenant)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

