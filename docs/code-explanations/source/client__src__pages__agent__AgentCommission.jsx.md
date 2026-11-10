# Source explanation: client/src/pages/agent/AgentCommission.jsx

**Source:** [client/src/pages/agent/AgentCommission.jsx](../../../client/src/pages/agent/AgentCommission.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useMemo` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `AlertTriangle`, `CheckCircle2`, `Clock3`, `RefreshCw`, `Wallet` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useQuery` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `fetchAgentCommission` from `../../api/agentApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/agentApi](../../../client/src/api/agentApi.js)

## Runtime declarations and data flow

### `money` — lines 6–6

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `statusOf` — lines 7–7

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `tone` — lines 8–8

Parameters: `status`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `AgentCommission` — lines 10–22

Parameters: none.
React hooks used: useQuery, useMemo. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 11:** `const query = useQuery({ queryKey: ["agent-commission"], queryFn: fetchAgentCommission, staleTime: 30000, refetchOnMount: "always" });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 12:** `const rows = Array.isArray(query.data?.data) ? query.data.data : Array.isArray(query.data) ? query.data : Array.isArray(query.data?.commissions) ? query.data.commissions : [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 13:** `const summary = useMemo(() => ({ total: rows.reduce((s, r) => s + (Number(r.amount) || 0), 0), pending: rows.filter(r => statusOf(r.status) === "pending").reduce((s,r)=>s+(Number(r.amount)||0),0), approved: rows.filter(r` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 15:** `if (query.isLoading) return <div className="min-h-full bg-slate-50 p-6"><div className="mx-auto max-w-7xl animate-pulse space-y-5"><div className="h-32 rounded-3xl bg-slate-200"/><div className="grid gap-4 sm:grid-cols-3` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 16:** `if (query.isError) return <div className="min-h-full bg-slate-50 p-6"><div className="mx-auto max-w-4xl rounded-3xl border border-rose-200 bg-white p-8"><AlertTriangle className="h-7 w-7 text-rose-600"/><h1 className="mt` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 18:** `return <section className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8"><div className="mx-auto max-w-7xl space-y-6"><header className="rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-6 text-white` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 6: `const money = (value) => { const n = Number(value); return Number.isFinite(n) ? \`KES ${n.toLocaleString("en-KE")}\` : "—"; };`.
- Line 7: `const statusOf = (value) => String(value || "unknown").toLowerCase();`.
- Line 8: `const tone = (status) => status === "approved" || status === "paid" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : status === "pending" ? "bg-amber-50 text-amber-700 ring-am`.
- Line 11: `const query = useQuery({ queryKey: ["agent-commission"], queryFn: fetchAgentCommission, staleTime: 30000, refetchOnMount: "always" });`.
- Line 12: `const rows = Array.isArray(query.data?.data) ? query.data.data : Array.isArray(query.data) ? query.data : Array.isArray(query.data?.commissions) ? query.data.commissions : [];`.
- Line 13: `const summary = useMemo(() => ({ total: rows.reduce((s, r) => s + (Number(r.amount) || 0), 0), pending: rows.filter(r => statusOf(r.status) === "pending").reduce((s,r)=>s+(Number(r`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
