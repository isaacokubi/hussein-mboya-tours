# Source explanation: server/controllers/adminAITaskController.js

**Source:** [server/controllers/adminAITaskController.js](../../../server/controllers/adminAITaskController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `tenantFilter` from `../tenancy/tenantQuery.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/tenantQuery.js](../../../server/tenancy/tenantQuery.js)
- `AITask` from `../models/AITask.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/AITask.js](../../../server/models/AITask.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `Payment` from `../models/Payment.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Payment.js](../../../server/models/Payment.js)
- `Review` from `../models/Review.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Review.js](../../../server/models/Review.js)

## Runtime declarations and data flow

### `generateAITasks` — lines 10–160

Parameters: `req`, `res`, `next`.
Persistent operations detected: Booking.countDocuments, Payment.countDocuments, Review.countDocuments, AITask.find; verify tenant/ownership filters in the exact query. 5 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 18:** `try{` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 21:** `const tasks=[];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 25:** `const pendingBookings =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 26:** `await Booking.countDocuments({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 32:** `if(pendingBookings > 0){` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 51:** `const pendingPayments =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 52:** `await Payment.countDocuments({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 66:** `if(pendingPayments > 0){` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 85:** `const poorReviews =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 86:** `await Review.countDocuments({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 96:** `if(poorReviews > 0){` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 115:** `for(const task of tasks){` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 117:** `await AITask.findOneAndUpdate(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 136:** `const saved =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 137:** `await AITask.find(tenantFilter(req))` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 145:** `res.json({` — Sends a JSON response; inspect its caller for status and error semantics.

### `updateAITask` — lines 165–207

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.body. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 171:** `try{` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 174:** `const task =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 175:** `await AITask.findOneAndUpdate(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 192:** `res.json({` — Sends a JSON response; inspect its caller for status and error semantics.

## Module-level declarations

- Line 10: `export const generateAITasks = async(`.
- Line 21: `const tasks=[];`.
- Line 25: `const pendingBookings =`.
- Line 51: `const pendingPayments =`.
- Line 85: `const poorReviews =`.
- Line 136: `const saved =`.
- Line 165: `export const updateAITask = async(`.
- Line 174: `const task =`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
