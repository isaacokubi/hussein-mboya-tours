# Source explanation: server/services/jobRetryService.js

**Source:** [server/services/jobRetryService.js](../../../server/services/jobRetryService.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `BackgroundJob` from `../models/BackgroundJob.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/BackgroundJob.js](../../../server/models/BackgroundJob.js)

## Runtime declarations and data flow

### `retryDeadJob` — lines 3–9

Parameters: `{tenantId, idempotencyKey}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 4:** `return BackgroundJob.findOneAndUpdate(` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

No top-level named declarations detected.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
