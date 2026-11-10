# Source explanation: client/src/pages/superadmin/SuperAdminSystem.jsx

**Source:** [client/src/pages/superadmin/SuperAdminSystem.jsx](../../../client/src/pages/superadmin/SuperAdminSystem.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useMemo` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useQuery` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Activity`, `AlertTriangle`, `CheckCircle2`, `Clock3`, `Cpu`, `Database`, `HardDrive`, `RefreshCw`, `Server`, `ShieldCheck`, `XCircle` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getSystemHealth` from `../../api/superAdminApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/superAdminApi](../../../client/src/api/superAdminApi.js)

## Runtime declarations and data flow

### `normalizeSystemHealth` — lines 6–28

Parameters: `payload`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 7:** `const source = payload?.system || payload?.data?.system || payload?.data || payload || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 8:** `const rawMemory = source.memory || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 9:** `const database = typeof source.database === "object" ? source.database : { status: source.database };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 10:** `return {` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `StatusBadge` — lines 38–42

Parameters: `{value}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 39:** `const meta = statusMeta[String(value || "unknown").toLowerCase()] || statusMeta.unknown;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 40:** `const Icon = meta.icon;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 41:** `return <span className={\`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${meta.classes}\`}><Icon className="h-3.5 w-3.5" />{meta.label}</span>;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `formatUptime` — lines 44–53

Parameters: `seconds`.
3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 45:** `if (!Number.isFinite(seconds) || seconds < 0) return "—";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 46:** `const total = Math.floor(seconds);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 47:** `const days = Math.floor(total / 86400);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 48:** `const hours = Math.floor((total % 86400) / 3600);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 49:** `const minutes = Math.floor((total % 3600) / 60);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 50:** `if (days) return \`${days}d ${hours}h ${minutes}m\`;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 51:** `if (hours) return \`${hours}h ${minutes}m\`;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 52:** `return \`${minutes}m ${total % 60}s\`;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `formatTime` — lines 55–60

Parameters: `value`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 56:** `if (!value) return "—";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 57:** `const date = new Date(value);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 58:** `if (Number.isNaN(date.getTime())) return "—";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 59:** `return new Intl.DateTimeFormat("en-KE", { timeZone: "Africa/Nairobi", dateStyle: "medium", timeStyle: "medium" }).format(date);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `MetricCard` — lines 62–70

Parameters: `{icon, label, value, detail, tone}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 63:** `const tones = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 69:** `return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `DetailRow` — lines 72–74

Parameters: `{label, value}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 73:** `return <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-3 last:border-0"><span className="text-sm text-slate-500">{label}</span><strong className="max-w-[65%] break-words text-right te` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `SuperAdminSystem` — lines 76–120

Parameters: none.
React hooks used: useQuery, useMemo. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 77:** `const { data, isLoading, isError, error, refetch, isFetching } = useQuery({ queryKey: ["system-health"], queryFn: getSystemHealth, refetchInterval: 10000 });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 79:** `const system = useMemo(() => normalizeSystemHealth(data), [data]);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 80:** `const databaseHealthy = String(system.database?.status || "").toLowerCase() === "connected" || system.database?.connected === true;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 81:** `const overallHealthy = String(system.status).toLowerCase() === "healthy";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 82:** `const heapPercent = Number(system.memory.heapPercent);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 83:** `const memoryKnown = Number.isFinite(heapPercent);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 84:** `const healthScore = overallHealthy ? (databaseHealthy && (!memoryKnown || heapPercent < 90) ? 100 : 90) : databaseHealthy ? 70 : 25;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 86:** `if (isLoading) return <div className="min-h-full bg-slate-50 p-6 lg:p-8"><div className="mx-auto max-w-[1600px] animate-pulse space-y-6"><div className="h-32 rounded-3xl bg-slate-200" /><div className="grid gap-4 md:grid` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 88:** `if (isError) return <div className="min-h-full bg-slate-50 p-6 lg:p-8"><div className="mx-auto max-w-[1600px] rounded-3xl border border-rose-200 bg-white p-8 shadow-sm"><div className="flex h-12 w-12 items-center justify` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 90:** `return <div className="min-h-full bg-slate-50 p-6 lg:p-8">` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 6: `function normalizeSystemHealth(payload) {`.
- Line 7: `const source = payload?.system || payload?.data?.system || payload?.data || payload || {};`.
- Line 8: `const rawMemory = source.memory || {};`.
- Line 9: `const database = typeof source.database === "object" ? source.database : { status: source.database };`.
- Line 30: `const statusMeta = {`.
- Line 38: `function StatusBadge({ value }) {`.
- Line 39: `const meta = statusMeta[String(value || "unknown").toLowerCase()] || statusMeta.unknown;`.
- Line 40: `const Icon = meta.icon;`.
- Line 44: `function formatUptime(seconds) {`.
- Line 46: `const total = Math.floor(seconds);`.
- Line 47: `const days = Math.floor(total / 86400);`.
- Line 48: `const hours = Math.floor((total % 86400) / 3600);`.
- Line 49: `const minutes = Math.floor((total % 3600) / 60);`.
- Line 55: `function formatTime(value) {`.
- Line 57: `const date = new Date(value);`.
- Line 62: `function MetricCard({ icon: Icon, label, value, detail, tone = "slate" }) {`.
- Line 63: `const tones = {`.
- Line 72: `function DetailRow({ label, value }) {`.
- Line 77: `const { data, isLoading, isError, error, refetch, isFetching } = useQuery({ queryKey: ["system-health"], queryFn: getSystemHealth, refetchInterval: 10000 });`.
- Line 79: `const system = useMemo(() => normalizeSystemHealth(data), [data]);`.
- Line 80: `const databaseHealthy = String(system.database?.status || "").toLowerCase() === "connected" || system.database?.connected === true;`.
- Line 81: `const overallHealthy = String(system.status).toLowerCase() === "healthy";`.
- Line 82: `const heapPercent = Number(system.memory.heapPercent);`.
- Line 83: `const memoryKnown = Number.isFinite(heapPercent);`.
- Line 84: `const healthScore = overallHealthy ? (databaseHealthy && (!memoryKnown || heapPercent < 90) ? 100 : 90) : databaseHealthy ? 70 : 25;`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
