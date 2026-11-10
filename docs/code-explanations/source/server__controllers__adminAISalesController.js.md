# Source explanation: server/controllers/adminAISalesController.js

**Source:** [server/controllers/adminAISalesController.js](../../../server/controllers/adminAISalesController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `tenantFilter` from `../tenancy/tenantQuery.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/tenantQuery.js](../../../server/tenancy/tenantQuery.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `Tour` from `../models/Tour.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Tour.js](../../../server/models/Tour.js)
- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)

## Runtime declarations and data flow

### `getAISalesAssistant` — lines 8–166

Parameters: `req`, `res`, `next`.
Persistent operations detected: Booking.countDocuments, User.countDocuments, Tour.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 15:** `try{` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 18:** `const [` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 31:** `Booking.countDocuments(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 34:** `Booking.countDocuments({` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 39:** `User.countDocuments({` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 44:** `Tour.find(tenantFilter(req))` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 56:** `const conversionRate =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 69:** `const recommendations=[];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 73:** `if(conversionRate < 30){` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 82:** `if(customers > 0){` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 97:** `const salesScripts=[` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 126:** `res.json({` — Sends a JSON response; inspect its caller for status and error semantics.

## Module-level declarations

- Line 8: `export const getAISalesAssistant = async(`.
- Line 18: `const [`.
- Line 56: `const conversionRate =`.
- Line 69: `const recommendations=[];`.
- Line 97: `const salesScripts=[`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
