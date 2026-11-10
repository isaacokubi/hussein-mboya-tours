# API endpoints: tenant

This guide contains 4 mounted method/path inventory entries in the **tenant** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.

## endpoint-504 — GET /api/tenant

**Contract status:** PARTIALLY VERIFIED<br>
**Router:** [tenantBrandingRoutes.js](../../server/routes/tenantBrandingRoutes.js) · [route module explanation](../code-explanations/backend/routes/tenantBrandingRoutes.md)<br>
**Mounted inventory entry:** 504 of 629<br>
**Route declaration pipeline:** `getBranding`
**Router-wide middleware:** resolveTenant
**Authentication evidence:** No standard `protect` guard is visible in route/router middleware. This alone does not prove public access; inspect handler-level checks and global middleware.

**Source declaration:**

```js
router.get("/", getBranding)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `500`.
- JSON envelope keys observed: `success`, `message`.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-505 — GET /api/tenant/branding

**Contract status:** PARTIALLY VERIFIED<br>
**Router:** [tenantBrandingRoutes.js](../../server/routes/tenantBrandingRoutes.js) · [route module explanation](../code-explanations/backend/routes/tenantBrandingRoutes.md)<br>
**Mounted inventory entry:** 505 of 629<br>
**Route declaration pipeline:** `getBranding`
**Router-wide middleware:** resolveTenant
**Authentication evidence:** No standard `protect` guard is visible in route/router middleware. This alone does not prove public access; inspect handler-level checks and global middleware.

**Source declaration:**

```js
router.get("/", getBranding)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`, `500`.
- JSON envelope keys observed: `success`, `message`.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-506 — PUT /api/tenant

**Contract status:** PARTIALLY VERIFIED<br>
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

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `409`, `500`.
- JSON envelope keys observed: `success`, `message`.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

## endpoint-507 — PUT /api/tenant/branding

**Contract status:** PARTIALLY VERIFIED<br>
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

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `409`, `500`.
- JSON envelope keys observed: `success`, `message`.

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

