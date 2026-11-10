# Source explanation: server/controllers/superAdminToolsController.js

**Source:** [server/controllers/superAdminToolsController.js](../../../server/controllers/superAdminToolsController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `publicErrorMessage` from `../utils/publicError.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/utils/publicError.js](../../../server/utils/publicError.js)
- `mergeTenantFilter` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `tenantFilter` from `../tenancy/tenantQuery.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/tenantQuery.js](../../../server/tenancy/tenantQuery.js)
- `getSystemSettings` from `../services/settingsService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/settingsService.js](../../../server/services/settingsService.js)
- `AuditLog` from `../models/AuditLog.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/AuditLog.js](../../../server/models/AuditLog.js)
- `SecurityLog` from `../models/SecurityLog.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/SecurityLog.js](../../../server/models/SecurityLog.js)
- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.

## Runtime declarations and data flow

### `getAudit` — lines 10–41

Parameters: `req`, `res`.
Persistent operations detected: AuditLog.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 11:** `try{` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 13:** `const logs = await AuditLog.find(tenantFilter(req))` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 21:** `res.json({` — Sends a JSON response; inspect its caller for status and error semantics.
- **Line 34:** `res.status(500).json({` — Builds an HTTP response with an explicit status and JSON payload.

### `getSecurity` — lines 45–76

Parameters: `req`, `res`.
Persistent operations detected: SecurityLog.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 46:** `try{` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 49:** `const events = await SecurityLog.find(tenantFilter(req))` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 56:** `res.json({` — Sends a JSON response; inspect its caller for status and error semantics.
- **Line 69:** `res.status(500).json({` — Builds an HTTP response with an explicit status and JSON payload.

### `getDatabase` — lines 80–114

Parameters: `req`, `res`.
Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 81:** `try{` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 84:** `res.json({` — Sends a JSON response; inspect its caller for status and error semantics.
- **Line 107:** `res.status(500).json({` — Builds an HTTP response with an explicit status and JSON payload.

### `getApiMonitor` — lines 118–171

Parameters: `req`, `res`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 120:** `const settings = await getSystemSettings();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 121:** `const companyName = settings.companyName || "Company";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 122:** `try{` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 125:** `const routes =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 135:** `res.json({` — Sends a JSON response; inspect its caller for status and error semantics.
- **Line 164:** `res.status(500).json({` — Builds an HTTP response with an explicit status and JSON payload.

### `getSystem` — lines 175–217

Parameters: `req`, `res`.
Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 176:** `try{` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 179:** `res.json({` — Sends a JSON response; inspect its caller for status and error semantics.
- **Line 210:** `res.status(500).json({` — Builds an HTTP response with an explicit status and JSON payload.

### `getSettings` — lines 221–245

Parameters: `req`, `res`.
Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 222:** `try{` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 225:** `res.json({` — Sends a JSON response; inspect its caller for status and error semantics.
- **Line 238:** `res.status(500).json({` — Builds an HTTP response with an explicit status and JSON payload.

## Module-level declarations

- Line 10: `export const getAudit = async(req,res)=>{`.
- Line 13: `const logs = await AuditLog.find(tenantFilter(req))`.
- Line 45: `export const getSecurity = async(req,res)=>{`.
- Line 49: `const events = await SecurityLog.find(tenantFilter(req))`.
- Line 80: `export const getDatabase = async(req,res)=>{`.
- Line 118: `export const getApiMonitor = async(req,res)=>{`.
- Line 120: `const settings = await getSystemSettings();`.
- Line 121: `const companyName = settings.companyName || "Company";`.
- Line 125: `const routes =`.
- Line 175: `export const getSystem = async(req,res)=>{`.
- Line 221: `export const getSettings = async(req,res)=>{`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
