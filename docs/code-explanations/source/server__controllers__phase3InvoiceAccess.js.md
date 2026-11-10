# Source explanation: server/controllers/phase3InvoiceAccess.js

**Source:** [server/controllers/phase3InvoiceAccess.js](../../../server/controllers/phase3InvoiceAccess.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mergeTenantFilter` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `getUserRole` from `../utils/roleUtils.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/utils/roleUtils.js](../../../server/utils/roleUtils.js)

## Runtime declarations and data flow

### `canAccessBooking` — lines 4–12

Parameters: `booking`, `user`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 5:** `const role = getUserRole(user);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 6:** `if (["admin", "super_admin", "manager", "agent"].includes(role)) return true;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 7:** `const requesterId = String(user?._id || "");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 8:** `return requesterId && (` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 4: `export const canAccessBooking = (booking, user) => {`.
- Line 5: `const role = getUserRole(user);`.
- Line 7: `const requesterId = String(user?._id || "");`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
