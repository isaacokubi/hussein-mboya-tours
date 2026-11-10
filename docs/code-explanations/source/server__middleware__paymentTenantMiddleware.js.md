# Source explanation: server/middleware/paymentTenantMiddleware.js

**Source:** [server/middleware/paymentTenantMiddleware.js](../../../server/middleware/paymentTenantMiddleware.js)

## Purpose

Express middleware that runs in a request pipeline, inspecting or enriching the request, rejecting it, or calling next().

## Imports and dependencies

- `Payment` from `../models/Payment.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Payment.js](../../../server/models/Payment.js)
- `runWithTenant`, `setTenantContext` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `Organization` from `../models/Organization.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Organization.js](../../../server/models/Organization.js)

## Runtime declarations and data flow

### `resolvePaymentTenant` — lines 5–20

Parameters: `req`.
Reads request/component inputs: req.body, req.tenant, req.tenantId. Persistent operations detected: Payment.findOne, Organization.findById; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 6:** `const checkoutRequestID = String(req.body?.Body?.stkCallback?.CheckoutRequestID || "").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 7:** `const conversationId = String(req.body?.Result?.ConversationID || req.body?.Result?.OriginatorConversationID || "").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 8:** `const payment = await runWithTenant({ bypass: true }, async () => {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 9:** `if (checkoutRequestID) return Payment.findOne({ $or: [{ checkoutRequestID }, { checkoutRequestId: checkoutRequestID }] }).lean();` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 10:** `if (conversationId) return Payment.findOne({ refundReference: conversationId }).lean();` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 11:** `return null;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 13:** `if (!payment?.tenantId) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 14:** `const tenant = await runWithTenant({ bypass: true }, () => Organization.findById(payment.tenantId).lean());` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 15:** `if (!tenant) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 19:** `return payment;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `resolveMpesaPaymentTenant` — lines 22–32

Parameters: `req`, `res`, `next`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 23:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 24:** `await resolvePaymentTenant(req);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

## Module-level declarations

- Line 6: `const checkoutRequestID = String(req.body?.Body?.stkCallback?.CheckoutRequestID || "").trim();`.
- Line 7: `const conversationId = String(req.body?.Result?.ConversationID || req.body?.Result?.OriginatorConversationID || "").trim();`.
- Line 8: `const payment = await runWithTenant({ bypass: true }, async () => {`.
- Line 14: `const tenant = await runWithTenant({ bypass: true }, () => Organization.findById(payment.tenantId).lean());`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
