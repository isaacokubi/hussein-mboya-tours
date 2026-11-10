# API endpoints: internal

This guide contains 3 mounted method/path inventory entries in the **internal** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.

## endpoint-312 — POST /api/internal/staging/seed-qa

**Contract status:** SOURCE-TRACED<br>
**Router:** [stagingSuperAdminBootstrapRoutes.js](../../server/routes/internal/stagingSuperAdminBootstrapRoutes.js) · [route module explanation](../code-explanations/backend/routes/stagingSuperAdminBootstrapRoutes.md)<br>
**Mounted inventory entry:** 312 of 629<br>
**Route declaration pipeline:** `seedLimiter`, `createStagingQaSeedHandler`
**Authentication evidence:** No standard `protect` guard is visible in route/router middleware. This alone does not prove public access; inspect handler-level checks and global middleware.

**Source declaration:**

```js
router.post("/seed-qa", seedLimiter, createStagingQaSeedHandler({ environment, mongooseClient, seed, models }))
```


**Source-traced contract:** See [restricted staging maintenance](../API_DOMAIN_CONTRACTS/staging-maintenance.md) for environment, token, effects and failure requirements.
## endpoint-313 — GET /api/internal/staging/verify-qa

**Contract status:** SOURCE-TRACED<br>
**Router:** [stagingSuperAdminBootstrapRoutes.js](../../server/routes/internal/stagingSuperAdminBootstrapRoutes.js) · [route module explanation](../code-explanations/backend/routes/stagingSuperAdminBootstrapRoutes.md)<br>
**Mounted inventory entry:** 313 of 629<br>
**Route declaration pipeline:** `seedLimiter`, `createStagingQaVerifyHandler`
**Authentication evidence:** No standard `protect` guard is visible in route/router middleware. This alone does not prove public access; inspect handler-level checks and global middleware.

**Source declaration:**

```js
router.get("/verify-qa", seedLimiter, createStagingQaVerifyHandler({ environment, mongooseClient, verify, models }))
```


**Source-traced contract:** See [restricted staging maintenance](../API_DOMAIN_CONTRACTS/staging-maintenance.md) for environment, token, effects and failure requirements.
## endpoint-314 — POST /api/internal/staging/reset-tenant-admin-password

**Contract status:** SOURCE-TRACED<br>
**Router:** [stagingSuperAdminBootstrapRoutes.js](../../server/routes/internal/stagingSuperAdminBootstrapRoutes.js) · [route module explanation](../code-explanations/backend/routes/stagingSuperAdminBootstrapRoutes.md)<br>
**Mounted inventory entry:** 314 of 629<br>
**Route declaration pipeline:** `resetLimiter`, `createStagingTenantAdminPasswordResetHandler`
**Authentication evidence:** No standard `protect` guard is visible in route/router middleware. This alone does not prove public access; inspect handler-level checks and global middleware.

**Source declaration:**

```js
router.post("/reset-tenant-admin-password", resetLimiter, createStagingTenantAdminPasswordResetHandler({ environment, mongooseClient, userSchema }))
```


**Source-traced contract:** See [restricted staging maintenance](../API_DOMAIN_CONTRACTS/staging-maintenance.md) for environment, token, effects and failure requirements.