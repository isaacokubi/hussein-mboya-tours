# Source explanation: client/src/pages/admin/Guides.jsx

**Source:** [client/src/pages/admin/Guides.jsx](../../../client/src/pages/admin/Guides.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useQuery` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getGuides` from `../../api/adminTourApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/adminTourApi](../../../client/src/api/adminTourApi.js)

## Runtime declarations and data flow

### `Guides` — lines 4–79

Parameters: none.
React hooks used: useQuery. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 6:** `const {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 10:** `} = useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 16:** `if(isLoading){` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 17:** `return <div>Loading guides...</div>;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 21:** `if(error){` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 22:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 30:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 4: `const Guides = () => {`.
- Line 6: `const {`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
