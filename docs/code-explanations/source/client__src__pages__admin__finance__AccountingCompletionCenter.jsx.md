# Source explanation: client/src/pages/admin/finance/AccountingCompletionCenter.jsx

**Source:** [client/src/pages/admin/finance/AccountingCompletionCenter.jsx](../../../client/src/pages/admin/finance/AccountingCompletionCenter.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useMemo`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useMutation`, `useQuery`, `useQueryClient` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `AlertCircle`, `CheckCircle2`, `CircleDollarSign`, `FileText`, `Landmark`, `LockKeyhole`, `Plus`, `RefreshCw`, `ShieldCheck`, `WalletCards`, `XCircle` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `api` from `../../../api/axios`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/axios](../../../client/src/api/axios.js)

## Runtime declarations and data flow

### `money` — lines 5–5

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `finite` — lines 6–6

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `first` — lines 7–7

Parameters: `...values`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 7:** `(...values) => values.find((v) => v !== null && v !== undefined && v !== "")` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.

### `unwrap` — lines 8–8

Parameters: `response`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `metricValue` — lines 9–9

Parameters: `query`, `value`.
3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:

### `queryMessage` — lines 10–10

Parameters: `query`, `label`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `AccountingCompletionCenter` — lines 11–47

Parameters: none.
HTTP operations detected: api.get, api.post; response/error handling occurs in this function and its caller. React hooks used: useState, useQuery, useMutation, useMemo. 10 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 12:** `const qc = useQueryClient(); const currentYear = new Date().getFullYear();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 13:** `const [year, setYear] = useState(currentYear); const [period, setPeriod] = useState(\`${currentYear}-${String(new Date().getMonth() + 1).padStart(2, "0")}\`);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 14:** `const [asset, setAsset] = useState({ assetNumber: "", name: "", acquisitionDate: new Date().toISOString().slice(0, 10), acquisitionCost: "", residualValue: "0", usefulLifeMonths: "60" });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 15:** `const [budget, setBudget] = useState({ name: "", accountCode: "5200", fiscalYear: String(currentYear), month: "", amount: "" }); const [notice, setNotice] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 16:** `const statements = useQuery({ queryKey: ["accounting-statements", year], queryFn: async () => unwrap(await api.get(\`/admin/finance/accounting/statements?from=${year}-01-01&to=${year}-12-31\`)), retry: 1 });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 17:** `const ar = useQuery({ queryKey: ["accounting-ar"], queryFn: async () => unwrap(await api.get("/admin/finance/accounting/ar-aging")), retry: 1 });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 18:** `const ap = useQuery({ queryKey: ["accounting-ap"], queryFn: async () => unwrap(await api.get("/admin/finance/accounting/ap-aging")), retry: 1 });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 19:** `const cash = useQuery({ queryKey: ["accounting-cash", year], queryFn: async () => unwrap(await api.get(\`/admin/finance/accounting/cash-flow?from=${year}-01-01&to=${year}-12-31\`)), retry: 1 });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 20:** `const assets = useQuery({ queryKey: ["accounting-assets"], queryFn: async () => unwrap(await api.get("/admin/finance/accounting/assets")), retry: 1 });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 21:** `const budgets = useQuery({ queryKey: ["accounting-budgets", year], queryFn: async () => unwrap(await api.get(\`/admin/finance/accounting/budgets?fiscalYear=${year}\`)), retry: 1 });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 22:** `const variance = useQuery({ queryKey: ["accounting-variance", year], queryFn: async () => unwrap(await api.get(\`/admin/finance/accounting/budgets-vs-actual?fiscalYear=${year}\`)), retry: 1 });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 23:** `const periods = useQuery({ queryKey: ["accounting-periods"], queryFn: async () => unwrap(await api.get("/admin/finance/accounting/periods")), retry: 1 });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 24:** `const wht = useQuery({ queryKey: ["accounting-wht"], queryFn: async () => unwrap(await api.get("/admin/finance/withholding-tax")), retry: 1 });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 25:** `const reconciliation = useQuery({ queryKey: ["accounting-reconciliation"], queryFn: async () => unwrap(await api.get("/admin/payments/reconciliation")), retry: 1 });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 26:** `const createAsset = useMutation({ mutationFn: () => api.post("/admin/finance/accounting/assets", { ...asset, acquisitionCost: Number(asset.acquisitionCost), residualValue: Number(asset.residualValue), usefulLifeMonths: N` — Makes an HTTP request through the shared client; the server route defines validation and authorization.
- **Line 27:** `const createBudget = useMutation({ mutationFn: () => api.post("/admin/finance/accounting/budgets", { ...budget, fiscalYear: Number(budget.fiscalYear), month: budget.month ? Number(budget.month) : null, amount: Number(bud` — Makes an HTTP request through the shared client; the server route defines validation and authorization.
- **Line 28:** `const close = useMutation({ mutationFn: () => api.post(\`/admin/finance/accounting/periods/${period}/close\`, { note: "Closed from Accounting Control Center" }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["acco` — Makes an HTTP request through the shared client; the server route defines validation and authorization.
- **Line 29:** `const reopen = useMutation({ mutationFn: (p) => api.post(\`/admin/finance/accounting/periods/${p}/reopen\`, {}), onSuccess: () => { qc.invalidateQueries({ queryKey: ["accounting-periods"] }); setNotice("Accounting period` — Makes an HTTP request through the shared client; the server route defines validation and authorization.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `refreshAll` — lines 31–31

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Kpi` — lines 48–48

Parameters: `{title, value, icon, query}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `NavButton` — lines 49–49

Parameters: `{href, icon, children}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `SectionTitle` — lines 50–50

Parameters: `{title, text}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Field` — lines 51–51

Parameters: `{label, type, value, onChange}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `MiniMetric` — lines 52–52

Parameters: `{label, value}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Status` — lines 53–53

Parameters: `{status}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `InlineError` — lines 54–54

Parameters: `{message}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Loading` — lines 55–55

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Empty` — lines 56–56

Parameters: `{text}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `DataError` — lines 57–57

Parameters: `{queries}`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:

## Module-level declarations

- Line 5: `const money = (value) => { const n = Number(value); return Number.isFinite(n) ? \`KES ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\` : "—"`.
- Line 6: `const finite = (value) => Number.isFinite(Number(value));`.
- Line 7: `const first = (...values) => values.find((v) => v !== null && v !== undefined && v !== "");`.
- Line 8: `const unwrap = (response) => response?.data ?? response;`.
- Line 9: `function metricValue(query, value) { if (query.isError) return "Unavailable"; if (query.isLoading) return "Loading…"; if (value === null || value === undefined || value === "" || !`.
- Line 10: `function queryMessage(query, label) { return query.error?.response?.data?.message || \`${label} could not be loaded.\`; }`.
- Line 12: `const qc = useQueryClient(); const currentYear = new Date().getFullYear();`.
- Line 13: `const [year, setYear] = useState(currentYear); const [period, setPeriod] = useState(\`${currentYear}-${String(new Date().getMonth() + 1).padStart(2, "0")}\`);`.
- Line 14: `const [asset, setAsset] = useState({ assetNumber: "", name: "", acquisitionDate: new Date().toISOString().slice(0, 10), acquisitionCost: "", residualValue: "0", usefulLifeMonths: "`.
- Line 15: `const [budget, setBudget] = useState({ name: "", accountCode: "5200", fiscalYear: String(currentYear), month: "", amount: "" }); const [notice, setNotice] = useState("");`.
- Line 16: `const statements = useQuery({ queryKey: ["accounting-statements", year], queryFn: async () => unwrap(await api.get(\`/admin/finance/accounting/statements?from=${year}-01-01&to=${ye`.
- Line 17: `const ar = useQuery({ queryKey: ["accounting-ar"], queryFn: async () => unwrap(await api.get("/admin/finance/accounting/ar-aging")), retry: 1 });`.
- Line 18: `const ap = useQuery({ queryKey: ["accounting-ap"], queryFn: async () => unwrap(await api.get("/admin/finance/accounting/ap-aging")), retry: 1 });`.
- Line 19: `const cash = useQuery({ queryKey: ["accounting-cash", year], queryFn: async () => unwrap(await api.get(\`/admin/finance/accounting/cash-flow?from=${year}-01-01&to=${year}-12-31\`))`.
- Line 20: `const assets = useQuery({ queryKey: ["accounting-assets"], queryFn: async () => unwrap(await api.get("/admin/finance/accounting/assets")), retry: 1 });`.
- Line 21: `const budgets = useQuery({ queryKey: ["accounting-budgets", year], queryFn: async () => unwrap(await api.get(\`/admin/finance/accounting/budgets?fiscalYear=${year}\`)), retry: 1 })`.
- Line 22: `const variance = useQuery({ queryKey: ["accounting-variance", year], queryFn: async () => unwrap(await api.get(\`/admin/finance/accounting/budgets-vs-actual?fiscalYear=${year}\`)),`.
- Line 23: `const periods = useQuery({ queryKey: ["accounting-periods"], queryFn: async () => unwrap(await api.get("/admin/finance/accounting/periods")), retry: 1 });`.
- Line 24: `const wht = useQuery({ queryKey: ["accounting-wht"], queryFn: async () => unwrap(await api.get("/admin/finance/withholding-tax")), retry: 1 });`.
- Line 25: `const reconciliation = useQuery({ queryKey: ["accounting-reconciliation"], queryFn: async () => unwrap(await api.get("/admin/payments/reconciliation")), retry: 1 });`.
- Line 26: `const createAsset = useMutation({ mutationFn: () => api.post("/admin/finance/accounting/assets", { ...asset, acquisitionCost: Number(asset.acquisitionCost), residualValue: Number(a`.
- Line 27: `const createBudget = useMutation({ mutationFn: () => api.post("/admin/finance/accounting/budgets", { ...budget, fiscalYear: Number(budget.fiscalYear), month: budget.month ? Number(`.
- Line 28: `const close = useMutation({ mutationFn: () => api.post(\`/admin/finance/accounting/periods/${period}/close\`, { note: "Closed from Accounting Control Center" }), onSuccess: () => {`.
- Line 29: `const reopen = useMutation({ mutationFn: (p) => api.post(\`/admin/finance/accounting/periods/${p}/reopen\`, {}), onSuccess: () => { qc.invalidateQueries({ queryKey: ["accounting-pe`.
- Line 30: `const summary = useMemo(() => { const s = statements.data?.data || statements.data || {}; const pl = s.profitAndLoss || {}; const arData = ar.data?.data || ar.data || {}; const apD`.
- Line 31: `const allQueries = [statements, ar, ap, cash, assets, budgets, variance, periods, wht, reconciliation]; const refreshAll = () => allQueries.forEach((q) => q.refetch());`.
- Line 32: `const assetsRows = assets.data?.data || []; const budgetRows = budgets.data?.data || []; const varianceRows = variance.data?.data?.rows || variance.data?.rows || []; const periodRo`.
- Line 33: `const assetValid = asset.assetNumber.trim() && asset.name.trim() && finite(asset.acquisitionCost) && Number(asset.acquisitionCost) > 0 && finite(asset.residualValue) && Number(asse`.
- Line 34: `const budgetValid = budget.name.trim() && budget.accountCode.trim() && finite(budget.fiscalYear) && finite(budget.amount) && Number(budget.amount) >= 0 && (!budget.month || (Number`.
- Line 48: `function Kpi({ title, value, icon: Icon, query }) { const unavailable = query.isError || value === "Unavailable"; return <div className={\`rounded-2xl border bg-white p-4 shadow-sm`.
- Line 49: `function NavButton({ href, icon: Icon, children }) { return <a href={href} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-`.
- Line 50: `function SectionTitle({ title, text }) { return <div className="mb-5"><h2 className="text-lg font-black text-slate-900">{title}</h2><p className="mt-1 text-sm leading-6 text-slate-`.
- Line 51: `function Field({ label, type = "text", value, onChange }) { return <label className="block text-xs font-extrabold text-slate-600">{label}<input type={type} value={value} onChange={`.
- Line 52: `function MiniMetric({ label, value }) { return <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-[11px] font-extrabold uppercase tracking-wide`.
- Line 53: `function Status({ status }) { const s = String(status || "unknown").toLowerCase(); const cls = s === "closed" || s === "remitted" ? "bg-emerald-100 text-emerald-800" : s === "open"`.
- Line 54: `function InlineError({ message }) { return <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-800"><AlertCirc`.
- Line 55: `function Loading() { return <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-sm font-semibold text-slate-500">Loading accounting controls…</div>`.
- Line 56: `function Empty({ text }) { return <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">{text}</div>; }`.
- Line 57: `function DataError({ queries }) { const failed = queries.filter((q) => q.isError); if (!failed.length) return null; return <div className="rounded-2xl border border-red-200 bg-red-`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
