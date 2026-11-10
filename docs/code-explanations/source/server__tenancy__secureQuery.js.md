# Source explanation: server/tenancy/secureQuery.js

**Source:** [server/tenancy/secureQuery.js](../../../server/tenancy/secureQuery.js)

## Purpose

A tenant context/query isolation primitive used by request middleware, model plugins and domain services.

## Imports and dependencies

- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.

## Runtime declarations and data flow

### `getTenantFilter` — lines 4–41

Parameters: `req`.
Reads request/component inputs: req.user. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 6:** `if(!req.user){` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 7:** `throw new Error("Missing authenticated user");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 11:** `const role =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 16:** `if(` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 20:** `return {};` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 24:** `const tenantId =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 29:** `if(!tenantId){` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 30:** `throw new Error(` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 36:** `return {` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `mergeTenantFilter` — lines 45–55

Parameters: `query`, `req`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 50:** `return {` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 4: `export function getTenantFilter(req){`.
- Line 11: `const role =`.
- Line 24: `const tenantId =`.
- Line 45: `export function mergeTenantFilter(`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
