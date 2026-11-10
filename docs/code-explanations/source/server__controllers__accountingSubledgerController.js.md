# Source explanation: server/controllers/accountingSubledgerController.js

**Source:** [server/controllers/accountingSubledgerController.js](../../../server/controllers/accountingSubledgerController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `crypto` from `crypto`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `AccountingSubledger` from `../models/AccountingSubledger.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/AccountingSubledger.js](../../../server/models/AccountingSubledger.js)
- `JournalEntry` from `../models/JournalEntry.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/JournalEntry.js](../../../server/models/JournalEntry.js)
- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `postFinanceEntry` from `../services/financeLifecycleService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/financeLifecycleService.js](../../../server/services/financeLifecycleService.js)

## Runtime declarations and data flow

### `money` — lines 8–8

Parameters: `n`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `hashId` — lines 10–10

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `cashCode` — lines 11–11

Parameters: `method`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `normalizeCurrency` — lines 13–13

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `validateCurrencyAndRate` — lines 14–20

Parameters: `currency`, `rate`.
5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 15:** `if (!/^[A-Z]{3}$/.test(currency)) return "Currency must be a valid three-letter ISO-style code.";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 16:** `if (!Number.isFinite(rate) || rate <= 0) return "Exchange rate to KES must be greater than zero.";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 17:** `if (currency === "KES" && rate !== 1) return "KES entries must use an exchange rate of 1.00.";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 18:** `if (currency !== "KES" && rate === 1) return "A valid explicit exchange rate to KES is required for non-KES entries.";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 19:** `return null;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `journalAmount` — lines 37–37

Parameters: `entry`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `classifyJournal` — lines 39–49

Parameters: `entry`.
6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 40:** `const explicit = JOURNAL_SUBLEDGER_TYPES[String(entry?.sourceType || "").toLowerCase()];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 41:** `if (explicit) return explicit;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 42:** `const codes = new Set((entry?.lines || []).map((line) => String(line?.account?.code || "").trim()));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 43:** `if (codes.has("7000") || codes.has("7010")) return "fx";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 44:** `if (codes.has("1300")) return "prepayment";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 45:** `if (codes.has("2140")) return "payroll";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 46:** `if (codes.has("1200")) return "inventory";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 47:** `if (codes.has("2000") && ["5000", "5010", "5020", "5100", "5200"].some((code) => codes.has(code))) return "accrual";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 48:** `return null;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `journalFallbackRows` — lines 51–87

Parameters: `{tenantId, type}`.
Persistent operations detected: JournalEntry.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 52:** `const entries = await JournalEntry.find({ tenantId, status: { $nin: ["void", "voided"] } })` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 58:** `return entries.map((entry) => {` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 59:** `const mappedType = classifyJournal(entry);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 60:** `if (!mappedType || (type && mappedType !== type)) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 61:** `const amount = journalAmount(entry);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 62:** `if (amount <= 0) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 63:** `const codes = (entry.lines || []).map((line) => String(line?.account?.code || "").trim()).filter(Boolean);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 64:** `const journalDate = entry.entryDate || entry.createdAt;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 65:** `return {` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `listSubledger` — lines 89–125

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. Persistent operations detected: AccountingSubledger.find; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 90:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 91:** `const tenantId = requireTenantId();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 92:** `const q = mergeTenantFilter(req, {});` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 93:** `const requestedType = req.query.type ? String(req.query.type).toLowerCase() : "";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 94:** `if (requestedType && requestedType !== "all" && allowed.has(requestedType)) q.type = requestedType;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 96:** `const rows = await AccountingSubledger.find(q)` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 102:** `const data = rows.map((row) => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 103:** `const amount = money(row.amount);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 104:** `const currency = normalizeCurrency(row.currency);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 105:** `const exchangeRate = Number.isFinite(Number(row.exchangeRate)) && Number(row.exchangeRate) > 0 ? Number(row.exchangeRate) : 1;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 106:** `const baseAmount = Number.isFinite(Number(row.baseAmount)) && Number(row.baseAmount) >= 0 ? money(row.baseAmount) : money(amount * exchangeRate);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 107:** `const journalEntry = row.journalEntry || null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 108:** `return { ...row, amount, currency, exchangeRate, baseAmount, quantity: Number.isFinite(Number(row.quantity)) ? Number(row.quantity) : null, unitCost: row.unitCost === null || row.unitCost === undefined ? null : money(row` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 111:** `const fallbackRows = await journalFallbackRows({ tenantId, type: requestedType === "all" ? "" : requestedType });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 112:** `const representedJournalIds = new Set(data.map((row) => row.journalEntry?._id ? String(row.journalEntry._id) : "").filter(Boolean));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 113:** `const linkedRows = fallbackRows.filter((row) => !representedJournalIds.has(String(row.journalEntry._id)));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 114:** `const combined = [...data, ...linkedRows].sort((a, b) => new Date(b.transactionDate || 0) - new Date(a.transactionDate || 0)).slice(0, 500);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 116:** `const summary = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `buildPosting` — lines 127–143

Parameters: `row`, `body (defaulted)`.
7 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 128:** `const amount = money(row.baseAmount || row.amount); const type = row.type; const meta = row.metadata || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 129:** `if (amount <= 0) throw new Error("Subledger base amount must be positive.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 130:** `if (type === "inventory") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 131:** `const action = String(body.transactionType || meta.transactionType || (meta.direction === "out" ? "issue" : "receipt")).toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 132:** `if (action === "issue" || action === "cogs") return { sourceType: "inventory_cogs", lines: [{ code: row.accountCode || "5000", debit: amount, credit: 0, description: "Inventory issue / COGS" }, { code: row.contraAccountC` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 133:** `return { sourceType: "inventory_receipt", lines: [{ code: row.accountCode || "1200", debit: amount, credit: 0, description: "Inventory received" }, { code: row.contraAccountCode || cashCode(meta.paymentMethod), debit: 0,` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 135:** `if (type === "payroll") return { sourceType: "payroll_journal", lines: [{ code: row.accountCode || "5200", debit: amount, credit: 0, description: "Payroll expense" }, { code: row.contraAccountCode || "2140", debit: 0, cr` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 136:** `if (type === "accrual") return { sourceType: "accrual", lines: [{ code: row.accountCode || "5200", debit: amount, credit: 0, description: "Accrued expense" }, { code: row.contraAccountCode || "2000", debit: 0, credit: am` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 137:** `if (type === "prepayment") return { sourceType: "prepayment", lines: [{ code: row.accountCode || "1300", debit: amount, credit: 0, description: "Prepayment asset" }, { code: row.contraAccountCode || cashCode(meta.payment` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 138:** `if (type === "fx") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 139:** `const direction = String(body.direction || meta.direction || "in").toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 140:** `return direction === "out" ? { sourceType: "fx_loss", lines: [{ code: "7010", debit: amount, credit: 0, description: "Foreign exchange loss" }, { code: row.contraAccountCode || "1100", debit: 0, credit: amount, descripti` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 142:** `throw new Error("Unsupported accounting subledger type.");` — Stops the current operation with an error; callers or Express error handling determine the response.

### `createSubledger` — lines 145–163

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.user. Persistent operations detected: AccountingSubledger.create, AccountingSubledger.deleteOne; verify tenant/ownership filters in the exact query. 4 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 10 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 146:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 147:** `const tenantId = requireTenantId(); const b = req.body || {}; const type = String(b.type || "").trim().toLowerCase(); const amount = money(b.amount); const currency = normalizeCurrency(b.currency); const rate = Number(b.` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 148:** `if (!allowed.has(type)) return res.status(400).json({ success: false, message: "Unsupported accounting subledger type." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 149:** `if (!b.reference || !String(b.reference).trim()) return res.status(400).json({ success: false, message: "Reference is required." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 150:** `if (!b.description || !String(b.description).trim()) return res.status(400).json({ success: false, message: "Description is required." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 151:** `if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ success: false, message: "Amount must be greater than zero." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 152:** `const currencyError = validateCurrencyAndRate(currency, rate); if (currencyError) return res.status(400).json({ success: false, message: currencyError });` — Builds an HTTP response with an explicit status and JSON payload.
- **Line 153:** `if (type === "inventory" && (!Number.isFinite(quantity) || quantity <= 0)) return res.status(400).json({ success: false, message: "Inventory quantity must be greater than zero." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 154:** `if (type === "inventory" && unitCost <= 0) return res.status(400).json({ success: false, message: "Inventory unit cost must be greater than zero." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 155:** `if (!["in", "out"].includes(direction)) return res.status(400).json({ success: false, message: "Direction must be in or out." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 156:** `const baseAmount = money(amount * rate); const metadata = { ...(b.metadata || {}), direction };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 157:** `const row = await AccountingSubledger.create({ tenantId, type, reference: String(b.reference).trim(), transactionDate: b.transactionDate || new Date(), description: String(b.description).trim(), amount, currency, exchang` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 158:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 159:** `const posting = buildPosting(row, b); const entry = await postFinanceEntry({ tenantId, sourceType: posting.sourceType, sourceId: row._id, description: row.description, reference: row.reference, date: row.transactionDate,` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 160:** `row.journalEntry = entry?._id || null; row.status = "posted"; row.postedBy = req.user?._id || null; row.postedAt = new Date(); await row.save(); return res.status(201).json({ success: true, data: row });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 161:** `} catch (postingError) { await AccountingSubledger.deleteOne({ _id: row._id, tenantId }); throw postingError; }` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 162:** `} catch (e) { if (e?.code === 11000) return res.status(409).json({ success: false, message: "This subledger reference already exists for the tenant." }); next(e); }` — Builds an HTTP response with an explicit status and JSON payload.

### `amortizeSubledger` — lines 165–172

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.body. Persistent operations detected: AccountingSubledger.findOne; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 166:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 167:** `const tenantId = requireTenantId(); const row = await AccountingSubledger.findOne(mergeTenantFilter(req, { _id: req.params.id })); if (!row) return res.status(404).json({ success: false, message: "Subledger record not fo` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 168:** `const amount = money(req.body?.amount); if (amount <= 0 || amount > money(row.baseAmount)) return res.status(400).json({ success: false, message: "Amortization amount must be positive and cannot exceed the prepayment bal` — Builds an HTTP response with an explicit status and JSON payload.
- **Line 169:** `const posting = await postFinanceEntry({ tenantId, sourceType: "prepayment_amortization", sourceId: hashId(\`${row._id}:${req.body?.reference || ""}:${amount}\`), description: \`Prepayment amortization: ${row.description` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 170:** `row.baseAmount = money(row.baseAmount - amount); row.status = row.baseAmount <= 0 ? "settled" : "posted"; await row.save(); return res.json({ success: true, data: row, journalEntry: posting?._id || null });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `reverseAccrual` — lines 174–181

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.body. Persistent operations detected: AccountingSubledger.findOne; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 175:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 176:** `const tenantId = requireTenantId(); const row = await AccountingSubledger.findOne(mergeTenantFilter(req, { _id: req.params.id })); if (!row) return res.status(404).json({ status: 404, success: false, message: "Subledger ` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 177:** `const amount = money(req.body?.amount || row.baseAmount); if (amount <= 0 || amount > money(row.baseAmount)) return res.status(400).json({ success: false, message: "Invalid accrual reversal amount." });` — Builds an HTTP response with an explicit status and JSON payload.
- **Line 178:** `const posting = await postFinanceEntry({ tenantId, sourceType: "accrual_reversal", sourceId: hashId(\`${row._id}:reverse:${req.body?.reference || ""}:${amount}\`), description: \`Accrual reversal: ${row.description}\`, r` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 179:** `row.baseAmount = money(row.baseAmount - amount); row.status = row.baseAmount <= 0 ? "settled" : "posted"; await row.save(); return res.json({ success: true, data: row, journalEntry: posting?._id || null });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

## Module-level declarations

- Line 8: `const money = (n) => Math.round(Number(n || 0) * 100) / 100;`.
- Line 9: `const allowed = new Set(["inventory", "payroll", "accrual", "prepayment", "fx"]);`.
- Line 10: `const hashId = (value) => new mongoose.Types.ObjectId(crypto.createHash("sha256").update(String(value)).digest("hex").slice(0, 24));`.
- Line 11: `const cashCode = (method) => { const m = String(method || "BANK").toUpperCase(); return m === "MPESA" ? "1020" : m === "CARD" ? "1030" : m === "CASH" ? "1000" : "1010"; };`.
- Line 13: `const normalizeCurrency = (value) => String(value || "KES").trim().toUpperCase();`.
- Line 14: `const validateCurrencyAndRate = (currency, rate) => {`.
- Line 22: `const JOURNAL_SUBLEDGER_TYPES = {`.
- Line 37: `const journalAmount = (entry) => money((entry?.lines || []).reduce((sum, line) => sum + Number(line.debit || 0), 0));`.
- Line 39: `const classifyJournal = (entry) => {`.
- Line 40: `const explicit = JOURNAL_SUBLEDGER_TYPES[String(entry?.sourceType || "").toLowerCase()];`.
- Line 42: `const codes = new Set((entry?.lines || []).map((line) => String(line?.account?.code || "").trim()));`.
- Line 51: `const journalFallbackRows = async ({ tenantId, type }) => {`.
- Line 52: `const entries = await JournalEntry.find({ tenantId, status: { $nin: ["void", "voided"] } })`.
- Line 59: `const mappedType = classifyJournal(entry);`.
- Line 61: `const amount = journalAmount(entry);`.
- Line 63: `const codes = (entry.lines || []).map((line) => String(line?.account?.code || "").trim()).filter(Boolean);`.
- Line 64: `const journalDate = entry.entryDate || entry.createdAt;`.
- Line 89: `export const listSubledger = async (req, res, next) => {`.
- Line 91: `const tenantId = requireTenantId();`.
- Line 92: `const q = mergeTenantFilter(req, {});`.
- Line 93: `const requestedType = req.query.type ? String(req.query.type).toLowerCase() : "";`.
- Line 96: `const rows = await AccountingSubledger.find(q)`.
- Line 102: `const data = rows.map((row) => {`.
- Line 103: `const amount = money(row.amount);`.
- Line 104: `const currency = normalizeCurrency(row.currency);`.
- Line 105: `const exchangeRate = Number.isFinite(Number(row.exchangeRate)) && Number(row.exchangeRate) > 0 ? Number(row.exchangeRate) : 1;`.
- Line 106: `const baseAmount = Number.isFinite(Number(row.baseAmount)) && Number(row.baseAmount) >= 0 ? money(row.baseAmount) : money(amount * exchangeRate);`.
- Line 107: `const journalEntry = row.journalEntry || null;`.
- Line 111: `const fallbackRows = await journalFallbackRows({ tenantId, type: requestedType === "all" ? "" : requestedType });`.
- Line 112: `const representedJournalIds = new Set(data.map((row) => row.journalEntry?._id ? String(row.journalEntry._id) : "").filter(Boolean));`.
- Line 113: `const linkedRows = fallbackRows.filter((row) => !representedJournalIds.has(String(row.journalEntry._id)));`.
- Line 114: `const combined = [...data, ...linkedRows].sort((a, b) => new Date(b.transactionDate || 0) - new Date(a.transactionDate || 0)).slice(0, 500);`.
- Line 116: `const summary = {`.
- Line 127: `const buildPosting = (row, body = {}) => {`.
- Line 128: `const amount = money(row.baseAmount || row.amount); const type = row.type; const meta = row.metadata || {};`.
- Line 131: `const action = String(body.transactionType || meta.transactionType || (meta.direction === "out" ? "issue" : "receipt")).toLowerCase();`.
- Line 139: `const direction = String(body.direction || meta.direction || "in").toLowerCase();`.
- Line 145: `export const createSubledger = async (req, res, next) => {`.
- Line 147: `const tenantId = requireTenantId(); const b = req.body || {}; const type = String(b.type || "").trim().toLowerCase(); const amount = money(b.amount); const currency = normalizeCurr`.
- Line 152: `const currencyError = validateCurrencyAndRate(currency, rate); if (currencyError) return res.status(400).json({ success: false, message: currencyError });`.
- Line 156: `const baseAmount = money(amount * rate); const metadata = { ...(b.metadata || {}), direction };`.
- Line 157: `const row = await AccountingSubledger.create({ tenantId, type, reference: String(b.reference).trim(), transactionDate: b.transactionDate || new Date(), description: String(b.descri`.
- Line 159: `const posting = buildPosting(row, b); const entry = await postFinanceEntry({ tenantId, sourceType: posting.sourceType, sourceId: row._id, description: row.description, reference: r`.
- Line 165: `export const amortizeSubledger = async (req, res, next) => {`.
- Line 167: `const tenantId = requireTenantId(); const row = await AccountingSubledger.findOne(mergeTenantFilter(req, { _id: req.params.id })); if (!row) return res.status(404).json({ success: `.
- Line 168: `const amount = money(req.body?.amount); if (amount <= 0 || amount > money(row.baseAmount)) return res.status(400).json({ success: false, message: "Amortization amount must be posit`.
- Line 169: `const posting = await postFinanceEntry({ tenantId, sourceType: "prepayment_amortization", sourceId: hashId(\`${row._id}:${req.body?.reference || ""}:${amount}\`), description: \`Pr`.
- Line 174: `export const reverseAccrual = async (req, res, next) => {`.
- Line 176: `const tenantId = requireTenantId(); const row = await AccountingSubledger.findOne(mergeTenantFilter(req, { _id: req.params.id })); if (!row) return res.status(404).json({ status: 4`.
- Line 177: `const amount = money(req.body?.amount || row.baseAmount); if (amount <= 0 || amount > money(row.baseAmount)) return res.status(400).json({ success: false, message: "Invalid accrual`.
- Line 178: `const posting = await postFinanceEntry({ tenantId, sourceType: "accrual_reversal", sourceId: hashId(\`${row._id}:reverse:${req.body?.reference || ""}:${amount}\`), description: \`A`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
