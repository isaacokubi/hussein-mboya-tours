# Source explanation: server/scripts/repairFinancialReconciliation.js

**Source:** [server/scripts/repairFinancialReconciliation.js](../../../server/scripts/repairFinancialReconciliation.js)

## Purpose

An operational script for checks, repair, migration, or data setup; it is not part of ordinary request handling.

## Imports and dependencies

- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `dotenv` from `dotenv`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Organization` from `../models/Organization.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Organization.js](../../../server/models/Organization.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `Payment` from `../models/Payment.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Payment.js](../../../server/models/Payment.js)
- `Invoice` from `../models/Invoice.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Invoice.js](../../../server/models/Invoice.js)
- `Commission` from `../models/Commission.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Commission.js](../../../server/models/Commission.js)
- `runWithTenant` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)

## Runtime declarations and data flow

### `round` — lines 12–12

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `syncBooking` — lines 14–40

Parameters: `booking`, `payments`.
Persistent operations detected: Booking.updateOne; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 7 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 15:** `const totalAmount = round(booking.totalAmount);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 16:** `const netPaid = round(payments.reduce((sum, payment) => sum + Math.max(0, Number(payment.amount || 0) - Number(payment.refundedAmount || 0)), 0));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 17:** `const totalRefunded = round(payments.reduce((sum, payment) => sum + Math.max(0, Number(payment.refundedAmount || 0)), 0));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 18:** `const depositAmount = round(Math.min(totalAmount, netPaid));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 19:** `const balanceAmount = round(Math.max(0, totalAmount - depositAmount));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 21:** `const paymentStatus = totalRefunded >= totalAmount && totalAmount > 0` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 29:** `const status = paymentStatus === "refunded" ? "refunded" : booking.status === "refunded" ? "pending" : booking.status;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 30:** `const update = {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 31:** `if (round(booking.depositAmount) !== depositAmount) update.depositAmount = depositAmount;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 32:** `if (round(booking.balanceAmount) !== balanceAmount) update.balanceAmount = balanceAmount;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 33:** `if (booking.paymentStatus !== paymentStatus) update.paymentStatus = paymentStatus;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 34:** `if (totalRefunded > 0 && round(booking.refundAmount) !== totalRefunded) update.refundAmount = totalRefunded;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 35:** `if (totalRefunded > 0 && booking.refundStatus !== "completed") update.refundStatus = "completed";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 36:** `if (status !== booking.status) update.status = status;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 38:** `if (Object.keys(update).length) await Booking.updateOne({ _id: booking._id }, { $set: update });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 39:** `return { changed: Object.keys(update).length > 0, netPaid, totalRefunded };` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `syncInvoice` — lines 42–55

Parameters: `invoice`, `netPaid`, `totalRefunded`.
Persistent operations detected: Invoice.updateOne; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 43:** `if (!invoice) return false;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 44:** `const totalAmount = round(invoice.totalAmount);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 45:** `const amountPaid = round(Math.min(totalAmount, Math.max(0, netPaid)));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 46:** `const balance = round(Math.max(0, totalAmount - amountPaid));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 47:** `const status = amountPaid <= 0 ? (totalRefunded > 0 ? "refunded" : "pending") : amountPaid >= totalAmount && totalAmount > 0 ? "paid" : "partial";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 48:** `const update = {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 49:** `if (round(invoice.amountPaid) !== amountPaid) update.amountPaid = amountPaid;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 50:** `if (round(invoice.balance) !== balance) update.balance = balance;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 51:** `if (invoice.status !== status && !["draft", "cancelled", "overdue"].includes(invoice.status)) update.status = status;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 52:** `if (!Object.keys(update).length) return false;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 53:** `await Invoice.updateOne({ _id: invoice._id }, { $set: update });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 54:** `return true;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `syncCommission` — lines 57–72

Parameters: `commission`, `totalRefunded`.
Persistent operations detected: Commission.updateOne; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 58:** `if (!commission) return false;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 59:** `const amount = round(commission.amount);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 60:** `const rate = Number(commission.rate || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 61:** `const refundedAmount = round(Math.min(amount, (totalRefunded * rate) / 100));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 62:** `const update = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 68:** `if (refundedAmount > 0) update.financeNotes = \`Commission adjustment posted: KES ${refundedAmount.toFixed(2)} due to booking refund.\`;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 69:** `const changed = round(commission.refundedAmount) !== refundedAmount || round(commission.adjustmentAmount) !== refundedAmount || commission.adjustmentStatus !== update.adjustmentStatus;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 70:** `if (changed) await Commission.updateOne({ _id: commission._id }, { $set: update });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 71:** `return changed;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `repairTenant` — lines 74–127

Parameters: `tenant`.
Persistent operations detected: Booking.find, Payment.find, Payment.create, Invoice.findOne, Commission.findOne; verify tenant/ownership filters in the exact query. 7 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 9 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 75:** `const bookings = await Booking.find({ isDeleted: { $ne: true } }).select("_id tenantId user customer totalAmount depositAmount balanceAmount paymentStatus status refundAmount refundStatus createdAt updatedAt").lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 76:** `let bookingChanges = 0;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 77:** `let invoiceChanges = 0;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 78:** `let commissionChanges = 0;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 80:** `for (const booking of bookings) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 81:** `let payments = await Payment.find({ booking: booking._id, status: { $in: ["completed", "refunded"] } }).select("amount refundedAmount status").lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 86:** `if (booking.paymentStatus === "paid" && Number(booking.totalAmount || 0) > 0 && (booking.user || booking.customer)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 87:** `const netPaid = round(payments.reduce((sum, payment) => sum + Math.max(0, Number(payment.amount || 0) - Number(payment.refundedAmount || 0)), 0));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 88:** `const outstanding = round(Math.max(0, Number(booking.totalAmount || 0) - netPaid));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 89:** `if (outstanding > 0) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 90:** `const paymentMethod = String(booking.paymentMethod || "MPESA").toUpperCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 91:** `const provider = paymentMethod === "BANK_TRANSFER" ? "BANK" : ["CARD", "PAYPAL", "MPESA", "CASH"].includes(paymentMethod) ? paymentMethod : "CASH";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 92:** `const createdPayment = await Payment.create({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 113:** `if (!payments.length) continue;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 115:** `const result = await syncBooking(booking, payments);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 116:** `if (result.changed) bookingChanges += 1;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 118:** `const [invoice, commission] = await Promise.all([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 119:** `Invoice.findOne({ booking: booking._id, isDeleted: { $ne: true } }).select("_id tenantId totalAmount amountPaid balance status").lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `main` — lines 129–145

Parameters: none.
Persistent operations detected: Organization.find; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 130:** `if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 131:** `await mongoose.connect(process.env.MONGODB_URI);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 133:** `const tenants = await Organization.find({ isDeleted: { $ne: true } }).select("_id name").lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 134:** `const results = [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 135:** `for (const tenant of tenants) results.push(await repairTenant(tenant));` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.

## Module-level declarations

- Line 12: `const round = (value) => Math.round(Number(value || 0) * 100) / 100;`.
- Line 14: `const syncBooking = async (booking, payments) => {`.
- Line 15: `const totalAmount = round(booking.totalAmount);`.
- Line 16: `const netPaid = round(payments.reduce((sum, payment) => sum + Math.max(0, Number(payment.amount || 0) - Number(payment.refundedAmount || 0)), 0));`.
- Line 17: `const totalRefunded = round(payments.reduce((sum, payment) => sum + Math.max(0, Number(payment.refundedAmount || 0)), 0));`.
- Line 18: `const depositAmount = round(Math.min(totalAmount, netPaid));`.
- Line 19: `const balanceAmount = round(Math.max(0, totalAmount - depositAmount));`.
- Line 21: `const paymentStatus = totalRefunded >= totalAmount && totalAmount > 0`.
- Line 29: `const status = paymentStatus === "refunded" ? "refunded" : booking.status === "refunded" ? "pending" : booking.status;`.
- Line 30: `const update = {};`.
- Line 42: `const syncInvoice = async (invoice, netPaid, totalRefunded) => {`.
- Line 44: `const totalAmount = round(invoice.totalAmount);`.
- Line 45: `const amountPaid = round(Math.min(totalAmount, Math.max(0, netPaid)));`.
- Line 46: `const balance = round(Math.max(0, totalAmount - amountPaid));`.
- Line 47: `const status = amountPaid <= 0 ? (totalRefunded > 0 ? "refunded" : "pending") : amountPaid >= totalAmount && totalAmount > 0 ? "paid" : "partial";`.
- Line 48: `const update = {};`.
- Line 57: `const syncCommission = async (commission, totalRefunded) => {`.
- Line 59: `const amount = round(commission.amount);`.
- Line 60: `const rate = Number(commission.rate || 0);`.
- Line 61: `const refundedAmount = round(Math.min(amount, (totalRefunded * rate) / 100));`.
- Line 62: `const update = {`.
- Line 69: `const changed = round(commission.refundedAmount) !== refundedAmount || round(commission.adjustmentAmount) !== refundedAmount || commission.adjustmentStatus !== update.adjustmentSta`.
- Line 74: `const repairTenant = async (tenant) => runWithTenant({ tenantId: tenant._id, tenant, role: "admin" }, async () => {`.
- Line 75: `const bookings = await Booking.find({ isDeleted: { $ne: true } }).select("_id tenantId user customer totalAmount depositAmount balanceAmount paymentStatus status refundAmount refun`.
- Line 76: `let bookingChanges = 0;`.
- Line 77: `let invoiceChanges = 0;`.
- Line 78: `let commissionChanges = 0;`.
- Line 81: `let payments = await Payment.find({ booking: booking._id, status: { $in: ["completed", "refunded"] } }).select("amount refundedAmount status").lean();`.
- Line 87: `const netPaid = round(payments.reduce((sum, payment) => sum + Math.max(0, Number(payment.amount || 0) - Number(payment.refundedAmount || 0)), 0));`.
- Line 88: `const outstanding = round(Math.max(0, Number(booking.totalAmount || 0) - netPaid));`.
- Line 90: `const paymentMethod = String(booking.paymentMethod || "MPESA").toUpperCase();`.
- Line 91: `const provider = paymentMethod === "BANK_TRANSFER" ? "BANK" : ["CARD", "PAYPAL", "MPESA", "CASH"].includes(paymentMethod) ? paymentMethod : "CASH";`.
- Line 92: `const createdPayment = await Payment.create({`.
- Line 115: `const result = await syncBooking(booking, payments);`.
- Line 118: `const [invoice, commission] = await Promise.all([`.
- Line 129: `const main = async () => {`.
- Line 133: `const tenants = await Organization.find({ isDeleted: { $ne: true } }).select("_id name").lean();`.
- Line 134: `const results = [];`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
