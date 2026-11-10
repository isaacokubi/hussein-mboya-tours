# Source explanation: server/middleware/notFoundMiddleware.js

**Source:** [server/middleware/notFoundMiddleware.js](../../../server/middleware/notFoundMiddleware.js)

## Purpose

Express middleware that runs in a request pipeline, inspecting or enriching the request, rejecting it, or calling next().

## Imports and dependencies

No ES module imports were found.

## Runtime declarations and data flow

### `notFound` — lines 13–19

Parameters: `req`, `res`, `next`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 14:** `const error = new Error(\`Route ${req.originalUrl} not found\`);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 16:** `res.status(404);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.

## Module-level declarations

- Line 13: `const notFound = (req, res, next) => {`.
- Line 14: `const error = new Error(\`Route ${req.originalUrl} not found\`);`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
