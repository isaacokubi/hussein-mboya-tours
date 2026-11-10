# Source explanation: server/controllers/complianceController.js

**Source:** [server/controllers/complianceController.js](../../../server/controllers/complianceController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `ComplianceRecord` from `../models/ComplianceRecord.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/ComplianceRecord.js](../../../server/models/ComplianceRecord.js)
- `Invoice` from `../models/Invoice.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Invoice.js](../../../server/models/Invoice.js)
- `EtimsSubmission` from `../models/EtimsSubmission.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/EtimsSubmission.js](../../../server/models/EtimsSubmission.js)
- `enqueueInvoiceForEtims` from `../services/etimsService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/etimsService.js](../../../server/services/etimsService.js)
- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)

## Runtime declarations and data flow

### `listComplianceRecords` — lines 10–10

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. Persistent operations detected: ComplianceRecord.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 10:** `async function listComplianceRecords(req, res, next) { try { requireTenantId(); const data = await ComplianceRecord.find(mergeTenantFilter(req, req.query?.type ? { type: req.query.type } : {})).populate("owner", "name em` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `upsertComplianceRecord` — lines 11–11

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.user. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 11:** `async function upsertComplianceRecord(req, res, next) { try { const tenantId = requireTenantId(); const type = String(req.body?.type || "").toUpperCase(); if (!TYPES.includes(type)) return res.status(400).json({ success:` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `getComplianceSummary` — lines 12–12

Parameters: `req`, `res`, `next`.
Persistent operations detected: ComplianceRecord.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 12:** `async function getComplianceSummary(req, res, next) { try { requireTenantId(); const records = await ComplianceRecord.find(mergeTenantFilter(req, {})).lean(); const now = Date.now(); const expiringSoon = records.filter((` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `queueEtimsInvoice` — lines 13–13

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. Persistent operations detected: Invoice.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 13:** `async function queueEtimsInvoice(req, res, next) { try { const tenantId = requireTenantId(); if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid invoice ID." }); ` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `getEtimsInvoiceStatus` — lines 14–14

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. Persistent operations detected: Invoice.findOne, EtimsSubmission.find; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 14:** `async function getEtimsInvoiceStatus(req, res, next) { try { requireTenantId(); if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid invoice ID." }); const invoice` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

## Module-level declarations

- Line 8: `const TYPES = ["TRA_LICENSE", "ODPC_REGISTRATION", "PRIVACY_POLICY", "DATA_RETENTION", "DPA_REVIEW", "BREACH_RESPONSE", "KRA_TAX_PROFILE", "ETIMS_ONBOARDING"];`.
- Line 9: `const STATUSES = ["not_started", "in_progress", "submitted", "approved", "expired", "action_required", "closed"];`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
