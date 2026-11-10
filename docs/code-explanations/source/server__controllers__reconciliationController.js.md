# Source explanation: server/controllers/reconciliationController.js

**Source:** [server/controllers/reconciliationController.js](../../../server/controllers/reconciliationController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `Payment` from `../models/Payment.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Payment.js](../../../server/models/Payment.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `Invoice` from `../models/Invoice.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Invoice.js](../../../server/models/Invoice.js)
- `Commission` from `../models/Commission.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Commission.js](../../../server/models/Commission.js)

## Runtime declarations and data flow

### `money` — lines 7–7

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `getPaymentReconciliation` — lines 12–138

Parameters: `req`, `res`, `next`.
Persistent operations detected: Payment.find, Booking.find, Invoice.find, Commission.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 16 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 13:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 14:** `const tenantId = requireTenantId();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 15:** `const [payments, bookings, invoices, commissions] = await Promise.all([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 16:** `Payment.find(mergeTenantFilter({})).sort({ createdAt: -1 }).lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 17:** `Booking.find(mergeTenantFilter({ isDeleted: { $ne: true } })).select("bookingNumber totalAmount depositAmount balanceAmount paymentStatus status agent commissionRate commissionAmount refundAmount refundStatus").lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 18:** `Invoice.find(mergeTenantFilter({ isDeleted: { $ne: true } })).select("booking invoiceNumber totalAmount amountPaid balance status etimsStatus etimsInvoiceNumber buyerPin taxRate taxType").lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 19:** `Commission.find(mergeTenantFilter({ isDeleted: { $ne: true } })).select("booking agent bookingAmount rate amount refundedAmount adjustmentAmount adjustmentStatus status").lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 22:** `const bookingMap = new Map(bookings.map((booking) => [String(booking._id), booking]));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 23:** `const invoiceMap = new Map(invoices.map((invoice) => [String(invoice.booking), invoice]));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 24:** `const commissionMap = new Map(commissions.map((commission) => [String(commission.booking), commission]));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 25:** `const paymentGroups = new Map();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 27:** `for (const payment of payments) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 28:** `const key = String(payment.booking || "");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 29:** `if (!paymentGroups.has(key)) paymentGroups.set(key, []);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 33:** `const mismatches = [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 34:** `const missingInvoices = [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 35:** `const overpayments = [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 36:** `const commissionAdjustments = [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 7: `const money = (value) => Number(Number(value || 0).toFixed(2));`.
- Line 8: `const activePaymentStatuses = ["completed", "refunded"];`.
- Line 9: `const pendingPaymentStatuses = ["pending", "processing"];`.
- Line 10: `const failedPaymentStatuses = ["failed", "cancelled"];`.
- Line 12: `export const getPaymentReconciliation = async (req, res, next) => {`.
- Line 14: `const tenantId = requireTenantId();`.
- Line 15: `const [payments, bookings, invoices, commissions] = await Promise.all([`.
- Line 22: `const bookingMap = new Map(bookings.map((booking) => [String(booking._id), booking]));`.
- Line 23: `const invoiceMap = new Map(invoices.map((invoice) => [String(invoice.booking), invoice]));`.
- Line 24: `const commissionMap = new Map(commissions.map((commission) => [String(commission.booking), commission]));`.
- Line 25: `const paymentGroups = new Map();`.
- Line 28: `const key = String(payment.booking || "");`.
- Line 33: `const mismatches = [];`.
- Line 34: `const missingInvoices = [];`.
- Line 35: `const overpayments = [];`.
- Line 36: `const commissionAdjustments = [];`.
- Line 39: `const key = String(booking._id);`.
- Line 40: `const bookingPayments = paymentGroups.get(key) || [];`.
- Line 41: `const completedPayments = bookingPayments.filter((payment) => activePaymentStatuses.includes(payment.status));`.
- Line 42: `const paidFromPayments = money(completedPayments.reduce((sum, payment) => sum + Math.max(0, Number(payment.amount || 0) - Number(payment.refundedAmount || 0)), 0));`.
- Line 43: `const refundedFromPayments = money(completedPayments.reduce((sum, payment) => sum + Math.max(0, Number(payment.refundedAmount || 0)), 0));`.
- Line 44: `const totalAmount = money(booking.totalAmount);`.
- Line 45: `const expectedPaid = money(Math.min(totalAmount, paidFromPayments));`.
- Line 46: `const expectedBalance = money(Math.max(0, totalAmount - expectedPaid));`.
- Line 47: `const storedPaid = money(booking.depositAmount);`.
- Line 48: `const storedBalance = money(booking.balanceAmount);`.
- Line 58: `const invoice = invoiceMap.get(key);`.
- Line 64: `const invoicePaid = money(invoice.amountPaid);`.
- Line 68: `const expectedInvoiceStatus = expectedPaid <= 0 ? (refundedFromPayments > 0 ? "refunded" : "pending") : expectedPaid >= totalAmount && totalAmount > 0 ? "paid" : "partial";`.
- Line 74: `const commission = commissionMap.get(key);`.
- Line 76: `const expectedCommission = money(Math.max(0, Number(commission.amount || 0) - (refundedFromPayments * Number(commission.rate || 0)) / 100));`.
- Line 77: `const actualNetCommission = money(Math.max(0, Number(commission.amount || 0) - Number(commission.refundedAmount || 0)));`.
- Line 86: `const orphanPayments = payments`.
- Line 90: `const missingReceipts = payments.filter((payment) => payment.status === "completed" && String(payment.provider || "").toUpperCase() === "MPESA" && !String(payment.mpesaReceiptNumbe`.
- Line 92: `const duplicateReferences = [];`.
- Line 93: `const referenceMap = new Map();`.
- Line 95: `const reference = String(payment.mpesaReceiptNumber || payment.transactionReference || payment.transactionId || "").trim().toUpperCase();`.
- Line 101: `const summary = {`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
