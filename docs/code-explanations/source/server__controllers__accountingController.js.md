# Source explanation: server/controllers/accountingController.js

**Source:** [server/controllers/accountingController.js](../../../server/controllers/accountingController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `ChartOfAccount` from `../models/ChartOfAccount.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/ChartOfAccount.js](../../../server/models/ChartOfAccount.js)
- `JournalEntry` from `../models/JournalEntry.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/JournalEntry.js](../../../server/models/JournalEntry.js)
- `tenantFilter` from `../tenancy/tenantQuery.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/tenantQuery.js](../../../server/tenancy/tenantQuery.js)

## Runtime declarations and data flow

### `userId` — lines 6–6

Parameters: `req`.
Reads request/component inputs: req.user.

Key statements:

### `ok` — lines 7–7

Parameters: `res`, `data`, `status (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 7:** `(res, data, status = 200) => res.status(status).json({ success: true, data })` — Builds an HTTP response with an explicit status and JSON payload.

### `ensureDefaults` — lines 19–22

Parameters: `tenantId`.
Persistent operations detected: ChartOfAccount.updateOne; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 20:** `const filter = tenantFilter({ tenantId });` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 21:** `for (const [code, name, type, subtype] of DEFAULT_ACCOUNTS) await ChartOfAccount.updateOne({ ...filter, code }, { $setOnInsert: { tenantId, code, name, type, subtype, currency: "KES", system: true, active: true } }, { up` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.

### `assertTenantAccounts` — lines 24–29

Parameters: `req`, `lines`.
Persistent operations detected: ChartOfAccount.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 25:** `const ids = [...new Set((lines || []).map((line) => String(line.account || "")))];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 26:** `if (ids.length < 2 || ids.some((id) => !mongoose.isValidObjectId(id))) throw Object.assign(new Error("Each journal line must reference a valid account."), { statusCode: 422 });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 27:** `const accounts = await ChartOfAccount.find({ ...tenantFilter(req), _id: { $in: ids }, active: true }).select("_id").lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 28:** `if (accounts.length !== ids.length) throw Object.assign(new Error("One or more journal accounts do not belong to this tenant or are inactive."), { statusCode: 403 });` — This branch gates the following work on a condition; test both true and false paths when changing it.

### `listAccounts` — lines 31–31

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.tenantId. Persistent operations detected: ChartOfAccount.find; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 31:** `async (req, res, next) => { try { await ensureDefaults(req.tenantId); return ok(res, await ChartOfAccount.find({ ...tenantFilter(req), active: { $ne: false } }).sort({ code: 1 }).lean()); } catch (e) { return next(e); } ` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `createAccount` — lines 32–32

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.tenantId. Persistent operations detected: ChartOfAccount.create; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 32:** `async (req, res, next) => { try { const data = await ChartOfAccount.create({ ...req.body, tenantId: req.tenantId, system: false }); return ok(res, data, 201); } catch (e) { return next(e); } }` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `listJournalEntries` — lines 33–33

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. Persistent operations detected: JournalEntry.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 33:** `async (req, res, next) => { try { const filter = { ...tenantFilter(req), status: req.query.status || { $in: ["draft", "posted", "void"] } }; if (req.query.status) filter.status = req.query.status; if (req.query.from || r` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `createJournalEntry` — lines 34–34

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.tenantId. Persistent operations detected: JournalEntry.create; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 34:** `async (req, res, next) => { try { await assertTenantAccounts(req, req.body?.lines); const entry = await JournalEntry.create({ ...req.body, tenantId: req.tenantId, status: "draft", createdBy: userId(req) }); return ok(res` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `postJournalEntry` — lines 35–35

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. Persistent operations detected: JournalEntry.findOne; verify tenant/ownership filters in the exact query. 4 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 35:** `async (req, res, next) => { try { const entry = await JournalEntry.findOne({ ...tenantFilter(req), _id: req.params.id }); if (!entry) return res.status(404).json({ success: false, message: "Journal entry not found." }); ` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `voidJournalEntry` — lines 36–36

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. Persistent operations detected: JournalEntry.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 36:** `async (req, res, next) => { try { const entry = await JournalEntry.findOne({ ...tenantFilter(req), _id: req.params.id }); if (!entry) return res.status(404).json({ success: false, message: "Journal entry not found." }); ` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `getLedgerSummary` — lines 38–48

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.tenantId. Persistent operations detected: ChartOfAccount.find, JournalEntry.find; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 39:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 40:** `await ensureDefaults(req.tenantId); const accounts = await ChartOfAccount.find({ ...tenantFilter(req), active: { $ne: false } }).sort({ code: 1 }).lean(); const entries = await JournalEntry.find({ ...tenantFilter(req), s` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 41:** `const balances = new Map(accounts.map((a) => [String(a._id), { account: a, debit: 0, credit: 0, balance: 0 }]));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 42:** `for (const entry of entries) for (const line of entry.lines || []) { const row = balances.get(String(line.account)); if (row) { row.debit += Number(line.debit || 0); row.credit += Number(line.credit || 0); } }` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 43:** `for (const row of balances.values()) { row.debit = Math.round(row.debit * 100) / 100; row.credit = Math.round(row.credit * 100) / 100; row.balance = Math.round((["asset", "expense"].includes(row.account.type) ? row.debit` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 44:** `const rows = [...balances.values()]; const totals = rows.reduce((a, r) => ({ debit: a.debit + r.debit, credit: a.credit + r.credit }), { debit: 0, credit: 0 });` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 45:** `const revenue = rows.filter((r) => r.account.type === "revenue").reduce((s, r) => s + r.balance, 0); const expenses = rows.filter((r) => r.account.type === "expense").reduce((s, r) => s + r.balance, 0); const assets = ro` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 46:** `return ok(res, { accounts: rows, totals: { debit: Math.round(totals.debit * 100) / 100, credit: Math.round(totals.credit * 100) / 100 }, profitLoss: { revenue: Math.round(revenue * 100) / 100, expenses: Math.round(expens` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 6: `const userId = (req) => req.user?._id || req.user?.id || null;`.
- Line 7: `const ok = (res, data, status = 200) => res.status(status).json({ success: true, data });`.
- Line 10: `const DEFAULT_ACCOUNTS = [`.
- Line 20: `const filter = tenantFilter({ tenantId });`.
- Line 25: `const ids = [...new Set((lines || []).map((line) => String(line.account || "")))];`.
- Line 27: `const accounts = await ChartOfAccount.find({ ...tenantFilter(req), _id: { $in: ids }, active: true }).select("_id").lean();`.
- Line 31: `export const listAccounts = async (req, res, next) => { try { await ensureDefaults(req.tenantId); return ok(res, await ChartOfAccount.find({ ...tenantFilter(req), active: { $ne: fa`.
- Line 32: `export const createAccount = async (req, res, next) => { try { const data = await ChartOfAccount.create({ ...req.body, tenantId: req.tenantId, system: false }); return ok(res, data`.
- Line 33: `export const listJournalEntries = async (req, res, next) => { try { const filter = { ...tenantFilter(req), status: req.query.status || { $in: ["draft", "posted", "void"] } }; if (r`.
- Line 34: `export const createJournalEntry = async (req, res, next) => { try { await assertTenantAccounts(req, req.body?.lines); const entry = await JournalEntry.create({ ...req.body, tenantI`.
- Line 35: `export const postJournalEntry = async (req, res, next) => { try { const entry = await JournalEntry.findOne({ ...tenantFilter(req), _id: req.params.id }); if (!entry) return res.sta`.
- Line 36: `export const voidJournalEntry = async (req, res, next) => { try { const entry = await JournalEntry.findOne({ ...tenantFilter(req), _id: req.params.id }); if (!entry) return res.sta`.
- Line 38: `export const getLedgerSummary = async (req, res, next) => {`.
- Line 41: `const balances = new Map(accounts.map((a) => [String(a._id), { account: a, debit: 0, credit: 0, balance: 0 }]));`.
- Line 44: `const rows = [...balances.values()]; const totals = rows.reduce((a, r) => ({ debit: a.debit + r.debit, credit: a.credit + r.credit }), { debit: 0, credit: 0 });`.
- Line 45: `const revenue = rows.filter((r) => r.account.type === "revenue").reduce((s, r) => s + r.balance, 0); const expenses = rows.filter((r) => r.account.type === "expense").reduce((s, r)`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
