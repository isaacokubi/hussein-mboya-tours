# Source explanation: server/middleware/tenantMiddleware.js

**Source:** [server/middleware/tenantMiddleware.js](../../../server/middleware/tenantMiddleware.js)

## Purpose

Express middleware that runs in a request pipeline, inspecting or enriching the request, rejecting it, or calling next().

## Imports and dependencies

- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `jwt` from `jsonwebtoken`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Organization` from `../models/Organization.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Organization.js](../../../server/models/Organization.js)
- `env` from `../config/env.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/config/env.js](../../../server/config/env.js)
- `runWithTenant` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `isTenantSubdomainHost` from `../utils/tenantHost.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/utils/tenantHost.js](../../../server/utils/tenantHost.js)
- `getConfiguredOrigins` from `../config/corsPolicy.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/config/corsPolicy.js](../../../server/config/corsPolicy.js)

## Runtime declarations and data flow

### `normalizeHost` — lines 10–10

Parameters: `value (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `getOriginHost` — lines 11–11

Parameters: `value (defaulted)`.
Error control: try=true, catch=false, finally=false.

Key statements:

### `normalizeRole` — lines 12–12

Parameters: `value (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `isLoginRequest` — lines 14–14

Parameters: `req`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `isSubscriptionRequest` — lines 15–15

Parameters: `req`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `verifyAccessToken` — lines 16–16

Parameters: `token`, `secret`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `getVerifiedTokenClaims` — lines 17–17

Parameters: `req`.
Error control: try=true, catch=false, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:

### `resolveLoginTenantByUniqueEmail` — lines 18–18

Parameters: `req`.
Reads request/component inputs: req.body. Persistent operations detected: Organization.findOne; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 18:** `async function resolveLoginTenantByUniqueEmail(req) { if (!isLoginRequest(req)) return null; const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : ""; if (!email || !mongoose.connectio` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `resolveTenant` — lines 19–59

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.tenantId, req.tenant, req.user. Persistent operations detected: Organization.findOne, Organization.find; verify tenant/ownership filters in the exact query. 11 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 27 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 24:** Sensitive-configuration/data operation; inspect source without copying secret values. — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 25:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 26:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 27:** `const user = req.user; const normalizedRole = normalizeRole(user?.role); if (PLATFORM_ROLES.has(normalizedRole)) return runWithTenant({ role: "super_admin", bypass: true }, () => next()); if (user?.tenantId) return runWi` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 28:** `const requestedTenantId = String(req.get("X-Tenant-ID") || "").trim(); const requestedTenantSlug = String(req.get("X-Tenant-Slug") || "").trim().toLowerCase(); const requestedTenantKey = String(req.get("X-Tenant-Key") ||` — Reads runtime/build configuration; never expose secret values through logs or browser-bundled variables.
- **Line 29:** `const resolveHost = async (host) => { if (!host || platformHosts.has(host)) return null; const platformSuffix = \`.${configuredPlatformHost}\`; if (host.endsWith(platformSuffix)) { const parts = host.slice(0, -platformSu` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 30:** `tenant = await resolveHost(requestHost); if (!tenant && originHost) tenant = await resolveHost(originHost); if (!tenant && originHost.endsWith(".vercel.app")) { const vercelSlug = originHost.slice(0, -".vercel.app".lengt` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 31:** `if (tenant && requestedTenantId && String(tenant._id) !== requestedTenantId) return res.status(404).json({ success: false, message: "Tenant not found." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 32:** `if (tenant && requestedTenantSlug && String(tenant.slug || "").toLowerCase() !== requestedTenantSlug) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 33:** `return res.status(404).json({ success: false, message: "Tenant not found." });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 35:** `if (tenant && requestedTenantKey && String(tenant._id) !== requestedTenantKey && String(tenant.slug || "").toLowerCase() !== requestedTenantKey.toLowerCase()) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 36:** `return res.status(404).json({ success: false, message: "Tenant not found." });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 38:** `if (!tenant && explicitTenantRequested) return res.status(404).json({ success: false, message: "Tenant not found." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 39:** `if (!tenant) tenant = await resolveLoginTenantByUniqueEmail(req);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 40:** `const integrationRequest = String(req.originalUrl || req.path || "").toLowerCase().startsWith("/api/integrations/v1/");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 41:** `const platformSuffix = \`.${configuredPlatformHost}\`;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 42:** `const tenantHostRequested = !platformHosts.has(requestHost) && isTenantSubdomainHost(requestHost, configuredPlatformHost)` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 47:** `const configuredFrontendOrigin = getConfiguredOrigins(env).includes(String(req.get("Origin") || ""));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `resolveHost` — lines 29–29

Parameters: `host`.
Persistent operations detected: Organization.findOne; verify tenant/ownership filters in the exact query. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 29:** `async (host) => { if (!host || platformHosts.has(host)) return null; const platformSuffix = \`.${configuredPlatformHost}\`; if (host.endsWith(platformSuffix)) { const parts = host.slice(0, -platformSuffix.length).split("` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.

## Module-level declarations

- Line 9: `const PLATFORM_ROLES = new Set(["super_admin", "superadmin"]);`.
- Line 10: `const normalizeHost = (value = "") => String(value).split(",")[0].trim().toLowerCase().replace(/:\d+$/, "");`.
- Line 11: `const getOriginHost = (value = "") => { try { return normalizeHost(new URL(String(value)).hostname); } catch { return ""; } };`.
- Line 12: `const normalizeRole = (value = "") => String(value || "").trim().toLowerCase().replace(/[\s-]+/g, "_");`.
- Line 13: `const JWT_ISSUER = "husseinmboyatours"; const JWT_AUDIENCE = "husseinmboyatours-client";`.
- Line 14: `const isLoginRequest = (req) => { const paths = [req.path, req.originalUrl].filter(Boolean).map((value) => String(value).toLowerCase().split("?")[0]); return req.method === "POST" `.
- Line 15: `const isSubscriptionRequest = (req) => String(req.originalUrl || req.path || "").toLowerCase().includes("/subscription");`.
- Line 16: `<sensitive declaration redacted>`.
- Line 17: `<sensitive declaration redacted>`.
- Line 24: `<sensitive declaration redacted>`.
- Line 27: `const user = req.user; const normalizedRole = normalizeRole(user?.role); if (PLATFORM_ROLES.has(normalizedRole)) return runWithTenant({ role: "super_admin", bypass: true }, () => n`.
- Line 28: `const requestedTenantId = String(req.get("X-Tenant-ID") || "").trim(); const requestedTenantSlug = String(req.get("X-Tenant-Slug") || "").trim().toLowerCase(); const requestedTenan`.
- Line 29: `const resolveHost = async (host) => { if (!host || platformHosts.has(host)) return null; const platformSuffix = \`.${configuredPlatformHost}\`; if (host.endsWith(platformSuffix)) {`.
- Line 40: `const integrationRequest = String(req.originalUrl || req.path || "").toLowerCase().startsWith("/api/integrations/v1/");`.
- Line 41: `const platformSuffix = \`.${configuredPlatformHost}\`;`.
- Line 42: `const tenantHostRequested = !platformHosts.has(requestHost) && isTenantSubdomainHost(requestHost, configuredPlatformHost)`.
- Line 47: `const configuredFrontendOrigin = getConfiguredOrigins(env).includes(String(req.get("Origin") || ""));`.
- Line 48: `const customOriginRequested = Boolean(originHost && !platformHosts.has(originHost) && !originHost.endsWith(platformSuffix) && !integrationRequest && !configuredFrontendOrigin);`.
- Line 52: `const fallbackSlug = String(process.env.DEFAULT_PUBLIC_TENANT_SLUG || process.env.PUBLIC_TENANT_SLUG || "").trim().toLowerCase();`.
- Line 57: `const allowSingleTenantDevFallback = String(process.env.ALLOW_SINGLE_TENANT_DEV_FALLBACK || "").toLowerCase() === "true"; if (!tenant && allowSingleTenantDevFallback) { const tenan`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
