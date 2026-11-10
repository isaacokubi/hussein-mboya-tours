# Source explanation: server/tenancy/backgroundContext.js

**Source:** [server/tenancy/backgroundContext.js](../../../server/tenancy/backgroundContext.js)

## Purpose

A tenant context/query isolation primitive used by request middleware, model plugins and domain services.

## Imports and dependencies

No ES module imports were found.

## Runtime declarations and data flow

### `setBackgroundTenant` — lines 4–8

Parameters: `tenantId`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `getBackgroundTenant` — lines 11–24

Parameters: none.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 13:** `if(!activeTenantId){` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 15:** `throw new Error(` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 22:** `return activeTenantId;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `clearBackgroundTenant` — lines 27–31

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 1: `let activeTenantId = null;`.
- Line 4: `export function setBackgroundTenant(tenantId){`.
- Line 11: `export function getBackgroundTenant(){`.
- Line 27: `export function clearBackgroundTenant(){`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
