# Source explanation: client/src/pages/admin/finance/ManagementAccounting.jsx

**Source:** [client/src/pages/admin/finance/ManagementAccounting.jsx](../../../client/src/pages/admin/finance/ManagementAccounting.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useEffect`, `useMemo`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Link` from `react-router-dom`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `AlertCircle`, `CheckCircle2`, `ChevronRight`, `CircleDollarSign`, `FileCheck2`, `Landmark`, `LockKeyhole`, `RefreshCw`, `ShieldCheck`, `WalletCards`, `XCircle` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `api` from `../../../api/axios`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/axios](../../../client/src/api/axios.js)

## Runtime declarations and data flow

### `money` — lines 18–27

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 19:** `const n = Number(value);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 20:** `return Number.isFinite(n)` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `finite` — lines 29–32

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 30:** `const n = Number(value);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 31:** `return Number.isFinite(n) ? n : null;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `unwrap` — lines 34–34

Parameters: `response`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `messageOf` — lines 35–36

Parameters: `error`, `fallback`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `asArray` — lines 38–38

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `ManagementAccounting` — lines 40–414

Parameters: none.
HTTP operations detected: api.get, api.post; response/error handling occurs in this function and its caller. React hooks used: useState, useEffect, useMemo. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true. 9 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 41:** `const [year, setYear] = useState(new Date().getFullYear());` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 42:** `const [assets, setAssets] = useState(null);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 43:** `const [budgets, setBudgets] = useState(null);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 44:** `const [periods, setPeriods] = useState(null);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 45:** `const [variance, setVariance] = useState(null);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 46:** `const [error, setError] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 47:** `const [notice, setNotice] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 48:** `const [loading, setLoading] = useState(true);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 49:** `const [busy, setBusy] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 51:** `const load = async () => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 54:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 55:** `const [a, b, p, v] = await Promise.all([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 56:** `api.get("/admin/finance/accounting/assets"),` — Makes an HTTP request through the shared client; the server route defines validation and authorization.
- **Line 57:** `api.get(\`/admin/finance/accounting/budgets?fiscalYear=${year}\`),` — Makes an HTTP request through the shared client; the server route defines validation and authorization.
- **Line 58:** `api.get("/admin/finance/accounting/periods"),` — Makes an HTTP request through the shared client; the server route defines validation and authorization.
- **Line 59:** `api.get(\`/admin/finance/accounting/budgets-vs-actual?fiscalYear=${year}\`),` — Makes an HTTP request through the shared client; the server route defines validation and authorization.
- **Line 65:** `const varianceData = unwrap(v);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 74:** `useEffect(() => {` — Uses a React hook to manage component state, side effects, memoization, or server state.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `load` — lines 51–72

Parameters: none.
HTTP operations detected: api.get; response/error handling occurs in this function and its caller. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true.

Key statements:
- **Line 54:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 55:** `const [a, b, p, v] = await Promise.all([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 56:** `api.get("/admin/finance/accounting/assets"),` — Makes an HTTP request through the shared client; the server route defines validation and authorization.
- **Line 57:** `api.get(\`/admin/finance/accounting/budgets?fiscalYear=${year}\`),` — Makes an HTTP request through the shared client; the server route defines validation and authorization.
- **Line 58:** `api.get("/admin/finance/accounting/periods"),` — Makes an HTTP request through the shared client; the server route defines validation and authorization.
- **Line 59:** `api.get(\`/admin/finance/accounting/budgets-vs-actual?fiscalYear=${year}\`),` — Makes an HTTP request through the shared client; the server route defines validation and authorization.
- **Line 65:** `const varianceData = unwrap(v);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.

### `run` — lines 78–91

Parameters: `key`, `fn`, `successMessage (defaulted)`.
2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true.

Key statements:
- **Line 82:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 83:** `await fn();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 85:** `await load();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `sum` — lines 94–97

Parameters: `rows`, `selector`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `depreciate` — lines 106–123

Parameters: `asset`.
HTTP operations detected: api.post; response/error handling occurs in this function and its caller. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 107:** `const months = Number(window.prompt("Number of depreciation months", "1"));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 108:** `if (!Number.isInteger(months) || months < 1) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 109:** `const period = window.prompt(` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 113:** `if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(period || "")) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 114:** `return run(` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 117:** `api.post(\`/admin/finance/accounting/assets/${asset._id}/depreciate\`, {` — Makes an HTTP request through the shared client; the server route defines validation and authorization.

### `dispose` — lines 125–140

Parameters: `asset`.
HTTP operations detected: api.post; response/error handling occurs in this function and its caller. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 126:** `const proceeds = Number(window.prompt("Disposal proceeds (KES)", "0"));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 127:** `if (!Number.isFinite(proceeds) || proceeds < 0) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 128:** `const reference =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 131:** `return run(` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 134:** `api.post(\`/admin/finance/accounting/assets/${asset._id}/dispose\`, {` — Makes an HTTP request through the shared client; the server route defines validation and authorization.

### `approveBudget` — lines 142–147

Parameters: `budget`.
HTTP operations detected: api.post; response/error handling occurs in this function and its caller.

Key statements:
- **Line 145:** `() => api.post(\`/admin/finance/accounting/budgets/${budget._id}/approve\`),` — Makes an HTTP request through the shared client; the server route defines validation and authorization.

### `closePeriod` — lines 149–157

Parameters: `period`.
HTTP operations detected: api.post; response/error handling occurs in this function and its caller.

Key statements:
- **Line 153:** `api.post(\`/admin/finance/accounting/periods/${period}/close\`, {` — Makes an HTTP request through the shared client; the server route defines validation and authorization.

### `reopenPeriod` — lines 159–164

Parameters: `period`.
HTTP operations detected: api.post; response/error handling occurs in this function and its caller.

Key statements:
- **Line 162:** `() => api.post(\`/admin/finance/accounting/periods/${period}/reopen\`),` — Makes an HTTP request through the shared client; the server route defines validation and authorization.

### `closeYear` — lines 166–178

Parameters: none.
HTTP operations detected: api.post; response/error handling occurs in this function and its caller. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 167:** `if (` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 172:** `return;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 173:** `return run(` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 175:** `() => api.post(\`/admin/finance/accounting/periods/${year}/year-end-close\`),` — Makes an HTTP request through the shared client; the server route defines validation and authorization.

### `StatusStrip` — lines 416–423

Parameters: `{icon, label, value}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 417:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `Metric` — lines 425–440

Parameters: `{icon, title, value, tone}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 426:** `const tones = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 431:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `SectionHeader` — lines 442–449

Parameters: `{icon, title, description}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 443:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `DataState` — lines 451–456

Parameters: `{ready, loading, empty, emptyText, error, children}`.
3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 452:** `if (loading) return <div className="p-8 text-center text-sm font-medium text-slate-500">Loading accounting data…</div>;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 453:** `if (error || !ready) return <div className="p-8 text-center text-sm font-semibold text-red-600">Data unavailable. Check the accounting API response above.</div>;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 454:** `if (empty) return <div className="p-8 text-center text-sm text-slate-500">{emptyText}</div>;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 455:** `return children;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `StatusBadge` — lines 458–468

Parameters: `{status}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 459:** `const normalized = String(status || "unknown").toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 460:** `const styles = normalized === "approved" || normalized === "active" || normalized === "open"` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 467:** `return <span className={\`inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ${styles}\`}>{normalized.replaceAll("_", " ")}</span>;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `ActionButton` — lines 470–484

Parameters: `{children, variant, disabled, onClick, loading}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 471:** `const base = variant === "secondary"` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 474:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `Table` — lines 486–505

Parameters: `{headers, rows}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 487:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 18: `const money = (value) => {`.
- Line 19: `const n = Number(value);`.
- Line 29: `const finite = (value) => {`.
- Line 30: `const n = Number(value);`.
- Line 34: `const unwrap = (response) => response?.data?.data ?? response?.data ?? null;`.
- Line 35: `const messageOf = (error, fallback) =>`.
- Line 38: `const asArray = (value) => (Array.isArray(value) ? value : null);`.
- Line 41: `const [year, setYear] = useState(new Date().getFullYear());`.
- Line 42: `const [assets, setAssets] = useState(null);`.
- Line 43: `const [budgets, setBudgets] = useState(null);`.
- Line 44: `const [periods, setPeriods] = useState(null);`.
- Line 45: `const [variance, setVariance] = useState(null);`.
- Line 46: `const [error, setError] = useState("");`.
- Line 47: `const [notice, setNotice] = useState("");`.
- Line 48: `const [loading, setLoading] = useState(true);`.
- Line 49: `const [busy, setBusy] = useState("");`.
- Line 51: `const load = async () => {`.
- Line 55: `const [a, b, p, v] = await Promise.all([`.
- Line 65: `const varianceData = unwrap(v);`.
- Line 78: `const run = async (key, fn, successMessage = "Accounting operation completed successfully.") => {`.
- Line 93: `const totals = useMemo(() => {`.
- Line 94: `const sum = (rows, selector) =>`.
- Line 106: `const depreciate = (asset) => {`.
- Line 107: `const months = Number(window.prompt("Number of depreciation months", "1"));`.
- Line 109: `const period = window.prompt(`.
- Line 125: `const dispose = (asset) => {`.
- Line 126: `const proceeds = Number(window.prompt("Disposal proceeds (KES)", "0"));`.
- Line 128: `const reference =`.
- Line 142: `const approveBudget = (budget) =>`.
- Line 149: `const closePeriod = (period) =>`.
- Line 159: `const reopenPeriod = (period) =>`.
- Line 166: `const closeYear = () => {`.
- Line 180: `const hasDataError = Boolean(error);`.
- Line 181: `const dataReady = !loading && !hasDataError;`.
- Line 416: `function StatusStrip({ icon: Icon, label, value }) {`.
- Line 425: `function Metric({ icon: Icon, title, value, tone }) {`.
- Line 426: `const tones = {`.
- Line 442: `function SectionHeader({ icon: Icon, title, description }) {`.
- Line 451: `function DataState({ ready, loading, empty, emptyText, error, children }) {`.
- Line 458: `function StatusBadge({ status }) {`.
- Line 459: `const normalized = String(status || "unknown").toLowerCase();`.
- Line 460: `const styles = normalized === "approved" || normalized === "active" || normalized === "open"`.
- Line 470: `function ActionButton({ children, variant = "primary", disabled, onClick, loading }) {`.
- Line 471: `const base = variant === "secondary"`.
- Line 486: `function Table({ headers, rows }) {`.

## Security, errors and performance checkpoints

- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
