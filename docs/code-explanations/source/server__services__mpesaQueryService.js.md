# Source explanation: server/services/mpesaQueryService.js

**Source:** [server/services/mpesaQueryService.js](../../../server/services/mpesaQueryService.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `axios` from `axios`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getTenantMpesaConfig`, `getTenantMpesaUrls` from `./paymentGatewayService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/paymentGatewayService.js](../../../server/services/paymentGatewayService.js)
- `generateAccessToken`, `generateTimestamp`, `generatePassword` from `./mpesaService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/mpesaService.js](../../../server/services/mpesaService.js)

## Runtime declarations and data flow

### `queryStkPush` — lines 7–33

Parameters: `checkoutRequestID`, `suppliedConfig (defaulted)`.
3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 8:** `const checkoutId = String(checkoutRequestID || "").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 9:** `if (!checkoutId) throw new Error("CheckoutRequestID is required.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 11:** `const config = suppliedConfig || await getTenantMpesaConfig();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 12:** `const urls = getTenantMpesaUrls(config);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 13:** `const timestamp = generateTimestamp();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 14:** Sensitive-configuration/data operation; inspect source without copying secret values. — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 15:** Sensitive-configuration/data operation; inspect source without copying secret values. — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 17:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 18:** `const { data } = await client.post(urls.query, {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 25:** `return data;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 31:** `throw new Error("Unable to query M-Pesa payment status.");` — Stops the current operation with an error; callers or Express error handling determine the response.

### `classifyStkQueryResult` — lines 35–41

Parameters: `resultCode`.
3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 36:** `const code = String(resultCode ?? "").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 37:** `if (code === "0") return "completed";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 38:** `if (["1032", "1037"].includes(code)) return "cancelled";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 39:** `if (["1036", "1", "2001"].includes(code)) return "failed";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 40:** `return "pending";` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 5: `const client = axios.create({ timeout: 30000 });`.
- Line 8: `const checkoutId = String(checkoutRequestID || "").trim();`.
- Line 11: `const config = suppliedConfig || await getTenantMpesaConfig();`.
- Line 12: `const urls = getTenantMpesaUrls(config);`.
- Line 13: `const timestamp = generateTimestamp();`.
- Line 14: `<sensitive declaration redacted>`.
- Line 15: `<sensitive declaration redacted>`.
- Line 18: `const { data } = await client.post(urls.query, {`.
- Line 35: `export function classifyStkQueryResult(resultCode) {`.
- Line 36: `const code = String(resultCode ?? "").trim();`.

## Security, errors and performance checkpoints

- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
