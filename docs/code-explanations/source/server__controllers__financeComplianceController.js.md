# Source explanation: server/controllers/financeComplianceController.js

**Source:** [server/controllers/financeComplianceController.js](../../../server/controllers/financeComplianceController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `TaxProfile` from `../models/TaxProfile.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/TaxProfile.js](../../../server/models/TaxProfile.js)
- `EtimsCredential`, `encryptEtimsSecret` from `../models/EtimsCredential.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/EtimsCredential.js](../../../server/models/EtimsCredential.js)
- `Expense` from `../models/Expense.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Expense.js](../../../server/models/Expense.js)
- `CreditDebitNote` from `../models/CreditDebitNote.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/CreditDebitNote.js](../../../server/models/CreditDebitNote.js)
- `Invoice` from `../models/Invoice.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Invoice.js](../../../server/models/Invoice.js)
- `EtimsSubmission` from `../models/EtimsSubmission.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/EtimsSubmission.js](../../../server/models/EtimsSubmission.js)
- `enqueueNoteForEtims` from `../services/etimsNoteService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/etimsNoteService.js](../../../server/services/etimsNoteService.js)
- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)

## Runtime declarations and data flow

### `getTaxProfile` — lines 10–10

Parameters: `req`, `res`, `next`.
Persistent operations detected: TaxProfile.findOne; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 10:** Sensitive-configuration/data operation; inspect source without copying secret values. — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `upsertTaxProfile` — lines 11–11

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.user. Persistent operations detected: TaxProfile.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 10 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 11:** Sensitive-configuration/data operation; inspect source without copying secret values. — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `getEtimsCredentialStatus` — lines 12–12

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. Persistent operations detected: EtimsCredential.findOne; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 12:** Sensitive-configuration/data operation; inspect source without copying secret values. — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `saveEtimsCredentials` — lines 13–13

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.user. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 13:** Sensitive-configuration/data operation; inspect source without copying secret values. — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `listExpenses` — lines 14–14

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. Persistent operations detected: Expense.find, Expense.countDocuments; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 14:** `async (req, res, next) => { try { const page = Math.max(Number(req.query.page) || 1, 1); const limit = Math.min(Math.max(Number(req.query.limit) || 25, 1), 100); const filter = {}; if (req.query.status) filter.status = r` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `createExpense` — lines 15–15

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.user. Persistent operations detected: Expense.create; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 15:** `async (req, res, next) => { try { const tenantId = requireTenantId(); const amount = Number(req.body?.amount); if (!req.body?.category || !req.body?.description || !Number.isFinite(amount) || amount <= 0) return res.stat` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `listNotes` — lines 16–16

Parameters: `req`, `res`, `next`.
Persistent operations detected: CreditDebitNote.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 16:** `async (req, res, next) => { try { const data = await CreditDebitNote.find(mergeTenantFilter(req, {})).populate("originalInvoice", "invoiceNumber etimsInvoiceNumber totalAmount issueDate").sort({ createdAt: -1 }).limit(20` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `createNote` — lines 17–17

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.user. Persistent operations detected: Invoice.findOne, TaxProfile.findOne, CreditDebitNote.create; verify tenant/ownership filters in the exact query. 4 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 17:** `async (req, res, next) => { try { const tenantId = requireTenantId(); const type = String(req.body?.type || "").toLowerCase(); if (!["credit", "debit"].includes(type)) return res.status(400).json({ success: false, messag` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `queueNoteEtims` — lines 18–18

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. Persistent operations detected: CreditDebitNote.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 18:** `async (req, res, next) => { try { const tenantId = requireTenantId(); const note = await CreditDebitNote.findOne(mergeTenantFilter(req, { _id: req.params.id })).lean(); if (!note) return res.status(404).json({ success: f` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `listEtimsSubmissions` — lines 19–19

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. Persistent operations detected: EtimsSubmission.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 19:** `async (req, res, next) => { try { const filter = {}; if (req.query.documentType) filter.documentType = req.query.documentType; if (req.query.status) filter.status = req.query.status; if (req.query.documentId) filter.docu` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `getFinanceComplianceSummary` — lines 20–20

Parameters: `req`, `res`, `next`.
Persistent operations detected: TaxProfile.findOne, Expense.aggregate, EtimsSubmission.aggregate, EtimsCredential.findOne; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 20:** Sensitive-configuration/data operation; inspect source without copying secret values. — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

## Module-level declarations

- Line 10: `<sensitive declaration redacted>`.
- Line 11: `<sensitive declaration redacted>`.
- Line 12: `<sensitive declaration redacted>`.
- Line 13: `<sensitive declaration redacted>`.
- Line 14: `export const listExpenses = async (req, res, next) => { try { const page = Math.max(Number(req.query.page) || 1, 1); const limit = Math.min(Math.max(Number(req.query.limit) || 25, `.
- Line 15: `export const createExpense = async (req, res, next) => { try { const tenantId = requireTenantId(); const amount = Number(req.body?.amount); if (!req.body?.category || !req.body?.de`.
- Line 16: `export const listNotes = async (req, res, next) => { try { const data = await CreditDebitNote.find(mergeTenantFilter(req, {})).populate("originalInvoice", "invoiceNumber etimsInvoi`.
- Line 17: `export const createNote = async (req, res, next) => { try { const tenantId = requireTenantId(); const type = String(req.body?.type || "").toLowerCase(); if (!["credit", "debit"].in`.
- Line 18: `export const queueNoteEtims = async (req, res, next) => { try { const tenantId = requireTenantId(); const note = await CreditDebitNote.findOne(mergeTenantFilter(req, { _id: req.par`.
- Line 19: `export const listEtimsSubmissions = async (req, res, next) => { try { const filter = {}; if (req.query.documentType) filter.documentType = req.query.documentType; if (req.query.sta`.
- Line 20: `<sensitive declaration redacted>`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
