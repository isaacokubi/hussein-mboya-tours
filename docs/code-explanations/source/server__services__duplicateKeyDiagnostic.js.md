# Source explanation: server/services/duplicateKeyDiagnostic.js

**Source:** [server/services/duplicateKeyDiagnostic.js](../../../server/services/duplicateKeyDiagnostic.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

No ES module imports were found.

## Runtime declarations and data flow

### `getDuplicateKeyDetails` — lines 1–25

Parameters: `error`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 2:** `if (!error || error.code !== 11000) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 4:** `const keyPattern = error.keyPattern || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 5:** `const keyValue = error.keyValue || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 6:** `const fields = Object.keys(keyPattern);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 8:** `const field = fields.length === 1 ? fields[0] : fields.join(",");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 9:** `const value = fields.length === 1` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 13:** `return {` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 1: `export function getDuplicateKeyDetails(error) {`.
- Line 4: `const keyPattern = error.keyPattern || {};`.
- Line 5: `const keyValue = error.keyValue || {};`.
- Line 6: `const fields = Object.keys(keyPattern);`.
- Line 8: `const field = fields.length === 1 ? fields[0] : fields.join(",");`.
- Line 9: `const value = fields.length === 1`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
