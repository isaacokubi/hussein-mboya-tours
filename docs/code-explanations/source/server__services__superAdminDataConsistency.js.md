# Source explanation: server/services/superAdminDataConsistency.js

**Source:** [server/services/superAdminDataConsistency.js](../../../server/services/superAdminDataConsistency.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.

## Runtime declarations and data flow

### `emptyMetrics` — lines 12–17

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `getCanonicalSuperAdminCustomerMetrics` — lines 28–125

Parameters: `db`, `tenantIds`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 29:** `if (!db) throw new Error("Database connection is not ready.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 31:** `const normalizedTenantIds = (tenantIds || []).map((id) =>` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 35:** `if (!normalizedTenantIds.length) return emptyMetrics();` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 37:** `const [accountResult, profileResult] = await Promise.all([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 40:** `.aggregate([` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 79:** `.aggregate([` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 116:** `const accounts = accountResult[0] || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 117:** `const profiles = profileResult[0] || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 119:** `return {` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 3: `const roleNameExpression = {`.
- Line 12: `const emptyMetrics = () => ({`.
- Line 31: `const normalizedTenantIds = (tenantIds || []).map((id) =>`.
- Line 37: `const [accountResult, profileResult] = await Promise.all([`.
- Line 116: `const accounts = accountResult[0] || {};`.
- Line 117: `const profiles = profileResult[0] || {};`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
