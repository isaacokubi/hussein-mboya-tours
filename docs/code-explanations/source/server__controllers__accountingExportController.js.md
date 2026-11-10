# Source explanation: server/controllers/accountingExportController.js

**Source:** [server/controllers/accountingExportController.js](../../../server/controllers/accountingExportController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `JournalEntry` from `../models/JournalEntry.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/JournalEntry.js](../../../server/models/JournalEntry.js)
- `ChartOfAccount` from `../models/ChartOfAccount.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/ChartOfAccount.js](../../../server/models/ChartOfAccount.js)
- `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)

## Runtime declarations and data flow

### `esc` — lines 5–5

Parameters: `v`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `exportGeneralLedgerCSV` — lines 6–8

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. Persistent operations detected: ChartOfAccount.find, JournalEntry.find; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 7:** `try { const tenantId = requireTenantId(); const accounts = await ChartOfAccount.find({ tenantId }).select("_id code name type").lean(); const map = new Map(accounts.map(a => [String(a._id), a])); const filter = { tenantI` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.

### `exportTaxControlCSV` — lines 10–12

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. Persistent operations detected: ChartOfAccount.find, JournalEntry.find; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 11:** `try { const tenantId = requireTenantId(); const accounts = await ChartOfAccount.find({ tenantId, code: { $in: ["2110", "2120", "2130"] } }).select("_id code name").lean(); const map = new Map(accounts.map(a => [String(a.` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.

## Module-level declarations

- Line 5: `const esc = (v) => \`"${String(v ?? "").replace(/"/g, '""')}"\`;`.
- Line 6: `export const exportGeneralLedgerCSV = async (req, res, next) => {`.
- Line 10: `export const exportTaxControlCSV = async (req, res, next) => {`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
