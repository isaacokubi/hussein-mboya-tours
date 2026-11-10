# Source explanation: server/services/paymentGatewayService.js

**Source:** [server/services/paymentGatewayService.js](../../../server/services/paymentGatewayService.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `PaymentGatewayConfig`, `decryptSecret` from `../models/PaymentGatewayConfig.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/PaymentGatewayConfig.js](../../../server/models/PaymentGatewayConfig.js)
- `mpesaConfig`, `hasLegacyMpesaConfig`, `getMpesaUrls` from `../config/mpesa.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/config/mpesa.js](../../../server/config/mpesa.js)
- `getEnvironmentMpesaSettings`, `validateMpesaGatewaySettings` from `./mpesaGatewaySettings.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/mpesaGatewaySettings.js](../../../server/services/mpesaGatewaySettings.js)

## Runtime declarations and data flow

### `isLegacyMpesaFallbackAllowed` — lines 6–8

Parameters: `nodeEnv`, `setting`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `gatewayConfigurationError` — lines 10–14

Parameters: `message`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `getTenantMpesaConfig` — lines 17–57

Parameters: `arg1 (defaulted)`.
Persistent operations detected: PaymentGatewayConfig.findOne; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 13 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 18:** `const tenantId = requireTenantId();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 19:** `const gateway = await PaymentGatewayConfig.findOne({ tenantId, provider: "MPESA" }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 21:** `if (gateway) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 22:** `if (!gateway.enabled && !allowDisabled) throw gatewayConfigurationError("M-Pesa is disabled for this tenant.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 23:** `const environment = String(requestedEnvironment || gateway.environment || "sandbox").toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 24:** `if (!["sandbox", "production"].includes(environment)) throw gatewayConfigurationError("M-Pesa environment must be sandbox or production.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 25:** `const environmentSettings = getEnvironmentMpesaSettings(gateway, environment);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 26:** `const config = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 38:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 39:** `throw gatewayConfigurationError("M-Pesa configuration is incomplete for this tenant.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 41:** `if (!config.callbackUrl) throw gatewayConfigurationError("M-Pesa callback URL is not configured for this tenant.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 42:** `if (!["sandbox", "production"].includes(String(config.environment).toLowerCase())) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 43:** `throw gatewayConfigurationError("M-Pesa environment must be sandbox or production.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 45:** `const callbackError = validateMpesaGatewaySettings(config);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 46:** `if (callbackError) throw gatewayConfigurationError(callbackError);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 47:** `return config;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 50:** `if (!isLegacyMpesaFallbackAllowed(process.env.NODE_ENV, process.env.ALLOW_GLOBAL_MPESA_FALLBACK) || !hasLegacyMpesaConfig()) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 51:** `throw gatewayConfigurationError("M-Pesa is not configured for this tenant.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `getTenantMpesaUrls` — lines 59–62

Parameters: `config`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 60:** `const environment = String(config?.environment || "sandbox").toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 61:** `return getMpesaUrls(environment);` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 6: `export const isLegacyMpesaFallbackAllowed = (nodeEnv, setting) => (`.
- Line 10: `const gatewayConfigurationError = (message) => Object.assign(new Error(message), {`.
- Line 17: `export const getTenantMpesaConfig = async ({ environment: requestedEnvironment = "", allowDisabled = false } = {}) => {`.
- Line 18: `const tenantId = requireTenantId();`.
- Line 19: `const gateway = await PaymentGatewayConfig.findOne({ tenantId, provider: "MPESA" }).lean();`.
- Line 23: `const environment = String(requestedEnvironment || gateway.environment || "sandbox").toLowerCase();`.
- Line 25: `const environmentSettings = getEnvironmentMpesaSettings(gateway, environment);`.
- Line 26: `const config = {`.
- Line 45: `const callbackError = validateMpesaGatewaySettings(config);`.
- Line 54: `const legacyCallbackError = validateMpesaGatewaySettings(legacyMpesaConfig);`.
- Line 59: `export const getTenantMpesaUrls = (config) => {`.
- Line 60: `const environment = String(config?.environment || "sandbox").toLowerCase();`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
