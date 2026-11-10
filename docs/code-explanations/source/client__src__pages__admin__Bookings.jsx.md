# Source explanation: client/src/pages/admin/Bookings.jsx

**Source:** [client/src/pages/admin/Bookings.jsx](../../../client/src/pages/admin/Bookings.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useQuery` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getAdminBookings` from `../../api/adminApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/adminApi](../../../client/src/api/adminApi.js)
- `DataTable` from `../../components/admin/DataTable`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/components/admin/DataTable](../../../client/src/components/admin/DataTable.jsx)

## Runtime declarations and data flow

### `Bookings` — lines 18–214

Parameters: none.
React hooks used: useQuery. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 21:** `const {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 25:** `} = useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 38:** `if(isLoading)` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 40:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 53:** `const bookings =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 64:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 156:** `if(` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 160:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 173:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 21: `const {`.
- Line 53: `const bookings =`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
