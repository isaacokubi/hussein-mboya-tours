# Source explanation: server/tenancy/backgroundTenantFilter.js

**Source:** [server/tenancy/backgroundTenantFilter.js](../../../server/tenancy/backgroundTenantFilter.js)

## Purpose

A tenant context/query isolation primitive used by request middleware, model plugins and domain services.

## Imports and dependencies

- `getBackgroundTenant` from `./backgroundContext.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/backgroundContext.js](../../../server/tenancy/backgroundContext.js)

## Runtime declarations and data flow

### `backgroundTenantFilter` — lines 4–14

Parameters: `query (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 6:** `return {` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 4: `export function backgroundTenantFilter(query={}){`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
