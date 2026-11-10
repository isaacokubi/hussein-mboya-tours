# Source explanation: server/utils/mpesaPaymentAmount.js

**Source:** [server/utils/mpesaPaymentAmount.js](../../../server/utils/mpesaPaymentAmount.js)

## Purpose

A backend utility shared by controllers, services, or models.

## Imports and dependencies

No ES module imports were found.

## Runtime declarations and data flow

### `invalidAmount` — lines 1–5

Parameters: `message`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `resolveMpesaPaymentAmount` — lines 7–21

Parameters: `requestedAmount`, `payableBalance`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 8:** `const balance = Number(payableBalance);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 9:** `if (!Number.isSafeInteger(balance) || balance < 1) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 10:** `throw invalidAmount("This booking does not have a valid whole-KES balance.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 13:** `const isAmountOmitted = requestedAmount === undefined` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 16:** `const amount = isAmountOmitted ? balance : Number(requestedAmount);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 17:** `if (!Number.isSafeInteger(amount) || amount < 1 || amount > balance) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 18:** `throw invalidAmount(\`Payment amount must be a whole KES amount between 1 and ${balance.toLocaleString()}.\`);` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 20:** `return amount;` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 1: `const invalidAmount = (message) => Object.assign(new Error(message), {`.
- Line 7: `export const resolveMpesaPaymentAmount = (requestedAmount, payableBalance) => {`.
- Line 8: `const balance = Number(payableBalance);`.
- Line 13: `const isAmountOmitted = requestedAmount === undefined`.
- Line 16: `const amount = isAmountOmitted ? balance : Number(requestedAmount);`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
