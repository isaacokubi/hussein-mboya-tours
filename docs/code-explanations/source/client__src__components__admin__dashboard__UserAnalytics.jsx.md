# Source explanation: client/src/components/admin/dashboard/UserAnalytics.jsx

**Source:** [client/src/components/admin/dashboard/UserAnalytics.jsx](../../../client/src/components/admin/dashboard/UserAnalytics.jsx)

## Purpose

A reusable UI component used by one or more pages/layouts. Props and callbacks form its input/output boundary.

## Imports and dependencies

No ES module imports were found.

## Runtime declarations and data flow

### `UserAnalytics` — lines 1–15

Parameters: `{users}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 2:** `const total = Number(users.total ?? users.count ?? users.length ?? 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 3:** `const active = Number(users.active ?? users.activeUsers ?? 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 4:** `const newUsers = Number(users.new ?? users.newUsers ?? 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 5:** `const inactive = Number(users.inactive ?? 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 7:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `Card` — lines 17–24

Parameters: `{title, value}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 18:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 2: `const total = Number(users.total ?? users.count ?? users.length ?? 0);`.
- Line 3: `const active = Number(users.active ?? users.activeUsers ?? 0);`.
- Line 4: `const newUsers = Number(users.new ?? users.newUsers ?? 0);`.
- Line 5: `const inactive = Number(users.inactive ?? 0);`.
- Line 17: `function Card({ title, value }) {`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
