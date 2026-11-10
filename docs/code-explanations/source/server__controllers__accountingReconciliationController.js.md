# Source explanation: server/controllers/accountingReconciliationController.js

**Source:** [server/controllers/accountingReconciliationController.js](../../../server/controllers/accountingReconciliationController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `AccountingReconciliation` from `../models/AccountingReconciliation.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/AccountingReconciliation.js](../../../server/models/AccountingReconciliation.js)
- `JournalEntry` from `../models/JournalEntry.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/JournalEntry.js](../../../server/models/JournalEntry.js)
- `ChartOfAccount` from `../models/ChartOfAccount.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/ChartOfAccount.js](../../../server/models/ChartOfAccount.js)
- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)

## Runtime declarations and data flow

### `money` — lines 6–6

Parameters: `n`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `listReconciliationTransactions` — lines 9–11

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. Persistent operations detected: AccountingReconciliation.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 10:** `try { requireTenantId(); const q = mergeTenantFilter(req, {}); if (req.query.sourceType && allowed.has(String(req.query.sourceType))) q.sourceType = String(req.query.sourceType); if (req.query.status) q.status = String(r` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.

### `createReconciliationTransaction` — lines 13–20

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.user. Persistent operations detected: AccountingReconciliation.create; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 14:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 15:** `const tenantId = requireTenantId(); const b = req.body || {}; const sourceType = String(b.sourceType || "").toLowerCase(); const amount = money(b.amount);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 16:** `if (!allowed.has(sourceType) || !String(b.externalReference || "").trim() || amount <= 0) return res.status(400).json({ success: false, message: "Source type, external reference and positive amount are required." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 17:** `const row = await AccountingReconciliation.create({ tenantId, sourceType, externalReference: String(b.externalReference).trim(), transactionDate: b.transactionDate || new Date(), amount, currency: String(b.currency || "K` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 18:** `return res.status(201).json({ success: true, data: row });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 19:** `} catch (e) { if (e?.code === 11000) return res.status(409).json({ success: false, message: "This external reference is already reconciled for the tenant." }); next(e); }` — Builds an HTTP response with an explicit status and JSON payload.

### `matchReconciliationTransaction` — lines 22–31

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.body, req.user. Persistent operations detected: AccountingReconciliation.findOne, JournalEntry.findOne, ChartOfAccount.find; verify tenant/ownership filters in the exact query. 4 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 23:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 24:** `const tenantId = requireTenantId(); const row = await AccountingReconciliation.findOne(mergeTenantFilter(req, { _id: req.params.id })); if (!row) return res.status(404).json({ success: false, message: "Reconciliation tra` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 25:** `const entry = await JournalEntry.findOne(mergeTenantFilter(req, { _id: req.body?.journalEntryId, status: "posted" })).lean(); if (!entry) return res.status(404).json({ success: false, message: "Posted journal entry not f` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 26:** `const accountIds = (entry.lines || []).filter((line) => Number(line.debit || 0) > 0 || Number(line.credit || 0) > 0).map((line) => line.account); const accounts = await ChartOfAccount.find({ tenantId, _id: { $in: account` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 27:** `const cashLines = (entry.lines || []).filter((line) => { const a = accountMap.get(String(line.account)); return a && ["1000", "1010", "1020", "1030"].includes(a.code); }); const matchedAmount = money(cashLines.reduce((su` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 28:** `if (Math.abs(Math.abs(matchedAmount) - row.amount) > 0.01) return res.status(409).json({ success: false, message: "Reconciliation amount does not match the cash/bank movement in the selected journal entry.", expected: ro` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 29:** `row.journalEntry = entry._id; row.status = "matched"; row.matchedAt = new Date(); row.matchedBy = req.user?._id || null; await row.save(); return res.json({ success: true, data: row });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `markReconciliationException` — lines 33–35

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.body. Persistent operations detected: AccountingReconciliation.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 34:** `try { requireTenantId(); const row = await AccountingReconciliation.findOne(mergeTenantFilter(req, { _id: req.params.id })); if (!row) return res.status(404).json({ success: false, message: "Reconciliation transaction no` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.

## Module-level declarations

- Line 6: `const money = (n) => Math.round(Number(n || 0) * 100) / 100;`.
- Line 7: `const allowed = new Set(["bank", "mpesa", "card", "gateway", "cash", "tax", "supplier", "customer"]);`.
- Line 9: `export const listReconciliationTransactions = async (req, res, next) => {`.
- Line 13: `export const createReconciliationTransaction = async (req, res, next) => {`.
- Line 15: `const tenantId = requireTenantId(); const b = req.body || {}; const sourceType = String(b.sourceType || "").toLowerCase(); const amount = money(b.amount);`.
- Line 17: `const row = await AccountingReconciliation.create({ tenantId, sourceType, externalReference: String(b.externalReference).trim(), transactionDate: b.transactionDate || new Date(), a`.
- Line 22: `export const matchReconciliationTransaction = async (req, res, next) => {`.
- Line 24: `const tenantId = requireTenantId(); const row = await AccountingReconciliation.findOne(mergeTenantFilter(req, { _id: req.params.id })); if (!row) return res.status(404).json({ succ`.
- Line 25: `const entry = await JournalEntry.findOne(mergeTenantFilter(req, { _id: req.body?.journalEntryId, status: "posted" })).lean(); if (!entry) return res.status(404).json({ success: fal`.
- Line 26: `const accountIds = (entry.lines || []).filter((line) => Number(line.debit || 0) > 0 || Number(line.credit || 0) > 0).map((line) => line.account); const accounts = await ChartOfAcco`.
- Line 27: `const cashLines = (entry.lines || []).filter((line) => { const a = accountMap.get(String(line.account)); return a && ["1000", "1010", "1020", "1030"].includes(a.code); }); const ma`.
- Line 33: `export const markReconciliationException = async (req, res, next) => {`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
