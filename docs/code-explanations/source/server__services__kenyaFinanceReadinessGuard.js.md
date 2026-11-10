# Source explanation: server/services/kenyaFinanceReadinessGuard.js

**Source:** [server/services/kenyaFinanceReadinessGuard.js](../../../server/services/kenyaFinanceReadinessGuard.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

No ES module imports were found.

## Runtime declarations and data flow

### `validateKenyaFinanceProductionReadiness` — lines 1–13

Parameters: `profile (defaulted)`.
11 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 2:** `const failures = [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 3:** `const environment = String(profile.etimsEnvironment || "sandbox").toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 4:** `if (!String(profile.kraPin || "").trim()) failures.push("KRA PIN is required.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 5:** `if (profile.vatRegistered && !String(profile.vatNumber || "").trim()) failures.push("VAT number is required when VAT registration is enabled.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 6:** `if (profile.etimsEnabled && environment === "production") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 7:** `if (!String(profile.etimsAdapterUrl || process.env.ETIMS_ADAPTER_URL || "").trim()) failures.push("A certified eTIMS adapter is required for production.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 8:** `if (!String(profile.etimsDeviceId || "").trim()) failures.push("eTIMS device ID is required for production.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 9:** `if (!String(profile.etimsBranchId || "").trim()) failures.push("eTIMS branch ID is required for production.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 10:** `if (!["ONLINE", "CLIENT", "VSCU", "OSCU"].includes(String(profile.etimsSolution || "").toUpperCase())) failures.push("A supported eTIMS solution must be selected for production.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 12:** `return { ready: failures.length === 0, failures };` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `assertKenyaFinanceProductionReadiness` — lines 15–25

Parameters: `profile (defaulted)`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 16:** `const result = validateKenyaFinanceProductionReadiness(profile);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 17:** `if (!result.ready) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 18:** `const error = new Error(\`Kenya finance production configuration is incomplete: ${result.failures.join(" ")}\`);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 22:** `throw error;` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 24:** `return result;` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 1: `export function validateKenyaFinanceProductionReadiness(profile = {}) {`.
- Line 2: `const failures = [];`.
- Line 3: `const environment = String(profile.etimsEnvironment || "sandbox").toLowerCase();`.
- Line 15: `export function assertKenyaFinanceProductionReadiness(profile = {}) {`.
- Line 16: `const result = validateKenyaFinanceProductionReadiness(profile);`.
- Line 18: `const error = new Error(\`Kenya finance production configuration is incomplete: ${result.failures.join(" ")}\`);`.

## Security, errors and performance checkpoints

- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
