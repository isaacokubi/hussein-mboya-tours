# Source explanation: server/services/mpesaRefundService.js

**Source:** [server/services/mpesaRefundService.js](../../../server/services/mpesaRefundService.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `axios` from `axios`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getTenantMpesaConfig`, `getTenantMpesaUrls` from `./paymentGatewayService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/paymentGatewayService.js](../../../server/services/paymentGatewayService.js)

## Runtime declarations and data flow

### `getAccessToken` — lines 4–12

Parameters: `config`, `urls`, `client (defaulted)`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 5:** Sensitive-configuration/data operation; inspect source without copying secret values. — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 6:** `const response = await client.get(urls.auth, {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 10:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 11:** Sensitive-configuration/data operation; inspect source without copying secret values. — Exits this function and supplies its result (or response short-circuit) to the caller.

### `buildRefundCallbackUrls` — lines 14–21

Parameters: `callbackUrl`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 15:** `const normalized = String(callbackUrl || "").trim().replace(/\/$/, "");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 16:** `const base = normalized.replace(/\/callback$/i, "");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 17:** `return {` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `requestMpesaRefund` — lines 23–64

Parameters: `{transactionId, client}`.
3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 24:** `const config = await getTenantMpesaConfig();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 25:** `const urls = getTenantMpesaUrls(config);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 27:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 28:** Sensitive-configuration/data operation; inspect source without copying secret values. — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 31:** `if (!config.callbackUrl) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 32:** `throw new Error("Tenant M-Pesa callback URL is not configured.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 35:** `const originalTransactionId = String(transactionId || "").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 36:** `if (!originalTransactionId) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 37:** `throw new Error("Original M-Pesa transaction ID is required for a refund.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 40:** `const { resultUrl, timeoutUrl } = buildRefundCallbackUrls(config.callbackUrl);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 41:** Sensitive-configuration/data operation; inspect source without copying secret values. — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 43:** `const response = await client.post(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 63:** `return response.data;` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 4: `<sensitive declaration redacted>`.
- Line 5: `<sensitive declaration redacted>`.
- Line 6: `const response = await client.get(urls.auth, {`.
- Line 14: `const buildRefundCallbackUrls = (callbackUrl) => {`.
- Line 15: `const normalized = String(callbackUrl || "").trim().replace(/\/$/, "");`.
- Line 16: `const base = normalized.replace(/\/callback$/i, "");`.
- Line 23: `export const requestMpesaRefund = async ({ transactionId, client = axios }) => {`.
- Line 24: `const config = await getTenantMpesaConfig();`.
- Line 25: `const urls = getTenantMpesaUrls(config);`.
- Line 35: `const originalTransactionId = String(transactionId || "").trim();`.
- Line 40: `const { resultUrl, timeoutUrl } = buildRefundCallbackUrls(config.callbackUrl);`.
- Line 41: `<sensitive declaration redacted>`.
- Line 43: `const response = await client.post(`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
