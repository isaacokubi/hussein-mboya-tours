# Source explanation: server/services/customerSegmentationService.js

**Source:** [server/services/customerSegmentationService.js](../../../server/services/customerSegmentationService.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `CustomerProfile` from `../models/CustomerProfile.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/CustomerProfile.js](../../../server/models/CustomerProfile.js)

## Runtime declarations and data flow

### `updateCustomerSegment` — lines 29–62

Parameters: `userId`.
Persistent operations detected: CustomerProfile.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 31:** `if (!userId) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 32:** `throw new Error("User ID is required.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 35:** `const customer = await CustomerProfile.findOne({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 39:** `if (!customer) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 40:** `return null;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 43:** `const totalSpent = customer.totalSpent || 0;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 44:** `const totalBookings = customer.totalBookings || 0;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 46:** `let customerType = "new";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 48:** `if (totalSpent >= CUSTOMER_SEGMENTS.VIP_MIN_SPENT) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 56:** `if (customer.customerType !== customerType) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 58:** `await customer.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 61:** `return customer;` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 10: `const CUSTOMER_SEGMENTS = {`.
- Line 29: `export const updateCustomerSegment = async (userId) => {`.
- Line 35: `const customer = await CustomerProfile.findOne({`.
- Line 43: `const totalSpent = customer.totalSpent || 0;`.
- Line 44: `const totalBookings = customer.totalBookings || 0;`.
- Line 46: `let customerType = "new";`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
