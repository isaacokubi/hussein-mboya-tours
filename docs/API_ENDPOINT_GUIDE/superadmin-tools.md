# API endpoints: superadmin-tools

This guide contains 2 mounted method/path inventory entries in the **superadmin-tools** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.

## endpoint-493 — GET /api/superadmin-tools/database

**Contract status:** PARTIALLY VERIFIED<br>
**Router:** [superAdminToolsRoutes.js](../../server/routes/superAdminToolsRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminToolsRoutes.md)<br>
**Mounted inventory entry:** 493 of 629<br>
**Route declaration pipeline:** `getDatabase`
**Router-wide middleware:** resolveTenant; protect; authorize("system.security")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("system.security"

**Source declaration:**

```js
router.get("/database", getDatabase)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `500`.
- JSON envelope keys observed: `success`, `message`.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-494 — GET /api/superadmin-tools/settings

**Contract status:** PARTIALLY VERIFIED<br>
**Router:** [superAdminToolsRoutes.js](../../server/routes/superAdminToolsRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminToolsRoutes.md)<br>
**Mounted inventory entry:** 494 of 629<br>
**Route declaration pipeline:** `getSettings`
**Router-wide middleware:** resolveTenant; protect; authorize("system.security")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("system.security"

**Source declaration:**

```js
router.get("/settings", getSettings)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `500`.
- JSON envelope keys observed: `success`, `message`.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

