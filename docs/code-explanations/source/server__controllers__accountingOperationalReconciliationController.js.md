# Source explanation: server/controllers/accountingOperationalReconciliationController.js

**Source:** [server/controllers/accountingOperationalReconciliationController.js](../../../server/controllers/accountingOperationalReconciliationController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `publicErrorMessage` from `../utils/publicError.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/utils/publicError.js](../../../server/utils/publicError.js)
- `crypto` from `node:crypto`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Payment` from `../models/Payment.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Payment.js](../../../server/models/Payment.js)
- `Invoice` from `../models/Invoice.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Invoice.js](../../../server/models/Invoice.js)
- `Expense` from `../models/Expense.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Expense.js](../../../server/models/Expense.js)
- `SupplierPayable` from `../models/SupplierPayable.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/SupplierPayable.js](../../../server/models/SupplierPayable.js)
- `JournalEntry` from `../models/JournalEntry.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/JournalEntry.js](../../../server/models/JournalEntry.js)
- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `postPaymentToLedger`, `postPaymentRefundToLedger`, `postInvoiceToLedger`, `postExpenseToLedger`, `postExpensePaymentToLedger`, `postSupplierPayableToLedger`, `postSupplierPaymentToLedger`, `reverseJournalOnce` from `../services/operationalAccountingService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/operationalAccountingService.js](../../../server/services/operationalAccountingService.js)

## Runtime declarations and data flow

### `exists` — lines 20–21

Parameters: `tenantId`, `sourceType`, `sourceId`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `hashedSourceId` — lines 23–27

Parameters: `payable`, `amount`, `reference (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `refundSourceId` — lines 29–29

Parameters: `payment`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `reconcileOperationalAccounting` — lines 31–173

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.tenantId. Persistent operations detected: Payment.find, Invoice.find, Expense.find, SupplierPayable.findOne, JournalEntry.findOne, SupplierPayable.find; verify tenant/ownership filters in the exact query. 28 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 32 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 33:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 34:** `const tenantId = req.tenantId;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 35:** `const filter = mergeTenantFilter(req, {});` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 36:** `const summary = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 43:** `const payments = await Payment.find(filter).sort({ createdAt: 1 }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 45:** `for (const payment of payments) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 46:** `if (payment.status === "completed" || payment.status === "refunded") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 47:** `if (await exists(tenantId, "payment", payment._id)) summary.alreadyPosted.payments += 1;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 48:** `else {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 49:** `try { await postPaymentToLedger(payment); summary.posted.payments += 1; }` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 50:** `catch (error) { summary.errors.push({ type: "payment", id: String(payment._id), message: publicErrorMessage(error) }); }` — Handles an exception from the preceding try block; check whether it returns, rethrows, logs safely, or continues.
- **Line 54:** `const refundAmount = Number(payment.refundedAmount || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 55:** `if ((payment.refundStatus === "completed" || payment.status === "refunded") && refundAmount > 0) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 57:** `const reference = String(payment.refundReference || \`REFUND-${payment._id}-${refundAmount}\`).trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 58:** `const sourceId = refundSourceId(payment);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 59:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 60:** `const alreadyPosted = await exists(tenantId, "payment_refund", sourceId);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 61:** `if (alreadyPosted) summary.alreadyPosted.refunds += 1;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 20: `const exists = async (tenantId, sourceType, sourceId) =>`.
- Line 23: `const hashedSourceId = (payable, amount, reference = "") =>`.
- Line 29: `const refundSourceId = (payment) => payment._id;`.
- Line 31: `export const reconcileOperationalAccounting = async (req, res, next) => {`.
- Line 34: `const tenantId = req.tenantId;`.
- Line 35: `const filter = mergeTenantFilter(req, {});`.
- Line 36: `const summary = {`.
- Line 43: `const payments = await Payment.find(filter).sort({ createdAt: 1 }).lean();`.
- Line 54: `const refundAmount = Number(payment.refundedAmount || 0);`.
- Line 57: `const reference = String(payment.refundReference || \`REFUND-${payment._id}-${refundAmount}\`).trim();`.
- Line 58: `const sourceId = refundSourceId(payment);`.
- Line 60: `const alreadyPosted = await exists(tenantId, "payment_refund", sourceId);`.
- Line 72: `const invoices = await Invoice.find({ ...filter, isDeleted: { $ne: true } }).sort({ createdAt: 1 }).lean();`.
- Line 85: `const expenses = await Expense.find(filter).sort({ createdAt: 1 }).lean();`.
- Line 88: `const linkedPayable = expense.purchaseOrder`.
- Line 100: `const original = await JournalEntry.findOne({ tenantId, sourceType: "expense_accrual", sourceId: expense._id }).lean();`.
- Line 117: `const linkedPayable = expense.purchaseOrder`.
- Line 127: `const original = await JournalEntry.findOne({ tenantId, sourceType: "expense_payment", sourceId: expense._id }).lean();`.
- Line 145: `const payables = await SupplierPayable.find(filter).sort({ createdAt: 1 }).lean();`.
- Line 156: `const amountPaid = Number(payable.amountPaid || 0);`.
- Line 159: `const reference = String(payable.paymentReference || \`SUPPLIER-${payable._id}-${amountPaid}\`).trim();`.
- Line 160: `const sourceId = hashedSourceId(payable, amountPaid, reference);`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
