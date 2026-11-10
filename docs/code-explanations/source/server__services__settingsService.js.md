# Source explanation: server/services/settingsService.js

**Source:** [server/services/settingsService.js](../../../server/services/settingsService.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `SystemSetting` from `../models/SystemSetting.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/SystemSetting.js](../../../server/models/SystemSetting.js)
- `PaymentGatewayConfig` from `../models/PaymentGatewayConfig.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/PaymentGatewayConfig.js](../../../server/models/PaymentGatewayConfig.js)
- `getPaypalEnvironmentSettings` from `./paypalService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/paypalService.js](../../../server/services/paypalService.js)
- `isPaypalCurrencySupported` from `./tenantPaymentMethods.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/tenantPaymentMethods.js](../../../server/services/tenantPaymentMethods.js)

## Runtime declarations and data flow

### `resolveTenantId` — lines 56–56

Parameters: `source`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `getSystemSettings` — lines 58–81

Parameters: `source (defaulted)`.
Persistent operations detected: SystemSetting.findOne, PaymentGatewayConfig.findOne; verify tenant/ownership filters in the exact query. 4 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=false, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 59:** `const tenantId = resolveTenantId(source);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 61:** `if (!tenantId) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 62:** `const platformSettings = await SystemSetting.findOne({ tenantId: null, key: "platform" }).lean().catch(() => null);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 63:** `if (platformSettings) return { ...DEFAULT_SETTINGS, ...platformSettings, _tenantScoped: false, _platformScoped: true };` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 65:** `return { ...DEFAULT_SETTINGS, _isDefault: true, _tenantScoped: false, _platformScoped: false };` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 68:** `let settings = await SystemSetting.findOne({ tenantId, key: "default" }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 69:** `if (!settings) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 77:** `const paypal = await PaymentGatewayConfig.findOne({ tenantId, provider: "PAYPAL" }).lean().catch(() => null);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 78:** `const paypalEnv = getPaypalEnvironmentSettings(paypal || {}, paypal?.environment);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 79:** `const paypalAvailable = Boolean(paypal?.enabled && paypalEnv.configured && paypalEnv.validatedAt && isPaypalCurrencySupported(settings?.currency || DEFAULT_SETTINGS.currency) && (paypal?.environment !== "production" || p` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 80:** `return { ...DEFAULT_SETTINGS, ...settings, paypalAvailable, enablePaypal: paypalAvailable, tenantId, _tenantScoped: true, _platformScoped: false };` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `updateSystemSettings` — lines 83–102

Parameters: `source (defaulted)`, `updates (defaulted)`.
3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 84:** `const tenantId = resolveTenantId(source);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 85:** `const allowedFields = Object.keys(DEFAULT_SETTINGS);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 86:** `const safeUpdates = {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 87:** `for (const field of allowedFields) if (Object.prototype.hasOwnProperty.call(updates, field)) safeUpdates[field] = updates[field];` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 89:** `if (!tenantId) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 90:** `return SystemSetting.findOneAndUpdate(` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 97:** `return SystemSetting.findOneAndUpdate(` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 6: `const DEFAULT_SETTINGS = {`.
- Line 56: `const resolveTenantId = (source) => source?.tenantId || source?.user?.tenantId || (source?.user?._id && source?.tenantId) || null;`.
- Line 59: `const tenantId = resolveTenantId(source);`.
- Line 62: `const platformSettings = await SystemSetting.findOne({ tenantId: null, key: "platform" }).lean().catch(() => null);`.
- Line 68: `let settings = await SystemSetting.findOne({ tenantId, key: "default" }).lean();`.
- Line 77: `const paypal = await PaymentGatewayConfig.findOne({ tenantId, provider: "PAYPAL" }).lean().catch(() => null);`.
- Line 78: `const paypalEnv = getPaypalEnvironmentSettings(paypal || {}, paypal?.environment);`.
- Line 79: `const paypalAvailable = Boolean(paypal?.enabled && paypalEnv.configured && paypalEnv.validatedAt && isPaypalCurrencySupported(settings?.currency || DEFAULT_SETTINGS.currency) && (p`.
- Line 84: `const tenantId = resolveTenantId(source);`.
- Line 85: `const allowedFields = Object.keys(DEFAULT_SETTINGS);`.
- Line 86: `const safeUpdates = {};`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
