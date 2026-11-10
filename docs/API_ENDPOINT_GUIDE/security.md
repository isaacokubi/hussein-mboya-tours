# API endpoints: security

This guide contains 2 mounted method/path inventory entries in the **security** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.

## endpoint-379 — GET /api/security/status

**Contract status:** SOURCE-TRACED<br>
**Router:** [securityRoutes.js](../../server/routes/securityRoutes.js) · [route module explanation](../code-explanations/backend/routes/securityRoutes.md)<br>
**Mounted inventory entry:** 379 of 629<br>
**Route declaration pipeline:** `protect`, `checkPermission`, `getSecurityStatus`
**Router-wide middleware:** resolveTenant
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** checkPermission`

**Source declaration:**

```js
router.get(
  "/status",
  protect,
  checkPermission("system.security"),
  getSecurityStatus
)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `500`.
- JSON envelope keys observed: `success`, `message`.


**Source-traced contract:** See [security status and event contracts](../API_DOMAIN_CONTRACTS/security-status.md) for query scope and response semantics.
## endpoint-380 — GET /api/security/events

**Contract status:** SOURCE-TRACED<br>
**Router:** [securityRoutes.js](../../server/routes/securityRoutes.js) · [route module explanation](../code-explanations/backend/routes/securityRoutes.md)<br>
**Mounted inventory entry:** 380 of 629<br>
**Route declaration pipeline:** `protect`, `checkPermission`, `getSecurityEvents`
**Router-wide middleware:** resolveTenant
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** checkPermission`

**Source declaration:**

```js
router.get(
  "/events",
  protect,
  checkPermission("system.security"),
  getSecurityEvents
)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: none detected; query parameters read: none detected.
- Literal HTTP statuses in handler: `500`.
- JSON envelope keys observed: `success`, `message`.


**Source-traced contract:** See [security status and event contracts](../API_DOMAIN_CONTRACTS/security-status.md) for query scope and response semantics.