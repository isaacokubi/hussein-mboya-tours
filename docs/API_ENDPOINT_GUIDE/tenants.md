# API endpoints: tenants

This guide contains 4 mounted method/path inventory entries in the **tenants** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.

## endpoint-508 — GET /api/tenants

**Contract status:** SOURCE-TRACED<br>
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

**Source-traced behavior:** See [Platform tenant directory APIs](../API_DOMAIN_CONTRACTS/platform-tenants.md). The current list handler calls tenantFilter(req) despite the platform Super Admin route having no tenantId, causing a missing-tenant-context failure.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-509 — POST /api/tenants

**Contract status:** SOURCE-TRACED<br>
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

**Source-traced behavior:** See [Platform tenant directory APIs](../API_DOMAIN_CONTRACTS/platform-tenants.md) for Super Admin authorization, body validation, tenant creation/cleanup, tenant detail reads and allowlisted tenant updates.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-510 — GET /api/tenants/:id

**Contract status:** SOURCE-TRACED<br>
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

**Source-traced behavior:** See [Platform tenant directory APIs](../API_DOMAIN_CONTRACTS/platform-tenants.md) for Super Admin authorization, body validation, tenant creation/cleanup, tenant detail reads and allowlisted tenant updates.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-511 — PATCH /api/tenants/:id

**Contract status:** SOURCE-TRACED<br>
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

**Source-traced behavior:** See [Platform tenant directory APIs](../API_DOMAIN_CONTRACTS/platform-tenants.md) for Super Admin authorization, body validation, tenant creation/cleanup, tenant detail reads and allowlisted tenant updates.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

