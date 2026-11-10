# Source explanation: client/src/pages/admin/AdminCompliance.jsx

**Source:** [client/src/pages/admin/AdminCompliance.jsx](../../../client/src/pages/admin/AdminCompliance.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useMemo`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useMutation`, `useQuery`, `useQueryClient` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `AlertTriangle`, `CheckCircle2`, `FileCheck2`, `History`, `Save`, `ShieldCheck`, `XCircle` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getComplianceRecords`, `getComplianceSummary`, `queueEtimsInvoice`, `saveComplianceRecord` from `../../api/complianceApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/complianceApi](../../../client/src/api/complianceApi.js)
- `createCreditDebitNote`, `getCreditDebitNotes`, `getEtimsCredentialStatus`, `getEtimsSubmissions`, `getFinanceComplianceSummary`, `getTaxProfile`, `queueCreditDebitNote`, `saveEtimsCredentials`, `saveTaxProfile` from `../../api/financeComplianceApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/financeComplianceApi](../../../client/src/api/financeComplianceApi.js)

## Runtime declarations and data flow

### `formatDate` — lines 23–25

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 24:** `return value ? new Date(value).toLocaleDateString() : "—";` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `statusTone` — lines 27–32

Parameters: `status`.
3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 28:** `if (status === "synced" || status === "approved") return "bg-emerald-50 text-emerald-700";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 29:** `if (status === "failed" || status === "expired") return "bg-red-50 text-red-700";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 30:** `if (["pending", "in_progress", "submitted"].includes(status)) return "bg-amber-50 text-amber-700";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 31:** `return "bg-slate-100 text-slate-600";` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `AdminCompliance` — lines 34–469

Parameters: none.
React hooks used: useState, useQuery, useMutation, useMemo. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 35:** `const qc = useQueryClient();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 36:** `const [tab, setTab] = useState("etims");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 37:** `const [editing, setEditing] = useState(null);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 38:** `const [taxEditing, setTaxEditing] = useState(null);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 39:** Sensitive-configuration/data operation; inspect source without copying secret values. — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 40:** `const [noteForm, setNoteForm] = useState({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 48:** `const summary = useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 53:** `const records = useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 58:** `const finance = useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 63:** `const taxProfile = useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 67:** `const environment = taxProfile.data?.data?.etimsEnvironment || "sandbox";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 68:** Sensitive-configuration/data operation; inspect source without copying secret values. — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 73:** `const submissions = useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 78:** `const notes = useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 83:** `const saveM = useMutation({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 92:** `const initM = useMutation({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 100:** `const taxM = useMutation({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 109:** Sensitive-configuration/data operation; inspect source without copying secret values. — Uses a React hook to manage component state, side effects, memoization, or server state.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `begin` — lines 159–166

Parameters: `row`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `update` — lines 168–168

Parameters: `key`, `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `startTaxEdit` — lines 170–189

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `startCredentialEdit` — lines 191–200

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 7: `const labels = {`.
- Line 18: `const types = Object.keys(labels);`.
- Line 19: `const statuses = ["not_started", "in_progress", "submitted", "approved", "expired", "action_required", "closed"];`.
- Line 20: `const inputClass = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600";`.
- Line 21: `const buttonClass = "inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity`.
- Line 23: `function formatDate(value) {`.
- Line 27: `function statusTone(status) {`.
- Line 35: `const qc = useQueryClient();`.
- Line 36: `const [tab, setTab] = useState("etims");`.
- Line 37: `const [editing, setEditing] = useState(null);`.
- Line 38: `const [taxEditing, setTaxEditing] = useState(null);`.
- Line 39: `<sensitive declaration redacted>`.
- Line 40: `const [noteForm, setNoteForm] = useState({`.
- Line 48: `const summary = useQuery({`.
- Line 53: `const records = useQuery({`.
- Line 58: `const finance = useQuery({`.
- Line 63: `const taxProfile = useQuery({`.
- Line 67: `const environment = taxProfile.data?.data?.etimsEnvironment || "sandbox";`.
- Line 68: `<sensitive declaration redacted>`.
- Line 73: `const submissions = useQuery({`.
- Line 78: `const notes = useQuery({`.
- Line 83: `const saveM = useMutation({`.
- Line 92: `const initM = useMutation({`.
- Line 100: `const taxM = useMutation({`.
- Line 109: `<sensitive declaration redacted>`.
- Line 117: `const invoiceQueueM = useMutation({`.
- Line 125: `const noteM = useMutation({`.
- Line 134: `const noteQueueM = useMutation({`.
- Line 142: `const rows = records.data?.data || [];`.
- Line 143: `const metrics = summary.data?.data || {};`.
- Line 144: `const fp = finance.data?.data || {};`.
- Line 145: `const profile = taxProfile.data?.data || {};`.
- Line 146: `const submissionsRows = submissions.data?.data || [];`.
- Line 147: `const notesRows = notes.data?.data || [];`.
- Line 149: `const cards = useMemo(`.
- Line 159: `const begin = (row) => {`.
- Line 168: `const update = (key, value) => setEditing((current) => ({ ...current, [key]: value }));`.
- Line 170: `const startTaxEdit = () => {`.
- Line 191: `<sensitive declaration redacted>`.

## Security, errors and performance checkpoints

- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
