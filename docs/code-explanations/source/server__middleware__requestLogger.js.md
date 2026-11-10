# Source explanation: server/middleware/requestLogger.js

**Source:** [server/middleware/requestLogger.js](../../../server/middleware/requestLogger.js)

## Purpose

Express middleware that runs in a request pipeline, inspecting or enriching the request, rejecting it, or calling next().

## Imports and dependencies

- `crypto` from `crypto`. This dependency supplies the imported behavior; inspect the linked local module for its contract.

## Runtime declarations and data flow

### `requestLogger` — lines 3–26

Parameters: `req`, `res`, `next`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 4:** `const requestId = crypto.randomUUID();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 5:** `const started = Date.now();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 11:** `const duration = Date.now() - started;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 12:** `if (process.env.NODE_ENV !== "test") {` — This branch gates the following work on a condition; test both true and false paths when changing it.

## Module-level declarations

- Line 4: `const requestId = crypto.randomUUID();`.
- Line 5: `const started = Date.now();`.
- Line 11: `const duration = Date.now() - started;`.

## Security, errors and performance checkpoints

- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
