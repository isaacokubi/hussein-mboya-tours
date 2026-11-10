# Source explanation: client/src/pages/admin/CustomerDetails.jsx

**Source:** [client/src/pages/admin/CustomerDetails.jsx](../../../client/src/pages/admin/CustomerDetails.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useMemo` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useQuery` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Link`, `useParams` from `react-router-dom`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `ArrowLeft`, `CalendarDays`, `CheckCircle2`, `FileText`, `Mail`, `MessageSquare`, `Phone`, `RefreshCw`, `Star`, `UserRound`, `WalletCards`, `X` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getCustomerProfile` from `../../api/customerApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/customerApi](../../../client/src/api/customerApi.js)

## Runtime declarations and data flow

### `money` — lines 20–24

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `displayValue` — lines 26–26

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `titleCase` — lines 28–31

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `statusTone` — lines 33–39

Parameters: `status`.
3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 34:** `const value = String(status || "").toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 35:** `if (["completed", "confirmed", "paid", "published"].includes(value)) return "bg-emerald-50 text-emerald-700 ring-emerald-100";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 36:** `if (["pending", "processing", "partial"].includes(value)) return "bg-amber-50 text-amber-700 ring-amber-100";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 37:** `if (["cancelled", "failed", "rejected", "refunded"].includes(value)) return "bg-red-50 text-red-700 ring-red-100";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 38:** `return "bg-slate-100 text-slate-700 ring-slate-200";` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `formatDate` — lines 41–47

Parameters: `value`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 42:** `if (!value) return "—";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 43:** `const date = new Date(value);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 44:** `return Number.isNaN(date.getTime())` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `CustomerDetails` — lines 51–174

Parameters: none.
React hooks used: useQuery, useMemo. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 52:** `const { id } = useParams();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 53:** `const { data, isLoading, isError, error, isFetching, refetch } = useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 60:** `const profile = data?.data || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 61:** `const customer = profile.customer;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 62:** `const bookings = Array.isArray(profile.bookings) ? profile.bookings : [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 63:** `const quotations = Array.isArray(profile.quotations) ? profile.quotations : [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 64:** `const invoices = Array.isArray(profile.invoices) ? profile.invoices : [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 65:** `const reviews = Array.isArray(profile.reviews) ? profile.reviews : [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 66:** `const communications = Array.isArray(profile.communications) ? profile.communications : [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 68:** `const metrics = useMemo(() => ({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 78:** `if (isLoading) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 79:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 90:** `if (isError || !customer) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 91:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 106:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `Metric` — lines 176–178

Parameters: `{icon, label, value, compact}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 177:** `return <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-slate-500">{labe` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `InfoPanel` — lines 180–182

Parameters: `{icon, title, items, empty, renderItem}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 181:** `return <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><div className="flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `Header` — lines 184–186

Parameters: `{children}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 185:** `return <th className="whitespace-nowrap p-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">{children}</th>;` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 20: `const money = (value) =>`.
- Line 26: `const displayValue = (value) => (value ? String(value) : "—");`.
- Line 28: `const titleCase = (value) =>`.
- Line 33: `const statusTone = (status) => {`.
- Line 34: `const value = String(status || "").toLowerCase();`.
- Line 41: `const formatDate = (value) => {`.
- Line 43: `const date = new Date(value);`.
- Line 49: `const successfulBookingStatuses = new Set(["confirmed", "assigned", "ongoing", "completed"]);`.
- Line 52: `const { id } = useParams();`.
- Line 53: `const { data, isLoading, isError, error, isFetching, refetch } = useQuery({`.
- Line 60: `const profile = data?.data || {};`.
- Line 61: `const customer = profile.customer;`.
- Line 62: `const bookings = Array.isArray(profile.bookings) ? profile.bookings : [];`.
- Line 63: `const quotations = Array.isArray(profile.quotations) ? profile.quotations : [];`.
- Line 64: `const invoices = Array.isArray(profile.invoices) ? profile.invoices : [];`.
- Line 65: `const reviews = Array.isArray(profile.reviews) ? profile.reviews : [];`.
- Line 66: `const communications = Array.isArray(profile.communications) ? profile.communications : [];`.
- Line 68: `const metrics = useMemo(() => ({`.
- Line 176: `function Metric({ icon: Icon, label, value, compact = false }) {`.
- Line 180: `function InfoPanel({ icon: Icon, title, items, empty, renderItem }) {`.
- Line 184: `function Header({ children }) {`.

## Security, errors and performance checkpoints

- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
