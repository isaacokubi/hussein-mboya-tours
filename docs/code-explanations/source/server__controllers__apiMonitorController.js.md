# Source explanation: server/controllers/apiMonitorController.js

**Source:** [server/controllers/apiMonitorController.js](../../../server/controllers/apiMonitorController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `getSystemSettings` from `../services/settingsService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/settingsService.js](../../../server/services/settingsService.js)
- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.

## Runtime declarations and data flow

### `getApiMonitor` — lines 11–50

Parameters: `req`, `res`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 12:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 13:** `const settings = await getSystemSettings();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 14:** `const companyName = settings?.companyName || "Company";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 15:** `const memory = process.memoryUsage();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 16:** `const databaseHealthy = mongoose.connection.readyState === 1;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 17:** `const endpoints = MONITORED_ENDPOINTS.map(([name, path]) => ({` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 23:** `const healthScore = databaseHealthy ? 100 : 25;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 25:** `return res.json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 48:** `return res.status(500).json({ success: false, message: "Unable to load API monitor status." });` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 4: `const MONITORED_ENDPOINTS = [`.
- Line 11: `export const getApiMonitor = async (req, res) => {`.
- Line 13: `const settings = await getSystemSettings();`.
- Line 14: `const companyName = settings?.companyName || "Company";`.
- Line 15: `const memory = process.memoryUsage();`.
- Line 16: `const databaseHealthy = mongoose.connection.readyState === 1;`.
- Line 17: `const endpoints = MONITORED_ENDPOINTS.map(([name, path]) => ({`.
- Line 23: `const healthScore = databaseHealthy ? 100 : 25;`.

## Security, errors and performance checkpoints

- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
