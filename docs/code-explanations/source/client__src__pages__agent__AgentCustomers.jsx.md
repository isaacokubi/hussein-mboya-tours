# Source explanation: client/src/pages/agent/AgentCustomers.jsx

**Source:** [client/src/pages/agent/AgentCustomers.jsx](../../../client/src/pages/agent/AgentCustomers.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useMemo`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `AlertTriangle`, `Eye`, `Phone`, `RefreshCw`, `Search`, `UserRound`, `Users` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useAgentCustomers` from `../../hooks/useAgentCustomers`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/hooks/useAgentCustomers](../../../client/src/hooks/useAgentCustomers.js)

## Runtime declarations and data flow

### `fullName` — lines 5–5

Parameters: `customer`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `statusOf` — lines 6–6

Parameters: `customer`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `statusTone` — lines 7–7

Parameters: `status`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `AgentCustomers` — lines 9–29

Parameters: none.
React hooks used: useState, useMemo. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 10:** `const query = useAgentCustomers({ page: 1, limit: 100 });` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 11:** `const data = Array.isArray(query.data) ? query.data : [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 12:** `const [search, setSearch] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 13:** `const [status, setStatus] = useState("all");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 14:** `const [selected, setSelected] = useState(null);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 15:** `const filtered = useMemo(() => { const term = search.trim().toLowerCase(); return data.filter((c) => { const s = statusOf(c); const matches = !term || [fullName(c), c?.phone, c?.email, c?.nationality, c?._id].some((v) =>` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 16:** `const active = data.filter((c) => statusOf(c) === "active").length;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 17:** `const withPhone = data.filter((c) => c?.phone).length;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 19:** `if (query.isLoading) return <div className="min-h-full bg-slate-50 p-6"><div className="mx-auto max-w-7xl animate-pulse space-y-5"><div className="h-32 rounded-3xl bg-slate-200"/><div className="h-96 rounded-2xl bg-white` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 20:** `if (query.isError) return <div className="min-h-full bg-slate-50 p-6"><div className="mx-auto max-w-4xl rounded-3xl border border-rose-200 bg-white p-8"><AlertTriangle className="h-7 w-7 text-rose-600"/><h1 className="mt` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 22:** `return <section className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8"><div className="mx-auto max-w-7xl space-y-6">` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 5: `const fullName = (customer) => customer?.name || [customer?.firstName, customer?.lastName].filter(Boolean).join(" ") || customer?.user?.name || "Customer unavailable";`.
- Line 6: `const statusOf = (customer) => String(customer?.status || "active").toLowerCase();`.
- Line 7: `const statusTone = (status) => status === "active" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : status === "inactive" ? "bg-slate-100 text-slate-600 ring-slate-200" : "bg-`.
- Line 10: `const query = useAgentCustomers({ page: 1, limit: 100 });`.
- Line 11: `const data = Array.isArray(query.data) ? query.data : [];`.
- Line 12: `const [search, setSearch] = useState("");`.
- Line 13: `const [status, setStatus] = useState("all");`.
- Line 14: `const [selected, setSelected] = useState(null);`.
- Line 15: `const filtered = useMemo(() => { const term = search.trim().toLowerCase(); return data.filter((c) => { const s = statusOf(c); const matches = !term || [fullName(c), c?.phone, c?.em`.
- Line 16: `const active = data.filter((c) => statusOf(c) === "active").length;`.
- Line 17: `const withPhone = data.filter((c) => c?.phone).length;`.

## Security, errors and performance checkpoints

- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
