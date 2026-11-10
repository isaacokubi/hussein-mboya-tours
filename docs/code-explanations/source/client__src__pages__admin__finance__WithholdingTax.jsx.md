# Source explanation: client/src/pages/admin/finance/WithholdingTax.jsx

**Source:** [client/src/pages/admin/finance/WithholdingTax.jsx](../../../client/src/pages/admin/finance/WithholdingTax.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useMutation`, `useQuery`, `useQueryClient` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `AlertCircle`, `CheckCircle2`, `ExternalLink`, `Eye`, `FileText`, `LockKeyhole`, `Percent`, `Plus`, `RefreshCw`, `ShieldCheck`, `X` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `api` from `../../../api/axios`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/axios](../../../client/src/api/axios.js)

## Runtime declarations and data flow

### `money` — lines 6–6

Parameters: `n`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `display` — lines 7–7

Parameters: `value`, `fallback (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `initialForm` — lines 9–17

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `WithholdingTax` — lines 19–146

Parameters: none.
HTTP operations detected: api.get, api.post; response/error handling occurs in this function and its caller. React hooks used: useState, useQuery, useMutation. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 20:** `const qc = useQueryClient();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 21:** `const [selected, setSelected] = useState(null);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 22:** `const [remitRef, setRemitRef] = useState({});` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 23:** `const [form, setForm] = useState(initialForm);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 25:** `const q = useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 27:** `queryFn: async () => (await api.get("/admin/finance/withholding-tax")).data,` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 31:** `const create = useMutation({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 32:** `mutationFn: () => api.post("/admin/finance/withholding-tax", {` — Makes an HTTP request through the shared client; the server route defines validation and authorization.
- **Line 44:** `const remit = useMutation({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 45:** `mutationFn: ({ id, reference }) => api.post(\`/admin/finance/withholding-tax/${id}/remit\`, { paymentReference: reference }),` — Makes an HTTP request through the shared client; the server route defines validation and authorization.
- **Line 52:** `const rows = q.data?.data || [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 53:** `const totals = q.data?.totals || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 54:** `const statusCode = q.error?.response?.status;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 55:** `const errorData = q.error?.response?.data || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 56:** `const isLocked = statusCode === 403 && errorData.code === "PLAN_FEATURE_LOCKED";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 57:** `const currentPlan = String(errorData.plan || "professional").replace(/_/g, " ");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 58:** `const errorMessage = errorData.message || "Unable to load withholding-tax records.";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 59:** `const canSubmit = !isLocked && !create.isPending && Number(form.baseAmount) > 0 && Number(form.rate) > 0 && Number(form.rate) <= 100 && form.payeeName.trim() && form.reference.trim() && /^\d{4}-(0[1-9]|1[0-2])$/.test(for` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `metricMoney` — lines 61–61

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Field` — lines 148–150

Parameters: `{label, required, type, value, onChange, placeholder, min, max, step, disabled}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 149:** `return <label className={\`block text-xs font-extrabold ${disabled ? "text-slate-400" : "text-slate-600"}\`}>{label}{required && <span className="ml-1 text-emerald-700">*</span>}<input disabled={disabled} type={type} val` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `Metric` — lines 151–151

Parameters: `{icon, title, value, hint}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Status` — lines 152–152

Parameters: `{status}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `InlineError` — lines 153–153

Parameters: `{message}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `LoadingState` — lines 154–154

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `RestrictedRegister` — lines 155–155

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `EmptyState` — lines 156–156

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `SourceDrawer` — lines 158–160

Parameters: `{record, onClose}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 159:** `return <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-label="Withholding tax source details" onMouseDown={(e) => e.target === e.currentTarget` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `Detail` — lines 161–161

Parameters: `{label, value}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 6: `const money = (n) => \`KES ${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\`;`.
- Line 7: `const display = (value, fallback = "Not provided") => value === null || value === undefined || value === "" ? fallback : String(value);`.
- Line 9: `const initialForm = () => ({`.
- Line 20: `const qc = useQueryClient();`.
- Line 21: `const [selected, setSelected] = useState(null);`.
- Line 22: `const [remitRef, setRemitRef] = useState({});`.
- Line 23: `const [form, setForm] = useState(initialForm);`.
- Line 25: `const q = useQuery({`.
- Line 31: `const create = useMutation({`.
- Line 44: `const remit = useMutation({`.
- Line 52: `const rows = q.data?.data || [];`.
- Line 53: `const totals = q.data?.totals || {};`.
- Line 54: `const statusCode = q.error?.response?.status;`.
- Line 55: `const errorData = q.error?.response?.data || {};`.
- Line 56: `const isLocked = statusCode === 403 && errorData.code === "PLAN_FEATURE_LOCKED";`.
- Line 57: `const currentPlan = String(errorData.plan || "professional").replace(/_/g, " ");`.
- Line 58: `const errorMessage = errorData.message || "Unable to load withholding-tax records.";`.
- Line 59: `const canSubmit = !isLocked && !create.isPending && Number(form.baseAmount) > 0 && Number(form.rate) > 0 && Number(form.rate) <= 100 && form.payeeName.trim() && form.reference.trim`.
- Line 60: `const metricValue = q.isError ? "—" : rows.length;`.
- Line 61: `const metricMoney = (value) => q.isError ? "—" : money(value);`.
- Line 148: `function Field({ label, required, type = "text", value, onChange, placeholder, min, max, step, disabled = false }) {`.
- Line 151: `function Metric({ icon: Icon, title, value, hint }) { return <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5"><div className="flex items-center justify-betwe`.
- Line 152: `function Status({ status }) { const styles = status === "remitted" ? "bg-emerald-100 text-emerald-800 ring-emerald-200" : status === "cancelled" ? "bg-slate-100 text-slate-600 ring`.
- Line 153: `function InlineError({ message }) { return <div className="mt-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-800"><AlertC`.
- Line 154: `function LoadingState() { return <div className="p-12 text-center"><RefreshCw size={22} className="mx-auto animate-spin text-emerald-700" /><p className="mt-3 text-sm font-bold tex`.
- Line 155: `function RestrictedRegister() { return <div className="p-12 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"`.
- Line 156: `function EmptyState() { return <tr><td colSpan="7" className="p-12 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-sla`.
- Line 158: `function SourceDrawer({ record, onClose }) {`.
- Line 161: `function Detail({ label, value }) { return <div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><p className="text-[10px] font-extrabold uppercase tracking-wider tex`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
