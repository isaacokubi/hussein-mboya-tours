# Source explanation: server/services/reportService.js

**Source:** [server/services/reportService.js](../../../server/services/reportService.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `mergeTenantFilter` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `Parser` from `json2csv`. This dependency supplies the imported behavior; inspect the linked local module for its contract.

## Runtime declarations and data flow

### `generateCSV` — lines 13–35

Parameters: `data (defaulted)`, `options (defaulted)`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 17:** `if (!Array.isArray(data)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 18:** `throw new Error("Data must be an array.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 21:** `if (data.length === 0) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 22:** `return "";` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 25:** `const parser = new Parser({` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 34:** `return parser.parse(data);` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 13: `export const generateCSV = (`.
- Line 25: `const parser = new Parser({`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
