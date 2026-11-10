# Source explanation: server/services/paymentReconciliationGuard.js

**Source:** [server/services/paymentReconciliationGuard.js](../../../server/services/paymentReconciliationGuard.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `Payment` from `../models/Payment.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Payment.js](../../../server/models/Payment.js)
- `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)

## Runtime declarations and data flow

### `reconcilePaymentReferences` — lines 6–30

Parameters: `arg1 (defaulted)`.
Persistent operations detected: Payment.findOne, Payment.find; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 7:** `if (!paymentId) throw Object.assign(new Error("Payment ID is required."), { statusCode: 400 });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 8:** `const options = session ? { session } : {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 9:** `const payment = await Payment.findOne({ tenantId, _id: paymentId }, null, options).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 10:** `if (!payment) throw Object.assign(new Error("Payment not found."), { statusCode: 404 });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 12:** `const refs = [payment.transactionReference, payment.transactionId, payment.mpesaReceiptNumber]` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 15:** `const duplicateReferences = [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 16:** `for (const reference of refs) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 17:** `const matches = await Payment.find({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 27:** `if (matches.length) duplicateReferences.push({ reference, payments: matches });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 29:** `return { payment, duplicateReferences };` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 4: `const ACTIVE = ["completed", "refunded"];`.
- Line 8: `const options = session ? { session } : {};`.
- Line 9: `const payment = await Payment.findOne({ tenantId, _id: paymentId }, null, options).lean();`.
- Line 12: `const refs = [payment.transactionReference, payment.transactionId, payment.mpesaReceiptNumber]`.
- Line 15: `const duplicateReferences = [];`.
- Line 17: `const matches = await Payment.find({`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
