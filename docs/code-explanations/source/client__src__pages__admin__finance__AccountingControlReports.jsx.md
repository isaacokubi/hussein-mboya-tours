# Source explanation: client/src/pages/admin/finance/AccountingControlReports.jsx

**Source:** [client/src/pages/admin/finance/AccountingControlReports.jsx](../../../client/src/pages/admin/finance/AccountingControlReports.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useQuery` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `api` from `../../../api/axios`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/axios](../../../client/src/api/axios.js)
- `Pagination` from `../../../components/admin/Pagination`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/components/admin/Pagination](../../../client/src/components/admin/Pagination.jsx)

## Runtime declarations and data flow

### `money` — lines 14–14

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `date` — lines 15–15

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `label` — lines 16–16

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `statusClass` — lines 18–27

Parameters: `status`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `fetchReport` — lines 29–33

Parameters: `url`, `name`.
HTTP operations detected: api.get; response/error handling occurs in this function and its caller. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 30:** `const response = (await api.get(url)).data;` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 31:** `if (!response?.success) throw new Error(\`${name} returned an invalid response.\`);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 32:** `return response;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `Badge` — lines 35–37

Parameters: `{status, children}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 36:** `return <span className={\`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass(status)}\`}>{children}</span>;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `ErrorBox` — lines 38–41

Parameters: `{query, name}`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 39:** `if (!query.isError) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 40:** `return <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert"><b>{name} unavailable.</b> The API request failed, so no fallback accounting values are displayed.</div>;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `LoadingBox` — lines 42–44

Parameters: `{name}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 43:** `return <div className="px-4 py-10 text-center" aria-live="polite"><div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-700" /><p className="mt-3 font-semibold text-slate-` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `Metric` — lines 45–47

Parameters: `{title, value, hint}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 46:** `return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p><p className="mt-2 text-2xl font-bold text-slate-9` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `MissingAccount` — lines 48–50

Parameters: `{code, name}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 49:** `return <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900"><b>{name} control account {code} is not configured.</b><p className="mt-1">This control is unavailable and is not represen` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `LedgerSection` — lines 52–70

Parameters: `{title, sub, type, from, to}`.
React hooks used: useState, useQuery. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 53:** `const [page, setPage] = useState(1);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 54:** `const query = useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 60:** `const data = query.data?.data;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 61:** `const rows = data?.rows || [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 62:** `const pagination = data?.pagination || { page, pages: 0, total: 0, pageSize: PAGE_SIZE };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 63:** `return <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `TaxAccountCards` — lines 72–79

Parameters: `{data}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 73:** `const rows = data?.rows || [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 74:** `const byCode = new Map(rows.map((row) => [row.code, row]));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 75:** `const configured = new Set(data?.reconciliation?.availableTaxAccounts || []);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 76:** `const statutoryConfigured = new Set(data?.reconciliation?.availableStatutoryAccounts || []);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 77:** `const render = (code) => { const isConfigured = configured.has(code) || statutoryConfigured.has(code); const row = byCode.get(code); return <div key={code} className="rounded-xl border border-slate-200 bg-slate-50 p-4"><` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 78:** `return <div className="space-y-5"><div><p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Tax controls</p><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{TAX_CODES.map(render)}</d` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `render` — lines 77–77

Parameters: `code`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `AccountingControlReports` — lines 81–108

Parameters: none.
React hooks used: useQuery. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 82:** `const year = new Date().getFullYear();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 83:** `const from = \`${year}-01-01\`, to = \`${year}-12-31\`;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 84:** `const tax = useQuery({ queryKey: ["tax-control", year], queryFn: () => fetchReport(\`/admin/finance/accounting/tax-control?from=${from}&to=${to}\`, "Tax control report"), staleTime: 15000 });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 85:** `const billing = useQuery({ queryKey: ["billing-control", year], queryFn: () => fetchReport(\`/admin/finance/accounting/profitability?from=${from}&to=${to}\`, "Service billing report"), staleTime: 15000 });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 86:** `const td = tax.data?.data;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 87:** `const billingData = billing.data;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 88:** `const serviceRows = billingData?.data || [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 89:** `const reconciliation = billingData?.reconciliation;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 90:** `const taxReconciliation = td?.reconciliation;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 91:** `const taxAccounts = taxReconciliation?.availableTaxAccounts || [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 93:** `return <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl space-y-6">` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 6: `const PAGE_SIZE = 15;`.
- Line 7: `const TAX_CODES = ["2100", "2110", "2120", "2130"];`.
- Line 8: `const STATUTORY_CODES = ["2140", "2150"];`.
- Line 9: `const ACCOUNT_LABELS = {`.
- Line 14: `const money = (value) => value == null ? "—" : \`KES ${Number(value).toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\`;`.
- Line 15: `const date = (value) => value ? new Date(value).toLocaleDateString("en-KE", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";`.
- Line 16: `const label = (value) => String(value || "manual").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());`.
- Line 18: `const statusClass = (status) => ({`.
- Line 29: `const fetchReport = async (url, name) => {`.
- Line 30: `const response = (await api.get(url)).data;`.
- Line 35: `function Badge({ status, children }) {`.
- Line 38: `function ErrorBox({ query, name }) {`.
- Line 42: `function LoadingBox({ name }) {`.
- Line 45: `function Metric({ title, value, hint }) {`.
- Line 48: `function MissingAccount({ code, name }) {`.
- Line 52: `function LedgerSection({ title, sub, type, from, to }) {`.
- Line 53: `const [page, setPage] = useState(1);`.
- Line 54: `const query = useQuery({`.
- Line 60: `const data = query.data?.data;`.
- Line 61: `const rows = data?.rows || [];`.
- Line 62: `const pagination = data?.pagination || { page, pages: 0, total: 0, pageSize: PAGE_SIZE };`.
- Line 72: `function TaxAccountCards({ data }) {`.
- Line 73: `const rows = data?.rows || [];`.
- Line 74: `const byCode = new Map(rows.map((row) => [row.code, row]));`.
- Line 75: `const configured = new Set(data?.reconciliation?.availableTaxAccounts || []);`.
- Line 76: `const statutoryConfigured = new Set(data?.reconciliation?.availableStatutoryAccounts || []);`.
- Line 77: `const render = (code) => { const isConfigured = configured.has(code) || statutoryConfigured.has(code); const row = byCode.get(code); return <div key={code} className="rounded-xl bo`.
- Line 82: `const year = new Date().getFullYear();`.
- Line 83: `const from = \`${year}-01-01\`, to = \`${year}-12-31\`;`.
- Line 84: `const tax = useQuery({ queryKey: ["tax-control", year], queryFn: () => fetchReport(\`/admin/finance/accounting/tax-control?from=${from}&to=${to}\`, "Tax control report"), staleTime`.
- Line 85: `const billing = useQuery({ queryKey: ["billing-control", year], queryFn: () => fetchReport(\`/admin/finance/accounting/profitability?from=${from}&to=${to}\`, "Service billing repor`.
- Line 86: `const td = tax.data?.data;`.
- Line 87: `const billingData = billing.data;`.
- Line 88: `const serviceRows = billingData?.data || [];`.
- Line 89: `const reconciliation = billingData?.reconciliation;`.
- Line 90: `const taxReconciliation = td?.reconciliation;`.
- Line 91: `const taxAccounts = taxReconciliation?.availableTaxAccounts || [];`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
