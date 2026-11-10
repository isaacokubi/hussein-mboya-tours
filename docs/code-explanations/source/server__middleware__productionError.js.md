# Source explanation: server/middleware/productionError.js

**Source:** [server/middleware/productionError.js](../../../server/middleware/productionError.js)

## Purpose

Express middleware that runs in a request pipeline, inspecting or enriching the request, rejecting it, or calling next().

## Imports and dependencies

No ES module imports were found.

## Runtime declarations and data flow

### `productionError` — lines 1–21

Parameters: `err`, `req`, `res`, `next`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 2:** `const requestId = req.requestId;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 11:** `const status = Number(err.statusCode ?? err.status) || 500;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 13:** `res.status(status).json({` — Builds an HTTP response with an explicit status and JSON payload.

## Module-level declarations

- Line 2: `const requestId = req.requestId;`.
- Line 11: `const status = Number(err.statusCode ?? err.status) || 500;`.

## Security, errors and performance checkpoints

- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
