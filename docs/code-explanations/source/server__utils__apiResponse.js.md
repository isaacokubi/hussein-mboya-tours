# Source explanation: server/utils/apiResponse.js

**Source:** [server/utils/apiResponse.js](../../../server/utils/apiResponse.js)

## Purpose

A backend utility shared by controllers, services, or models.

## Imports and dependencies

No ES module imports were found.

## Runtime declarations and data flow

### `successResponse` — lines 7–28

Parameters: `res`, `status (defaulted)`, `message (defaulted)`, `data (defaulted)`, `meta (defaulted)`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 14:** `const response = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 19:** `if (data !== null) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 23:** `if (meta) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 27:** `return res.status(status).json(response);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `errorResponse` — lines 30–46

Parameters: `res`, `status (defaulted)`, `message (defaulted)`, `errors (defaulted)`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 36:** `const response = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 41:** `if (errors) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 45:** `return res.status(status).json(response);` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 7: `export const successResponse = (`.
- Line 14: `const response = {`.
- Line 30: `export const errorResponse = (`.
- Line 36: `const response = {`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
