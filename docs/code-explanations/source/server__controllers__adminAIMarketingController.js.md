# Source explanation: server/controllers/adminAIMarketingController.js

**Source:** [server/controllers/adminAIMarketingController.js](../../../server/controllers/adminAIMarketingController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mergeTenantFilter` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `Tour` from `../models/Tour.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Tour.js](../../../server/models/Tour.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)

## Runtime declarations and data flow

### `generateAIMarketingCampaign` — lines 7–136

Parameters: `req`, `res`, `next`.
Persistent operations detected: Tour.countDocuments, Booking.countDocuments, User.countDocuments; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 13:** `try{` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 16:** `const [` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 27:** `Tour.countDocuments(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 30:** `Booking.countDocuments(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 33:** `User.countDocuments({` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 42:** `const campaigns=[` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 107:** `res.json({` — Sends a JSON response; inspect its caller for status and error semantics.

## Module-level declarations

- Line 7: `export const generateAIMarketingCampaign = async(`.
- Line 16: `const [`.
- Line 42: `const campaigns=[`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
