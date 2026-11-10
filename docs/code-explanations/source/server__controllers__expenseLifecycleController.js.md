# Source explanation: server/controllers/expenseLifecycleController.js

**Source:** [server/controllers/expenseLifecycleController.js](../../../server/controllers/expenseLifecycleController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `Expense` from `../models/Expense.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Expense.js](../../../server/models/Expense.js)
- `SupplierPayable` from `../models/SupplierPayable.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/SupplierPayable.js](../../../server/models/SupplierPayable.js)
- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `postExpenseToLedger`, `postExpensePaymentToLedger` from `../services/operationalAccountingService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/operationalAccountingService.js](../../../server/services/operationalAccountingService.js)

## Runtime declarations and data flow

### `actor` — lines 6–6

Parameters: `req`.
Reads request/component inputs: req.user.

Key statements:

### `transitionExpense` — lines 8–38

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.body. Persistent operations detected: Expense.findOne, SupplierPayable.findOne; verify tenant/ownership filters in the exact query. 5 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 10 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 9:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 10:** `const tenantId = requireTenantId();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 11:** `const expense = await Expense.findOne(mergeTenantFilter(req, { _id: req.params.id }));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 12:** `if (!expense) return res.status(404).json({ success: false, message: "Expense not found." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 14:** `const nextStatus = String(req.body?.status || "").trim().toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 15:** `const current = String(expense.status || "draft");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 16:** `const allowed = { draft: ["approved", "cancelled"], approved: ["paid", "cancelled"], paid: [], cancelled: [] };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 17:** `if (!allowed[current]?.includes(nextStatus)) return res.status(409).json({ success: false, message: \`Expense cannot move from ${current} to ${nextStatus}.\` });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 19:** `const linkedPayable = expense.purchaseOrder ? await SupplierPayable.findOne(mergeTenantFilter(req, { purchaseOrder: expense.purchaseOrder })) : null;` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 20:** `if (nextStatus === "paid" && linkedPayable && linkedPayable.balance > 0) return res.status(409).json({ success: false, message: "This procurement expense is backed by an Accounts Payable balance. Settle the linked suppli` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 21:** `if (nextStatus === "paid" && !String(req.body?.paymentReference || expense.paymentReference || "").trim()) return res.status(422).json({ success: false, message: "A payment reference is required before an expense can be ` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 24:** `if (req.body?.paymentReference !== undefined) expense.paymentReference = String(req.body.paymentReference || "").trim();` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 25:** `if (nextStatus === "approved") expense.approvedBy = actor(req);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 26:** `if (nextStatus === "paid") { expense.paidAt = new Date(); expense.paidBy = actor(req); }` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 27:** `if (nextStatus === "cancelled") expense.cancelledBy = actor(req);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 28:** `await expense.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 32:** `if ((nextStatus === "approved" || nextStatus === "paid") && !linkedPayable) await postExpenseToLedger(expense);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 33:** `if (nextStatus === "paid" && expense.supplier && !linkedPayable) await postExpensePaymentToLedger(expense);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 6: `const actor = (req) => req.user?._id || req.user?.id || null;`.
- Line 8: `export const transitionExpense = async (req, res, next) => {`.
- Line 10: `const tenantId = requireTenantId();`.
- Line 11: `const expense = await Expense.findOne(mergeTenantFilter(req, { _id: req.params.id }));`.
- Line 14: `const nextStatus = String(req.body?.status || "").trim().toLowerCase();`.
- Line 15: `const current = String(expense.status || "draft");`.
- Line 16: `const allowed = { draft: ["approved", "cancelled"], approved: ["paid", "cancelled"], paid: [], cancelled: [] };`.
- Line 19: `const linkedPayable = expense.purchaseOrder ? await SupplierPayable.findOne(mergeTenantFilter(req, { purchaseOrder: expense.purchaseOrder })) : null;`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
