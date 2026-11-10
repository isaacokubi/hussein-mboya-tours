# Source explanation: client/src/pages/superadmin/SuperAdminSecurity.jsx

**Source:** [client/src/pages/superadmin/SuperAdminSecurity.jsx](../../../client/src/pages/superadmin/SuperAdminSecurity.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useQuery` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `ShieldCheck`, `ShieldAlert`, `Database`, `KeyRound`, `RefreshCw`, `Users`, `LockKeyhole`, `Activity`, `CheckCircle2`, `AlertTriangle` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getSecurityStatus` from `../../api/superAdminApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/superAdminApi](../../../client/src/api/superAdminApi.js)

## Runtime declarations and data flow

### `normalizeStatus` — lines 5–5

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `SuperAdminSecurity` — lines 7–95

Parameters: none.
React hooks used: useQuery. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 8:** `const { data: response, isLoading, isError, error, refetch, isFetching } = useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 15:** `if (isLoading) return <SecurityLoading />;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 17:** `if (isError) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 18:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 35:** `const data = response?.data || response || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 36:** `const authenticationStatus = typeof data.authentication === "object" ? data.authentication.status : data.authentication;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 37:** `const authorization = typeof data.authorization === "object" ? data.authorization : {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 38:** `const authorizationStatus = authorization.status || (authorization.roles > 0 && authorization.permissions > 0 ? "Active" : "Warning");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 39:** `const controls = Array.isArray(data.controls) ? data.controls : [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 40:** `const score = typeof data.securityScore === "number" ? data.securityScore : null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 41:** `const threat = normalizeStatus(data.threatLevel);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 42:** `const failedAttempts = typeof data.failedAttempts24h === "number" ? data.failedAttempts24h : null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 43:** `const criticalEvents = typeof data.criticalEvents24h === "number" ? data.criticalEvents24h : null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 44:** `const lastChecked = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 45:** `const activeControls = controls.filter((control) => normalizeStatus(control.status) === "active").length;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 47:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 66:** `const active = normalizeStatus(control.status) === "active";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 67:** `return <div key={control._id || control.name || index} className={\`rounded-xl border p-4 transition ${active ? "border-emerald-200 bg-emerald-50/60" : "border-amber-200 bg-amber-50/60"}\`}><div className="flex items-sta` — Exits this function and supplies its result (or response short-circuit) to the caller.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `PageHeader` — lines 97–97

Parameters: `{onRefresh, refreshing}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `MetricCard` — lines 98–98

Parameters: `{label, value, helper, icon, tone}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `InfoCard` — lines 99–99

Parameters: `{icon, label, value}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `SnapshotRow` — lines 100–100

Parameters: `{label, value, status, numeric, critical}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `EmptyState` — lines 101–101

Parameters: `{text}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `SecurityLoading` — lines 102–102

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 5: `const normalizeStatus = (value) => String(value || "unknown").trim().toLowerCase();`.
- Line 8: `const { data: response, isLoading, isError, error, refetch, isFetching } = useQuery({`.
- Line 35: `const data = response?.data || response || {};`.
- Line 36: `const authenticationStatus = typeof data.authentication === "object" ? data.authentication.status : data.authentication;`.
- Line 37: `const authorization = typeof data.authorization === "object" ? data.authorization : {};`.
- Line 38: `const authorizationStatus = authorization.status || (authorization.roles > 0 && authorization.permissions > 0 ? "Active" : "Warning");`.
- Line 39: `const controls = Array.isArray(data.controls) ? data.controls : [];`.
- Line 40: `const score = typeof data.securityScore === "number" ? data.securityScore : null;`.
- Line 41: `const threat = normalizeStatus(data.threatLevel);`.
- Line 42: `const failedAttempts = typeof data.failedAttempts24h === "number" ? data.failedAttempts24h : null;`.
- Line 43: `const criticalEvents = typeof data.criticalEvents24h === "number" ? data.criticalEvents24h : null;`.
- Line 44: `const lastChecked = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });`.
- Line 45: `const activeControls = controls.filter((control) => normalizeStatus(control.status) === "active").length;`.
- Line 66: `const active = normalizeStatus(control.status) === "active";`.
- Line 97: `function PageHeader({ onRefresh, refreshing }) { return <div className="flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 px-5 py-6 text-w`.
- Line 98: `function MetricCard({ label, value, helper, icon: Icon, tone }) { const tones = { emerald: "border-emerald-200 bg-emerald-50 text-emerald-700", amber: "border-amber-200 bg-amber-50`.
- Line 99: `function InfoCard({ icon: Icon, label, value }) { return <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><span className="rounded`.
- Line 100: `function SnapshotRow({ label, value, status, numeric = false, critical = false }) { const normalized = normalizeStatus(status); const good = normalized === "active" || normalized =`.
- Line 101: `function EmptyState({ text }) { return <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500 sm:col-span-2">{text}</di`.
- Line 102: `function SecurityLoading() { return <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8"><div className="h-40 animate-pulse rounded-2xl bg-slate-200" /><div className="mt-6 gr`.

## Security, errors and performance checkpoints

- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
