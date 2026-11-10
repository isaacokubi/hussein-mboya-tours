# API endpoints: superadmin-tools

This guide contains 2 mounted method/path inventory entries in the **superadmin-tools** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.

## endpoint-493 — GET /api/superadmin-tools/database

**Contract status:** SOURCE-TRACED<br>
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

**Source-traced behavior:** See [Super Admin tools API contracts](../API_DOMAIN_CONTRACTS/superadmin-tools.md) for router middleware, permission boundary, database metadata response and placeholder settings response.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-494 — GET /api/superadmin-tools/settings

**Contract status:** SOURCE-TRACED<br>
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

**Source-traced behavior:** See [Super Admin tools API contracts](../API_DOMAIN_CONTRACTS/superadmin-tools.md) for router middleware, permission boundary, database metadata response and placeholder settings response.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

