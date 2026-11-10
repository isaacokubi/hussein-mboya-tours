# Source explanation: server/services/aiIntentService.js

**Source:** [server/services/aiIntentService.js](../../../server/services/aiIntentService.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `mergeTenantFilter` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)

## Runtime declarations and data flow

### `detectIntent` — lines 2–53

Parameters: `message (defaulted)`.
5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 4:** `const text = message.toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 7:** `if(` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 12:** `return "BOOKING";` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 16:** `if(` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 21:** `return "PRICE";` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 25:** `if(` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 30:** `return "RECOMMENDATION";` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 34:** `if(` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 39:** `return "DESTINATION";` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 43:** `if(` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 47:** `return "TRAVEL_INFO";` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 51:** `return "GENERAL";` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 2: `export const detectIntent = (message = "") => {`.
- Line 4: `const text = message.toLowerCase();`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
