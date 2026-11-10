# Source explanation: client/src/components/admin/KenyaTaxCenter.jsx

**Source:** [client/src/components/admin/KenyaTaxCenter.jsx](../../../client/src/components/admin/KenyaTaxCenter.jsx)

## Purpose

A reusable UI component used by one or more pages/layouts. Props and callbacks form its input/output boundary.

## Imports and dependencies

- `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useMutation`, `useQuery`, `useQueryClient` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Calculator`, `CheckCircle2`, `RefreshCw`, `Save`, `ShieldCheck` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `calculateTax`, `getTaxRules`, `initializeTaxRules`, `saveTaxRule` from `../../api/taxApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/taxApi](../../../client/src/api/taxApi.js)

## Runtime declarations and data flow

### `money` — lines 6–6

Parameters: `v`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `unwrapList` — lines 7–7

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `errorText` — lines 8–8

Parameters: `e`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `ruleRate` — lines 9–9

Parameters: `rule`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `KenyaTaxCenter` — lines 11–22

Parameters: none.
React hooks used: useQuery, useState, useMutation. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 12:** `const qc = useQueryClient(); const rulesQ = useQuery({ queryKey: ["kenya-tax-rules"], queryFn: getTaxRules, staleTime: 30000, retry: 2 });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 13:** `const [amount, setAmount] = useState("10000"); const [category, setCategory] = useState("STANDARD"); const [mode, setMode] = useState("exclusive"); const [rate, setRate] = useState(""); const [result, setResult] = useSta` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 14:** `const rules = unwrapList(rulesQ.data); const init = useMutation({ mutationFn: initializeTaxRules, onSuccess: () => qc.invalidateQueries({ queryKey: ["kenya-tax-rules"] }) }); const calc = useMutation({ mutationFn: calcul` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 15:** `const updateDraft = (code, field, value) => setDrafts((prev) => ({ ...prev, [code]: { ...(prev[code] || {}), [field]: value } })); const submitCalc = (e) => { e.preventDefault(); calc.mutate({ amount: Number(amount), cat` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 16:** `return <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `updateDraft` — lines 15–15

Parameters: `code`, `field`, `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `submitCalc` — lines 15–15

Parameters: `e`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `TaxMetric` — lines 23–23

Parameters: `{label, value, strong}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 6: `const money = (v) => \`KES ${Number(v || 0).toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\`;`.
- Line 7: `const unwrapList = (value) => Array.isArray(value) ? value : value?.items || value?.data || [];`.
- Line 8: `const errorText = (e) => e?.response?.data?.message || e?.message || "The request could not be completed.";`.
- Line 9: `const ruleRate = (rule) => rule?.rate === null || rule?.rate === undefined || rule?.rate === "" || !Number.isFinite(Number(rule?.rate)) ? null : Number(rule.rate);`.
- Line 12: `const qc = useQueryClient(); const rulesQ = useQuery({ queryKey: ["kenya-tax-rules"], queryFn: getTaxRules, staleTime: 30000, retry: 2 });`.
- Line 13: `const [amount, setAmount] = useState("10000"); const [category, setCategory] = useState("STANDARD"); const [mode, setMode] = useState("exclusive"); const [rate, setRate] = useState`.
- Line 14: `const rules = unwrapList(rulesQ.data); const init = useMutation({ mutationFn: initializeTaxRules, onSuccess: () => qc.invalidateQueries({ queryKey: ["kenya-tax-rules"] }) }); const`.
- Line 15: `const updateDraft = (code, field, value) => setDrafts((prev) => ({ ...prev, [code]: { ...(prev[code] || {}), [field]: value } })); const submitCalc = (e) => { e.preventDefault(); c`.
- Line 23: `function TaxMetric({ label, value, strong }) { return <div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><span className="text-xs font-bold uppercase tracking-wide`.

## Security, errors and performance checkpoints

- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
