# Source explanation: client/src/pages/admin/OperationsProcurement.jsx

**Source:** [client/src/pages/admin/OperationsProcurement.jsx](../../../client/src/pages/admin/OperationsProcurement.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useQuery` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Activity`, `AlertTriangle`, `Boxes`, `CheckCircle2`, `ClipboardCheck`, `FileText`, `RefreshCw`, `Truck`, `WalletCards`, `XCircle` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getOperationsOverview` from `../../api/operationsApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/operationsApi](../../../client/src/api/operationsApi.js)
- `getSuppliers`, `getPurchaseOrders`, `getTourCosts`, `getSupplierPayables`, `getCorporateAccounts` from `../../api/operationsModuleApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/operationsModuleApi](../../../client/src/api/operationsModuleApi.js)
- `OperationsActionCenter` from `../../components/admin/OperationsActionCenter`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/components/admin/OperationsActionCenter](../../../client/src/components/admin/OperationsActionCenter.jsx)

## Runtime declarations and data flow

### `money` — lines 7–7

Parameters: `v`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `unwrap` — lines 8–8

Parameters: `v`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `statusClass` — lines 10–17

Parameters: `status`.
4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 11:** `const value = String(status || "").toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 12:** `if (value === "confirmed" || value === "completed") return "bg-emerald-50 text-emerald-700 ring-emerald-200";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 13:** `if (value === "ongoing" || value === "assigned") return "bg-sky-50 text-sky-700 ring-sky-200";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 14:** `if (value === "pending") return "bg-amber-50 text-amber-700 ring-amber-200";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 15:** `if (value === "cancelled" || value === "refunded") return "bg-rose-50 text-rose-700 ring-rose-200";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 16:** `return "bg-slate-100 text-slate-600 ring-slate-200";` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `OperationsProcurement` — lines 19–91

Parameters: none.
React hooks used: useQuery. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 20:** `const overview = useQuery({ queryKey: ["operations-overview"], queryFn: getOperationsOverview, staleTime: 15000 });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 21:** `const suppliers = useQuery({ queryKey: ["operations-suppliers"], queryFn: getSuppliers, staleTime: 15000 });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 22:** `const purchaseOrders = useQuery({ queryKey: ["operations-purchase-orders"], queryFn: getPurchaseOrders, staleTime: 15000 });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 23:** `const tourCosts = useQuery({ queryKey: ["operations-tour-costs"], queryFn: getTourCosts, staleTime: 15000 });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 24:** `const payables = useQuery({ queryKey: ["operations-payables"], queryFn: getSupplierPayables, staleTime: 15000 });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 25:** `const corporate = useQuery({ queryKey: ["operations-corporate"], queryFn: getCorporateAccounts, staleTime: 15000 });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 26:** `const queries = [overview, suppliers, purchaseOrders, tourCosts, payables, corporate];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 27:** `const refreshing = queries.some((q) => q.isFetching);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 28:** `const refresh = async () => { await Promise.all(queries.map((q) => q.refetch())); };` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 29:** `const o = overview.data?.data || overview.data || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 30:** `const p = o.procurement || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 31:** `const po = unwrap(purchaseOrders.data);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 32:** `const ps = unwrap(suppliers.data);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 33:** `const tourCostRows = unwrap(tourCosts.data);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 34:** `const payableRows = unwrap(payables.data);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 35:** `const corporateRows = unwrap(corporate.data);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 36:** `const committedPoStatuses = new Set(["submitted", "approved", "partially_received", "received"]);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 37:** `const fallbackPoValue = po.filter((item) => committedPoStatuses.has(String(item.status || "").toLowerCase())).reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `refresh` — lines 28–28

Parameters: none.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller.

Key statements:

### `Kpi` — lines 93–93

Parameters: `{icon, label, value, tone}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Mini` — lines 94–94

Parameters: `{title, value, tone}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Readiness` — lines 95–95

Parameters: `{label, value, tone}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 7: `const money = (v) => \`KES ${Number(v || 0).toLocaleString("en-KE", { maximumFractionDigits: 2 })}\`;`.
- Line 8: `const unwrap = (v) => Array.isArray(v) ? v : (v?.items || v?.data || []);`.
- Line 9: `const card = "rounded-2xl border border-slate-200 bg-white shadow-sm";`.
- Line 10: `const statusClass = (status) => {`.
- Line 11: `const value = String(status || "").toLowerCase();`.
- Line 20: `const overview = useQuery({ queryKey: ["operations-overview"], queryFn: getOperationsOverview, staleTime: 15000 });`.
- Line 21: `const suppliers = useQuery({ queryKey: ["operations-suppliers"], queryFn: getSuppliers, staleTime: 15000 });`.
- Line 22: `const purchaseOrders = useQuery({ queryKey: ["operations-purchase-orders"], queryFn: getPurchaseOrders, staleTime: 15000 });`.
- Line 23: `const tourCosts = useQuery({ queryKey: ["operations-tour-costs"], queryFn: getTourCosts, staleTime: 15000 });`.
- Line 24: `const payables = useQuery({ queryKey: ["operations-payables"], queryFn: getSupplierPayables, staleTime: 15000 });`.
- Line 25: `const corporate = useQuery({ queryKey: ["operations-corporate"], queryFn: getCorporateAccounts, staleTime: 15000 });`.
- Line 26: `const queries = [overview, suppliers, purchaseOrders, tourCosts, payables, corporate];`.
- Line 27: `const refreshing = queries.some((q) => q.isFetching);`.
- Line 28: `const refresh = async () => { await Promise.all(queries.map((q) => q.refetch())); };`.
- Line 29: `const o = overview.data?.data || overview.data || {};`.
- Line 30: `const p = o.procurement || {};`.
- Line 31: `const po = unwrap(purchaseOrders.data);`.
- Line 32: `const ps = unwrap(suppliers.data);`.
- Line 33: `const tourCostRows = unwrap(tourCosts.data);`.
- Line 34: `const payableRows = unwrap(payables.data);`.
- Line 35: `const corporateRows = unwrap(corporate.data);`.
- Line 36: `const committedPoStatuses = new Set(["submitted", "approved", "partially_received", "received"]);`.
- Line 37: `const fallbackPoValue = po.filter((item) => committedPoStatuses.has(String(item.status || "").toLowerCase())).reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);`.
- Line 38: `const fallbackPayables = payableRows.reduce((sum, item) => sum + Number(item.balance || 0), 0);`.
- Line 39: `const fallbackTourCosts = tourCostRows.filter((item) => String(item.status || "").toLowerCase() !== "cancelled").reduce((sum, item) => sum + Number(item.totalCost || 0), 0);`.
- Line 40: `const fallbackCorporateExposure = corporateRows.filter((item) => String(item.status || "").toLowerCase() === "active").reduce((sum, item) => sum + Number(item.currentBalance || 0),`.
- Line 41: `const upcoming = (Array.isArray(o.schedule) ? o.schedule : []).filter((b) => b?.tour?.title || b?.customTourRequest?.destination || b?.customTourRequest?.title);`.
- Line 42: `const failedModules = [`.
- Line 93: `const Kpi = ({ icon: Icon, label, value, tone }) => { const tones = { sky: "border-sky-200 bg-gradient-to-br from-sky-50 to-white text-sky-700", indigo: "border-indigo-200 bg-gradi`.
- Line 94: `const Mini = ({ title, value, tone }) => { const tones = { sky: "ring-sky-200", indigo: "ring-indigo-200", violet: "ring-violet-200", emerald: "ring-emerald-200" }; return <div cla`.
- Line 95: `const Readiness = ({ label, value, tone }) => { const tones = { sky: "bg-sky-50 text-sky-700 ring-sky-100", cyan: "bg-cyan-50 text-cyan-700 ring-cyan-100", orange: "bg-orange-50 te`.

## Security, errors and performance checkpoints

- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
