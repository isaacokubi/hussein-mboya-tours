# Source explanation: server/middleware/resolveMpesaRefundTenant.js

**Source:** [server/middleware/resolveMpesaRefundTenant.js](../../../server/middleware/resolveMpesaRefundTenant.js)

## Purpose

Express middleware that runs in a request pipeline, inspecting or enriching the request, rejecting it, or calling next().

## Imports and dependencies

- `Payment` from `../models/Payment.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Payment.js](../../../server/models/Payment.js)
- `runWithTenant`, `setTenantContext` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)

## Runtime declarations and data flow

### `resolveMpesaRefundTenant` — lines 4–22

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.tenantId. Persistent operations detected: Payment.findOne; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 5:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 6:** `const result = req.body?.Result;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 7:** `const conversationId = String(result?.ConversationID || result?.OriginatorConversationID || "").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 8:** `if (!conversationId) return next();` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 10:** `const payment = await runWithTenant({ bypass: true }, () => Payment.findOne({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 14:** `if (!payment?.tenantId) return next();` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 18:** `return next();` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 20:** `return next(error);` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 6: `const result = req.body?.Result;`.
- Line 7: `const conversationId = String(result?.ConversationID || result?.OriginatorConversationID || "").trim();`.
- Line 10: `const payment = await runWithTenant({ bypass: true }, () => Payment.findOne({`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
