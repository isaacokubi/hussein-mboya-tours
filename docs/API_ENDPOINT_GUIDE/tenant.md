# API endpoints: tenant

This guide contains 4 mounted method/path inventory entries in the **tenant** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.

## endpoint-504 — GET /api/tenant

**Contract status:** SOURCE-TRACED<br>
**Router:** [tenantBrandingRoutes.js](../../server/routes/tenantBrandingRoutes.js) · [route module explanation](../code-explanations/backend/routes/tenantBrandingRoutes.md)<br>
**Mounted inventory entry:** 504 of 629<br>
**Route declaration pipeline:** `getBranding`
**Router-wide middleware:** resolveTenant
**Authentication evidence:** No standard `protect` guard is visible in route/router middleware. This alone does not prove public access; inspect handler-level checks and global middleware.

**Source declaration:**

```js
router.get("/", getBranding)
```

**Source-traced behavior:** See [Tenant branding API contracts and inventory reconciliation](../API_DOMAIN_CONTRACTS/tenant-branding.md) for tenant resolution, public branding response, role gate, body allowlist and Organization update behavior.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-505 — GET /api/tenant/branding

**Contract status:** SOURCE-TRACED<br>
**Router:** [tenantBrandingRoutes.js](../../server/routes/tenantBrandingRoutes.js) · [route module explanation](../code-explanations/backend/routes/tenantBrandingRoutes.md)<br>
**Mounted inventory entry:** 505 of 629<br>
**Route declaration pipeline:** `getBranding`
**Router-wide middleware:** resolveTenant
**Authentication evidence:** No standard `protect` guard is visible in route/router middleware. This alone does not prove public access; inspect handler-level checks and global middleware.

**Source declaration:**

```js
router.get("/", getBranding)
```

**Source-traced behavior:** See [Tenant branding API contracts and inventory reconciliation](../API_DOMAIN_CONTRACTS/tenant-branding.md). This listed /branding path is not mounted in the current route source; only the root path under /tenant is declared.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-506 — PUT /api/tenant

**Contract status:** SOURCE-TRACED<br>
**Router:** [tenantBrandingRoutes.js](../../server/routes/tenantBrandingRoutes.js) · [route module explanation](../code-explanations/backend/routes/tenantBrandingRoutes.md)<br>
**Mounted inventory entry:** 506 of 629<br>
**Route declaration pipeline:** `protect`, `requireRoles`, `updateBranding`
**Router-wide middleware:** resolveTenant
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** requireRoles`

**Source declaration:**

```js
router.put("/", protect, requireRoles("admin", "manager"), updateBranding)
```

**Source-traced behavior:** See [Tenant branding API contracts and inventory reconciliation](../API_DOMAIN_CONTRACTS/tenant-branding.md) for tenant resolution, public branding response, role gate, body allowlist and Organization update behavior.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-507 — PUT /api/tenant/branding

**Contract status:** SOURCE-TRACED<br>
**Router:** [tenantBrandingRoutes.js](../../server/routes/tenantBrandingRoutes.js) · [route module explanation](../code-explanations/backend/routes/tenantBrandingRoutes.md)<br>
**Mounted inventory entry:** 507 of 629<br>
**Route declaration pipeline:** `protect`, `requireRoles`, `updateBranding`
**Router-wide middleware:** resolveTenant
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** requireRoles`

**Source declaration:**

```js
router.put("/", protect, requireRoles("admin", "manager"), updateBranding)
```

**Source-traced behavior:** See [Tenant branding API contracts and inventory reconciliation](../API_DOMAIN_CONTRACTS/tenant-branding.md). This listed /branding path is not mounted in the current route source; only the root path under /tenant is declared.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

