# Source explanation: client/src/pages/agent/AgentBookings.jsx

**Source:** [client/src/pages/agent/AgentBookings.jsx](../../../client/src/pages/agent/AgentBookings.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useMemo`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `AlertTriangle`, `CalendarDays`, `CheckCircle2`, `Eye`, `RefreshCw`, `Search`, `Clock3`, `CreditCard` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useAgentBookings` from `../../hooks/useAgentBookings`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/hooks/useAgentBookings](../../../client/src/hooks/useAgentBookings.js)

## Runtime declarations and data flow

### `money` — lines 5–5

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `nameOf` — lines 6–6

Parameters: `booking`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `tourOf` — lines 7–7

Parameters: `booking`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `statusOf` — lines 8–8

Parameters: `booking`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `paymentOf` — lines 9–9

Parameters: `booking`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `formatDate` — lines 10–10

Parameters: `value`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:

### `statusTone` — lines 11–11

Parameters: `status`.
3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:

### `label` — lines 13–13

Parameters: `status`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `AgentBookings` — lines 15–35

Parameters: none.
React hooks used: useState, useMemo. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 16:** `const query = useAgentBookings({ page: 1, limit: 100 });` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 17:** `const data = Array.isArray(query.data) ? query.data : [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 18:** `const [search, setSearch] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 19:** `const [status, setStatus] = useState("all");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 20:** `const [payment, setPayment] = useState("all");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 21:** `const [selected, setSelected] = useState(null);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 22:** `const filtered = useMemo(() => { const term = search.trim().toLowerCase(); return data.filter((b) => { const s = statusOf(b); const p = paymentOf(b); const matchesSearch = !term || [nameOf(b), tourOf(b), b?.bookingNumber` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 23:** `const stats = useMemo(() => ({ total: data.length, completed: data.filter((b) => statusOf(b) === "completed").length, pending: data.filter((b) => ["pending", "processing"].includes(statusOf(b))).length, paid: data.filter` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 25:** `if (query.isLoading) return <div className="min-h-full bg-slate-50 p-6"><div className="mx-auto max-w-7xl animate-pulse space-y-5"><div className="h-32 rounded-3xl bg-slate-200"/><div className="grid gap-4 sm:grid-cols-2` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 26:** `if (query.isError) return <div className="min-h-full bg-slate-50 p-6"><div className="mx-auto max-w-4xl rounded-3xl border border-rose-200 bg-white p-8"><AlertTriangle className="h-7 w-7 text-rose-600"/><h1 className="mt` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 28:** `return <section className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8"><div className="mx-auto max-w-7xl space-y-6">` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 5: `const money = (value) => { const n = Number(value); return Number.isFinite(n) ? \`KES ${n.toLocaleString("en-KE")}\` : "—"; };`.
- Line 6: `const nameOf = (booking) => booking?.customer?.name || [booking?.customer?.firstName, booking?.customer?.lastName].filter(Boolean).join(" ") || booking?.customerSnapshot?.name || b`.
- Line 7: `const tourOf = (booking) => booking?.tourPackage?.title || booking?.tour?.title || booking?.tour?.name || "Tour unavailable";`.
- Line 8: `const statusOf = (booking) => String(booking?.bookingStatus || booking?.status || "unknown").toLowerCase();`.
- Line 9: `const paymentOf = (booking) => String(booking?.paymentStatus || "unknown").toLowerCase();`.
- Line 10: `const formatDate = (value) => { if (!value) return "—"; const d = new Date(value); return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-KE", { day: "2-digit", month: "`.
- Line 11: `const statusTone = (status) => { if (["completed", "confirmed", "paid", "approved"].includes(status)) return "bg-emerald-50 text-emerald-700 ring-emerald-200"; if (["pending", "pro`.
- Line 12: `const iconTone = { indigo: "bg-indigo-50 text-indigo-700", emerald: "bg-emerald-50 text-emerald-700", amber: "bg-amber-50 text-amber-700", violet: "bg-violet-50 text-violet-700" };`.
- Line 13: `const label = (status) => status.replace(/[_-]/g, " ").replace(/\b\w/g, (x) => x.toUpperCase());`.
- Line 16: `const query = useAgentBookings({ page: 1, limit: 100 });`.
- Line 17: `const data = Array.isArray(query.data) ? query.data : [];`.
- Line 18: `const [search, setSearch] = useState("");`.
- Line 19: `const [status, setStatus] = useState("all");`.
- Line 20: `const [payment, setPayment] = useState("all");`.
- Line 21: `const [selected, setSelected] = useState(null);`.
- Line 22: `const filtered = useMemo(() => { const term = search.trim().toLowerCase(); return data.filter((b) => { const s = statusOf(b); const p = paymentOf(b); const matchesSearch = !term ||`.
- Line 23: `const stats = useMemo(() => ({ total: data.length, completed: data.filter((b) => statusOf(b) === "completed").length, pending: data.filter((b) => ["pending", "processing"].includes`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
