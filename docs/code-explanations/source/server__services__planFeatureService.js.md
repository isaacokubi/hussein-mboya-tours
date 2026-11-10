# Source explanation: server/services/planFeatureService.js

**Source:** [server/services/planFeatureService.js](../../../server/services/planFeatureService.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `SystemSetting` from `../models/SystemSetting.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/SystemSetting.js](../../../server/models/SystemSetting.js)
- `runWithTenant` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)

## Runtime declarations and data flow

### `feature` — lines 10–10

Parameters: `id`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `normalize` — lines 18–18

Parameters: `items (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `configuredPlanFeatures` — lines 19–19

Parameters: `configured`, `plan`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `getPlanFeatures` — lines 20–20

Parameters: none.
Persistent operations detected: SystemSetting.findOne; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller.

Key statements:
- **Line 20:** `async () => runWithTenant({ role: "super_admin", bypass: true }, async () => { const settings = await SystemSetting.findOne({ tenantId: null, key: "platform" }).lean(); const configured = settings?.subscriptionPlanFeatur` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `getPlanFeatureCatalog` — lines 21–21

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `getTenantPlanFeatures` — lines 22–22

Parameters: `plan`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller.

Key statements:

### `tenantHasFeature` — lines 23–23

Parameters: `plan`, `featureId`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller.

Key statements:

### `validatePlanFeatures` — lines 24–24

Parameters: `input`.
4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:

## Module-level declarations

- Line 4: `export const PLAN_ORDER = Object.freeze(["starter", "professional", "business", "enterprise"]);`.
- Line 5: `export const PLAN_FEATURE_CATALOG = Object.freeze([`.
- Line 9: `const FEATURE_IDS = new Set(PLAN_FEATURE_CATALOG.map(([id]) => id));`.
- Line 10: `const feature = (id) => id;`.
- Line 11: `export const DEFAULT_PLAN_FEATURES = Object.freeze({`.
- Line 18: `const normalize = (items = []) => [...new Set(items.map((item) => String(item || "").trim().toLowerCase()).filter((item) => FEATURE_IDS.has(item)))];`.
- Line 19: `const configuredPlanFeatures = (configured, plan) => { const value = typeof configured?.get === "function" ? configured.get(plan) : configured?.[plan]; return Array.isArray(value) `.
- Line 20: `export const getPlanFeatures = async () => runWithTenant({ role: "super_admin", bypass: true }, async () => { const settings = await SystemSetting.findOne({ tenantId: null, key: "p`.
- Line 21: `export const getPlanFeatureCatalog = () => PLAN_FEATURE_CATALOG.map(([id, name, description]) => ({ id, name, description }));`.
- Line 22: `export const getTenantPlanFeatures = async (plan) => { const normalized = String(plan || "starter").toLowerCase(); const all = await getPlanFeatures(); return all[normalized] || al`.
- Line 23: `export const tenantHasFeature = async (plan, featureId) => (await getTenantPlanFeatures(plan)).includes(String(featureId || "").trim().toLowerCase());`.
- Line 24: `export const validatePlanFeatures = (input) => { const output = {}; for (const plan of PLAN_ORDER) { if (!Array.isArray(input?.[plan])) throw new Error(\`${plan} features must be a`.
- Line 25: `export const planFeature = feature;`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
