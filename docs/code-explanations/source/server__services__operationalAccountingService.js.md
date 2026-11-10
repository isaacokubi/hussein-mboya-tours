# Source explanation: server/services/operationalAccountingService.js

**Source:** [server/services/operationalAccountingService.js](../../../server/services/operationalAccountingService.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `crypto` from `node:crypto`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `JournalEntry` from `../models/JournalEntry.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/JournalEntry.js](../../../server/models/JournalEntry.js)
- `ChartOfAccount` from `../models/ChartOfAccount.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/ChartOfAccount.js](../../../server/models/ChartOfAccount.js)
- `Invoice` from `../models/Invoice.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Invoice.js](../../../server/models/Invoice.js)

## Runtime declarations and data flow

### `round` — lines 6–6

Parameters: `n`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `safeReference` — lines 7–7

Parameters: `...values`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 7:** `(...values) => values.map((value) => String(value ?? "").trim()).find((value) => value && !/^(undefined|null|nan)$/i.test(value)) || ""` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.

### `invalidateAccountCache` — lines 11–18

Parameters: `tenantId (defaulted)`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 12:** `const prefix = tenantId ? \`${String(tenantId)}:\` : "";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 13:** `for (const key of accountCache.keys()) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 14:** `if (!prefix || key === \`__ready__:${String(tenantId)}\` || key.startsWith(prefix)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.

### `account` — lines 20–28

Parameters: `tenantId`, `code`.
Persistent operations detected: ChartOfAccount.findOne; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 21:** `const key = String(tenantId) + ":" + code;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 22:** `const cached = accountCache.get(key);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 23:** `if (cached && cached.expiresAt > Date.now()) return cached.value;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 25:** `const value = await ChartOfAccount.findOne({ tenantId, code, active: true }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 26:** `if (value) accountCache.set(key, { value, expiresAt: Date.now() + ACCOUNT_CACHE_TTL_MS });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 27:** `return value;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `ensureAccounts` — lines 29–54

Parameters: `tenantId`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 30:** `const tenantKey = String(tenantId);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 31:** `const readyKey = "__ready__:" + tenantKey;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 32:** `const readyAt = accountCache.get(readyKey);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 33:** `if (readyAt && readyAt > Date.now()) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 35:** `const defaults = [` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 43:** `await ChartOfAccount.bulkWrite(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `postOnce` — lines 56–91

Parameters: `{tenantId, sourceType, sourceId, date, description, reference, lines, session}`.
Persistent operations detected: JournalEntry.findOne, ChartOfAccount.findOne, JournalEntry.create; verify tenant/ownership filters in the exact query. 6 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 10 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 57:** `if (!tenantId || !sourceId || !lines?.length) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 58:** `const existingQuery = JournalEntry.findOne({ tenantId, sourceType, sourceId });` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 59:** `if (session) existingQuery.session(session);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 60:** `const existing = await existingQuery.lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 61:** `if (existing) return existing;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 62:** `await ensureAccounts(tenantId);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 63:** `const resolved = [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 64:** `for (const line of lines) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 68:** `const acc = line.code` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 71:** `? await ChartOfAccount.findOne({ tenantId, _id: line.account, active: true }).lean()` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 73:** `if (!acc) throw new Error(\`Accounting account ${line.code || line.account || "unknown"} is unavailable for tenant.\`);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 76:** `const totalDebit = round(resolved.reduce((s, l) => s + l.debit, 0));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 77:** `const totalCredit = round(resolved.reduce((s, l) => s + l.credit, 0));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 78:** `if (totalDebit <= 0 || Math.abs(totalDebit - totalCredit) > 0.01) throw new Error("Operational accounting entry must be balanced and non-zero.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 79:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 80:** `const entry = { tenantId, entryDate: date || new Date(), description, reference: reference || "", sourceType, sourceId, status: "posted", lines: resolved, postedAt: new Date() };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 81:** `if (session) return (await JournalEntry.create([entry], { session }))[0];` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 82:** `return await JournalEntry.create(entry);` — Exits this function and supplies its result (or response short-circuit) to the caller.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `reverseJournalOnce` — lines 93–122

Parameters: `{tenantId, originalJournal, sourceType, sourceId, date, description, reference}`.
Persistent operations detected: JournalEntry.findOne, JournalEntry.create; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 94:** `if (!tenantId || !originalJournal?._id || !sourceType || !sourceId) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 95:** `const existing = await JournalEntry.findOne({ tenantId, sourceType, sourceId }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 96:** `if (existing) return existing;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 97:** `const lines = (originalJournal.lines || []).map((line) => ({` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 103:** `const totalDebit = round(lines.reduce((sum, line) => sum + line.debit, 0));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 104:** `const totalCredit = round(lines.reduce((sum, line) => sum + line.credit, 0));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 105:** `if (totalDebit <= 0 || Math.abs(totalDebit - totalCredit) > 0.01) throw new Error("Journal reversal must be balanced and non-zero.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 106:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 107:** `return await JournalEntry.create({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 119:** `if (error?.code === 11000) return JournalEntry.findOne({ tenantId, sourceType, sourceId }).lean();` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 120:** `throw error;` — Stops the current operation with an error; callers or Express error handling determine the response.

### `postInvoiceToLedger` — lines 124–133

Parameters: `invoice`, `arg2 (defaulted)`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 125:** `if (!invoice || invoice.isDeleted || ["draft", "cancelled"].includes(invoice.status)) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 126:** `const total = Math.max(0, round(invoice.totalAmount));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 127:** `const tax = Math.max(0, Math.min(total, round(invoice.tax)));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 128:** `const revenue = round(total - tax);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 129:** `const revenueCode = invoice.hospitalityType === "hotel" ? "4010" : invoice.hospitalityType === "airport_transfer" ? "4020" : "4000";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 130:** `const lines = [{ code: "1100", debit: total, credit: 0, description: "Accounts receivable" }, { code: revenueCode, debit: 0, credit: revenue, description: invoice.hospitalityType === "hotel" ? "Hotel revenue" : invoice.h` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 131:** `if (tax > 0) lines.push({ code: "2110", debit: 0, credit: tax, description: "Output VAT" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 132:** `return postOnce({ session, tenantId: invoice.tenantId, sourceType: "invoice", sourceId: invoice._id, date: invoice.issueDate, description: \`Invoice ${invoice.invoiceNumber}\`, reference: invoice.invoiceNumber, lines });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `postPaymentToLedger` — lines 135–148

Parameters: `payment`, `arg2 (defaulted)`.
4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 138:** `if (!payment || !["completed", "refunded"].includes(String(payment.status || "").toLowerCase())) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 139:** `const provider = String(payment.provider || payment.paymentMethod || "").toUpperCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 140:** `const cashCode = provider === "MPESA" ? "1020" : provider === "CARD" || provider === "STRIPE" || provider === "PAYPAL" || provider === "PESAPAL" ? "1030" : provider === "CASH" ? "1000" : "1010";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 141:** `const gross = round(payment.amount);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 142:** `const fee = round(payment.feeAmount || payment.paymentFee || payment.transactionFee || payment.gatewayFee || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 143:** `if (gross <= 0) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 144:** `if (fee > gross) throw new Error("Payment fee cannot exceed the payment amount.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 145:** `const lines = [{ code: cashCode, debit: round(gross - fee), credit: 0, description: "Net payment settlement" }, { code: "1100", debit: 0, credit: gross, description: "Accounts receivable" }];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 146:** `if (fee > 0) lines.push({ code: "5260", debit: fee, credit: 0, description: "Payment provider fee" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 147:** `return postOnce({ session, tenantId: payment.tenantId, sourceType: "payment", sourceId: payment._id, date: payment.paidAt || payment.updatedAt, description: \`${payment.hospitalityType ? \`${payment.hospitalityType} \` :` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `postPaymentRefundToLedger` — lines 150–242

Parameters: `payment`, `refundAmount (defaulted)`, `refundReference (defaulted)`, `arg4 (defaulted)`.
Persistent operations detected: Invoice.findOne, JournalEntry.findOne, ChartOfAccount.find; verify tenant/ownership filters in the exact query. 12 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 11 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 151:** `if (!payment || !payment.tenantId) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 152:** `const amount = round(refundAmount ?? payment.refundedAmount ?? 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 153:** `if (amount <= 0) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 154:** `const originalAmount = round(payment.amount);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 155:** `if (amount > originalAmount) throw new Error("Refund cannot exceed the original payment amount.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 156:** `const provider = String(payment.provider || payment.paymentMethod || "").toUpperCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 157:** `const cashCode = provider === "MPESA" ? "1020" : provider === "CARD" || provider === "STRIPE" || provider === "PAYPAL" || provider === "PESAPAL" ? "1030" : provider === "CASH" ? "1000" : "1010";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 158:** `const reference = safeReference(refundReference, payment.refundReference, "REFUND-" + payment._id + "-" + amount);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 159:** `const sourceId = payment._id;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 161:** `const invoice = payment.invoiceNumber` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 162:** `? await Invoice.findOne({ tenantId: payment.tenantId, invoiceNumber: payment.invoiceNumber, isDeleted: { $ne: true } }).lean()` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 164:** `? await Invoice.findOne({ tenantId: payment.tenantId, booking: payment.booking, isDeleted: { $ne: true } }).lean()` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 166:** `? await Invoice.findOne({ tenantId: payment.tenantId, hospitalityBooking: payment.hospitalityBooking, isDeleted: { $ne: true } }).lean()` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 171:** `const existingRefund = await JournalEntry.findOne({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 181:** `if (existingRefund) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 182:** `const lineAccounts = await ChartOfAccount.find({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 187:** `const codeById = new Map(lineAccounts.map((item) => [String(item._id), item.code]));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 188:** `const arLine = (existingRefund.lines || []).find((line) => codeById.get(String(line.account)) === "1100" && Number(line.debit || 0) > 0);` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `postExpenseToLedger` — lines 243–259

Parameters: `expense`.
5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 244:** `if (!expense || expense.status === "draft" || expense.status === "cancelled") return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 245:** `const gross = round(Number(expense.amount || 0) + Number(expense.taxAmount || 0));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 246:** `const inputTax = round(Number(expense.taxAmount || 0));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 247:** `const net = round(Number(expense.amount || 0));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 248:** `if (gross <= 0) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 249:** `const expenseCode = ["hotel", "accommodation"].includes(String(expense.category || "").toLowerCase()) ? "5010" : ["transport", "fuel"].includes(String(expense.category || "").toLowerCase()) ? "5020" : ["commission", "com` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 250:** `const lines = [{ code: expenseCode, debit: net, credit: 0, description: expense.description }];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 251:** `if (inputTax > 0) lines.push({ code: "2120", debit: inputTax, credit: 0, description: "Input VAT" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 252:** `if (expense.supplier) lines.push({ code: "2000", debit: 0, credit: gross, description: "Supplier payable" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 253:** `else {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 254:** `const method = String(expense.paymentMethod || "").toUpperCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 255:** `const cashCode = method === "MPESA" ? "1020" : method === "CARD" ? "1030" : method === "CASH" ? "1000" : "1010";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 258:** `return postOnce({ tenantId: expense.tenantId, sourceType: "expense_accrual", sourceId: expense._id, date: expense.expenseDate, description: \`Expense ${expense.expenseNumber}: ${expense.description}\`, reference: expense` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `postExpensePaymentToLedger` — lines 261–268

Parameters: `expense`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 262:** `if (!expense || expense.status !== "paid" || !expense.supplier) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 263:** `const amount = round(Number(expense.amount || 0) + Number(expense.taxAmount || 0));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 264:** `if (amount <= 0) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 265:** `const method = String(expense.paymentMethod || "").toUpperCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 266:** `const cashCode = method === "MPESA" ? "1020" : method === "CARD" ? "1030" : method === "CASH" ? "1000" : "1010";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 267:** `return postOnce({ tenantId: expense.tenantId, sourceType: "expense_payment", sourceId: expense._id, date: expense.paidAt || expense.expenseDate, description: \`Expense payment ${expense.expenseNumber}\`, reference: expen` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `postSupplierPayableToLedger` — lines 270–275

Parameters: `payable`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 271:** `if (!payable || !payable.tenantId || payable.status === "cancelled") return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 272:** `const amount = round(payable.amount);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 273:** `if (amount <= 0) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 274:** `return postOnce({ tenantId: payable.tenantId, sourceType: "supplier_payable", sourceId: payable._id, date: payable.createdAt, description: \`Supplier payable ${payable.payableNumber || payable._id}\`, reference: payable.` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `postSupplierPaymentToLedger` — lines 277–287

Parameters: `payable`, `amount (defaulted)`, `paymentReference (defaulted)`, `paymentMethod (defaulted)`.
3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 278:** `if (!payable || !payable.tenantId) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 279:** `const paid = round(amount ?? payable.amountPaid ?? 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 280:** `if (paid <= 0) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 281:** `if (paid > round(payable.amount)) throw new Error("Supplier settlement cannot exceed the payable amount.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 282:** `const method = String(paymentMethod || "BANK_TRANSFER").toUpperCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 283:** `const cashCode = method === "MPESA" ? "1020" : method === "CARD" ? "1030" : method === "CASH" ? "1000" : "1010";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 284:** `const reference = safeReference(paymentReference, payable.paymentReference, \`SUPPLIER-${payable._id}-${paid}\`);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 285:** `const sourceId = crypto.createHash("sha256").update(\`${payable._id}:${reference}:${paid}\`).digest("hex").slice(0, 24);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 286:** `return postOnce({ tenantId: payable.tenantId, sourceType: "supplier_payable_payment", sourceId, description: \`Supplier payable settlement ${payable.payableNumber || payable._id}\`, reference, date: new Date(), lines: [{` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 6: `const round = (n) => Math.round(Number(n || 0) * 100) / 100;`.
- Line 7: `const safeReference = (...values) => values.map((value) => String(value ?? "").trim()).find((value) => value && !/^(undefined|null|nan)$/i.test(value)) || "";`.
- Line 8: `const ACCOUNT_CACHE_TTL_MS = Math.max(5_000, Number(process.env.ACCOUNT_CACHE_TTL_MS || 60_000));`.
- Line 9: `const accountCache = new Map();`.
- Line 11: `const invalidateAccountCache = (tenantId = null) => {`.
- Line 12: `const prefix = tenantId ? \`${String(tenantId)}:\` : "";`.
- Line 20: `const account = async (tenantId, code) => {`.
- Line 21: `const key = String(tenantId) + ":" + code;`.
- Line 22: `const cached = accountCache.get(key);`.
- Line 25: `const value = await ChartOfAccount.findOne({ tenantId, code, active: true }).lean();`.
- Line 29: `const ensureAccounts = async (tenantId) => {`.
- Line 30: `const tenantKey = String(tenantId);`.
- Line 31: `const readyKey = "__ready__:" + tenantKey;`.
- Line 32: `const readyAt = accountCache.get(readyKey);`.
- Line 35: `const defaults = [`.
- Line 56: `const postOnce = async ({ tenantId, sourceType, sourceId, date, description, reference, lines, session = null }) => {`.
- Line 58: `const existingQuery = JournalEntry.findOne({ tenantId, sourceType, sourceId });`.
- Line 60: `const existing = await existingQuery.lean();`.
- Line 63: `const resolved = [];`.
- Line 68: `const acc = line.code`.
- Line 76: `const totalDebit = round(resolved.reduce((s, l) => s + l.debit, 0));`.
- Line 77: `const totalCredit = round(resolved.reduce((s, l) => s + l.credit, 0));`.
- Line 80: `const entry = { tenantId, entryDate: date || new Date(), description, reference: reference || "", sourceType, sourceId, status: "posted", lines: resolved, postedAt: new Date() };`.
- Line 85: `const retryQuery = JournalEntry.findOne({ tenantId, sourceType, sourceId });`.
- Line 93: `export const reverseJournalOnce = async ({ tenantId, originalJournal, sourceType, sourceId, date, description, reference }) => {`.
- Line 95: `const existing = await JournalEntry.findOne({ tenantId, sourceType, sourceId }).lean();`.
- Line 97: `const lines = (originalJournal.lines || []).map((line) => ({`.
- Line 103: `const totalDebit = round(lines.reduce((sum, line) => sum + line.debit, 0));`.
- Line 104: `const totalCredit = round(lines.reduce((sum, line) => sum + line.credit, 0));`.
- Line 124: `export const postInvoiceToLedger = async (invoice, { session = null } = {}) => {`.
- Line 126: `const total = Math.max(0, round(invoice.totalAmount));`.
- Line 127: `const tax = Math.max(0, Math.min(total, round(invoice.tax)));`.
- Line 128: `const revenue = round(total - tax);`.
- Line 129: `const revenueCode = invoice.hospitalityType === "hotel" ? "4010" : invoice.hospitalityType === "airport_transfer" ? "4020" : "4000";`.
- Line 130: `const lines = [{ code: "1100", debit: total, credit: 0, description: "Accounts receivable" }, { code: revenueCode, debit: 0, credit: revenue, description: invoice.hospitalityType =`.
- Line 135: `export const postPaymentToLedger = async (payment, { session = null } = {}) => {`.
- Line 139: `const provider = String(payment.provider || payment.paymentMethod || "").toUpperCase();`.
- Line 140: `const cashCode = provider === "MPESA" ? "1020" : provider === "CARD" || provider === "STRIPE" || provider === "PAYPAL" || provider === "PESAPAL" ? "1030" : provider === "CASH" ? "1`.
- Line 141: `const gross = round(payment.amount);`.
- Line 142: `const fee = round(payment.feeAmount || payment.paymentFee || payment.transactionFee || payment.gatewayFee || 0);`.
- Line 145: `const lines = [{ code: cashCode, debit: round(gross - fee), credit: 0, description: "Net payment settlement" }, { code: "1100", debit: 0, credit: gross, description: "Accounts rece`.
- Line 150: `export const postPaymentRefundToLedger = async (payment, refundAmount = null, refundReference = "", { session = null } = {}) => {`.
- Line 152: `const amount = round(refundAmount ?? payment.refundedAmount ?? 0);`.
- Line 154: `const originalAmount = round(payment.amount);`.
- Line 156: `const provider = String(payment.provider || payment.paymentMethod || "").toUpperCase();`.
- Line 157: `const cashCode = provider === "MPESA" ? "1020" : provider === "CARD" || provider === "STRIPE" || provider === "PAYPAL" || provider === "PESAPAL" ? "1030" : provider === "CASH" ? "1`.
- Line 158: `const reference = safeReference(refundReference, payment.refundReference, "REFUND-" + payment._id + "-" + amount);`.
- Line 159: `const sourceId = payment._id;`.
- Line 161: `const invoice = payment.invoiceNumber`.
- Line 171: `const existingRefund = await JournalEntry.findOne({`.
- Line 182: `const lineAccounts = await ChartOfAccount.find({`.
- Line 187: `const codeById = new Map(lineAccounts.map((item) => [String(item._id), item.code]));`.
- Line 188: `const arLine = (existingRefund.lines || []).find((line) => codeById.get(String(line.account)) === "1100" && Number(line.debit || 0) > 0);`.
- Line 189: `const existingCashLine = (existingRefund.lines || []).find((line) => ["1000", "1010", "1020", "1030"].includes(codeById.get(String(line.account))) && Number(line.credit || 0) > 0);`.
- Line 205: `const invoiceTotal = Math.max(0, round(invoice?.totalAmount));`.
- Line 206: `const invoiceTax = Math.max(0, Math.min(invoiceTotal, round(invoice?.tax)));`.
- Line 207: `const ratio = invoiceTotal > 0 ? Math.min(1, amount / invoiceTotal) : 1;`.
- Line 208: `const taxReversal = round(invoiceTax * ratio);`.
- Line 209: `const revenueReversal = round(amount - taxReversal);`.
- Line 210: `const revenueCode = invoice?.hospitalityType === "hotel" ? "4010" : invoice?.hospitalityType === "airport_transfer" ? "4020" : "4000";`.
- Line 211: `const revenueAccount = await account(payment.tenantId, revenueCode);`.
- Line 212: `const cashAccount = await account(payment.tenantId, codeById.get(String(existingCashLine.account)));`.
- Line 213: `const correctionLines = [`.
- Line 233: `const invoiceTotal = Math.max(0, round(invoice?.totalAmount));`.
- Line 234: `const invoiceTax = Math.max(0, Math.min(invoiceTotal, round(invoice?.tax)));`.
- Line 235: `const refundRatio = invoiceTotal > 0 ? Math.min(1, amount / invoiceTotal) : 1;`.
- Line 236: `const taxReversal = round(invoiceTax * refundRatio);`.
- Line 237: `const revenueReversal = round(amount - taxReversal);`.
- Line 238: `const revenueCode = invoice?.hospitalityType === "hotel" ? "4010" : invoice?.hospitalityType === "airport_transfer" ? "4020" : "4000";`.
- Line 239: `const lines = [{ code: revenueCode, debit: revenueReversal, credit: 0, description: "Revenue reversal for customer refund" }, { code: cashCode, debit: 0, credit: amount, descriptio`.
- Line 243: `export const postExpenseToLedger = async (expense) => {`.
- Line 245: `const gross = round(Number(expense.amount || 0) + Number(expense.taxAmount || 0));`.
- Line 246: `const inputTax = round(Number(expense.taxAmount || 0));`.
- Line 247: `const net = round(Number(expense.amount || 0));`.
- Line 249: `const expenseCode = ["hotel", "accommodation"].includes(String(expense.category || "").toLowerCase()) ? "5010" : ["transport", "fuel"].includes(String(expense.category || "").toLow`.
- Line 250: `const lines = [{ code: expenseCode, debit: net, credit: 0, description: expense.description }];`.
- Line 254: `const method = String(expense.paymentMethod || "").toUpperCase();`.
- Line 255: `const cashCode = method === "MPESA" ? "1020" : method === "CARD" ? "1030" : method === "CASH" ? "1000" : "1010";`.
- Line 261: `export const postExpensePaymentToLedger = async (expense) => {`.
- Line 263: `const amount = round(Number(expense.amount || 0) + Number(expense.taxAmount || 0));`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
