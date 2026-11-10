# Source explanation: server/utils/bookingOwnership.js

**Source:** [server/utils/bookingOwnership.js](../../../server/utils/bookingOwnership.js)

## Purpose

A backend utility shared by controllers, services, or models.

## Imports and dependencies

No ES module imports were found.

## Runtime declarations and data flow

### `normalizeRole` — lines 7–18

Parameters: `user`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 9:** `return String(` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `isStaff` — lines 21–36

Parameters: `user`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 23:** `return [` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `ownsBooking` — lines 39–68

Parameters: `booking`, `user`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 44:** `if (` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 48:** `return false;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 51:** `const userId =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 54:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `canAccessBooking` — lines 71–83

Parameters: `booking`, `user`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 76:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 7: `export const normalizeRole = (user) => {`.
- Line 21: `export const isStaff = (user) => {`.
- Line 39: `export const ownsBooking = (`.
- Line 51: `const userId =`.
- Line 71: `export const canAccessBooking = (`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
