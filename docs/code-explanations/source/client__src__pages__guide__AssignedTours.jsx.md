# Source explanation: client/src/pages/guide/AssignedTours.jsx

**Source:** [client/src/pages/guide/AssignedTours.jsx](../../../client/src/pages/guide/AssignedTours.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useQuery` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `CalendarDays`, `MapPin`, `Users`, `RefreshCw` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getAssignedTours` from `../../api/guideApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/guideApi](../../../client/src/api/guideApi.js)

## Runtime declarations and data flow

### `AssignedTours` — lines 5–32

Parameters: none.
React hooks used: useQuery.

Key statements:
- **Line 6:** `const { data, isLoading, isError, refetch, isFetching } = useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 10:** `const tours = Array.isArray(data) ? data : data?.tours || data?.data?.tours || data?.data || [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 11:** `return <div className="min-h-screen bg-slate-50 p-4 md:p-8">` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 6: `const { data, isLoading, isError, refetch, isFetching } = useQuery({`.
- Line 10: `const tours = Array.isArray(data) ? data : data?.tours || data?.data?.tours || data?.data || [];`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
