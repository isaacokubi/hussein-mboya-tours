# Source explanation: server/config/mpesa.js

**Source:** [server/config/mpesa.js](../../../server/config/mpesa.js)

## Purpose

Server configuration or provider initialization. Values and validation affect runtime startup or request behavior.

## Imports and dependencies

- `dotenv` from `dotenv`. This dependency supplies the imported behavior; inspect the linked local module for its contract.

## Runtime declarations and data flow

### `validateMpesaEnvironment` — lines 31–37

Parameters: `environment (defaulted)`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 32:** `const normalized = String(environment || "").trim().toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 33:** `if (!["sandbox", "production"].includes(normalized)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 34:** `throw Object.assign(new Error("MPESA_ENVIRONMENT must be either sandbox or production."), { status: 503, expose: true });` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 36:** `return normalized;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `hasLegacyMpesaConfig` — lines 39–45

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `getMpesaUrls` — lines 53–71

Parameters: `environment (defaulted)`.
Error control: try=true, catch=false, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 54:** `const normalized = validateMpesaEnvironment(environment);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 55:** `const base = String(normalized === "production"` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 58:** `const expectedHost = normalized === "production" ? "api.safaricom.co.ke" : "sandbox.safaricom.co.ke";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 59:** `let parsed;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 60:** `try { parsed = new URL(base); } catch { parsed = null; }` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 61:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 62:** `throw Object.assign(new Error(\`Configured Daraja ${normalized} base URL is invalid.\`), { status: 503, expose: true });` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 64:** `return {` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 18: `export const mpesaConfig = {`.
- Line 31: `export const validateMpesaEnvironment = (environment = mpesaConfig.environment) => {`.
- Line 32: `const normalized = String(environment || "").trim().toLowerCase();`.
- Line 39: `export const hasLegacyMpesaConfig = () => Boolean(`.
- Line 53: `export const getMpesaUrls = (environment = mpesaConfig.environment) => {`.
- Line 54: `const normalized = validateMpesaEnvironment(environment);`.
- Line 55: `const base = String(normalized === "production"`.
- Line 58: `const expectedHost = normalized === "production" ? "api.safaricom.co.ke" : "sandbox.safaricom.co.ke";`.
- Line 59: `let parsed;`.

## Security, errors and performance checkpoints

- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
