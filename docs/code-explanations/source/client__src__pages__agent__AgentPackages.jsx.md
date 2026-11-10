# Source explanation: client/src/pages/agent/AgentPackages.jsx

**Source:** [client/src/pages/agent/AgentPackages.jsx](../../../client/src/pages/agent/AgentPackages.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useMemo`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `AlertTriangle`, `CalendarDays`, `Package`, `RefreshCw`, `Search`, `Wallet` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useQuery` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getPackages` from `../../api/packageApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/packageApi](../../../client/src/api/packageApi.js)

## Runtime declarations and data flow

### `price` — lines 6–6

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `duration` — lines 7–7

Parameters: `pkg`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `AgentPackages` — lines 9–22

Parameters: none.
React hooks used: useQuery, useState, useMemo. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 10:** `const query = useQuery({ queryKey: ["agent-packages"], queryFn: getPackages, staleTime: 30000, refetchOnMount: "always" });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 11:** `const packages = Array.isArray(query.data) ? query.data : query.data?.packages || query.data?.data?.packages || query.data?.data || [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 12:** `const [search, setSearch] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 13:** `const filtered = useMemo(() => { const term = search.trim().toLowerCase(); return packages.filter((pkg) => !term || [pkg?.name, pkg?.title, pkg?.description, pkg?.destination?.name].some((v) => String(v || "").toLowerCas` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 15:** `if (query.isLoading) return <div className="min-h-full bg-slate-50 p-6"><div className="mx-auto max-w-7xl animate-pulse space-y-5"><div className="h-32 rounded-3xl bg-slate-200"/><div className="grid gap-5 md:grid-cols-2` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 16:** `if (query.isError) return <div className="min-h-full bg-slate-50 p-6"><div className="mx-auto max-w-4xl rounded-3xl border border-rose-200 bg-white p-8"><AlertTriangle className="h-7 w-7 text-rose-600"/><h1 className="mt` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 18:** `return <section className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8"><div className="mx-auto max-w-7xl space-y-6"><header className="rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-6 text-white` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 6: `const price = (value) => { const n = Number(value); return Number.isFinite(n) && n > 0 ? \`KES ${n.toLocaleString("en-KE")}\` : "Price unavailable"; };`.
- Line 7: `const duration = (pkg) => { const value = pkg?.duration ?? pkg?.durationDays; return value === undefined || value === null || value === "" ? "Flexible duration" : \`${value} ${Numb`.
- Line 10: `const query = useQuery({ queryKey: ["agent-packages"], queryFn: getPackages, staleTime: 30000, refetchOnMount: "always" });`.
- Line 11: `const packages = Array.isArray(query.data) ? query.data : query.data?.packages || query.data?.data?.packages || query.data?.data || [];`.
- Line 12: `const [search, setSearch] = useState("");`.
- Line 13: `const filtered = useMemo(() => { const term = search.trim().toLowerCase(); return packages.filter((pkg) => !term || [pkg?.name, pkg?.title, pkg?.description, pkg?.destination?.name`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
