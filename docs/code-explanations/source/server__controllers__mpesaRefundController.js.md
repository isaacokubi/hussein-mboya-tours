# Source explanation: server/controllers/mpesaRefundController.js

**Source:** [server/controllers/mpesaRefundController.js](../../../server/controllers/mpesaRefundController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `Payment` from `../models/Payment.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Payment.js](../../../server/models/Payment.js)
- `refundBookingPayment` from `../services/paymentLifecycleService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/paymentLifecycleService.js](../../../server/services/paymentLifecycleService.js)

## Runtime declarations and data flow

### `getConversationId` — lines 5–7

Parameters: `result (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `findRefundPayment` — lines 9–10

Parameters: `req`, `conversationId`.
Persistent operations detected: Payment.findOne; verify tenant/ownership filters in the exact query.

Key statements:
- **Line 10:** `Payment.findOne(mergeTenantFilter(req, { refundReference: conversationId }))` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.

### `mpesaRefundResult` — lines 12–53

Parameters: `req`, `res`.
Reads request/component inputs: req.body. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 14:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 15:** `const result = req.body?.Result;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 16:** `if (!result || typeof result !== "object") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 17:** `return res.json({ ResultCode: 0, ResultDesc: "Accepted" });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 20:** `const conversationId = getConversationId(result);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 21:** `if (!conversationId) return res.json({ ResultCode: 0, ResultDesc: "Accepted" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 23:** `const payment = await findRefundPayment(req, conversationId);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 24:** `if (!payment) return res.json({ ResultCode: 0, ResultDesc: "Accepted" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 26:** `if (payment.refundStatus === "completed" && payment.refundReference === conversationId) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 27:** `return res.json({ ResultCode: 0, ResultDesc: "Accepted" });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 30:** `const resultCode = Number(result.ResultCode);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 31:** `if (resultCode === 0) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 32:** `await refundBookingPayment({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 45:** `await payment.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 48:** `return res.json({ ResultCode: 0, ResultDesc: "Accepted" });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 51:** `return res.json({ ResultCode: 0, ResultDesc: "Accepted" });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `mpesaRefundTimeout` — lines 55–74

Parameters: `req`, `res`.
Reads request/component inputs: req.body. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 57:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 58:** `const result = req.body?.Result || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 59:** `const conversationId = getConversationId(result);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 60:** `if (conversationId) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 61:** `const payment = await findRefundPayment(req, conversationId);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 62:** `if (payment && payment.refundStatus !== "completed") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 66:** `await payment.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 73:** `return res.json({ ResultCode: 0, ResultDesc: "Accepted" });` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 5: `const getConversationId = (result = {}) => String(`.
- Line 9: `const findRefundPayment = (req, conversationId) =>`.
- Line 12: `export const mpesaRefundResult = async (req, res) => {`.
- Line 15: `const result = req.body?.Result;`.
- Line 20: `const conversationId = getConversationId(result);`.
- Line 23: `const payment = await findRefundPayment(req, conversationId);`.
- Line 30: `const resultCode = Number(result.ResultCode);`.
- Line 55: `export const mpesaRefundTimeout = async (req, res) => {`.
- Line 58: `const result = req.body?.Result || {};`.
- Line 59: `const conversationId = getConversationId(result);`.
- Line 61: `const payment = await findRefundPayment(req, conversationId);`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
