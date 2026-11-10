# Source explanation: server/controllers/adminAIBookingRiskController.js

**Source:** [server/controllers/adminAIBookingRiskController.js](../../../server/controllers/adminAIBookingRiskController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mergeTenantFilter` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `Payment` from `../models/Payment.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Payment.js](../../../server/models/Payment.js)

## Runtime declarations and data flow

### `getBookingRiskAnalysis` — lines 6–167

Parameters: `req`, `res`, `next`.
Persistent operations detected: Booking.countDocuments, Payment.countDocuments; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 12:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 15:** `const [` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 23:** `Booking.countDocuments({` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 28:** `Booking.countDocuments({` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 33:** `Payment.countDocuments({` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 44:** `Booking.countDocuments({` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 63:** `const risks=[];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 67:** `if(oldPendingBookings > 0){` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 84:** `if(unpaidBookings > 0){` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 101:** `if(cancelledBookings > pendingBookings){` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 118:** `if(!risks.length){` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 135:** `res.json({` — Sends a JSON response; inspect its caller for status and error semantics.

## Module-level declarations

- Line 6: `export const getBookingRiskAnalysis = async (`.
- Line 15: `const [`.
- Line 63: `const risks=[];`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
