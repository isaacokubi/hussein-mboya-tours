# Source explanation: client/src/pages/admin/finance/Reconciliation.jsx

**Source:** [client/src/pages/admin/finance/Reconciliation.jsx](../../../client/src/pages/admin/finance/Reconciliation.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useMemo`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useQuery` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `AlertTriangle`, `CheckCircle2`, `Clock3`, `Download`, `ExternalLink`, `FileWarning`, `RefreshCw`, `ShieldAlert`, `WalletCards`, `X` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getPaymentReconciliation`, `exportPaymentsCSV` from `../../../api/admin/adminPaymentApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/admin/adminPaymentApi](../../../client/src/api/admin/adminPaymentApi.js)

## Runtime declarations and data flow

### `money` — lines 6–6

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `number` — lines 7–7

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Reconciliation` — lines 19–54

Parameters: none.
React hooks used: useQuery, useState, useMemo. 9 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 20:** `const query = useQuery({ queryKey: ["payment-reconciliation"], queryFn: getPaymentReconciliation, refetchInterval: 60000, staleTime: 30000 });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 21:** `const [selectedException, setSelectedException] = useState(null);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 22:** `const dataSet = query.data?.data || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 23:** `const summary = dataSet.summary || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 24:** `const issueCount = useMemo(() => issueDefinitions.reduce((sum, [key]) => sum + Number(summary[key] || 0), 0), [summary]);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 25:** `const generatedAt = dataSet.generatedAt ? new Date(dataSet.generatedAt) : null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 27:** `const exceptionRows = useMemo(() => {` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 28:** `const rows = [...(dataSet.mismatches || [])];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 29:** `for (const row of dataSet.missingInvoices || []) rows.push({ ...row, type: "missing_invoice", recorded: "No invoice" });` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 30:** `for (const row of dataSet.overpayments || []) rows.push({ ...row, type: "overpayment", recorded: row.paidFromPayments });` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 31:** `for (const row of dataSet.commissionAdjustments || []) rows.push({ ...row, type: "commission_adjustment" });` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 32:** `for (const row of dataSet.missingReceipts || []) rows.push({ ...row, type: "missing_mpesa_receipt" });` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 33:** `for (const row of dataSet.duplicateReferences || []) rows.push({ ...row, type: "duplicate_reference" });` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 34:** `for (const row of dataSet.orphanPayments || []) rows.push({ ...row, type: "orphan_payment" });` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 35:** `return rows;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 38:** `if (query.isLoading) return <div className="reconciliation-page"><div className="recon-loading"><RefreshCw className="animate-spin" size={22} /> Loading payment reconciliation…</div></div>;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 39:** `if (query.isError) return <div className="reconciliation-page"><div className="recon-error"><ShieldAlert size={24} /><div><h2>Reconciliation unavailable</h2><p>{query.error?.response?.data?.message || "The reconciliation` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 41:** `return <div className="reconciliation-page">` — Exits this function and supplies its result (or response short-circuit) to the caller.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `Metric` — lines 56–56

Parameters: `{icon, label, value, tone, emphasis}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `IssueCard` — lines 57–57

Parameters: `{icon, title, description, value}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `ExceptionList` — lines 58–58

Parameters: `{title, rows, render, onOpen}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `EmptyState` — lines 59–59

Parameters: `{text, compact}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `SourceDrawer` — lines 61–70

Parameters: `{exception, payments, onClose}`.
React hooks used: useMemo. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 62:** `const relatedPayments = useMemo(() => {` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 63:** `const bookingId = exception.bookingId ? String(exception.bookingId) : null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 64:** `const paymentIds = new Set((exception.paymentIds || []).map(String));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 65:** `return payments.filter((payment) => (paymentIds.size && paymentIds.has(String(payment._id))) || (bookingId && String(payment.booking || "") === bookingId));` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 68:** `const entries = Object.entries(exception).filter(([key]) => !["source", "paymentIds"].includes(key));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 69:** `return <div className="recon-drawer-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><aside className="recon-source-drawer" role="dialog" aria-modal="true" aria-lab` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 6: `const money = (value) => \`KES ${Number(value || 0).toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\`;`.
- Line 7: `const number = (value) => Number(value || 0).toLocaleString("en-KE");`.
- Line 8: `const issueDefinitions = [`.
- Line 20: `const query = useQuery({ queryKey: ["payment-reconciliation"], queryFn: getPaymentReconciliation, refetchInterval: 60000, staleTime: 30000 });`.
- Line 21: `const [selectedException, setSelectedException] = useState(null);`.
- Line 22: `const dataSet = query.data?.data || {};`.
- Line 23: `const summary = dataSet.summary || {};`.
- Line 24: `const issueCount = useMemo(() => issueDefinitions.reduce((sum, [key]) => sum + Number(summary[key] || 0), 0), [summary]);`.
- Line 25: `const generatedAt = dataSet.generatedAt ? new Date(dataSet.generatedAt) : null;`.
- Line 27: `const exceptionRows = useMemo(() => {`.
- Line 28: `const rows = [...(dataSet.mismatches || [])];`.
- Line 56: `function Metric({ icon: Icon, label, value, tone = "", emphasis = false }) { return <article className={\`recon-metric ${tone} ${emphasis ? "emphasis" : ""}\`}><div className="metr`.
- Line 57: `function IssueCard({ icon: Icon, title, description, value }) { const count = Number(value || 0); return <article className={\`recon-issue ${count ? "is-danger" : "is-good"}\`}><di`.
- Line 58: `function ExceptionList({ title, rows = [], render, onOpen }) { return <div className="exception-list"><div className="recon-list-heading"><h3>{title}</h3><span>{number(rows?.length`.
- Line 59: `function EmptyState({ text, compact = false }) { return <div className={\`recon-empty ${compact ? "compact" : ""}\`}><CheckCircle2 size={18} /><span>{text}</span></div>; }`.
- Line 61: `function SourceDrawer({ exception, payments, onClose }) {`.
- Line 62: `const relatedPayments = useMemo(() => {`.
- Line 63: `const bookingId = exception.bookingId ? String(exception.bookingId) : null;`.
- Line 64: `const paymentIds = new Set((exception.paymentIds || []).map(String));`.
- Line 68: `const entries = Object.entries(exception).filter(([key]) => !["source", "paymentIds"].includes(key));`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
