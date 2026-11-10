# Source explanation: client/src/pages/admin/Agents.jsx

**Source:** [client/src/pages/admin/Agents.jsx](../../../client/src/pages/admin/Agents.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useMemo`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useQuery`, `useMutation`, `useQueryClient` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Users`, `CheckCircle2`, `Clock3`, `PauseCircle`, `MapPin`, `Search`, `RefreshCw`, `UserCheck`, `Building2`, `Mail`, `Phone` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `toast` from `react-toastify`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getAgents`, `approveAgent`, `updateAgentStatus` from `../../api/adminAgentApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/adminAgentApi](../../../client/src/api/adminAgentApi.js)

## Runtime declarations and data flow

### `statusLabel` — lines 8–8

Parameters: `status`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `statusClass` — lines 9–13

Parameters: `status`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `money` — lines 14–14

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `text` — lines 15–15

Parameters: `value`, `fallback (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Metric` — lines 17–19

Parameters: `{icon, label, value, tone}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 18:** `return <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-center justify-between gap-3"><div className={\`flex h-11 w-11` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `Agents` — lines 21–54

Parameters: none.
React hooks used: useState, useQuery, useMutation, useMemo. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 22:** `const qc = useQueryClient();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 23:** `const [search, setSearch] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 24:** `const [filter, setFilter] = useState("all");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 25:** `const { data = [], isLoading, isFetching, isError, refetch } = useQuery({ queryKey: ["agents"], queryFn: getAgents, staleTime: 15_000 });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 26:** `const approve = useMutation({ mutationFn: approveAgent, onSuccess: () => { qc.invalidateQueries({ queryKey: ["agents"] }); toast.success("Agent approved successfully."); }, onError: (error) => toast.error(error?.response` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 27:** `const status = useMutation({ mutationFn: ({ id, value }) => updateAgentStatus(id, value), onSuccess: () => { qc.invalidateQueries({ queryKey: ["agents"] }); toast.success("Agent status updated."); }, onError: (error) => ` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 29:** `const rows = useMemo(() => {` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 30:** `const term = search.trim().toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 31:** `return data.filter((agent) => {` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 32:** `const state = !agent.isApproved ? "pending" : agent.status || "inactive";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 33:** `const haystack = [agent.user?.name, agent.user?.email, agent.email, agent.companyName, agent.location, agent.phone].filter(Boolean).join(" ").toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 34:** `return (!term || haystack.includes(term)) && (filter === "all" || state === filter);` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 38:** `const active = data.filter((agent) => agent.isApproved === true && agent.status === "active").length;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 39:** `const pending = data.filter((agent) => agent.isApproved !== true).length;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 40:** `const suspended = data.filter((agent) => agent.isApproved === true && agent.status === "suspended").length;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 42:** `if (isLoading) return <div className="min-h-[60vh] bg-gradient-to-br from-emerald-50 via-slate-50 to-amber-50 p-4 sm:p-6"><div className="mx-auto max-w-7xl animate-pulse rounded-2xl bg-white p-8 shadow-sm ring-1 ring-sla` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 43:** `if (isError) return <div className="min-h-[60vh] bg-gradient-to-br from-emerald-50 via-slate-50 to-amber-50 p-4 sm:p-6"><div className="mx-auto max-w-7xl rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800"><` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 45:** `return <div className="min-h-full bg-gradient-to-br from-emerald-50 via-slate-50 to-amber-50 p-4 sm:p-6"><div className="mx-auto max-w-7xl space-y-6">` — Exits this function and supplies its result (or response short-circuit) to the caller.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 7: `const STATUS_OPTIONS = ["active", "inactive", "suspended"];`.
- Line 8: `const statusLabel = (status) => ({ active: "Active", inactive: "Inactive", suspended: "Suspended" }[status] || "Unknown");`.
- Line 9: `const statusClass = (status) => ({`.
- Line 14: `const money = (value) => \`KES ${Number(value || 0).toLocaleString("en-KE", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}\`;`.
- Line 15: `const text = (value, fallback = "—") => String(value ?? "").trim() || fallback;`.
- Line 17: `function Metric({ icon: Icon, label, value, tone }) {`.
- Line 22: `const qc = useQueryClient();`.
- Line 23: `const [search, setSearch] = useState("");`.
- Line 24: `const [filter, setFilter] = useState("all");`.
- Line 25: `const { data = [], isLoading, isFetching, isError, refetch } = useQuery({ queryKey: ["agents"], queryFn: getAgents, staleTime: 15_000 });`.
- Line 26: `const approve = useMutation({ mutationFn: approveAgent, onSuccess: () => { qc.invalidateQueries({ queryKey: ["agents"] }); toast.success("Agent approved successfully."); }, onError`.
- Line 27: `const status = useMutation({ mutationFn: ({ id, value }) => updateAgentStatus(id, value), onSuccess: () => { qc.invalidateQueries({ queryKey: ["agents"] }); toast.success("Agent st`.
- Line 29: `const rows = useMemo(() => {`.
- Line 30: `const term = search.trim().toLowerCase();`.
- Line 32: `const state = !agent.isApproved ? "pending" : agent.status || "inactive";`.
- Line 33: `const haystack = [agent.user?.name, agent.user?.email, agent.email, agent.companyName, agent.location, agent.phone].filter(Boolean).join(" ").toLowerCase();`.
- Line 38: `const active = data.filter((agent) => agent.isApproved === true && agent.status === "active").length;`.
- Line 39: `const pending = data.filter((agent) => agent.isApproved !== true).length;`.
- Line 40: `const suspended = data.filter((agent) => agent.isApproved === true && agent.status === "suspended").length;`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
