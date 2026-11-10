# Source explanation: server/services/currencyService.js

**Source:** [server/services/currencyService.js](../../../server/services/currencyService.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `mergeTenantFilter` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)

## Runtime declarations and data flow

### `convertCurrency` — lines 15–28

Parameters: `amount`, `rate`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 16:** `const sourceAmount = Number(amount);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 17:** `const exchangeRate = Number(rate);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 19:** `if (!Number.isFinite(sourceAmount)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 20:** `throw new Error("Invalid amount.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 23:** `if (!Number.isFinite(exchangeRate) || exchangeRate <= 0) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 24:** `throw new Error("Invalid exchange rate.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 27:** `return Number((sourceAmount / exchangeRate).toFixed(2));` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 15: `export const convertCurrency = (amount, rate) => {`.
- Line 16: `const sourceAmount = Number(amount);`.
- Line 17: `const exchangeRate = Number(rate);`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
