# Source explanation: client/src/utils/exportBookings.js

**Source:** [client/src/utils/exportBookings.js](../../../client/src/utils/exportBookings.js)

## Purpose

A client utility/helper used by pages, hooks, or components; inspect its exported functions for exact transformation rules.

## Imports and dependencies

No ES module imports were found.

## Runtime declarations and data flow

### `csvCell` — lines 1–4

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 2:** `const text = String(value ?? "");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 3:** `return \`"${text.replace(/"/g, '""')}"\`;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `exportBookingsCSV` — lines 6–29

Parameters: `bookings (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 7:** `const rows = [` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 21:** `const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 22:** `const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 23:** `const url = URL.createObjectURL(blob);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 24:** `const anchor = document.createElement("a");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.

## Module-level declarations

- Line 1: `const csvCell = (value) => {`.
- Line 2: `const text = String(value ?? "");`.
- Line 6: `export const exportBookingsCSV = (bookings = []) => {`.
- Line 7: `const rows = [`.
- Line 21: `const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");`.
- Line 22: `const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });`.
- Line 23: `const url = URL.createObjectURL(blob);`.
- Line 24: `const anchor = document.createElement("a");`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
