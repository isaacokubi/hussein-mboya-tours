# Source explanation: server/services/kenyaComplianceService.js

**Source:** [server/services/kenyaComplianceService.js](../../../server/services/kenyaComplianceService.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `crypto` from `crypto`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Tenant` from `../models/Tenant.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. `server/models/Tenant.js` (no matching file found; verify this import path)

## Runtime declarations and data flow

### `clean` — lines 4–4

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `buildKenyaComplianceSnapshot` — lines 6–38

Parameters: `tenant`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 7:** `const compliance = tenant?.kenyaCompliance || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 8:** `const tax = tenant?.taxProfile || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 9:** `const tra = compliance.tra || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 10:** `const odpc = compliance.odpc || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 11:** `const etims = compliance.etims || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 13:** `return {` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `generateIdempotencyKey` — lines 40–42

Parameters: `prefix (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 41:** `return \`${prefix}-${crypto.randomUUID()}\`;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getTenantKenyaCompliance` — lines 44–52

Parameters: `tenantId`.
Persistent operations detected: Tenant.findById; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 45:** `const tenant = await Tenant.findById(tenantId).select("taxProfile kenyaCompliance").lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 46:** `if (!tenant) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 47:** `const error = new Error("Tenant not found.");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 49:** `throw error;` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 51:** `return buildKenyaComplianceSnapshot(tenant);` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 4: `const clean = (value) => (value == null ? "" : String(value).trim());`.
- Line 6: `export function buildKenyaComplianceSnapshot(tenant) {`.
- Line 7: `const compliance = tenant?.kenyaCompliance || {};`.
- Line 8: `const tax = tenant?.taxProfile || {};`.
- Line 9: `const tra = compliance.tra || {};`.
- Line 10: `const odpc = compliance.odpc || {};`.
- Line 11: `const etims = compliance.etims || {};`.
- Line 40: `export function generateIdempotencyKey(prefix = "KE") {`.
- Line 45: `const tenant = await Tenant.findById(tenantId).select("taxProfile kenyaCompliance").lean();`.
- Line 47: `const error = new Error("Tenant not found.");`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
