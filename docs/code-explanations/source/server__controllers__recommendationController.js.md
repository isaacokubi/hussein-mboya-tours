# Source explanation: server/controllers/recommendationController.js

**Source:** [server/controllers/recommendationController.js](../../../server/controllers/recommendationController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mergeTenantFilter` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `recommendTours` from `../services/recommendationService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/recommendationService.js](../../../server/services/recommendationService.js)

## Runtime declarations and data flow

### `getRecommendations` — lines 12–34

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 13:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 14:** `const preferences = req.body;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 16:** `if (!preferences || Object.keys(preferences).length === 0) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 17:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 23:** `const tours = await recommendTours(preferences);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 25:** `return res.status(200).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 12: `export const getRecommendations = async (req, res, next) => {`.
- Line 14: `const preferences = req.body;`.
- Line 23: `const tours = await recommendTours(preferences);`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
