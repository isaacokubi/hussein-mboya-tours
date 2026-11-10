# Source explanation: server/controllers/subscriptionMpesaCallbackController.js

**Source:** [server/controllers/subscriptionMpesaCallbackController.js](../../../server/controllers/subscriptionMpesaCallbackController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `SubscriptionPayment` from `../models/SubscriptionPayment.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/SubscriptionPayment.js](../../../server/models/SubscriptionPayment.js)
- `activateTenantSubscription` from `../services/tenantSubscriptionService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/tenantSubscriptionService.js](../../../server/services/tenantSubscriptionService.js)
- `mpesaCallback` from `./mpesaController.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/controllers/mpesaController.js](../../../server/controllers/mpesaController.js)

## Runtime declarations and data flow

### `resolvedTenantId` — lines 5–5

Parameters: `req`.
Reads request/component inputs: req.tenantId, req.tenant.

Key statements:

### `subscriptionMpesaCallback` — lines 7–59

Parameters: `req`, `res`.
Reads request/component inputs: req.body. Persistent operations detected: SubscriptionPayment.findOne; verify tenant/ownership filters in the exact query. 5 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 8:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 9:** `const stkCallback = req.body?.Body?.stkCallback;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 10:** `const checkoutRequestID = String(stkCallback?.CheckoutRequestID || stkCallback?.checkoutRequestID || stkCallback?.checkoutRequestId || "").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 11:** `if (!checkoutRequestID) return mpesaCallback(req, res);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 13:** `const tenantId = resolvedTenantId(req);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 14:** `if (!tenantId) return mpesaCallback(req, res);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 16:** `const payment = await SubscriptionPayment.findOne({ tenantId, checkoutRequestID });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 17:** `if (!payment) return mpesaCallback(req, res);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 18:** `if (["completed", "failed", "cancelled"].includes(payment.status)) return res.json({ ResultCode: 0, ResultDesc: "Already processed" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 20:** `const resultCode = Number(stkCallback?.ResultCode);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 21:** `if (resultCode !== 0) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 25:** `await payment.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 26:** `return res.json({ ResultCode: 0, ResultDesc: "Accepted" });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 29:** `const items = stkCallback?.CallbackMetadata?.Item || [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 30:** `const value = (name) => items.find((item) => item.Name === name)?.Value ?? null;` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 31:** `const paidAmount = Number(value("Amount"));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 32:** `const receipt = String(value("MpesaReceiptNumber") || "").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 33:** `if (!Number.isFinite(paidAmount) || Math.round(paidAmount) !== Math.round(payment.amount) || !receipt) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `value` — lines 30–30

Parameters: `name`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 30:** `(name) => items.find((item) => item.Name === name)?.Value ?? null` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.

## Module-level declarations

- Line 5: `const resolvedTenantId = (req) => String(req.tenantId || req.tenant?.tenantId || req.tenant?.id || "").trim();`.
- Line 7: `export const subscriptionMpesaCallback = async (req, res) => {`.
- Line 9: `const stkCallback = req.body?.Body?.stkCallback;`.
- Line 10: `const checkoutRequestID = String(stkCallback?.CheckoutRequestID || stkCallback?.checkoutRequestID || stkCallback?.checkoutRequestId || "").trim();`.
- Line 13: `const tenantId = resolvedTenantId(req);`.
- Line 16: `const payment = await SubscriptionPayment.findOne({ tenantId, checkoutRequestID });`.
- Line 20: `const resultCode = Number(stkCallback?.ResultCode);`.
- Line 29: `const items = stkCallback?.CallbackMetadata?.Item || [];`.
- Line 30: `const value = (name) => items.find((item) => item.Name === name)?.Value ?? null;`.
- Line 31: `const paidAmount = Number(value("Amount"));`.
- Line 32: `const receipt = String(value("MpesaReceiptNumber") || "").trim();`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
