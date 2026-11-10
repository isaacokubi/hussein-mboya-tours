# Source explanation: server/controllers/accountingReportsController.js

**Source:** [server/controllers/accountingReportsController.js](../../../server/controllers/accountingReportsController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `ChartOfAccount` from `../models/ChartOfAccount.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/ChartOfAccount.js](../../../server/models/ChartOfAccount.js)
- `JournalEntry` from `../models/JournalEntry.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/JournalEntry.js](../../../server/models/JournalEntry.js)
- `Invoice` from `../models/Invoice.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Invoice.js](../../../server/models/Invoice.js)
- `SupplierPayable` from `../models/SupplierPayable.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/SupplierPayable.js](../../../server/models/SupplierPayable.js)
- `tenantFilter` from `../tenancy/tenantQuery.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/tenantQuery.js](../../../server/tenancy/tenantQuery.js)

## Runtime declarations and data flow

### `money` — lines 7–7

Parameters: `n`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `ageBucket` — lines 8–8

Parameters: `days`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `dateFilter` — lines 10–28

Parameters: `req`, `field (defaulted)`.
Reads request/component inputs: req.query. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 11:** `const filter = {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 12:** `if (req.query.from || req.query.to) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 14:** `if (req.query.from) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 15:** `const from = new Date(req.query.from);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 16:** `if (Number.isNaN(from.getTime())) throw new Error("Invalid from date.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 20:** `if (req.query.to) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 21:** `const to = new Date(req.query.to);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 22:** `if (Number.isNaN(to.getTime())) throw new Error("Invalid to date.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 27:** `return filter;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getLedger` — lines 30–39

Parameters: `req`.
Persistent operations detected: ChartOfAccount.find, JournalEntry.find; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 31:** `const accounts = await ChartOfAccount.find({ ...tenantFilter(req), active: { $ne: false } }).sort({ code: 1 }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 32:** `const entries = await JournalEntry.find({ ...tenantFilter(req), status: "posted", ...dateFilter(req) }).select("entryDate lines").lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 33:** `const balances = new Map(accounts.map((a) => [String(a._id), { account: a, debit: 0, credit: 0 }]));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 34:** `for (const entry of entries) for (const line of entry.lines || []) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 35:** `const row = balances.get(String(line.account));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 36:** `if (row) { row.debit += Number(line.debit || 0); row.credit += Number(line.credit || 0); }` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 38:** `return [...balances.values()].map((row) => ({ ...row, debit: money(row.debit), credit: money(row.credit), balance: money(["asset", "expense"].includes(row.account.type) ? row.debit - row.credit : row.credit - row.debit) ` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getFinancialStatements` — lines 41–64

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 42:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 43:** `const rows = await getLedger(req);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 44:** `const revenue = rows.filter((r) => r.account.type === "revenue");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 45:** `const expenses = rows.filter((r) => r.account.type === "expense");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 46:** `const assets = rows.filter((r) => r.account.type === "asset");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 47:** `const liabilities = rows.filter((r) => r.account.type === "liability");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 48:** `const equity = rows.filter((r) => r.account.type === "equity");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 49:** `const revenueTotal = money(revenue.reduce((s, r) => s + r.balance, 0));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 50:** `const expenseTotal = money(expenses.reduce((s, r) => s + r.balance, 0));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 51:** `const netProfit = money(revenueTotal - expenseTotal);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 52:** `const assetTotal = money(assets.reduce((s, r) => s + r.balance, 0));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 53:** `const liabilityTotal = money(liabilities.reduce((s, r) => s + r.balance, 0));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 54:** `const equityTotal = money(equity.reduce((s, r) => s + r.balance, 0));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 55:** `const cashAccounts = rows.filter((r) => ["cash", "bank", "mobile_money", "payment_clearing"].includes(r.account.subtype));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 56:** `const cashPosition = money(cashAccounts.reduce((s, r) => s + r.balance, 0));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 57:** `return res.json({ success: true, data: {` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getArAging` — lines 66–80

Parameters: `req`, `res`, `next`.
Persistent operations detected: Invoice.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 67:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 68:** `const invoices = await Invoice.find({ ...tenantFilter(req), isDeleted: { $ne: true }, status: { $nin: ["draft", "cancelled", "paid"] }, balance: { $gt: 0 } }).select("invoiceNumber issueDate dueDate totalAmount amountPai` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 69:** `const buckets = { current: 0, "1_30": 0, "31_60": 0, "61_90": 0, "90_plus": 0 };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 70:** `const today = Date.now();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 71:** `const data = invoices.map((invoice) => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 72:** `const due = new Date(invoice.dueDate || invoice.issueDate || today).getTime();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 73:** `const days = Math.ceil((today - due) / 86400000);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 74:** `const bucket = ageBucket(days);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 76:** `return { ...invoice, balance: money(invoice.balance), daysOverdue: Math.max(0, days), bucket };` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 78:** `return res.json({ success: true, data: { buckets: Object.fromEntries(Object.entries(buckets).map(([k, v]) => [k, money(v)])), totalOutstanding: money(data.reduce((s, r) => s + r.balance, 0)), invoices: data } });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getApAging` — lines 82–140

Parameters: `req`, `res`, `next`.
Persistent operations detected: SupplierPayable.find; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 83:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 84:** `const filter = tenantFilter(req);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 85:** `const payables = await SupplierPayable.find({ ...filter, status: { $nin: ["cancelled", "paid"] }, balance: { $gt: 0 } })` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 91:** `const linkedExpenseIds = new Set(payables.filter((p) => p.expense).map((p) => String(p.expense)));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 92:** `const expenses = await (await import("../models/Expense.js")).default.find({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 98:** `const rows = [` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 121:** `const buckets = { current: 0, "1_30": 0, "31_60": 0, "61_90": 0, "90_plus": 0 };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 122:** `const today = Date.now();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 123:** `const data = rows.map((payable) => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 124:** `const due = new Date(payable.dueDate || today).getTime();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 125:** `const days = Math.ceil((today - due) / 86400000);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 126:** `const bucket = ageBucket(days);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 128:** `return { ...payable, balance: money(payable.balance), daysOverdue: Math.max(0, days), bucket };` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 131:** `return res.json({` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getCashFlow` — lines 142–157

Parameters: `req`, `res`, `next`.
Persistent operations detected: ChartOfAccount.find, JournalEntry.find; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 143:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 144:** `const filter = { ...tenantFilter(req), status: "posted", ...dateFilter(req) };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 145:** `const cashCodes = new Map((await ChartOfAccount.find({ ...tenantFilter(req), code: { $in: ["1000", "1010", "1020", "1030"] } }).select("_id code").lean()).map((a) => [String(a._id), a.code]));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 146:** `const entries = await JournalEntry.find(filter).select("entryDate lines description sourceType reference").sort({ entryDate: 1 }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 147:** `const movements = [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 148:** `for (const entry of entries) for (const line of entry.lines || []) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 149:** `const code = cashCodes.get(String(line.account));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 150:** `if (!code) continue;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 151:** `const amount = money(Number(line.debit || 0) - Number(line.credit || 0));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 152:** `if (amount === 0) continue;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 155:** `return res.json({ success: true, data: { movements, netMovement: money(movements.reduce((s, m) => s + m.amount, 0)), inflows: money(movements.filter((m) => m.amount > 0).reduce((s, m) => s + m.amount, 0)), outflows: mone` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 7: `const money = (n) => Math.round(Number(n || 0) * 100) / 100;`.
- Line 8: `const ageBucket = (days) => days <= 0 ? "current" : days <= 30 ? "1_30" : days <= 60 ? "31_60" : days <= 90 ? "61_90" : "90_plus";`.
- Line 10: `const dateFilter = (req, field = "entryDate") => {`.
- Line 11: `const filter = {};`.
- Line 15: `const from = new Date(req.query.from);`.
- Line 21: `const to = new Date(req.query.to);`.
- Line 30: `const getLedger = async (req) => {`.
- Line 31: `const accounts = await ChartOfAccount.find({ ...tenantFilter(req), active: { $ne: false } }).sort({ code: 1 }).lean();`.
- Line 32: `const entries = await JournalEntry.find({ ...tenantFilter(req), status: "posted", ...dateFilter(req) }).select("entryDate lines").lean();`.
- Line 33: `const balances = new Map(accounts.map((a) => [String(a._id), { account: a, debit: 0, credit: 0 }]));`.
- Line 35: `const row = balances.get(String(line.account));`.
- Line 41: `export const getFinancialStatements = async (req, res, next) => {`.
- Line 43: `const rows = await getLedger(req);`.
- Line 44: `const revenue = rows.filter((r) => r.account.type === "revenue");`.
- Line 45: `const expenses = rows.filter((r) => r.account.type === "expense");`.
- Line 46: `const assets = rows.filter((r) => r.account.type === "asset");`.
- Line 47: `const liabilities = rows.filter((r) => r.account.type === "liability");`.
- Line 48: `const equity = rows.filter((r) => r.account.type === "equity");`.
- Line 49: `const revenueTotal = money(revenue.reduce((s, r) => s + r.balance, 0));`.
- Line 50: `const expenseTotal = money(expenses.reduce((s, r) => s + r.balance, 0));`.
- Line 51: `const netProfit = money(revenueTotal - expenseTotal);`.
- Line 52: `const assetTotal = money(assets.reduce((s, r) => s + r.balance, 0));`.
- Line 53: `const liabilityTotal = money(liabilities.reduce((s, r) => s + r.balance, 0));`.
- Line 54: `const equityTotal = money(equity.reduce((s, r) => s + r.balance, 0));`.
- Line 55: `const cashAccounts = rows.filter((r) => ["cash", "bank", "mobile_money", "payment_clearing"].includes(r.account.subtype));`.
- Line 56: `const cashPosition = money(cashAccounts.reduce((s, r) => s + r.balance, 0));`.
- Line 66: `export const getArAging = async (req, res, next) => {`.
- Line 68: `const invoices = await Invoice.find({ ...tenantFilter(req), isDeleted: { $ne: true }, status: { $nin: ["draft", "cancelled", "paid"] }, balance: { $gt: 0 } }).select("invoiceNumber`.
- Line 69: `const buckets = { current: 0, "1_30": 0, "31_60": 0, "61_90": 0, "90_plus": 0 };`.
- Line 70: `const today = Date.now();`.
- Line 71: `const data = invoices.map((invoice) => {`.
- Line 72: `const due = new Date(invoice.dueDate || invoice.issueDate || today).getTime();`.
- Line 73: `const days = Math.ceil((today - due) / 86400000);`.
- Line 74: `const bucket = ageBucket(days);`.
- Line 82: `export const getApAging = async (req, res, next) => {`.
- Line 84: `const filter = tenantFilter(req);`.
- Line 85: `const payables = await SupplierPayable.find({ ...filter, status: { $nin: ["cancelled", "paid"] }, balance: { $gt: 0 } })`.
- Line 91: `const linkedExpenseIds = new Set(payables.filter((p) => p.expense).map((p) => String(p.expense)));`.
- Line 92: `const expenses = await (await import("../models/Expense.js")).default.find({`.
- Line 98: `const rows = [`.
- Line 121: `const buckets = { current: 0, "1_30": 0, "31_60": 0, "61_90": 0, "90_plus": 0 };`.
- Line 122: `const today = Date.now();`.
- Line 123: `const data = rows.map((payable) => {`.
- Line 124: `const due = new Date(payable.dueDate || today).getTime();`.
- Line 125: `const days = Math.ceil((today - due) / 86400000);`.
- Line 126: `const bucket = ageBucket(days);`.
- Line 142: `export const getCashFlow = async (req, res, next) => {`.
- Line 144: `const filter = { ...tenantFilter(req), status: "posted", ...dateFilter(req) };`.
- Line 145: `const cashCodes = new Map((await ChartOfAccount.find({ ...tenantFilter(req), code: { $in: ["1000", "1010", "1020", "1030"] } }).select("_id code").lean()).map((a) => [String(a._id)`.
- Line 146: `const entries = await JournalEntry.find(filter).select("entryDate lines description sourceType reference").sort({ entryDate: 1 }).lean();`.
- Line 147: `const movements = [];`.
- Line 149: `const code = cashCodes.get(String(line.account));`.
- Line 151: `const amount = money(Number(line.debit || 0) - Number(line.credit || 0));`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
