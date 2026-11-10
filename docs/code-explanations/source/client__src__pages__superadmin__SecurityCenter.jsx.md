# Source explanation: client/src/pages/superadmin/SecurityCenter.jsx

**Source:** [client/src/pages/superadmin/SecurityCenter.jsx](../../../client/src/pages/superadmin/SecurityCenter.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useQuery` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getSecurityStatus`, `getSecurityEvents` from `../../api/superAdminApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/superAdminApi](../../../client/src/api/superAdminApi.js)

## Runtime declarations and data flow

### `SecurityCenter` — lines 4–30

Parameters: none.
React hooks used: useQuery. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 5:** `const statusQuery = useQuery({ queryKey: ["security-center-status"], queryFn: getSecurityStatus, staleTime: 30_000, retry: 1 });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 6:** `const eventsQuery = useQuery({ queryKey: ["security-center-events"], queryFn: getSecurityEvents, staleTime: 30_000, retry: 1 });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 8:** `if (statusQuery.isLoading) return <div className="p-8">Checking security infrastructure...</div>;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 10:** `if (statusQuery.isError) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 11:** `return <div className="space-y-4 p-8"><h1 className="text-3xl font-bold">Security Center</h1><div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700"><h2 className="font-bold">Security status unavaila` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 14:** `const response = statusQuery.data?.data || statusQuery.data || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 15:** `const events = eventsQuery.data?.data || eventsQuery.data || [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 16:** `const authentication = typeof response.authentication === "object" ? response.authentication.status : response.authentication;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 17:** `const authorization = typeof response.authorization === "object" ? response.authorization.status : response.authorization;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 19:** `return <div className="space-y-8 p-8">` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `Card` — lines 32–32

Parameters: `{title, value}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 5: `const statusQuery = useQuery({ queryKey: ["security-center-status"], queryFn: getSecurityStatus, staleTime: 30_000, retry: 1 });`.
- Line 6: `const eventsQuery = useQuery({ queryKey: ["security-center-events"], queryFn: getSecurityEvents, staleTime: 30_000, retry: 1 });`.
- Line 14: `const response = statusQuery.data?.data || statusQuery.data || {};`.
- Line 15: `const events = eventsQuery.data?.data || eventsQuery.data || [];`.
- Line 16: `const authentication = typeof response.authentication === "object" ? response.authentication.status : response.authentication;`.
- Line 17: `const authorization = typeof response.authorization === "object" ? response.authorization.status : response.authorization;`.
- Line 32: `function Card({ title, value }) { return <div className="rounded-xl bg-white p-5 shadow"><h3 className="text-gray-500">{title}</h3><p className="mt-2 text-3xl font-bold">{value}</p`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
