# Source explanation: server/controllers/adminAIFraudController.js

**Source:** [server/controllers/adminAIFraudController.js](../../../server/controllers/adminAIFraudController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `Payment` from `../models/Payment.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Payment.js](../../../server/models/Payment.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)

## Runtime declarations and data flow

### `getAIFraudMonitoring` — lines 6–208

Parameters: `req`, `res`, `next`.
Persistent operations detected: Payment.countDocuments, Payment.aggregate; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 13:** `try{` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 16:** `const [` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 29:** `Payment.countDocuments({` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 43:** `Payment.countDocuments({` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 51:** `Payment.countDocuments({` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 61:** `Payment.aggregate([` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 87:** `const alerts=[];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 91:** `if(failedPayments > 0){` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 108:** `if(pendingPayments > 5){` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 125:** `if(largePayments > 0){` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 142:** `if(duplicatePayments.length > 0){` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 159:** `if(alerts.length===0){` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 176:** `res.json({` — Sends a JSON response; inspect its caller for status and error semantics.

## Module-level declarations

- Line 6: `export const getAIFraudMonitoring = async(`.
- Line 16: `const [`.
- Line 87: `const alerts=[];`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
