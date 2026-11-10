# Source explanation: server/controllers/adminAIOperationsController.js

**Source:** [server/controllers/adminAIOperationsController.js](../../../server/controllers/adminAIOperationsController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `Payment` from `../models/Payment.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Payment.js](../../../server/models/Payment.js)
- `Review` from `../models/Review.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Review.js](../../../server/models/Review.js)
- `Vehicle` from `../models/Vehicle.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Vehicle.js](../../../server/models/Vehicle.js)
- `Tour` from `../models/Tour.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Tour.js](../../../server/models/Tour.js)

## Runtime declarations and data flow

### `getAIOperationsCenter` — lines 9–244

Parameters: `req`, `res`, `next`.
Persistent operations detected: Booking.countDocuments, Payment.aggregate, Vehicle.countDocuments, Tour.countDocuments, Review.aggregate; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 16:** `try{` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 19:** `const [` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 38:** `Booking.countDocuments(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 41:** `Booking.countDocuments({` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 46:** `Booking.countDocuments({` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 51:** `Payment.aggregate([` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 68:** `Vehicle.countDocuments({` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 73:** `Tour.countDocuments(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 76:** `Review.aggregate([` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 92:** `const rating =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 103:** `const alerts=[];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 107:** `if(pendingBookings > 10){` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 124:** `if(vehicles < 3){` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 141:** `if(rating < 4){` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 158:** `if(!alerts.length){` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 175:** `const healthScore =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 185:** `const actions=[` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 197:** `res.json({` — Sends a JSON response; inspect its caller for status and error semantics.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 9: `export const getAIOperationsCenter = async(`.
- Line 19: `const [`.
- Line 92: `const rating =`.
- Line 103: `const alerts=[];`.
- Line 175: `const healthScore =`.
- Line 185: `const actions=[`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
