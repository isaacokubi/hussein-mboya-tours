# Source explanation: server/tests/operationsCopilotAccess.test.js

**Source:** [server/tests/operationsCopilotAccess.test.js](../../../server/tests/operationsCopilotAccess.test.js)

## Purpose

A Node test module. Its assertions prove only the cases and environment configured by the test; inspect mocks and setup before generalizing.

## Imports and dependencies

- `assert` from `node:assert/strict`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `fs` from `node:fs`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `path` from `node:path`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `test` from `node:test`. This dependency supplies the imported behavior; inspect the linked local module for its contract.

## Runtime declarations and data flow

### `read` — lines 6–6

Parameters: `file`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 6: `const read = (file) => fs.readFileSync(path.resolve(process.cwd(), file), "utf8");`.
- Line 9: `const routes = read("routes/tourManagerRoutes.js");`.
- Line 10: `const protect = routes.indexOf("router.use(protect);");`.
- Line 11: `const tenantResolution = routes.indexOf("router.use(resolveTenant);");`.
- Line 12: `const managerAuthorization = routes.indexOf("router.use(managerOnly);");`.
- Line 13: `const summaryRoute = routes.indexOf('router.get("/copilot/summary", getOperationsCopilotSummary);');`.
- Line 14: `const quoteRoute = routes.indexOf('router.post("/copilot/quote-draft", createOperationsQuoteDraft);');`.
- Line 23: `const controller = read("controllers/operationsCopilotController.js");`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
