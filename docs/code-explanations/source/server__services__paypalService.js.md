# Source explanation: server/services/paypalService.js

**Source:** [server/services/paypalService.js](../../../server/services/paypalService.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `decryptSecret` from `../models/PaymentGatewayConfig.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/PaymentGatewayConfig.js](../../../server/models/PaymentGatewayConfig.js)

## Runtime declarations and data flow

### `normalizePaypalEnvironment` — lines 9–12

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 10:** `const environment = String(value || "").trim().toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 11:** `return Object.hasOwn(API_ROOT, environment) ? environment : "";` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getPaypalEnvironmentSettings` — lines 14–30

Parameters: `config (defaulted)`, `environment (defaulted)`.
Error control: try=true, catch=false, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 15:** `const selected = normalizePaypalEnvironment(environment);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 16:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 17:** `const prefix = selected === "sandbox" ? "sandbox" : "production";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 18:** `let clientId = "";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 19:** Sensitive-configuration/data operation; inspect source without copying secret values. — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 20:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 24:** Sensitive-configuration/data operation; inspect source without copying secret values. — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 26:** `const webhookId = String(config[\`${prefix}PaypalWebhookId\`] || "").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 27:** `const merchantId = String(config[\`${prefix}PaypalMerchantId\`] || "").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 28:** `const validatedAt = config[\`${prefix}PaypalValidatedAt\`] || null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 29:** Sensitive-configuration/data operation; inspect source without copying secret values. — Exits this function and supplies its result (or response short-circuit) to the caller.

### `request` — lines 32–42

Parameters: `url`, `options (defaulted)`, `fetchImpl (defaulted)`.
2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=false, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 33:** `const response = await fetchImpl(url, { ...options, signal: AbortSignal.timeout(PAYPAL_TIMEOUT_MS), redirect: "error" });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 34:** `const body = await response.json().catch(() => ({}));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 35:** `if (!response.ok) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 36:** `const error = new Error("PayPal could not complete the request.");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 39:** `throw error;` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 41:** `return body;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getPaypalAccessToken` — lines 44–55

Parameters: `config`, `fetchImpl (defaulted)`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 45:** `const env = normalizePaypalEnvironment(config?.environment);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 46:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 47:** Sensitive-configuration/data operation; inspect source without copying secret values. — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 48:** Sensitive-configuration/data operation; inspect source without copying secret values. — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 53:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 54:** Sensitive-configuration/data operation; inspect source without copying secret values. — Exits this function and supplies its result (or response short-circuit) to the caller.

### `paypalApiRequest` — lines 57–69

Parameters: `config`, `path`, `arg3 (defaulted)`, `fetchImpl (defaulted)`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller.

Key statements:
- **Line 58:** `const environment = normalizePaypalEnvironment(config?.environment);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 59:** Sensitive-configuration/data operation; inspect source without copying secret values. — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 60:** `return request(\`${API_ROOT[environment]}${path}\`, {` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `verifyPaypalWebhook` — lines 71–86

Parameters: `{config, headers, event, fetchImpl}`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 72:** `if (!config?.webhookId) return false;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 73:** `const requiredHeaders = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 80:** `if (Object.values(requiredHeaders).some((value) => !value)) return false;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 81:** `const result = await paypalApiRequest(config, "/v1/notifications/verify-webhook-signature", {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 85:** `return result?.verification_status === "SUCCESS";` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getPaypalApiRoot` — lines 88–88

Parameters: `environment`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 3: `const PAYPAL_TIMEOUT_MS = 10000;`.
- Line 4: `const API_ROOT = Object.freeze({`.
- Line 9: `export const normalizePaypalEnvironment = (value) => {`.
- Line 10: `const environment = String(value || "").trim().toLowerCase();`.
- Line 14: `export const getPaypalEnvironmentSettings = (config = {}, environment = config.environment) => {`.
- Line 15: `const selected = normalizePaypalEnvironment(environment);`.
- Line 17: `const prefix = selected === "sandbox" ? "sandbox" : "production";`.
- Line 18: `let clientId = "";`.
- Line 19: `<sensitive declaration redacted>`.
- Line 26: `const webhookId = String(config[\`${prefix}PaypalWebhookId\`] || "").trim();`.
- Line 27: `const merchantId = String(config[\`${prefix}PaypalMerchantId\`] || "").trim();`.
- Line 28: `const validatedAt = config[\`${prefix}PaypalValidatedAt\`] || null;`.
- Line 32: `const request = async (url, options = {}, fetchImpl = fetch) => {`.
- Line 33: `const response = await fetchImpl(url, { ...options, signal: AbortSignal.timeout(PAYPAL_TIMEOUT_MS), redirect: "error" });`.
- Line 34: `const body = await response.json().catch(() => ({}));`.
- Line 36: `const error = new Error("PayPal could not complete the request.");`.
- Line 44: `<sensitive declaration redacted>`.
- Line 45: `const env = normalizePaypalEnvironment(config?.environment);`.
- Line 47: `<sensitive declaration redacted>`.
- Line 48: `<sensitive declaration redacted>`.
- Line 57: `export const paypalApiRequest = async (config, path, { method = "GET", body, requestId } = {}, fetchImpl = fetch) => {`.
- Line 58: `const environment = normalizePaypalEnvironment(config?.environment);`.
- Line 59: `<sensitive declaration redacted>`.
- Line 71: `export const verifyPaypalWebhook = async ({ config, headers, event, fetchImpl = fetch }) => {`.
- Line 73: `const requiredHeaders = {`.
- Line 81: `const result = await paypalApiRequest(config, "/v1/notifications/verify-webhook-signature", {`.
- Line 88: `export const getPaypalApiRoot = (environment) => API_ROOT[normalizePaypalEnvironment(environment)] || "";`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
