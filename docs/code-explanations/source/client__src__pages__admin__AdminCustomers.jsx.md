# Source explanation: client/src/pages/admin/AdminCustomers.jsx

**Source:** [client/src/pages/admin/AdminCustomers.jsx](../../../client/src/pages/admin/AdminCustomers.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useQuery` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `api` from `../../api/axios`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/axios](../../../client/src/api/axios.js)

## Runtime declarations and data flow

### `AdminCustomers` — lines 4–51

Parameters: none.
HTTP operations detected: api.get; response/error handling occurs in this function and its caller. React hooks used: useQuery. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 6:** `const { data, isLoading, isError } = useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 8:** `queryFn: async () => (await api.get("/customers")).data,` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 10:** `const customers = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : Array.isArray(data?.customers) ? data.customers : [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 12:** `if (isLoading) return <div className="p-6">Loading customers...</div>;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 13:** `if (isError) return <div className="p-6 text-red-600">Failed to load customers.</div>;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 15:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 6: `const { data, isLoading, isError } = useQuery({`.
- Line 10: `const customers = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : Array.isArray(data?.customers) ? data.customers : [];`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
