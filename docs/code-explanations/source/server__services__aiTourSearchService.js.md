# Source explanation: server/services/aiTourSearchService.js

**Source:** [server/services/aiTourSearchService.js](../../../server/services/aiTourSearchService.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `Tour` from `../models/Tour.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Tour.js](../../../server/models/Tour.js)
-  from `../models/Destination.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Destination.js](../../../server/models/Destination.js)

## Runtime declarations and data flow

### `searchRelevantTours` — lines 6–176

Parameters: `query (defaulted)`.
Persistent operations detected: Tour.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 9:** `const text = query.toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 12:** `const numbers =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 16:** `const budget =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 17:** `numbers.find(n => n >= 100 && n <= 100000);` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 20:** `const days =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 21:** `numbers.find(n => n >= 1 && n <= 60);` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 25:** `const keywords =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 32:** `const regex =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 39:** `const filters = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 81:** `if(budget){` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 91:** `const tours =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 92:** `await Tour.find(filters)` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 117:** `let ranked =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 121:** `let score = 0;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 124:** `if(` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 133:** `if(` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 142:** `if(days &&` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 152:** `if(tour.featured){` — This branch gates the following work on a condition; test both true and false paths when changing it.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 6: `export const searchRelevantTours = async (query = "") => {`.
- Line 9: `const text = query.toLowerCase();`.
- Line 12: `const numbers =`.
- Line 16: `const budget =`.
- Line 20: `const days =`.
- Line 25: `const keywords =`.
- Line 32: `const regex =`.
- Line 39: `const filters = {`.
- Line 91: `const tours =`.
- Line 117: `let ranked =`.
- Line 121: `let score = 0;`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
