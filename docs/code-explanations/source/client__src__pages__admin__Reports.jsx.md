# Source explanation: client/src/pages/admin/Reports.jsx

**Source:** [client/src/pages/admin/Reports.jsx](../../../client/src/pages/admin/Reports.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useMemo` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useQuery` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Activity`, `AlertCircle`, `BarChart3`, `CalendarDays`, `CheckCircle2`, `Clock3`, `RefreshCw`, `TrendingUp`, `Users` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getDailyReport`, `getTourReport`, `getAgentReport` from `../../api/adminReportApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/adminReportApi](../../../client/src/api/adminReportApi.js)

## Runtime declarations and data flow

### `money` — lines 6–6

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `number` — lines 7–7

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `listFrom` — lines 8–12

Parameters: `value`, `keys (defaulted)`.
3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 9:** `if (Array.isArray(value)) return value;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 10:** `for (const key of keys) if (Array.isArray(value?.[key])) return value[key];` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 11:** `return [];` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `agentDisplayName` — lines 14–14

Parameters: `agent`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `agentEmail` — lines 15–15

Parameters: `agent`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `agentPhone` — lines 16–16

Parameters: `agent`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `StatCard` — lines 18–21

Parameters: `{icon, label, value, detail, tone}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 19:** `const tones = { indigo: "bg-indigo-50 text-indigo-700 ring-indigo-100", sky: "bg-sky-50 text-sky-700 ring-sky-100", violet: "bg-violet-50 text-violet-700 ring-violet-100", emerald: "bg-emerald-50 text-emerald-700 ring-em` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 20:** `return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `Section` — lines 23–23

Parameters: `{icon, title, description, children}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `LoadingBlock` — lines 24–24

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `ErrorBlock` — lines 25–25

Parameters: `{onRetry}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Reports` — lines 27–48

Parameters: none.
React hooks used: useQuery, useMemo.

Key statements:
- **Line 28:** `const dailyQuery = useQuery({ queryKey: ["daily-report"], queryFn: getDailyReport, staleTime: 30_000, retry: 2, refetchOnWindowFocus: false });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 29:** `const toursQuery = useQuery({ queryKey: ["tour-report"], queryFn: getTourReport, staleTime: 30_000, retry: 2, refetchOnWindowFocus: false });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 30:** `const agentsQuery = useQuery({ queryKey: ["agent-report"], queryFn: getAgentReport, staleTime: 30_000, retry: 2, refetchOnWindowFocus: false });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 32:** `const dailyBookings = listFrom(dailyQuery.data, ["bookings", "data"]);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 33:** `const tours = listFrom(toursQuery.data, ["data", "tours"]);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 34:** `const agents = listFrom(agentsQuery.data, ["data", "agents"]);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 35:** `const metrics = useMemo(() => ({ revenue: tours.reduce((sum, item) => sum + (Number(item.revenue) || 0), 0), bookings: tours.reduce((sum, item) => sum + (Number(item.totalBookings) || 0), 0) }), [tours]);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 36:** `const refreshAll = () => { dailyQuery.refetch(); toursQuery.refetch(); agentsQuery.refetch(); };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 37:** `const anyLoading = dailyQuery.isFetching || toursQuery.isFetching || agentsQuery.isFetching;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 38:** `const hasErrorWithoutData = (query, items) => query.isError && !query.data && items.length === 0;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 40:** `return <div className="min-h-full bg-slate-100 p-4 sm:p-6 lg:p-8"><div className="mx-auto max-w-7xl space-y-6">` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `refreshAll` — lines 36–36

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `hasErrorWithoutData` — lines 38–38

Parameters: `query`, `items`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 6: `const money = (value) => new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(Number(value) || 0);`.
- Line 7: `const number = (value) => new Intl.NumberFormat("en-KE").format(Number(value) || 0);`.
- Line 8: `const listFrom = (value, keys = []) => {`.
- Line 14: `const agentDisplayName = (agent) => agent?.name || agent?.user?.name || agent?.companyName || agent?.email || agent?.user?.email || "Unknown agent";`.
- Line 15: `const agentEmail = (agent) => agent?.email || agent?.user?.email || "";`.
- Line 16: `const agentPhone = (agent) => agent?.phone || agent?.user?.phone || "";`.
- Line 18: `const StatCard = ({ icon: Icon, label, value, detail, tone = "indigo" }) => {`.
- Line 19: `const tones = { indigo: "bg-indigo-50 text-indigo-700 ring-indigo-100", sky: "bg-sky-50 text-sky-700 ring-sky-100", violet: "bg-violet-50 text-violet-700 ring-violet-100", emerald:`.
- Line 23: `const Section = ({ icon: Icon, title, description, children }) => <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex i`.
- Line 24: `const LoadingBlock = () => <div className="animate-pulse space-y-3 p-5"><div className="h-10 rounded-lg bg-slate-100" /><div className="h-10 rounded-lg bg-slate-100" /><div classNa`.
- Line 25: `const ErrorBlock = ({ onRetry }) => <div className="flex flex-col items-center justify-center px-5 py-12 text-center"><div className="rounded-full bg-red-50 p-3 text-red-600"><Aler`.
- Line 28: `const dailyQuery = useQuery({ queryKey: ["daily-report"], queryFn: getDailyReport, staleTime: 30_000, retry: 2, refetchOnWindowFocus: false });`.
- Line 29: `const toursQuery = useQuery({ queryKey: ["tour-report"], queryFn: getTourReport, staleTime: 30_000, retry: 2, refetchOnWindowFocus: false });`.
- Line 30: `const agentsQuery = useQuery({ queryKey: ["agent-report"], queryFn: getAgentReport, staleTime: 30_000, retry: 2, refetchOnWindowFocus: false });`.
- Line 32: `const dailyBookings = listFrom(dailyQuery.data, ["bookings", "data"]);`.
- Line 33: `const tours = listFrom(toursQuery.data, ["data", "tours"]);`.
- Line 34: `const agents = listFrom(agentsQuery.data, ["data", "agents"]);`.
- Line 35: `const metrics = useMemo(() => ({ revenue: tours.reduce((sum, item) => sum + (Number(item.revenue) || 0), 0), bookings: tours.reduce((sum, item) => sum + (Number(item.totalBookings)`.
- Line 36: `const refreshAll = () => { dailyQuery.refetch(); toursQuery.refetch(); agentsQuery.refetch(); };`.
- Line 37: `const anyLoading = dailyQuery.isFetching || toursQuery.isFetching || agentsQuery.isFetching;`.
- Line 38: `const hasErrorWithoutData = (query, items) => query.isError && !query.data && items.length === 0;`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
