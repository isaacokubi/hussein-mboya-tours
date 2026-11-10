# Source explanation: server/services/invoiceLifecycleService.js

**Source:** [server/services/invoiceLifecycleService.js](../../../server/services/invoiceLifecycleService.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `Invoice` from `../models/Invoice.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Invoice.js](../../../server/models/Invoice.js)
- `Payment` from `../models/Payment.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Payment.js](../../../server/models/Payment.js)

## Runtime declarations and data flow

### `syncInvoiceFromPayment` — lines 3–15

Parameters: `payment`.
Persistent operations detected: Invoice.findOne, Payment.aggregate; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 4:** `if (!payment?.booking || !payment?.tenantId) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 5:** `const invoice = await Invoice.findOne({ tenantId: payment.tenantId, booking: payment.booking, isDeleted: { $ne: true } });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 6:** `if (!invoice) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 7:** `const totals = await Payment.aggregate([{ $match: { tenantId: payment.tenantId, booking: payment.booking, status: "completed" } }, { $group: { _id: null, amount: { $sum: "$amount" }, lastReference: { $last: "$transaction` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 8:** `const paid = Math.min(Number(invoice.totalAmount || 0), Number(totals[0]?.amount || 0));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 12:** `if (totals[0]?.lastReference) invoice.paymentReference = String(totals[0].lastReference);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 13:** `await invoice.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 14:** `return invoice;` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 5: `const invoice = await Invoice.findOne({ tenantId: payment.tenantId, booking: payment.booking, isDeleted: { $ne: true } });`.
- Line 7: `const totals = await Payment.aggregate([{ $match: { tenantId: payment.tenantId, booking: payment.booking, status: "completed" } }, { $group: { _id: null, amount: { $sum: "$amount" `.
- Line 8: `const paid = Math.min(Number(invoice.totalAmount || 0), Number(totals[0]?.amount || 0));`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
