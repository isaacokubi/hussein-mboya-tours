# Source explanation: server/services/mpesaGatewaySettings.js

**Source:** [server/services/mpesaGatewaySettings.js](../../../server/services/mpesaGatewaySettings.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `isIP` from `node:net`. This dependency supplies the imported behavior; inspect the linked local module for its contract.

## Runtime declarations and data flow

### `parseHttpsUrl` — lines 5–19

Parameters: `value`.
Error control: try=true, catch=false, finally=false. 6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 6:** `let url;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 7:** `try { url = new URL(String(value || "").trim()); } catch { return null; }` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 8:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 9:** `if (url.port && url.port !== "443") return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 10:** `if (url.search) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 11:** `if (url.pathname.replace(/\/$/, "") !== CALLBACK_PATH) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 12:** `const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 13:** `if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".") || !host.includes(".")) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 17:** `if (isIP(host)) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 18:** `return url;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getProductionMpesaCallbackUrl` — lines 21–34

Parameters: `environment (defaulted)`.
Error control: try=true, catch=false, finally=false. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 22:** `const explicit = String(environment.MPESA_PRODUCTION_CALLBACK_URL || "").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 23:** `if (explicit) return explicit;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 24:** `if (String(environment.DEPLOYMENT_ENV || "").trim().toLowerCase() === "staging") return "";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 25:** `const legacy = String(environment.MPESA_CALLBACK_URL || "").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 26:** `if (legacy) return legacy;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 27:** `if (String(environment.NODE_ENV || "").toLowerCase() === "production" && environment.RENDER_EXTERNAL_URL) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 28:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 29:** `const origin = new URL(environment.RENDER_EXTERNAL_URL).origin;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 30:** `return \`${origin}${CALLBACK_PATH}\`;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 33:** `return "";` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getSandboxMpesaCallbackUrl` — lines 36–44

Parameters: `environment (defaulted)`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 37:** `const explicit = String(environment.MPESA_SANDBOX_CALLBACK_URL || "").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 38:** `if (explicit) return explicit;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 43:** `return getProductionMpesaCallbackUrl(environment);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `validateMpesaGatewaySettings` — lines 46–61

Parameters: `{environment, callbackUrl}`, `options (defaulted)`.
6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 47:** `if (!["sandbox", "production"].includes(String(environment || "").toLowerCase())) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 48:** `return "Environment must be sandbox or production.";` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 50:** `const callback = parseHttpsUrl(callbackUrl);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 51:** `if (!callback) return \`Callback URL must be a public HTTPS URL ending in ${CALLBACK_PATH}.\`;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 52:** `if (String(environment).toLowerCase() === "sandbox") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 53:** `const sandboxCallbackUrl = options.sandboxCallbackUrl ?? options.productionCallbackUrl ?? getSandboxMpesaCallbackUrl(options.processEnv);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 54:** `const sandboxCallback = parseHttpsUrl(sandboxCallbackUrl);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 55:** `if (!sandboxCallback) return "A valid Sandbox callback host must be configured before saving Sandbox settings.";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 56:** `if (callback.origin.toLowerCase() !== sandboxCallback.origin.toLowerCase()) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 57:** `return \`Sandbox callback host must match the configured Sandbox host (${sandboxCallback.host}). Set MPESA_SANDBOX_CALLBACK_URL for a dedicated Sandbox API, or use the explicitly configured shared callback host.\`;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 60:** `return null;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getEnvironmentMpesaSettings` — lines 63–74

Parameters: `config (defaulted)`, `environment (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 64:** `const prefix = environment === "production" ? "production" : "sandbox";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 65:** `const legacyApplies = (config.environment || "sandbox") === prefix;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 66:** `return {` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `safeMpesaGatewayView` — lines 76–94

Parameters: `config (defaulted)`, `environment (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 77:** `const envConfig = getEnvironmentMpesaSettings(config, environment);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 78:** `return ({` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 3: `const CALLBACK_PATH = "/api/mpesa/callback";`.
- Line 5: `const parseHttpsUrl = (value) => {`.
- Line 6: `let url;`.
- Line 12: `const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");`.
- Line 21: `export const getProductionMpesaCallbackUrl = (environment = process.env) => {`.
- Line 22: `const explicit = String(environment.MPESA_PRODUCTION_CALLBACK_URL || "").trim();`.
- Line 25: `const legacy = String(environment.MPESA_CALLBACK_URL || "").trim();`.
- Line 29: `const origin = new URL(environment.RENDER_EXTERNAL_URL).origin;`.
- Line 36: `export const getSandboxMpesaCallbackUrl = (environment = process.env) => {`.
- Line 37: `const explicit = String(environment.MPESA_SANDBOX_CALLBACK_URL || "").trim();`.
- Line 46: `export const validateMpesaGatewaySettings = ({ environment, callbackUrl }, options = {}) => {`.
- Line 50: `const callback = parseHttpsUrl(callbackUrl);`.
- Line 53: `const sandboxCallbackUrl = options.sandboxCallbackUrl ?? options.productionCallbackUrl ?? getSandboxMpesaCallbackUrl(options.processEnv);`.
- Line 54: `const sandboxCallback = parseHttpsUrl(sandboxCallbackUrl);`.
- Line 63: `export const getEnvironmentMpesaSettings = (config = {}, environment = config.environment || "sandbox") => {`.
- Line 64: `const prefix = environment === "production" ? "production" : "sandbox";`.
- Line 65: `const legacyApplies = (config.environment || "sandbox") === prefix;`.
- Line 76: `export const safeMpesaGatewayView = (config = {}, environment = config.environment || "sandbox") => {`.
- Line 77: `const envConfig = getEnvironmentMpesaSettings(config, environment);`.

## Security, errors and performance checkpoints

- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
