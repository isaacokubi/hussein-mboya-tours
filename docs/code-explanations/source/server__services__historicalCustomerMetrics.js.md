# Source explanation: server/services/historicalCustomerMetrics.js

**Source:** [server/services/historicalCustomerMetrics.js](../../../server/services/historicalCustomerMetrics.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)

## Runtime declarations and data flow

### `getHistoricalCustomerCount` — lines 10–45

Parameters: `arg1 (defaulted)`.
Persistent operations detected: Booking.aggregate; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller.

Key statements:
- **Line 11:** `const tenantId = new mongoose.Types.ObjectId(String(requireTenantId()));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 12:** `const match = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 17:** `const result = await Booking.aggregate([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 44:** `return result[0]?.total || 0;` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 11: `const tenantId = new mongoose.Types.ObjectId(String(requireTenantId()));`.
- Line 12: `const match = {`.
- Line 17: `const result = await Booking.aggregate([`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
