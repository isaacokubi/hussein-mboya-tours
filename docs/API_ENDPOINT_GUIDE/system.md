# API endpoints: system

This guide contains 4 mounted method/path inventory entries in the **system** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.

## endpoint-496 — GET /api/system/health

**Contract status:** SOURCE-TRACED<br>
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

**Source-traced behavior:** See [Tenant system health API contracts](../API_DOMAIN_CONTRACTS/system-health.md) for effective middleware, tenant isolation, Cloudinary/Daraja OAuth checks and response semantics.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-497 — GET /api/system/health

**Contract status:** SOURCE-TRACED<br>
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

**Source-traced behavior:** See [Tenant system health API contracts](../API_DOMAIN_CONTRACTS/system-health.md) for effective middleware, tenant isolation, Cloudinary/Daraja OAuth checks and response semantics.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-498 — GET /api/system/admin/system-health

**Contract status:** SOURCE-TRACED<br>
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

**Source-traced behavior:** See [Tenant system health API contracts](../API_DOMAIN_CONTRACTS/system-health.md) for effective middleware, tenant isolation, Cloudinary/Daraja OAuth checks and response semantics.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-499 — GET /api/system/admin/system-health

**Contract status:** SOURCE-TRACED<br>
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

**Source-traced behavior:** See [Tenant system health API contracts](../API_DOMAIN_CONTRACTS/system-health.md) for effective middleware, tenant isolation, Cloudinary/Daraja OAuth checks and response semantics.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

