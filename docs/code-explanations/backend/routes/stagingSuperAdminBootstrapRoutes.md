# Route module: stagingSuperAdminBootstrapRoutes.js

**Source:** [server/routes/internal/stagingSuperAdminBootstrapRoutes.js](../../../../server/routes/internal/stagingSuperAdminBootstrapRoutes.js)

Observed mount prefixes include `/api/internal/staging/seed-qa`, `/api/internal/staging/verify-qa`, `/api/internal/staging/reset-tenant-admin-password`.

## Router-wide middleware

No router.use declaration was found at module scope.

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### POST /seed-qa → `/api/internal/staging/seed-qa`

Declared at source line 43. Route handler pipeline names: `seedLimiter`, `createStagingQaSeedHandler`.

```js
router.post("/seed-qa", seedLimiter, createStagingQaSeedHandler({ environment, mongooseClient, seed, models }))
```

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/internal/staging/seed-qa'
```

### GET /verify-qa → `/api/internal/staging/verify-qa`

Declared at source line 44. Route handler pipeline names: `seedLimiter`, `createStagingQaVerifyHandler`.

```js
router.get("/verify-qa", seedLimiter, createStagingQaVerifyHandler({ environment, mongooseClient, verify, models }))
```

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/internal/staging/verify-qa'
```

### POST /reset-tenant-admin-password → `/api/internal/staging/reset-tenant-admin-password`

Declared at source line 52. Route handler pipeline names: `resetLimiter`, `createStagingTenantAdminPasswordResetHandler`.

```js
router.post("/reset-tenant-admin-password", resetLimiter, createStagingTenantAdminPasswordResetHandler({ environment, mongooseClient, userSchema }))
```

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X POST 'http://localhost:5000/api/internal/staging/reset-tenant-admin-password'
```

