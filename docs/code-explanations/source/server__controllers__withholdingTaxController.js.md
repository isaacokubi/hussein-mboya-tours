# Source explanation: server/controllers/withholdingTaxController.js

**Source:** [server/controllers/withholdingTaxController.js](../../../server/controllers/withholdingTaxController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `WithholdingTax` from `../models/WithholdingTax.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/WithholdingTax.js](../../../server/models/WithholdingTax.js)
- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `postFinanceEntry` from `../services/financeLifecycleService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/financeLifecycleService.js](../../../server/services/financeLifecycleService.js)

## Runtime declarations and data flow

### `money` — lines 5–5

Parameters: `n`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `actor` — lines 6–6

Parameters: `req`.
Reads request/component inputs: req.user.

Key statements:

### `currentPeriod` — lines 7–7

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `validPeriod` — lines 8–8

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `normaliseSourceType` — lines 9–9

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `listWithholdingTax` — lines 11–32

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. Persistent operations detected: WithholdingTax.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 12:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 14:** `const filter = {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 15:** `if (req.query.status) filter.status = req.query.status;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 16:** `if (req.query.taxPeriod) filter.taxPeriod = req.query.taxPeriod;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 17:** `if (req.query.payee) filter.payee = req.query.payee;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 18:** `const data = await WithholdingTax.find(mergeTenantFilter(req, filter)).populate("payee", "legalName supplierNumber pin").sort({ createdAt: -1 }).limit(Math.min(Number(req.query.limit) || 200, 500)).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 19:** `const totals = data.reduce((a, row) => { a.baseAmount += Number(row.baseAmount || 0); a.taxAmount += Number(row.taxAmount || 0); if (row.status === "remitted") a.remitted += Number(row.taxAmount || 0); if (row.status ===` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 20:** `const sourceData = data.map((row) => ({` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 30:** `return res.json({ success: true, data: sourceData, totals: Object.fromEntries(Object.entries(totals).map(([k, v]) => [k, money(v)])) });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `createWithholdingTax` — lines 34–70

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body. Persistent operations detected: WithholdingTax.create; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 35:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 36:** `const tenantId = requireTenantId();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 37:** `const baseAmount = money(req.body?.baseAmount);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 38:** `const rate = Number(req.body?.rate);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 39:** `const taxPeriod = String(req.body?.taxPeriod || "").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 40:** `const payeeName = String(req.body?.payeeName || "").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 41:** `const payeePin = String(req.body?.payeePin || "").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 42:** `const reference = String(req.body?.reference || "").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 43:** `const sourceType = normaliseSourceType(req.body?.sourceType);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 44:** `const sourceId = req.body?.sourceId ? String(req.body.sourceId).trim() : undefined;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 45:** `if (!payeeName || !reference || !Number.isFinite(baseAmount) || baseAmount <= 0 || !Number.isFinite(rate) || rate < 0 || rate > 100 || !validPeriod(taxPeriod)) return res.status(422).json({ success: false, message: "Paye` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 46:** `if (sourceId && !/^[a-f\d]{24}$/i.test(sourceId)) return res.status(422).json({ success: false, message: "Source ID must be a valid record identifier when supplied." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 47:** `const taxAmount = money(baseAmount * (rate / 100));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 48:** `const data = await WithholdingTax.create({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 65:** `if (data.sourceType === "supplier_payment" && taxAmount > 0) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 66:** `await postFinanceEntry({ tenantId, sourceType: "withholding_tax_accrual", sourceId: data._id, description: \`WHT withheld ${data.reference}\`, reference: data.reference, lines: [{ code: "2000", debit: taxAmount, credit: ` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 68:** `return res.status(201).json({ success: true, data });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `remitWithholdingTax` — lines 72–91

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.body. Persistent operations detected: WithholdingTax.findOne; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 73:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 74:** `const tenantId = requireTenantId();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 75:** `const record = await WithholdingTax.findOne(mergeTenantFilter(req, { _id: req.params.id }));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 76:** `if (!record) return res.status(404).json({ success: false, message: "Withholding tax record not found." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 77:** `if (record.status === "remitted") return res.json({ success: true, data: record, alreadyRemitted: true });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 78:** `if (record.status === "cancelled") return res.status(409).json({ success: false, message: "Cancelled withholding tax cannot be remitted." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 79:** `const paymentReference = String(req.body?.paymentReference || "").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 80:** `if (!paymentReference) return res.status(422).json({ success: false, message: "A remittance payment reference is required." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 81:** `const certificateNumber = String(req.body?.certificateNumber || record.certificateNumber || "").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 82:** `await postFinanceEntry({ tenantId, sourceType: "withholding_tax_remittance", sourceId: record._id, description: \`WHT remittance ${record.reference}\`, reference: paymentReference, date: new Date(), lines: [{ code: "2130` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 88:** `await record.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 89:** `return res.json({ success: true, data: record });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `cancelWithholdingTax` — lines 93–102

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. Persistent operations detected: WithholdingTax.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 94:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 96:** `const record = await WithholdingTax.findOne(mergeTenantFilter(req, { _id: req.params.id }));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 97:** `if (!record) return res.status(404).json({ success: false, message: "Withholding tax record not found." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 98:** `if (record.status === "remitted") return res.status(409).json({ success: false, message: "Remitted withholding tax cannot be cancelled." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 99:** `record.status = "cancelled"; record.updatedBy = actor(req); await record.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 100:** `return res.json({ success: true, data: record });` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 5: `const money = (n) => Math.round(Number(n || 0) * 100) / 100;`.
- Line 6: `const actor = (req) => req.user?._id || req.user?.id || null;`.
- Line 7: `const currentPeriod = () => new Date().toISOString().slice(0, 7);`.
- Line 8: `const validPeriod = (value) => /^(\d{4})-(0[1-9]|1[0-2])$/.test(String(value || ""));`.
- Line 9: `const normaliseSourceType = (value) => ["supplier_payment", "expense", "commission", "other"].includes(value) ? value : "other";`.
- Line 11: `export const listWithholdingTax = async (req, res, next) => {`.
- Line 14: `const filter = {};`.
- Line 18: `const data = await WithholdingTax.find(mergeTenantFilter(req, filter)).populate("payee", "legalName supplierNumber pin").sort({ createdAt: -1 }).limit(Math.min(Number(req.query.lim`.
- Line 19: `const totals = data.reduce((a, row) => { a.baseAmount += Number(row.baseAmount || 0); a.taxAmount += Number(row.taxAmount || 0); if (row.status === "remitted") a.remitted += Number`.
- Line 20: `const sourceData = data.map((row) => ({`.
- Line 34: `export const createWithholdingTax = async (req, res, next) => {`.
- Line 36: `const tenantId = requireTenantId();`.
- Line 37: `const baseAmount = money(req.body?.baseAmount);`.
- Line 38: `const rate = Number(req.body?.rate);`.
- Line 39: `const taxPeriod = String(req.body?.taxPeriod || "").trim();`.
- Line 40: `const payeeName = String(req.body?.payeeName || "").trim();`.
- Line 41: `const payeePin = String(req.body?.payeePin || "").trim();`.
- Line 42: `const reference = String(req.body?.reference || "").trim();`.
- Line 43: `const sourceType = normaliseSourceType(req.body?.sourceType);`.
- Line 44: `const sourceId = req.body?.sourceId ? String(req.body.sourceId).trim() : undefined;`.
- Line 47: `const taxAmount = money(baseAmount * (rate / 100));`.
- Line 48: `const data = await WithholdingTax.create({`.
- Line 72: `export const remitWithholdingTax = async (req, res, next) => {`.
- Line 74: `const tenantId = requireTenantId();`.
- Line 75: `const record = await WithholdingTax.findOne(mergeTenantFilter(req, { _id: req.params.id }));`.
- Line 79: `const paymentReference = String(req.body?.paymentReference || "").trim();`.
- Line 81: `const certificateNumber = String(req.body?.certificateNumber || record.certificateNumber || "").trim();`.
- Line 93: `export const cancelWithholdingTax = async (req, res, next) => {`.
- Line 96: `const record = await WithholdingTax.findOne(mergeTenantFilter(req, { _id: req.params.id }));`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
