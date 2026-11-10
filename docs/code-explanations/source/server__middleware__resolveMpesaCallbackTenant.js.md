# Source explanation: server/middleware/resolveMpesaCallbackTenant.js

**Source:** [server/middleware/resolveMpesaCallbackTenant.js](../../../server/middleware/resolveMpesaCallbackTenant.js)

## Purpose

Express middleware that runs in a request pipeline, inspecting or enriching the request, rejecting it, or calling next().

## Imports and dependencies

- `Payment` from `../models/Payment.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Payment.js](../../../server/models/Payment.js)
- `SubscriptionPayment` from `../models/SubscriptionPayment.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/SubscriptionPayment.js](../../../server/models/SubscriptionPayment.js)
- `runWithTenant`, `setTenantContext` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)

## Runtime declarations and data flow

### `callbackCheckoutId` — lines 5–8

Parameters: `req`.
Reads request/component inputs: req.body.

Key statements:
- **Line 6:** `const callback = req.body?.Body?.stkCallback;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 7:** `return String(callback?.CheckoutRequestID || callback?.checkoutRequestID || callback?.checkoutRequestId || "").trim();` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `resolveMpesaCallbackTenant` — lines 10–48

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.tenantId. Persistent operations detected: Payment.findOne, SubscriptionPayment.findOne; verify tenant/ownership filters in the exact query. 4 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 11:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 12:** `const checkoutRequestID = callbackCheckoutId(req);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 13:** `if (!checkoutRequestID) return next();` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 15:** `const lookup = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 22:** `const tenantId = await runWithTenant({ bypass: true }, async () => {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 23:** `const payment = await Payment.findOne(lookup).select("tenantId").lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 24:** `if (payment?.tenantId) return String(payment.tenantId);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 26:** `const subscriptionPayment = await SubscriptionPayment.findOne({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 30:** `return subscriptionPayment?.tenantId` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 35:** `if (!tenantId) return next();` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 44:** `return next();` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 46:** `return next(error);` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 5: `const callbackCheckoutId = (req) => {`.
- Line 6: `const callback = req.body?.Body?.stkCallback;`.
- Line 12: `const checkoutRequestID = callbackCheckoutId(req);`.
- Line 15: `const lookup = {`.
- Line 22: `const tenantId = await runWithTenant({ bypass: true }, async () => {`.
- Line 23: `const payment = await Payment.findOne(lookup).select("tenantId").lean();`.
- Line 26: `const subscriptionPayment = await SubscriptionPayment.findOne({`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
