# Source explanation: server/services/quotationCalculator.js

**Source:** [server/services/quotationCalculator.js](../../../server/services/quotationCalculator.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `mergeTenantFilter` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)

## Runtime declarations and data flow

### `calculateQuotation` — lines 8–69

Parameters: `items (defaulted)`, `discount (defaulted)`, `taxRate (defaulted)`.
6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 13:** `if (!Array.isArray(items)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 14:** `throw new Error("Items must be an array.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 17:** `let subtotal = 0;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 18:** `let totalItems = 0;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 20:** `for (const item of items) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 21:** `const quantity = Number(item.quantity);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 22:** `const unitPrice = Number(item.unitPrice);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 24:** `if (` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 28:** `throw new Error(` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 33:** `if (` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 37:** `throw new Error(` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 48:** `const taxableAmount = Math.max(` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 53:** `const tax =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 56:** `const grandTotal = taxableAmount + tax;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 58:** `return {` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 8: `export const calculateQuotation = (`.
- Line 17: `let subtotal = 0;`.
- Line 18: `let totalItems = 0;`.
- Line 21: `const quantity = Number(item.quantity);`.
- Line 22: `const unitPrice = Number(item.unitPrice);`.
- Line 48: `const taxableAmount = Math.max(`.
- Line 53: `const tax =`.
- Line 56: `const grandTotal = taxableAmount + tax;`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
