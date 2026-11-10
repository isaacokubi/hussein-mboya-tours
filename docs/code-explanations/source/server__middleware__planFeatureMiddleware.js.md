# Source explanation: server/middleware/planFeatureMiddleware.js

**Source:** [server/middleware/planFeatureMiddleware.js](../../../server/middleware/planFeatureMiddleware.js)

## Purpose

Express middleware that runs in a request pipeline, inspecting or enriching the request, rejecting it, or calling next().

## Imports and dependencies

- `Organization` from `../models/Organization.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Organization.js](../../../server/models/Organization.js)
- `getTenantPlanFeatures` from `../services/planFeatureService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/planFeatureService.js](../../../server/services/planFeatureService.js)

## Runtime declarations and data flow

### `resolveFeatureForPath` — lines 26–34

Parameters: `path`, `search (defaulted)`.
Persistent operations detected: FEATURE_ROUTES.find; verify tenant/ownership filters in the exact query. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 27:** `const normalized = String(path || "").split("?")[0].replace(/^\/api/, "") || "/";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 28:** `if (/^\/admin\/hospitality(?:\/|$)/.test(normalized)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 29:** `const tab = new URLSearchParams(String(search || "")).get("tab");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 30:** `if (tab === "hotels") return "hotels";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 31:** `if (tab === "transfers") return "airport_transfers";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 33:** `return FEATURE_ROUTES.find(([pattern]) => pattern.test(normalized))?.[1] || null;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getPlanFeaturesForTenant` — lines 36–41

Parameters: `tenantId`.
Persistent operations detected: Organization.findById; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 37:** `const organization = await Organization.findById(tenantId).select("subscription.plan status").lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 38:** `if (!organization) return { plan: null, features: [] };` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 39:** `const plan = String(organization.subscription?.plan || "starter").toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 40:** `return { plan, features: await getTenantPlanFeatures(plan) };` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `enforcePlanFeature` — lines 43–90

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.user, req.tenantId, req.tenant. Persistent operations detected: Organization.findById; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 44:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 45:** `const role = String(req.user?.role || req.user?.legacyRole || req.userRole || "").toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 46:** `if (["super_admin", "superadmin"].includes(role)) return next();` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 47:** `const feature = resolveFeatureForPath(req.path, req.originalUrl?.includes("?") ? req.originalUrl.slice(req.originalUrl.indexOf("?")) : "");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 48:** `if (!feature) return next();` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 49:** `const tenantId = req.tenantId || req.user?.tenantId;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 50:** `if (!tenantId) return next();` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 52:** `const organization = await Organization.findById(tenantId).select("status subscription.plan subscription.trialEndsAt subscription.renewsAt").lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 53:** `if (!organization) return res.status(403).json({ success: false, code: "TENANT_NOT_FOUND", message: "The company workspace could not be resolved." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 55:** `const plan = String(organization.subscription?.plan || "starter").toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 56:** `const now = Date.now();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 57:** `const trialEndsAt = organization.subscription?.trialEndsAt ? new Date(organization.subscription.trialEndsAt).getTime() : null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 58:** `const renewsAt = organization.subscription?.renewsAt ? new Date(organization.subscription.renewsAt).getTime() : null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 59:** `const graceEndsAt = renewsAt ? renewsAt + GRACE_DAYS * DAY_MS : null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 60:** `const billingFeature = feature === "billing";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 61:** `const trialExpired = organization.status === "trial" && trialEndsAt && now > trialEndsAt;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 62:** `const paidExpired = organization.status === "active" && renewsAt && now > renewsAt;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 63:** `const withinGrace = paidExpired && graceEndsAt && now <= graceEndsAt;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 4: `const FEATURE_ROUTES = [`.
- Line 23: `const DAY_MS = 86400000;`.
- Line 24: `const GRACE_DAYS = Math.max(0, Math.min(Number(process.env.SUBSCRIPTION_GRACE_PERIOD_DAYS || 3), 30));`.
- Line 26: `export const resolveFeatureForPath = (path, search = "") => {`.
- Line 27: `const normalized = String(path || "").split("?")[0].replace(/^\/api/, "") || "/";`.
- Line 29: `const tab = new URLSearchParams(String(search || "")).get("tab");`.
- Line 36: `export const getPlanFeaturesForTenant = async (tenantId) => {`.
- Line 37: `const organization = await Organization.findById(tenantId).select("subscription.plan status").lean();`.
- Line 39: `const plan = String(organization.subscription?.plan || "starter").toLowerCase();`.
- Line 43: `export const enforcePlanFeature = async (req, res, next) => {`.
- Line 45: `const role = String(req.user?.role || req.user?.legacyRole || req.userRole || "").toLowerCase();`.
- Line 47: `const feature = resolveFeatureForPath(req.path, req.originalUrl?.includes("?") ? req.originalUrl.slice(req.originalUrl.indexOf("?")) : "");`.
- Line 49: `const tenantId = req.tenantId || req.user?.tenantId;`.
- Line 52: `const organization = await Organization.findById(tenantId).select("status subscription.plan subscription.trialEndsAt subscription.renewsAt").lean();`.
- Line 55: `const plan = String(organization.subscription?.plan || "starter").toLowerCase();`.
- Line 56: `const now = Date.now();`.
- Line 57: `const trialEndsAt = organization.subscription?.trialEndsAt ? new Date(organization.subscription.trialEndsAt).getTime() : null;`.
- Line 58: `const renewsAt = organization.subscription?.renewsAt ? new Date(organization.subscription.renewsAt).getTime() : null;`.
- Line 59: `const graceEndsAt = renewsAt ? renewsAt + GRACE_DAYS * DAY_MS : null;`.
- Line 60: `const billingFeature = feature === "billing";`.
- Line 61: `const trialExpired = organization.status === "trial" && trialEndsAt && now > trialEndsAt;`.
- Line 62: `const paidExpired = organization.status === "active" && renewsAt && now > renewsAt;`.
- Line 63: `const withinGrace = paidExpired && graceEndsAt && now <= graceEndsAt;`.
- Line 64: `const hardSuspended = ["suspended", "cancelled"].includes(String(organization.status || "").toLowerCase());`.
- Line 79: `const features = await getTenantPlanFeatures(plan);`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
