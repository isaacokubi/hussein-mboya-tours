# API endpoints: superadmin

This guide contains 97 mounted method/path inventory entries in the **superadmin** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.

## endpoint-177 — GET /api/superadmin/api-monitor

**Contract status:** SOURCE-TRACED<br>
**Router:** [apiMonitorRoutes.js](../../server/routes/apiMonitorRoutes.js) · [route module explanation](../code-explanations/backend/routes/apiMonitorRoutes.md)<br>
**Mounted inventory entry:** 177 of 629<br>
**Route declaration pipeline:** `protect`, `superAdminOnly`, `getApiMonitor`
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly`

**Source declaration:**

```js
router.get("/", protect, superAdminOnly, getApiMonitor)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `500`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced contract:** See [SuperAdmin API monitor](../API_DOMAIN_CONTRACTS/superadmin-api-monitor.md); the broad router declaration precedes and shadows the later duplicate mount.

## endpoint-398 — GET /api/superadmin/maintenance/backups

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminMaintenanceRoutes.js](../../server/routes/superAdminMaintenanceRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminMaintenanceRoutes.md)<br>
**Mounted inventory entry:** 398 of 629<br>
**Route declaration pipeline:** `listDatabaseBackups`
**Router-wide middleware:** resolveTenant; protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.get(
  "/backups",
  listDatabaseBackups
)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `500`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced behavior:** See [Super Admin maintenance API contracts](../API_DOMAIN_CONTRACTS/superadmin-maintenance.md) for backup listing/creation, cache deletion, download/delete semantics, tenant scope, filesystem effects and failure boundaries.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-399 — POST /api/superadmin/maintenance/backup

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminMaintenanceRoutes.js](../../server/routes/superAdminMaintenanceRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminMaintenanceRoutes.md)<br>
**Mounted inventory entry:** 399 of 629<br>
**Route declaration pipeline:** `createDatabaseBackup`
**Router-wide middleware:** resolveTenant; protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.post(
  "/backup",
  createDatabaseBackup
)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `503`, `500`.
- JSON envelope keys observed: `success`, `message`, `file`, `scope`.

**Source-traced behavior:** See [Super Admin maintenance API contracts](../API_DOMAIN_CONTRACTS/superadmin-maintenance.md) for backup listing/creation, cache deletion, download/delete semantics, tenant scope, filesystem effects and failure boundaries.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-400 — POST /api/superadmin/maintenance/maintenance/backup

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminMaintenanceRoutes.js](../../server/routes/superAdminMaintenanceRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminMaintenanceRoutes.md)<br>
**Mounted inventory entry:** 400 of 629<br>
**Route declaration pipeline:** `createDatabaseBackup`
**Router-wide middleware:** resolveTenant; protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.post(
  "/maintenance/backup",
  createDatabaseBackup
)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `503`, `500`.
- JSON envelope keys observed: `success`, `message`, `file`, `scope`.

**Source-traced behavior:** See [Super Admin maintenance API contracts](../API_DOMAIN_CONTRACTS/superadmin-maintenance.md) for backup listing/creation, cache deletion, download/delete semantics, tenant scope, filesystem effects and failure boundaries.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-401 — POST /api/superadmin/maintenance/cache

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminMaintenanceRoutes.js](../../server/routes/superAdminMaintenanceRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminMaintenanceRoutes.md)<br>
**Mounted inventory entry:** 401 of 629<br>
**Route declaration pipeline:** `clearSystemCache`
**Router-wide middleware:** resolveTenant; protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.post(
  "/cache",
  clearSystemCache
)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `500`.
- JSON envelope keys observed: `success`, `message`, `timestamp`.

**Source-traced behavior:** See [Super Admin maintenance API contracts](../API_DOMAIN_CONTRACTS/superadmin-maintenance.md) for backup listing/creation, cache deletion, download/delete semantics, tenant scope, filesystem effects and failure boundaries.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-402 — POST /api/superadmin/maintenance/maintenance/cache

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminMaintenanceRoutes.js](../../server/routes/superAdminMaintenanceRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminMaintenanceRoutes.md)<br>
**Mounted inventory entry:** 402 of 629<br>
**Route declaration pipeline:** `clearSystemCache`
**Router-wide middleware:** resolveTenant; protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.post(
  "/maintenance/cache",
  clearSystemCache
)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `500`.
- JSON envelope keys observed: `success`, `message`, `timestamp`.

**Source-traced behavior:** See [Super Admin maintenance API contracts](../API_DOMAIN_CONTRACTS/superadmin-maintenance.md) for backup listing/creation, cache deletion, download/delete semantics, tenant scope, filesystem effects and failure boundaries.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-403 — DELETE /api/superadmin/maintenance/backups/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminMaintenanceRoutes.js](../../server/routes/superAdminMaintenanceRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminMaintenanceRoutes.md)<br>
**Mounted inventory entry:** 403 of 629<br>
**Route declaration pipeline:** `deleteDatabaseBackup`
**Router-wide middleware:** resolveTenant; protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.delete(
  "/backups/:id",
  deleteDatabaseBackup
)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `500`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced behavior:** See [Super Admin maintenance API contracts](../API_DOMAIN_CONTRACTS/superadmin-maintenance.md) for backup listing/creation, cache deletion, download/delete semantics, tenant scope, filesystem effects and failure boundaries.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-404 — GET /api/superadmin/maintenance/database/backup/:id/download

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminMaintenanceRoutes.js](../../server/routes/superAdminMaintenanceRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminMaintenanceRoutes.md)<br>
**Mounted inventory entry:** 404 of 629<br>
**Route declaration pipeline:** `downloadDatabaseBackup`
**Router-wide middleware:** resolveTenant; protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.get(
  "/database/backup/:id/download",
  downloadDatabaseBackup
)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `500`.
- JSON envelope keys observed: `success`, `message`.

**Source-traced behavior:** See [Super Admin maintenance API contracts](../API_DOMAIN_CONTRACTS/superadmin-maintenance.md) for backup listing/creation, cache deletion, download/delete semantics, tenant scope, filesystem effects and failure boundaries.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-405 — POST /api/superadmin/maintenance/database/backup

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminMaintenanceRoutes.js](../../server/routes/superAdminMaintenanceRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminMaintenanceRoutes.md)<br>
**Mounted inventory entry:** 405 of 629<br>
**Route declaration pipeline:** `createDatabaseBackup`
**Router-wide middleware:** resolveTenant; protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.post(
  "/database/backup",
  createDatabaseBackup
)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `503`, `500`.
- JSON envelope keys observed: `success`, `message`, `file`, `scope`.

**Source-traced behavior:** See [Super Admin maintenance API contracts](../API_DOMAIN_CONTRACTS/superadmin-maintenance.md) for backup listing/creation, cache deletion, download/delete semantics, tenant scope, filesystem effects and failure boundaries.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-406 — POST /api/superadmin/maintenance/database/cache-clear

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminMaintenanceRoutes.js](../../server/routes/superAdminMaintenanceRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminMaintenanceRoutes.md)<br>
**Mounted inventory entry:** 406 of 629<br>
**Route declaration pipeline:** `clearSystemCache`
**Router-wide middleware:** resolveTenant; protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.post(
  "/database/cache-clear",
  clearSystemCache
)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `500`.
- JSON envelope keys observed: `success`, `message`, `timestamp`.

**Source-traced behavior:** See [Super Admin maintenance API contracts](../API_DOMAIN_CONTRACTS/superadmin-maintenance.md) for backup listing/creation, cache deletion, download/delete semantics, tenant scope, filesystem effects and failure boundaries.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-407 — GET /api/superadmin/audit

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminOperationsRoutes.js](../../server/routes/superAdminOperationsRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminOperationsRoutes.md)<br>
**Mounted inventory entry:** 407 of 629<br>
**Route declaration pipeline:** `getAuditLogs`
**Router-wide middleware:** resolveTenant; protect; auditMiddleware
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.get("/audit",getAuditLogs)
```

**Source-traced behavior:** See [Super Admin operational status and audit APIs](../API_DOMAIN_CONTRACTS/superadmin-operations.md) for query coercion, audit filtering, response details, middleware behavior and security limitations.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-408 — GET /api/superadmin/database

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminOperationsRoutes.js](../../server/routes/superAdminOperationsRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminOperationsRoutes.md)<br>
**Mounted inventory entry:** 408 of 629<br>
**Route declaration pipeline:** `getDatabaseStatus`
**Router-wide middleware:** resolveTenant; protect; auditMiddleware
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.get("/database",getDatabaseStatus)
```

**Source-traced behavior:** See [Super Admin operational status and audit APIs](../API_DOMAIN_CONTRACTS/superadmin-operations.md) for query coercion, audit filtering, response details, middleware behavior and security limitations.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-409 — GET /api/superadmin/system

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminOperationsRoutes.js](../../server/routes/superAdminOperationsRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminOperationsRoutes.md)<br>
**Mounted inventory entry:** 409 of 629<br>
**Route declaration pipeline:** `getSystemHealth`
**Router-wide middleware:** resolveTenant; protect; auditMiddleware
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.get("/system",getSystemHealth)
```

**Source-traced behavior:** See [Super Admin operational status and audit APIs](../API_DOMAIN_CONTRACTS/superadmin-operations.md) for query coercion, audit filtering, response details, middleware behavior and security limitations.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-410 — GET /api/superadmin/revenue

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRevenueRoutes.js](../../server/routes/superAdminRevenueRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRevenueRoutes.md)<br>
**Mounted inventory entry:** 410 of 629<br>
**Route declaration pipeline:** `authorize`, `getSuperAdminRevenue`
**Authentication evidence:** No standard `protect` guard is visible in route/router middleware. This alone does not prove public access; inspect handler-level checks and global middleware.
**Role/permission middleware evidence:** authorize`

**Source declaration:**

```js
router.get("/", authorize("admin.dashboard"), getSuperAdminRevenue)
```

**Source-traced behavior:** See [Super Admin platform revenue API contract](../API_DOMAIN_CONTRACTS/superadmin-revenue.md) for permission evaluation, platform-wide aggregation, currency handling and the cross-tenant authorization finding.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-411 — GET /api/superadmin/roles

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoleRoutes.js](../../server/routes/superAdminRoleRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoleRoutes.md)<br>
**Mounted inventory entry:** 411 of 629<br>
**Route declaration pipeline:** `getPlatformRoles`
**Router-wide middleware:** protect; authorize("roles.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("roles.manage"

**Source declaration:**

```js
router.get("/", getPlatformRoles)
```

**Source-traced behavior:** See [Super Admin role and permission API contracts](../API_DOMAIN_CONTRACTS/superadmin-roles.md) for authorization, tenant scope, request/response behavior, validation and limitations.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-412 — GET /api/superadmin/roles/permissions/all

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoleRoutes.js](../../server/routes/superAdminRoleRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoleRoutes.md)<br>
**Mounted inventory entry:** 412 of 629<br>
**Route declaration pipeline:** `getPlatformPermissions`
**Router-wide middleware:** protect; authorize("roles.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("roles.manage"

**Source declaration:**

```js
router.get("/permissions/all", getPlatformPermissions)
```

**Source-traced behavior:** See [Super Admin role and permission API contracts](../API_DOMAIN_CONTRACTS/superadmin-roles.md) for authorization, tenant scope, request/response behavior, validation and limitations.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-413 — GET /api/superadmin/roles/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoleRoutes.js](../../server/routes/superAdminRoleRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoleRoutes.md)<br>
**Mounted inventory entry:** 413 of 629<br>
**Route declaration pipeline:** `getPlatformRole`
**Router-wide middleware:** protect; authorize("roles.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("roles.manage"

**Source declaration:**

```js
router.get("/:id", getPlatformRole)
```

**Source-traced behavior:** See [Super Admin role and permission API contracts](../API_DOMAIN_CONTRACTS/superadmin-roles.md) for authorization, tenant scope, request/response behavior, validation and limitations.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-414 — PUT /api/superadmin/roles/:id/permissions

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoleRoutes.js](../../server/routes/superAdminRoleRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoleRoutes.md)<br>
**Mounted inventory entry:** 414 of 629<br>
**Route declaration pipeline:** `updatePlatformRolePermissions`
**Router-wide middleware:** protect; authorize("roles.manage")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("roles.manage"

**Source declaration:**

```js
router.put("/:id/permissions", updatePlatformRolePermissions)
```

**Source-traced behavior:** See [Super Admin role and permission API contracts](../API_DOMAIN_CONTRACTS/superadmin-roles.md) for authorization, tenant scope, request/response behavior, validation and limitations.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-415 — GET /api/superadmin/dashboard/metrics

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 415 of 629<br>
**Route declaration pipeline:** `getSuperAdminDashboardMetrics`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.get("/dashboard/metrics", getSuperAdminDashboardMetrics)
```

**Source-traced behavior:** See [Super Admin dashboard metrics API contract](../API_DOMAIN_CONTRACTS/superadmin-dashboard.md) for authorization, tenant scope, request/response behavior, validation and limitations.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-416 — GET /api/superadmin/dashboard/metrics

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 416 of 629<br>
**Route declaration pipeline:** `getSuperAdminDashboardMetrics`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.get("/dashboard/metrics", getSuperAdminDashboardMetrics)
```

**Source-traced behavior:** See [Super Admin dashboard metrics API contract](../API_DOMAIN_CONTRACTS/superadmin-dashboard.md) for authorization, tenant scope, request/response behavior, validation and limitations.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-417 — GET /api/superadmin/dashboard

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 417 of 629<br>
**Route declaration pipeline:** `getSuperAdminDashboardMetrics`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.get("/dashboard", getSuperAdminDashboardMetrics)
```

**Source-traced behavior:** See [Super Admin dashboard metrics API contract](../API_DOMAIN_CONTRACTS/superadmin-dashboard.md) for authorization, tenant scope, request/response behavior, validation and limitations.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-418 — GET /api/superadmin/dashboard

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 418 of 629<br>
**Route declaration pipeline:** `getSuperAdminDashboardMetrics`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.get("/dashboard", getSuperAdminDashboardMetrics)
```

**Source-traced behavior:** See [Super Admin dashboard metrics API contract](../API_DOMAIN_CONTRACTS/superadmin-dashboard.md) for authorization, tenant scope, request/response behavior, validation and limitations.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-419 — GET /api/superadmin/tenant-plans

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 419 of 629<br>
**Route declaration pipeline:** `getTenantPlans`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.get("/tenant-plans", getTenantPlans)
```

**Source-traced behavior:** See [Super Admin tenant plans and tenant directory APIs](../API_DOMAIN_CONTRACTS/superadmin-tenants.md) for plan values, pagination/search, tenant creation validation and transaction behavior, and tenant detail responses.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-420 — GET /api/superadmin/tenant-plans

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 420 of 629<br>
**Route declaration pipeline:** `getTenantPlans`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.get("/tenant-plans", getTenantPlans)
```

**Source-traced behavior:** See [Super Admin tenant plans and tenant directory APIs](../API_DOMAIN_CONTRACTS/superadmin-tenants.md) for plan values, pagination/search, tenant creation validation and transaction behavior, and tenant detail responses.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-421 — GET /api/superadmin/tenants

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 421 of 629<br>
**Route declaration pipeline:** `listTenants`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.get("/tenants", listTenants)
```

**Source-traced behavior:** See [Super Admin tenant plans and tenant directory APIs](../API_DOMAIN_CONTRACTS/superadmin-tenants.md) for plan values, pagination/search, tenant creation validation and transaction behavior, and tenant detail responses.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-422 — GET /api/superadmin/tenants

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 422 of 629<br>
**Route declaration pipeline:** `listTenants`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.get("/tenants", listTenants)
```

**Source-traced behavior:** See [Super Admin tenant plans and tenant directory APIs](../API_DOMAIN_CONTRACTS/superadmin-tenants.md) for plan values, pagination/search, tenant creation validation and transaction behavior, and tenant detail responses.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-423 — POST /api/superadmin/tenants

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 423 of 629<br>
**Route declaration pipeline:** `createTenantWithAdmin`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.post("/tenants", createTenantWithAdmin)
```

**Source-traced behavior:** See [Super Admin tenant plans and tenant directory APIs](../API_DOMAIN_CONTRACTS/superadmin-tenants.md) for plan values, pagination/search, tenant creation validation and transaction behavior, and tenant detail responses.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-424 — POST /api/superadmin/tenants

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 424 of 629<br>
**Route declaration pipeline:** `createTenantWithAdmin`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.post("/tenants", createTenantWithAdmin)
```

**Source-traced behavior:** See [Super Admin tenant plans and tenant directory APIs](../API_DOMAIN_CONTRACTS/superadmin-tenants.md) for plan values, pagination/search, tenant creation validation and transaction behavior, and tenant detail responses.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-425 — GET /api/superadmin/tenants/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 425 of 629<br>
**Route declaration pipeline:** `getTenant`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.get("/tenants/:id", getTenant)
```

**Source-traced behavior:** See [Super Admin tenant plans and tenant directory APIs](../API_DOMAIN_CONTRACTS/superadmin-tenants.md) for plan values, pagination/search, tenant creation validation and transaction behavior, and tenant detail responses.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-426 — GET /api/superadmin/tenants/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 426 of 629<br>
**Route declaration pipeline:** `getTenant`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.get("/tenants/:id", getTenant)
```

**Source-traced behavior:** See [Super Admin tenant plans and tenant directory APIs](../API_DOMAIN_CONTRACTS/superadmin-tenants.md) for plan values, pagination/search, tenant creation validation and transaction behavior, and tenant detail responses.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-427 — GET /api/superadmin/tenants/:tenantId/mpesa

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 427 of 629<br>
**Route declaration pipeline:** `getSuperAdminTenantMpesa`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.get("/tenants/:tenantId/mpesa", getSuperAdminTenantMpesa)
```

**Source-traced behavior:** See [Super Admin tenant M-Pesa gateway and status APIs](../API_DOMAIN_CONTRACTS/superadmin-tenant-gateways.md) for tenant scoping, encrypted credentials, callback validation, Daraja OAuth verification, disable behavior and manual subscription activation.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-428 — GET /api/superadmin/tenants/:tenantId/mpesa

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 428 of 629<br>
**Route declaration pipeline:** `getSuperAdminTenantMpesa`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.get("/tenants/:tenantId/mpesa", getSuperAdminTenantMpesa)
```

**Source-traced behavior:** See [Super Admin tenant M-Pesa gateway and status APIs](../API_DOMAIN_CONTRACTS/superadmin-tenant-gateways.md) for tenant scoping, encrypted credentials, callback validation, Daraja OAuth verification, disable behavior and manual subscription activation.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-429 — PUT /api/superadmin/tenants/:tenantId/mpesa

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 429 of 629<br>
**Route declaration pipeline:** `saveSuperAdminTenantMpesa`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.put("/tenants/:tenantId/mpesa", saveSuperAdminTenantMpesa)
```

**Source-traced behavior:** See [Super Admin tenant M-Pesa gateway and status APIs](../API_DOMAIN_CONTRACTS/superadmin-tenant-gateways.md) for tenant scoping, encrypted credentials, callback validation, Daraja OAuth verification, disable behavior and manual subscription activation.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-430 — PUT /api/superadmin/tenants/:tenantId/mpesa

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 430 of 629<br>
**Route declaration pipeline:** `saveSuperAdminTenantMpesa`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.put("/tenants/:tenantId/mpesa", saveSuperAdminTenantMpesa)
```

**Source-traced behavior:** See [Super Admin tenant M-Pesa gateway and status APIs](../API_DOMAIN_CONTRACTS/superadmin-tenant-gateways.md) for tenant scoping, encrypted credentials, callback validation, Daraja OAuth verification, disable behavior and manual subscription activation.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-431 — POST /api/superadmin/tenants/:tenantId/mpesa/validate

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 431 of 629<br>
**Route declaration pipeline:** `rateLimit`, `validateSuperAdminTenantMpesa`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.post("/tenants/:tenantId/mpesa/validate", rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: true, legacyHeaders: false, message: { success: false, message: "Too many configuration checks. Try again later." } }), validateSuperAdminTenantMpesa)
```

**Source-traced behavior:** See [Super Admin tenant M-Pesa gateway and status APIs](../API_DOMAIN_CONTRACTS/superadmin-tenant-gateways.md) for tenant scoping, encrypted credentials, callback validation, Daraja OAuth verification, disable behavior and manual subscription activation.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-432 — POST /api/superadmin/tenants/:tenantId/mpesa/validate

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 432 of 629<br>
**Route declaration pipeline:** `rateLimit`, `validateSuperAdminTenantMpesa`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.post("/tenants/:tenantId/mpesa/validate", rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: true, legacyHeaders: false, message: { success: false, message: "Too many configuration checks. Try again later." } }), validateSuperAdminTenantMpesa)
```

**Source-traced behavior:** See [Super Admin tenant M-Pesa gateway and status APIs](../API_DOMAIN_CONTRACTS/superadmin-tenant-gateways.md) for tenant scoping, encrypted credentials, callback validation, Daraja OAuth verification, disable behavior and manual subscription activation.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-433 — DELETE /api/superadmin/tenants/:tenantId/mpesa

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 433 of 629<br>
**Route declaration pipeline:** `disableSuperAdminTenantMpesa`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.delete("/tenants/:tenantId/mpesa", disableSuperAdminTenantMpesa)
```

**Source-traced behavior:** See [Super Admin tenant M-Pesa gateway and status APIs](../API_DOMAIN_CONTRACTS/superadmin-tenant-gateways.md) for tenant scoping, encrypted credentials, callback validation, Daraja OAuth verification, disable behavior and manual subscription activation.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-434 — DELETE /api/superadmin/tenants/:tenantId/mpesa

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 434 of 629<br>
**Route declaration pipeline:** `disableSuperAdminTenantMpesa`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.delete("/tenants/:tenantId/mpesa", disableSuperAdminTenantMpesa)
```

**Source-traced behavior:** See [Super Admin tenant M-Pesa gateway and status APIs](../API_DOMAIN_CONTRACTS/superadmin-tenant-gateways.md) for tenant scoping, encrypted credentials, callback validation, Daraja OAuth verification, disable behavior and manual subscription activation.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-435 — PATCH /api/superadmin/tenants/:id/status

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 435 of 629<br>
**Route declaration pipeline:** `updateTenantStatus`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.patch("/tenants/:id/status", updateTenantStatus)
```

**Source-traced behavior:** See [Super Admin tenant M-Pesa gateway and status APIs](../API_DOMAIN_CONTRACTS/superadmin-tenant-gateways.md) for tenant scoping, encrypted credentials, callback validation, Daraja OAuth verification, disable behavior and manual subscription activation.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-436 — PATCH /api/superadmin/tenants/:id/status

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 436 of 629<br>
**Route declaration pipeline:** `updateTenantStatus`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.patch("/tenants/:id/status", updateTenantStatus)
```

**Source-traced behavior:** See [Super Admin tenant M-Pesa gateway and status APIs](../API_DOMAIN_CONTRACTS/superadmin-tenant-gateways.md) for tenant scoping, encrypted credentials, callback validation, Daraja OAuth verification, disable behavior and manual subscription activation.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-437 — POST /api/superadmin/tenants/:id/subscription/activate

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 437 of 629<br>
**Route declaration pipeline:** `approveTenantSubscription`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.post("/tenants/:id/subscription/activate", approveTenantSubscription)
```

**Source-traced behavior:** See [Super Admin subscription activation, plan switching, deletion and payment listing](../API_DOMAIN_CONTRACTS/superadmin-subscriptions.md) for manual payment handling, plan transitions, destructive deletion scope and payment-list limits.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-438 — POST /api/superadmin/tenants/:id/subscription/activate

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 438 of 629<br>
**Route declaration pipeline:** `approveTenantSubscription`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.post("/tenants/:id/subscription/activate", approveTenantSubscription)
```

**Source-traced behavior:** See [Super Admin subscription activation, plan switching, deletion and payment listing](../API_DOMAIN_CONTRACTS/superadmin-subscriptions.md) for manual payment handling, plan transitions, destructive deletion scope and payment-list limits.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-439 — PATCH /api/superadmin/tenants/:id/subscription/plan

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 439 of 629<br>
**Route declaration pipeline:** `switchTenantSubscription`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.patch("/tenants/:id/subscription/plan", switchTenantSubscription)
```

**Source-traced behavior:** See [Super Admin subscription activation, plan switching, deletion and payment listing](../API_DOMAIN_CONTRACTS/superadmin-subscriptions.md) for manual payment handling, plan transitions, destructive deletion scope and payment-list limits.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-440 — PATCH /api/superadmin/tenants/:id/subscription/plan

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 440 of 629<br>
**Route declaration pipeline:** `switchTenantSubscription`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.patch("/tenants/:id/subscription/plan", switchTenantSubscription)
```

**Source-traced behavior:** See [Super Admin subscription activation, plan switching, deletion and payment listing](../API_DOMAIN_CONTRACTS/superadmin-subscriptions.md) for manual payment handling, plan transitions, destructive deletion scope and payment-list limits.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-441 — DELETE /api/superadmin/tenants/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 441 of 629<br>
**Route declaration pipeline:** `deleteTenant`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.delete("/tenants/:id", deleteTenant)
```

**Source-traced behavior:** See [Super Admin subscription activation, plan switching, deletion and payment listing](../API_DOMAIN_CONTRACTS/superadmin-subscriptions.md) for manual payment handling, plan transitions, destructive deletion scope and payment-list limits.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-442 — DELETE /api/superadmin/tenants/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 442 of 629<br>
**Route declaration pipeline:** `deleteTenant`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.delete("/tenants/:id", deleteTenant)
```

**Source-traced behavior:** See [Super Admin subscription activation, plan switching, deletion and payment listing](../API_DOMAIN_CONTRACTS/superadmin-subscriptions.md) for manual payment handling, plan transitions, destructive deletion scope and payment-list limits.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-443 — GET /api/superadmin/subscription-payments

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 443 of 629<br>
**Route declaration pipeline:** `listSubscriptionPayments`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.get("/subscription-payments", listSubscriptionPayments)
```

**Source-traced behavior:** See [Super Admin subscription activation, plan switching, deletion and payment listing](../API_DOMAIN_CONTRACTS/superadmin-subscriptions.md) for manual payment handling, plan transitions, destructive deletion scope and payment-list limits.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-444 — GET /api/superadmin/subscription-payments

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 444 of 629<br>
**Route declaration pipeline:** `listSubscriptionPayments`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.get("/subscription-payments", listSubscriptionPayments)
```

**Source-traced behavior:** See [Super Admin subscription activation, plan switching, deletion and payment listing](../API_DOMAIN_CONTRACTS/superadmin-subscriptions.md) for manual payment handling, plan transitions, destructive deletion scope and payment-list limits.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-445 — GET /api/superadmin/billing/config

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 445 of 629<br>
**Route declaration pipeline:** `getPlatformBillingConfig`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.get("/billing/config", getPlatformBillingConfig)
```

**Source-traced behavior:** See [Super Admin platform billing configuration APIs](../API_DOMAIN_CONTRACTS/superadmin-billing.md) for price fallback/validation, platform settings isolation, feature catalogue defaults and update semantics.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-446 — GET /api/superadmin/billing/config

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 446 of 629<br>
**Route declaration pipeline:** `getPlatformBillingConfig`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.get("/billing/config", getPlatformBillingConfig)
```

**Source-traced behavior:** See [Super Admin platform billing configuration APIs](../API_DOMAIN_CONTRACTS/superadmin-billing.md) for price fallback/validation, platform settings isolation, feature catalogue defaults and update semantics.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-447 — PUT /api/superadmin/billing/config

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 447 of 629<br>
**Route declaration pipeline:** `updatePlatformBillingConfig`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.put("/billing/config", updatePlatformBillingConfig)
```

**Source-traced behavior:** See [Super Admin platform billing configuration APIs](../API_DOMAIN_CONTRACTS/superadmin-billing.md) for price fallback/validation, platform settings isolation, feature catalogue defaults and update semantics.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-448 — PUT /api/superadmin/billing/config

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 448 of 629<br>
**Route declaration pipeline:** `updatePlatformBillingConfig`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.put("/billing/config", updatePlatformBillingConfig)
```

**Source-traced behavior:** See [Super Admin platform billing configuration APIs](../API_DOMAIN_CONTRACTS/superadmin-billing.md) for price fallback/validation, platform settings isolation, feature catalogue defaults and update semantics.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-449 — GET /api/superadmin/billing/features

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 449 of 629<br>
**Route declaration pipeline:** `getPlatformPlanFeatureCatalog`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.get("/billing/features", getPlatformPlanFeatureCatalog)
```

**Source-traced behavior:** See [Super Admin platform billing configuration APIs](../API_DOMAIN_CONTRACTS/superadmin-billing.md) for price fallback/validation, platform settings isolation, feature catalogue defaults and update semantics.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-450 — GET /api/superadmin/billing/features

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 450 of 629<br>
**Route declaration pipeline:** `getPlatformPlanFeatureCatalog`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.get("/billing/features", getPlatformPlanFeatureCatalog)
```

**Source-traced behavior:** See [Super Admin platform billing configuration APIs](../API_DOMAIN_CONTRACTS/superadmin-billing.md) for price fallback/validation, platform settings isolation, feature catalogue defaults and update semantics.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-451 — GET /api/superadmin/users

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 451 of 629<br>
**Route declaration pipeline:** `getSuperAdminUsers`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.get("/users", getSuperAdminUsers)
```

**Source-traced behavior:** See [Super Admin user administration API contracts](../API_DOMAIN_CONTRACTS/superadmin-users.md) for role normalization, user search/pagination, account creation, tenant assignment caveats, status updates and deletion behavior.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-452 — GET /api/superadmin/users

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 452 of 629<br>
**Route declaration pipeline:** `getSuperAdminUsers`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.get("/users", getSuperAdminUsers)
```

**Source-traced behavior:** See [Super Admin user administration API contracts](../API_DOMAIN_CONTRACTS/superadmin-users.md) for role normalization, user search/pagination, account creation, tenant assignment caveats, status updates and deletion behavior.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-453 — POST /api/superadmin/users/accounts

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 453 of 629<br>
**Route declaration pipeline:** `createSuperAdminCompanyAccount`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.post("/users/accounts", createSuperAdminCompanyAccount)
```

**Source-traced behavior:** See [Super Admin user administration API contracts](../API_DOMAIN_CONTRACTS/superadmin-users.md) for role normalization, user search/pagination, account creation, tenant assignment caveats, status updates and deletion behavior.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-454 — POST /api/superadmin/users/accounts

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 454 of 629<br>
**Route declaration pipeline:** `createSuperAdminCompanyAccount`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.post("/users/accounts", createSuperAdminCompanyAccount)
```

**Source-traced behavior:** See [Super Admin user administration API contracts](../API_DOMAIN_CONTRACTS/superadmin-users.md) for role normalization, user search/pagination, account creation, tenant assignment caveats, status updates and deletion behavior.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-455 — PATCH /api/superadmin/users/:id/status

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 455 of 629<br>
**Route declaration pipeline:** `updateSuperAdminUserStatus`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.patch("/users/:id/status", updateSuperAdminUserStatus)
```

**Source-traced behavior:** See [Super Admin user administration API contracts](../API_DOMAIN_CONTRACTS/superadmin-users.md) for role normalization, user search/pagination, account creation, tenant assignment caveats, status updates and deletion behavior.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-456 — PATCH /api/superadmin/users/:id/status

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 456 of 629<br>
**Route declaration pipeline:** `updateSuperAdminUserStatus`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.patch("/users/:id/status", updateSuperAdminUserStatus)
```

**Source-traced behavior:** See [Super Admin user administration API contracts](../API_DOMAIN_CONTRACTS/superadmin-users.md) for role normalization, user search/pagination, account creation, tenant assignment caveats, status updates and deletion behavior.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-457 — PUT /api/superadmin/users/:id/status

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 457 of 629<br>
**Route declaration pipeline:** `updateSuperAdminUserStatus`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.put("/users/:id/status", updateSuperAdminUserStatus)
```

**Source-traced behavior:** See [Super Admin user administration API contracts](../API_DOMAIN_CONTRACTS/superadmin-users.md) for role normalization, user search/pagination, account creation, tenant assignment caveats, status updates and deletion behavior.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-458 — PUT /api/superadmin/users/:id/status

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 458 of 629<br>
**Route declaration pipeline:** `updateSuperAdminUserStatus`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.put("/users/:id/status", updateSuperAdminUserStatus)
```

**Source-traced behavior:** See [Super Admin user administration API contracts](../API_DOMAIN_CONTRACTS/superadmin-users.md) for role normalization, user search/pagination, account creation, tenant assignment caveats, status updates and deletion behavior.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-459 — DELETE /api/superadmin/users/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 459 of 629<br>
**Route declaration pipeline:** `deleteSuperAdminUser`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.delete("/users/:id", deleteSuperAdminUser)
```

**Source-traced behavior:** See [Super Admin user administration API contracts](../API_DOMAIN_CONTRACTS/superadmin-users.md) for role normalization, user search/pagination, account creation, tenant assignment caveats, status updates and deletion behavior.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-460 — DELETE /api/superadmin/users/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 460 of 629<br>
**Route declaration pipeline:** `deleteSuperAdminUser`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.delete("/users/:id", deleteSuperAdminUser)
```

**Source-traced behavior:** See [Super Admin user administration API contracts](../API_DOMAIN_CONTRACTS/superadmin-users.md) for effective router order, authorization, handler behavior, response contracts and operational/security limitations.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-461 — GET /api/superadmin/audit

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 461 of 629<br>
**Route declaration pipeline:** `getAuditLogs`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.get("/audit", getAuditLogs)
```

**Source-traced behavior:** See [Super Admin audit, security, settings, monitoring and backup APIs](../API_DOMAIN_CONTRACTS/superadmin-operations-and-backups.md) for effective router order, authorization, handler behavior, response contracts and operational/security limitations.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-462 — GET /api/superadmin/audit

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 462 of 629<br>
**Route declaration pipeline:** `getAuditLogs`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.get("/audit", getAuditLogs)
```

**Source-traced behavior:** See [Super Admin audit, security, settings, monitoring and backup APIs](../API_DOMAIN_CONTRACTS/superadmin-operations-and-backups.md) for effective router order, authorization, handler behavior, response contracts and operational/security limitations.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-463 — GET /api/superadmin/security

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 463 of 629<br>
**Route declaration pipeline:** inline callback
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.get("/security", async (req, res) => { try { const data = await securityService.getSecurityStatus(); return res.json({ success: true, data }); } catch (error) { console.error("SuperAdmin security status error:", error); return res.status(500).json({ success: false, message: error.message }); } })
```

**Source-traced behavior:** See [Super Admin audit, security, settings, monitoring and backup APIs](../API_DOMAIN_CONTRACTS/superadmin-operations-and-backups.md) for effective router order, authorization, handler behavior, response contracts and operational/security limitations.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-464 — GET /api/superadmin/security

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 464 of 629<br>
**Route declaration pipeline:** inline callback
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.get("/security", async (req, res) => { try { const data = await securityService.getSecurityStatus(); return res.json({ success: true, data }); } catch (error) { console.error("SuperAdmin security status error:", error); return res.status(500).json({ success: false, message: error.message }); } })
```

**Source-traced behavior:** See [Super Admin audit, security, settings, monitoring and backup APIs](../API_DOMAIN_CONTRACTS/superadmin-operations-and-backups.md) for effective router order, authorization, handler behavior, response contracts and operational/security limitations.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-465 — GET /api/superadmin/database

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 465 of 629<br>
**Route declaration pipeline:** `getDatabaseStatus`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.get("/database", getDatabaseStatus)
```

**Source-traced behavior:** See [Super Admin audit, security, settings, monitoring and backup APIs](../API_DOMAIN_CONTRACTS/superadmin-operations-and-backups.md) for effective router order, authorization, handler behavior, response contracts and operational/security limitations.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-466 — GET /api/superadmin/database

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 466 of 629<br>
**Route declaration pipeline:** `getDatabaseStatus`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.get("/database", getDatabaseStatus)
```

**Source-traced behavior:** See [Super Admin audit, security, settings, monitoring and backup APIs](../API_DOMAIN_CONTRACTS/superadmin-operations-and-backups.md) for effective router order, authorization, handler behavior, response contracts and operational/security limitations.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-467 — GET /api/superadmin/system

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 467 of 629<br>
**Route declaration pipeline:** `getSystemHealth`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.get("/system", getSystemHealth)
```

**Source-traced behavior:** See [Super Admin audit, security, settings, monitoring and backup APIs](../API_DOMAIN_CONTRACTS/superadmin-operations-and-backups.md) for effective router order, authorization, handler behavior, response contracts and operational/security limitations.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-468 — GET /api/superadmin/system

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 468 of 629<br>
**Route declaration pipeline:** `getSystemHealth`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.get("/system", getSystemHealth)
```

**Source-traced behavior:** See [Super Admin audit, security, settings, monitoring and backup APIs](../API_DOMAIN_CONTRACTS/superadmin-operations-and-backups.md) for effective router order, authorization, handler behavior, response contracts and operational/security limitations.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-469 — GET /api/superadmin/api-monitor

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 469 of 629<br>
**Route declaration pipeline:** `getApiMonitor`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.get("/api-monitor", getApiMonitor)
```

**Source-traced behavior:** See [Super Admin audit, security, settings, monitoring and backup APIs](../API_DOMAIN_CONTRACTS/superadmin-operations-and-backups.md) for effective router order, authorization, handler behavior, response contracts and operational/security limitations.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-470 — GET /api/superadmin/api-monitor

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 470 of 629<br>
**Route declaration pipeline:** `getApiMonitor`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.get("/api-monitor", getApiMonitor)
```

**Source-traced behavior:** See [Super Admin audit, security, settings, monitoring and backup APIs](../API_DOMAIN_CONTRACTS/superadmin-operations-and-backups.md) for effective router order, authorization, handler behavior, response contracts and operational/security limitations.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-471 — GET /api/superadmin/settings

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 471 of 629<br>
**Route declaration pipeline:** `getSettings`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.get("/settings", getSettings)
```

**Source-traced behavior:** See [Super Admin audit, security, settings, monitoring and backup APIs](../API_DOMAIN_CONTRACTS/superadmin-operations-and-backups.md) for effective router order, authorization, handler behavior, response contracts and operational/security limitations.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-472 — GET /api/superadmin/settings

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 472 of 629<br>
**Route declaration pipeline:** `getSettings`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.get("/settings", getSettings)
```

**Source-traced behavior:** See [Super Admin audit, security, settings, monitoring and backup APIs](../API_DOMAIN_CONTRACTS/superadmin-operations-and-backups.md) for effective router order, authorization, handler behavior, response contracts and operational/security limitations.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-473 — PUT /api/superadmin/settings

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 473 of 629<br>
**Route declaration pipeline:** `updateSettings`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.put("/settings", updateSettings)
```

**Source-traced behavior:** See [Super Admin audit, security, settings, monitoring and backup APIs](../API_DOMAIN_CONTRACTS/superadmin-operations-and-backups.md) for effective router order, authorization, handler behavior, response contracts and operational/security limitations.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-474 — PUT /api/superadmin/settings

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 474 of 629<br>
**Route declaration pipeline:** `updateSettings`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.put("/settings", updateSettings)
```

**Source-traced behavior:** See [Super Admin audit, security, settings, monitoring and backup APIs](../API_DOMAIN_CONTRACTS/superadmin-operations-and-backups.md) for effective router order, authorization, handler behavior, response contracts and operational/security limitations.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-475 — POST /api/superadmin/maintenance/backup

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 475 of 629<br>
**Route declaration pipeline:** `createPlatformDatabaseBackup`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.post("/maintenance/backup", createPlatformDatabaseBackup)
```

**Source-traced behavior:** See [Super Admin audit, security, settings, monitoring and backup APIs](../API_DOMAIN_CONTRACTS/superadmin-operations-and-backups.md) for effective router order, authorization, handler behavior, response contracts and operational/security limitations.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-476 — POST /api/superadmin/maintenance/backup

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 476 of 629<br>
**Route declaration pipeline:** `createPlatformDatabaseBackup`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.post("/maintenance/backup", createPlatformDatabaseBackup)
```

**Source-traced behavior:** See [Super Admin audit, security, settings, monitoring and backup APIs](../API_DOMAIN_CONTRACTS/superadmin-operations-and-backups.md) for effective router order, authorization, handler behavior, response contracts and operational/security limitations.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-477 — POST /api/superadmin/database/backup

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 477 of 629<br>
**Route declaration pipeline:** `createPlatformDatabaseBackup`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.post("/database/backup", createPlatformDatabaseBackup)
```

**Source-traced behavior:** See [Super Admin audit, security, settings, monitoring and backup APIs](../API_DOMAIN_CONTRACTS/superadmin-operations-and-backups.md) for effective router order, authorization, handler behavior, response contracts and operational/security limitations.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-478 — POST /api/superadmin/database/backup

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 478 of 629<br>
**Route declaration pipeline:** `createPlatformDatabaseBackup`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.post("/database/backup", createPlatformDatabaseBackup)
```

**Source-traced behavior:** See [Super Admin audit, security, settings, monitoring and backup APIs](../API_DOMAIN_CONTRACTS/superadmin-operations-and-backups.md) for effective router order, authorization, handler behavior, response contracts and operational/security limitations.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-479 — POST /api/superadmin/maintenance/cache

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 479 of 629<br>
**Route declaration pipeline:** `clearSystemCache`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.post("/maintenance/cache", clearSystemCache)
```

**Source-traced behavior:** See [Super Admin audit, security, settings, monitoring and backup APIs](../API_DOMAIN_CONTRACTS/superadmin-operations-and-backups.md) for effective router order, authorization, handler behavior, response contracts and operational/security limitations.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-480 — POST /api/superadmin/maintenance/cache

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 480 of 629<br>
**Route declaration pipeline:** `clearSystemCache`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.post("/maintenance/cache", clearSystemCache)
```

**Source-traced behavior:** See [Super Admin audit, security, settings, monitoring and backup APIs](../API_DOMAIN_CONTRACTS/superadmin-operations-and-backups.md) for effective router order, authorization, handler behavior, response contracts and operational/security limitations.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-481 — POST /api/superadmin/database/cache-clear

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 481 of 629<br>
**Route declaration pipeline:** `clearSystemCache`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.post("/database/cache-clear", clearSystemCache)
```

**Source-traced behavior:** See [Super Admin audit, security, settings, monitoring and backup APIs](../API_DOMAIN_CONTRACTS/superadmin-operations-and-backups.md) for effective router order, authorization, handler behavior, response contracts and operational/security limitations.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-482 — POST /api/superadmin/database/cache-clear

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 482 of 629<br>
**Route declaration pipeline:** `clearSystemCache`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.post("/database/cache-clear", clearSystemCache)
```

**Source-traced behavior:** See [Super Admin audit, security, settings, monitoring and backup APIs](../API_DOMAIN_CONTRACTS/superadmin-operations-and-backups.md) for effective router order, authorization, handler behavior, response contracts and operational/security limitations.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-483 — GET /api/superadmin/database/backups

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 483 of 629<br>
**Route declaration pipeline:** `listPlatformDatabaseBackups`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.get("/database/backups", listPlatformDatabaseBackups)
```

**Source-traced behavior:** See [Super Admin audit, security, settings, monitoring and backup APIs](../API_DOMAIN_CONTRACTS/superadmin-operations-and-backups.md) for effective router order, authorization, handler behavior, response contracts and operational/security limitations.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-484 — GET /api/superadmin/database/backups

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 484 of 629<br>
**Route declaration pipeline:** `listPlatformDatabaseBackups`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.get("/database/backups", listPlatformDatabaseBackups)
```

**Source-traced behavior:** See [Super Admin audit, security, settings, monitoring and backup APIs](../API_DOMAIN_CONTRACTS/superadmin-operations-and-backups.md) for effective router order, authorization, handler behavior, response contracts and operational/security limitations.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-485 — GET /api/superadmin/maintenance/backups

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 485 of 629<br>
**Route declaration pipeline:** `listPlatformDatabaseBackups`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.get("/maintenance/backups", listPlatformDatabaseBackups)
```

**Source-traced behavior:** See [Super Admin audit, security, settings, monitoring and backup APIs](../API_DOMAIN_CONTRACTS/superadmin-operations-and-backups.md) for effective router order, authorization, handler behavior, response contracts and operational/security limitations.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-486 — GET /api/superadmin/maintenance/backups

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 486 of 629<br>
**Route declaration pipeline:** `listPlatformDatabaseBackups`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.get("/maintenance/backups", listPlatformDatabaseBackups)
```

**Source-traced behavior:** See [Super Admin audit, security, settings, monitoring and backup APIs](../API_DOMAIN_CONTRACTS/superadmin-operations-and-backups.md) for effective router order, authorization, handler behavior, response contracts and operational/security limitations.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-487 — DELETE /api/superadmin/maintenance/backups/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 487 of 629<br>
**Route declaration pipeline:** `deletePlatformDatabaseBackup`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.delete("/maintenance/backups/:id", deletePlatformDatabaseBackup)
```

**Source-traced behavior:** See [Super Admin audit, security, settings, monitoring and backup APIs](../API_DOMAIN_CONTRACTS/superadmin-operations-and-backups.md) for effective router order, authorization, handler behavior, response contracts and operational/security limitations.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-488 — DELETE /api/superadmin/maintenance/backups/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 488 of 629<br>
**Route declaration pipeline:** `deletePlatformDatabaseBackup`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.delete("/maintenance/backups/:id", deletePlatformDatabaseBackup)
```

**Source-traced behavior:** See [Super Admin audit, security, settings, monitoring and backup APIs](../API_DOMAIN_CONTRACTS/superadmin-operations-and-backups.md) for effective router order, authorization, handler behavior, response contracts and operational/security limitations.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-489 — DELETE /api/superadmin/database/backups/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 489 of 629<br>
**Route declaration pipeline:** `deletePlatformDatabaseBackup`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.delete("/database/backups/:id", deletePlatformDatabaseBackup)
```

**Source-traced behavior:** See [Super Admin audit, security, settings, monitoring and backup APIs](../API_DOMAIN_CONTRACTS/superadmin-operations-and-backups.md) for effective router order, authorization, handler behavior, response contracts and operational/security limitations.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-490 — DELETE /api/superadmin/database/backups/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 490 of 629<br>
**Route declaration pipeline:** `deletePlatformDatabaseBackup`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.delete("/database/backups/:id", deletePlatformDatabaseBackup)
```

**Source-traced behavior:** See [Super Admin audit, security, settings, monitoring and backup APIs](../API_DOMAIN_CONTRACTS/superadmin-operations-and-backups.md) for effective router order, authorization, handler behavior, response contracts and operational/security limitations.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-491 — GET /api/superadmin/database/backup/:id/download

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 491 of 629<br>
**Route declaration pipeline:** `downloadPlatformDatabaseBackup`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.get("/database/backup/:id/download", downloadPlatformDatabaseBackup)
```

**Source-traced behavior:** See [Super Admin audit, security, settings, monitoring and backup APIs](../API_DOMAIN_CONTRACTS/superadmin-operations-and-backups.md) for platform-only backup lookup, path handling and download responses.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-492 — GET /api/superadmin/database/backup/:id/download

**Contract status:** SOURCE-TRACED<br>
**Router:** [superAdminRoutes.js](../../server/routes/superAdminRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminRoutes.md)<br>
**Mounted inventory entry:** 492 of 629<br>
**Route declaration pipeline:** `downloadPlatformDatabaseBackup`
**Router-wide middleware:** protect, superAdminOnly
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** superAdminOnly

**Source declaration:**

```js
router.get("/database/backup/:id/download", downloadPlatformDatabaseBackup)
```

**Source-traced behavior:** See [Super Admin audit, security, settings, monitoring and backup APIs](../API_DOMAIN_CONTRACTS/superadmin-operations-and-backups.md) for platform-only backup lookup, path handling and download responses.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-495 — POST /api/superadmin/users/accounts

**Contract status:** PARTIALLY VERIFIED<br>
**Router:** [superAdminUserRoutes.js](../../server/routes/superAdminUserRoutes.js) · [route module explanation](../code-explanations/backend/routes/superAdminUserRoutes.md)<br>
**Mounted inventory entry:** 495 of 629<br>
**Route declaration pipeline:** `createCompanyAccount`
**Router-wide middleware:** protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.post("/accounts", createCompanyAccount)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: `name`, `email`, `phone`, `password`, `role`.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `409`, `201`.
- JSON envelope keys observed: `success`, `message`, `user`.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

