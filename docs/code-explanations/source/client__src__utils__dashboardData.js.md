# Source explanation: client/src/utils/dashboardData.js

**Source:** [client/src/utils/dashboardData.js](../../../client/src/utils/dashboardData.js)

## Purpose

A client utility/helper used by pages, hooks, or components; inspect its exported functions for exact transformation rules.

## Imports and dependencies

No ES module imports were found.

## Runtime declarations and data flow

### `unwrapData` — lines 1–11

Parameters: `payload`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 2:** `let current = payload?.data ?? payload ?? {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 3:** `if (` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 10:** `return current ?? {};` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `asArray` — lines 13–13

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `numeric` — lines 15–18

Parameters: `value`, `fallback (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 16:** `const number = Number(value);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 17:** `return Number.isFinite(number) ? number : fallback;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `firstNumeric` — lines 20–26

Parameters: `...values`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 21:** `for (const value of values) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 22:** `const number = Number(value);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 23:** `if (Number.isFinite(number)) return number;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 25:** `return 0;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `entityId` — lines 28–29

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `isDeleted` — lines 31–31

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `activeEntities` — lines 33–33

Parameters: `items`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `statusOf` — lines 35–36

Parameters: `value`, `fallback (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `paymentStatusOf` — lines 38–45

Parameters: `value`, `fallback (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 1: `export const unwrapData = (payload) => {`.
- Line 2: `let current = payload?.data ?? payload ?? {};`.
- Line 13: `export const asArray = (value) => (Array.isArray(value) ? value : []);`.
- Line 15: `export const numeric = (value, fallback = 0) => {`.
- Line 16: `const number = Number(value);`.
- Line 20: `export const firstNumeric = (...values) => {`.
- Line 22: `const number = Number(value);`.
- Line 28: `export const entityId = (value) =>`.
- Line 31: `export const isDeleted = (value) => value?.isDeleted === true;`.
- Line 33: `export const activeEntities = (items) => asArray(items).filter((item) => !isDeleted(item));`.
- Line 35: `export const statusOf = (value, fallback = "pending") =>`.
- Line 38: `export const paymentStatusOf = (value, fallback = "pending") =>`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
