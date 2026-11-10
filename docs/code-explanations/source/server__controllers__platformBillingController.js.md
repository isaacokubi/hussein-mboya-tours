# Source explanation: server/controllers/platformBillingController.js

**Source:** [server/controllers/platformBillingController.js](../../../server/controllers/platformBillingController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `SystemSetting` from `../models/SystemSetting.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/SystemSetting.js](../../../server/models/SystemSetting.js)
- `runWithTenant` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `hasLegacyMpesaConfig`, `mpesaConfig` from `../config/mpesa.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/config/mpesa.js](../../../server/config/mpesa.js)
- `PLAN_FEATURE_CATALOG`, `PLAN_ORDER`, `getPlanFeatures`, `validatePlanFeatures` from `../services/planFeatureService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/planFeatureService.js](../../../server/services/planFeatureService.js)

## Runtime declarations and data flow

### `envPrices` — lines 7–7

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `paymentStatus` — lines 8–8

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `readPlatformSettings` — lines 9–9

Parameters: none.
Persistent operations detected: SystemSetting.findOne; verify tenant/ownership filters in the exact query.

Key statements:
- **Line 9:** `() => runWithTenant({ role: "super_admin", bypass: true }, () => SystemSetting.findOne({ tenantId: null, key: "platform" }).lean())` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.

### `writePlatformSettings` — lines 10–10

Parameters: `work`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `getPlatformBillingConfig` — lines 12–20

Parameters: `req`, `res`, `next`.
2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 13:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 14:** `const settings = await readPlatformSettings();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 15:** `const env = envPrices();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 16:** `const prices = Object.fromEntries(Object.entries(PRICE_FIELDS).map(([plan, field]) => [plan, Number(settings?.[field] ?? env[plan] ?? 0)]));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 17:** `const features = await getPlanFeatures();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 18:** `return res.json({ success: true, prices, currency: "KES", mpesa: paymentStatus(), features, featureCatalog: PLAN_FEATURE_CATALOG.map(([id, name, description]) => ({ id, name, description })) });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `updatePlatformBillingConfig` — lines 22–46

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body. Persistent operations detected: SystemSetting.findOne; verify tenant/ownership filters in the exact query. 4 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 23:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 24:** `const result = await writePlatformSettings(async () => {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 25:** `let settings = await SystemSetting.findOne({ tenantId: null, key: "platform" });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 26:** `if (!settings) settings = new SystemSetting({ tenantId: null, key: "platform", companyName: "Global Tours" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 27:** `const values = {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 28:** `for (const [plan, field] of Object.entries(PRICE_FIELDS)) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 29:** `const value = Number(req.body?.[plan]);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 30:** `if (!Number.isInteger(value) || value < 0 || value > 100000000) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 31:** `const error = new Error(\`${plan} price must be a whole KES amount between 0 and 100,000,000.\`);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 33:** `throw error;` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 37:** `const rawFeatures = req.body?.features;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 38:** `const features = rawFeatures === undefined ? await getPlanFeatures() : validatePlanFeatures(rawFeatures);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 41:** `await settings.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 42:** `return { prices: Object.fromEntries(Object.entries(PRICE_FIELDS).map(([plan, field]) => [plan, Number(settings[field] || 0)])), features };` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 44:** `return res.json({ success: true, message: "Subscription pricing and plan features saved successfully.", prices: result.prices, features: result.features, currency: "KES", mpesa: paymentStatus() });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getPlatformPlanFeatureCatalog` — lines 48–51

Parameters: `req`, `res`, `next`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 49:** `try { return res.json({ success: true, plans: await getPlanFeatures(), catalog: PLAN_FEATURE_CATALOG.map(([id, name, description]) => ({ id, name, description })) }); }` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 50:** `catch (error) { next(error); }` — Handles an exception from the preceding try block; check whether it returns, rethrows, logs safely, or continues.

## Module-level declarations

- Line 6: `const PRICE_FIELDS = { starter: "tenantPlanStarterPriceKes", professional: "tenantPlanProfessionalPriceKes", business: "tenantPlanBusinessPriceKes", enterprise: "tenantPlanEnterpri`.
- Line 7: `const envPrices = () => ({ starter: Number(process.env.TENANT_PLAN_STARTER_PRICE_KES || 0), professional: Number(process.env.TENANT_PLAN_PROFESSIONAL_PRICE_KES || 0), business: Num`.
- Line 8: `const paymentStatus = () => ({ provider: "mpesa", environment: mpesaConfig.environment, configured: hasLegacyMpesaConfig(), callbackConfigured: Boolean(mpesaConfig.callbackUrl), sh`.
- Line 9: `const readPlatformSettings = () => runWithTenant({ role: "super_admin", bypass: true }, () => SystemSetting.findOne({ tenantId: null, key: "platform" }).lean());`.
- Line 10: `const writePlatformSettings = (work) => runWithTenant({ role: "super_admin", bypass: true }, work);`.
- Line 12: `export const getPlatformBillingConfig = async (req, res, next) => {`.
- Line 14: `const settings = await readPlatformSettings();`.
- Line 15: `const env = envPrices();`.
- Line 16: `const prices = Object.fromEntries(Object.entries(PRICE_FIELDS).map(([plan, field]) => [plan, Number(settings?.[field] ?? env[plan] ?? 0)]));`.
- Line 17: `const features = await getPlanFeatures();`.
- Line 22: `export const updatePlatformBillingConfig = async (req, res, next) => {`.
- Line 24: `const result = await writePlatformSettings(async () => {`.
- Line 25: `let settings = await SystemSetting.findOne({ tenantId: null, key: "platform" });`.
- Line 27: `const values = {};`.
- Line 29: `const value = Number(req.body?.[plan]);`.
- Line 31: `const error = new Error(\`${plan} price must be a whole KES amount between 0 and 100,000,000.\`);`.
- Line 37: `const rawFeatures = req.body?.features;`.
- Line 38: `const features = rawFeatures === undefined ? await getPlanFeatures() : validatePlanFeatures(rawFeatures);`.
- Line 48: `export const getPlatformPlanFeatureCatalog = async (req, res, next) => {`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
