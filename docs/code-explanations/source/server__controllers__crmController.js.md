# Source explanation: server/controllers/crmController.js

**Source:** [server/controllers/crmController.js](../../../server/controllers/crmController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `publicErrorMessage` from `../utils/publicError.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/utils/publicError.js](../../../server/utils/publicError.js)
- `mergeTenantFilter` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `Customer` from `../models/Customer.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Customer.js](../../../server/models/Customer.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)

## Runtime declarations and data flow

### `getCRMStats` — lines 7–33

Parameters: `req`, `res`.
Persistent operations detected: Customer.countDocuments, Booking.countDocuments, User.countDocuments; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 8:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 9:** `const [` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 14:** `Customer.countDocuments(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 15:** `Booking.countDocuments(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 16:** `User.countDocuments()` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 19:** `res.json({` — Sends a JSON response; inspect its caller for status and error semantics.
- **Line 28:** `res.status(500).json({` — Builds an HTTP response with an explicit status and JSON payload.

### `healthCheck` — lines 41–46

Parameters: `req`, `res`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 42:** `res.json({` — Sends a JSON response; inspect its caller for status and error semantics.

## Module-level declarations

- Line 7: `export const getCRMStats = async (req, res) => {`.
- Line 9: `const [`.
- Line 41: `export const healthCheck = async(req,res)=>{`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
