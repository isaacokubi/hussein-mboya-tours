# Source explanation: client/src/pages/admin/AdminAnalytics.jsx

**Source:** [client/src/pages/admin/AdminAnalytics.jsx](../../../client/src/pages/admin/AdminAnalytics.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useQuery` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `BarChart`, `Bar`, `XAxis`, `YAxis`, `Tooltip`, `ResponsiveContainer`, `PieChart`, `Pie`, `Cell` from `recharts`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Users`, `CalendarCheck`, `Car`, `Trophy`, `WalletCards`, `RefreshCw` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getAnalytics` from `../../api/analyticsApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/analyticsApi](../../../client/src/api/analyticsApi.js)

## Runtime declarations and data flow

### `idLabel` — lines 6–6

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `displayStatus` — lines 7–11

Parameters: `value`, `fallback (defaulted)`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 8:** `const normalized = String(value ?? "").trim().toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 9:** `if (!normalized || normalized === "unknown" || normalized === "null" || normalized === "undefined") return fallback;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 10:** `return normalized.replace(/[_-]+/g, " ");` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `tourTitle` — lines 12–12

Parameters: `item`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `AdminAnalytics` — lines 14–55

Parameters: none.
React hooks used: useQuery. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 15:** `const { data, isLoading, isError, refetch, isFetching } = useQuery({ queryKey: ["analytics"], queryFn: () => getAnalytics(), staleTime: 30_000, retry: 2, refetchOnWindowFocus: false });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 16:** `const payload = data?.data || data || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 17:** `const revenue = payload.revenue || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 18:** `const bookingsSeries = Array.isArray(payload.bookings) ? payload.bookings : [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 19:** `const bookingStatus = (Array.isArray(payload.bookingStatus) ? payload.bookingStatus : []).map((item) => ({ ...item, _id: displayStatus(item?._id) }));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 20:** `const monthlyRevenue = Array.isArray(payload.monthlyRevenue) ? payload.monthlyRevenue : [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 21:** `const vehicleStats = (Array.isArray(payload.vehicleStats) ? payload.vehicleStats : []).map((item) => ({ ...item, _id: displayStatus(item?._id) }));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 22:** `const popularTours = Array.isArray(payload.popularTours) ? payload.popularTours : [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 23:** `const profitability = payload.profitability || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 24:** `const customerCount = Number(payload.customers || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 25:** `const bookingCount = bookingsSeries.reduce((sum, item) => sum + Number(item.bookings || 0), 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 27:** `if (isLoading) return <div className="min-h-screen bg-slate-100 p-8 text-slate-600">Loading analytics...</div>;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 28:** `if (isError && !data) return <div className="min-h-screen bg-slate-100 p-8"><div className="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm"><p className="font-semibold text-red-700` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 30:** `const cards = [` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 37:** `return <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8"><div className="mx-auto max-w-7xl">` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `Metric` — lines 56–56

Parameters: `{label, value}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `ChartCard` — lines 57–57

Parameters: `{title, children}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `StatusSummary` — lines 58–58

Parameters: `{title, items}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 6: `const idLabel = (value) => value ? String(value).slice(-8).toUpperCase() : "—";`.
- Line 7: `const displayStatus = (value, fallback = "Not recorded") => {`.
- Line 8: `const normalized = String(value ?? "").trim().toLowerCase();`.
- Line 12: `const tourTitle = (item) => item?.tour?.title || item?.title || (item?._id ? \`Tour ID: ${idLabel(item._id)}\` : "Tour not linked");`.
- Line 15: `const { data, isLoading, isError, refetch, isFetching } = useQuery({ queryKey: ["analytics"], queryFn: () => getAnalytics(), staleTime: 30_000, retry: 2, refetchOnWindowFocus: fals`.
- Line 16: `const payload = data?.data || data || {};`.
- Line 17: `const revenue = payload.revenue || {};`.
- Line 18: `const bookingsSeries = Array.isArray(payload.bookings) ? payload.bookings : [];`.
- Line 19: `const bookingStatus = (Array.isArray(payload.bookingStatus) ? payload.bookingStatus : []).map((item) => ({ ...item, _id: displayStatus(item?._id) }));`.
- Line 20: `const monthlyRevenue = Array.isArray(payload.monthlyRevenue) ? payload.monthlyRevenue : [];`.
- Line 21: `const vehicleStats = (Array.isArray(payload.vehicleStats) ? payload.vehicleStats : []).map((item) => ({ ...item, _id: displayStatus(item?._id) }));`.
- Line 22: `const popularTours = Array.isArray(payload.popularTours) ? payload.popularTours : [];`.
- Line 23: `const profitability = payload.profitability || {};`.
- Line 24: `const customerCount = Number(payload.customers || 0);`.
- Line 25: `const bookingCount = bookingsSeries.reduce((sum, item) => sum + Number(item.bookings || 0), 0);`.
- Line 30: `const cards = [`.
- Line 56: `function Metric({ label, value }) { return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">{label}</p><p className`.
- Line 57: `function ChartCard({ title, children }) { return <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="mb-4 text-lg font-bold text-slate-950">{`.
- Line 58: `function StatusSummary({ title, items }) { return <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-bold text-slate-950">{titl`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
