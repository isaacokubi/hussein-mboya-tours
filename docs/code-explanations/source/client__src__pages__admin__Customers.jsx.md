# Source explanation: client/src/pages/admin/Customers.jsx

**Source:** [client/src/pages/admin/Customers.jsx](../../../client/src/pages/admin/Customers.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useMemo`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useQuery` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Search`, `ChevronLeft`, `ChevronRight`, `Users`, `Eye`, `RefreshCw`, `UserRound`, `Phone`, `Mail`, `CalendarDays`, `WalletCards`, `CheckCircle2`, `X` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Link` from `react-router-dom`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useDebouncedValue` from `../../hooks/useDebouncedValue`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/hooks/useDebouncedValue](../../../client/src/hooks/useDebouncedValue.js)
- `getAdminCustomers` from `../../api/customerApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/customerApi](../../../client/src/api/customerApi.js)

## Runtime declarations and data flow

### `money` — lines 9–9

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `titleCase` — lines 10–10

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `displayValue` — lines 11–11

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Customers` — lines 12–21

Parameters: none.
React hooks used: useState, useQuery, useMemo. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 13:** `const [search, setSearch] = useState(""); const [page, setPage] = useState(1); const debouncedSearch = useDebouncedValue(search, 350);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 14:** `const { data, isLoading, isError, error, isFetching, refetch } = useQuery({ queryKey: ["admin-customers", debouncedSearch, page], queryFn: () => getAdminCustomers({ search: debouncedSearch, page, limit: PAGE_SIZE }), pla` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 15:** `const customers = Array.isArray(data?.data) ? data.data : []; const total = Number(data?.pagination?.total || 0); const pages = Math.max(1, Number(data?.pagination?.pages || 1));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 16:** `const metrics = useMemo(() => ({ active: customers.filter((customer) => customer.isActive !== false).length, confirmedBookings: customers.reduce((sum, customer) => sum + Number(customer.confirmedBookings || 0), 0), confi` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 17:** `const resetSearch = () => { setSearch(""); setPage(1); };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 18:** `if (isLoading) return <div className="min-h-screen bg-slate-50 p-4 sm:p-6"><div className="mx-auto max-w-7xl animate-pulse space-y-5"><div className="h-32 rounded-3xl bg-slate-200" /><div className="h-20 rounded-2xl bg-w` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 19:** `if (isError) return <div className="min-h-screen bg-slate-50 p-4 sm:p-6"><div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm"><div className="mx-auto mb-4 flex h-12 w-12` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 20:** `return <div className="min-h-screen bg-slate-50 p-4 sm:p-6"><div className="mx-auto max-w-7xl space-y-5"><section className="overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-800 to-green-700 p-6` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `resetSearch` — lines 17–17

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Metric` — lines 22–22

Parameters: `{icon, label, value, compact}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Header` — lines 23–23

Parameters: `{children, align}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 8: `const PAGE_SIZE = 10;`.
- Line 9: `const money = (value) => \`KES ${Number(value || 0).toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\`;`.
- Line 10: `const titleCase = (value) => String(value || "individual").replace(/[_-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());`.
- Line 11: `const displayValue = (value) => (value ? String(value) : "—");`.
- Line 13: `const [search, setSearch] = useState(""); const [page, setPage] = useState(1); const debouncedSearch = useDebouncedValue(search, 350);`.
- Line 14: `const { data, isLoading, isError, error, isFetching, refetch } = useQuery({ queryKey: ["admin-customers", debouncedSearch, page], queryFn: () => getAdminCustomers({ search: debounc`.
- Line 15: `const customers = Array.isArray(data?.data) ? data.data : []; const total = Number(data?.pagination?.total || 0); const pages = Math.max(1, Number(data?.pagination?.pages || 1));`.
- Line 16: `const metrics = useMemo(() => ({ active: customers.filter((customer) => customer.isActive !== false).length, confirmedBookings: customers.reduce((sum, customer) => sum + Number(cus`.
- Line 17: `const resetSearch = () => { setSearch(""); setPage(1); };`.
- Line 22: `function Metric({ icon: Icon, label, value, compact = false }) { return <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><div className="flex items-start j`.
- Line 23: `function Header({ children, align = "left" }) { return <th className={\`${align === "right" ? "text-right" : "text-left"} whitespace-nowrap p-4 text-xs font-black uppercase trackin`.

## Security, errors and performance checkpoints

- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
