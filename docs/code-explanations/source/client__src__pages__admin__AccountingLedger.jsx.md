# Source explanation: client/src/pages/admin/AccountingLedger.jsx

**Source:** [client/src/pages/admin/AccountingLedger.jsx](../../../client/src/pages/admin/AccountingLedger.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useMemo`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useMutation`, `useQuery`, `useQueryClient` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `CheckCircle2`, `ChevronDown`, `FilePlus2`, `Plus`, `RefreshCw`, `Scale`, `ShieldCheck`, `XCircle` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `createAccount`, `createJournalEntry`, `getAccounts`, `getJournalEntries`, `getLedgerSummary`, `postJournalEntry`, `voidJournalEntry` from `../../api/accountingApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/accountingApi](../../../client/src/api/accountingApi.js)

## Runtime declarations and data flow

### `money` — lines 6–6

Parameters: `n`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `unwrap` — lines 7–7

Parameters: `v`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `blankLine` — lines 8–8

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `AccountingLedger` — lines 10–48

Parameters: none.
React hooks used: useState, useQuery, useMutation, useMemo. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 11:** `const qc = useQueryClient();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 12:** `const [description, setDescription] = useState(""); const [reference, setReference] = useState(""); const [entryDate, setEntryDate] = useState(new Date().toISOString().slice(0, 10)); const [lines, setLines] = useState([b` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 13:** `const [showAccountForm, setShowAccountForm] = useState(false); const [account, setAccount] = useState({ code: "", name: "", type: "asset", subtype: "", description: "" });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 14:** `const accountsQ = useQuery({ queryKey: ["accounting-accounts"], queryFn: getAccounts, staleTime: 30000, retry: 2 });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 15:** `const journalQ = useQuery({ queryKey: ["accounting-journal"], queryFn: () => getJournalEntries({ limit: 200 }), staleTime: 30000, retry: 2 });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 16:** `const summaryQ = useQuery({ queryKey: ["accounting-summary"], queryFn: getLedgerSummary, staleTime: 30000, retry: 2 });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 17:** `const refresh = () => { accountsQ.refetch(); journalQ.refetch(); summaryQ.refetch(); };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 18:** `const createM = useMutation({ mutationFn: createJournalEntry, onSuccess: () => { qc.invalidateQueries({ queryKey: ["accounting-journal"] }); qc.invalidateQueries({ queryKey: ["accounting-summary"] }); setDescription("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 19:** `const accountM = useMutation({ mutationFn: createAccount, onSuccess: () => { qc.invalidateQueries({ queryKey: ["accounting-accounts"] }); setAccount({ code: "", name: "", type: "asset", subtype: "", description: "" }); s` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 20:** `const postM = useMutation({ mutationFn: postJournalEntry, onSuccess: () => { qc.invalidateQueries({ queryKey: ["accounting-journal"] }); qc.invalidateQueries({ queryKey: ["accounting-summary"] }); } });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 21:** `const voidM = useMutation({ mutationFn: voidJournalEntry, onSuccess: () => qc.invalidateQueries({ queryKey: ["accounting-journal"] }) });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 22:** `const accounts = Array.isArray(accountsQ.data) ? accountsQ.data : unwrap(accountsQ.data).items || [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 23:** `const rows = unwrap(summaryQ.data).accounts || []; const journal = Array.isArray(journalQ.data) ? journalQ.data : unwrap(journalQ.data).items || [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 24:** `const totals = useMemo(() => lines.reduce((a, l) => ({ debit: a.debit + Number(l.debit || 0), credit: a.credit + Number(l.credit || 0) }), { debit: 0, credit: 0 }), [lines]);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 25:** `const balanced = lines.length >= 2 && totals.debit > 0 && Math.abs(totals.debit - totals.credit) < 0.01 && lines.every((l) => l.account && !(Number(l.debit || 0) > 0 && Number(l.credit || 0)));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 26:** `const ps = unwrap(summaryQ.data).profitLoss || {}; const bs = unwrap(summaryQ.data).balanceSheet || {}; const ledgerBalanced = Math.abs(Number(unwrap(summaryQ.data).totals?.debit || 0) - Number(unwrap(summaryQ.data).tota` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 27:** `const updateLine = (index, field, value) => setLines((prev) => prev.map((line, i) => i === index ? { ...line, [field]: value } : line));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 28:** `const submit = (e) => { e.preventDefault(); if (!balanced || !description.trim()) return; createM.mutate({ entryDate, description: description.trim(), reference: reference.trim(), lines: lines.map((l) => ({ account: l.ac` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `refresh` — lines 17–17

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `updateLine` — lines 27–27

Parameters: `index`, `field`, `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `submit` — lines 28–28

Parameters: `e`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:

### `submitAccount` — lines 29–29

Parameters: `e`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:

### `Stat` — lines 50–50

Parameters: `{label, value, icon, tone}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Summary` — lines 51–51

Parameters: `{label, value}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 6: `const money = (n) => \`KSh ${Number(n || 0).toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\`;`.
- Line 7: `const unwrap = (v) => v?.data?.data ?? v?.data ?? v ?? {};`.
- Line 8: `const blankLine = () => ({ account: "", description: "", debit: "", credit: "" });`.
- Line 11: `const qc = useQueryClient();`.
- Line 12: `const [description, setDescription] = useState(""); const [reference, setReference] = useState(""); const [entryDate, setEntryDate] = useState(new Date().toISOString().slice(0, 10)`.
- Line 13: `const [showAccountForm, setShowAccountForm] = useState(false); const [account, setAccount] = useState({ code: "", name: "", type: "asset", subtype: "", description: "" });`.
- Line 14: `const accountsQ = useQuery({ queryKey: ["accounting-accounts"], queryFn: getAccounts, staleTime: 30000, retry: 2 });`.
- Line 15: `const journalQ = useQuery({ queryKey: ["accounting-journal"], queryFn: () => getJournalEntries({ limit: 200 }), staleTime: 30000, retry: 2 });`.
- Line 16: `const summaryQ = useQuery({ queryKey: ["accounting-summary"], queryFn: getLedgerSummary, staleTime: 30000, retry: 2 });`.
- Line 17: `const refresh = () => { accountsQ.refetch(); journalQ.refetch(); summaryQ.refetch(); };`.
- Line 18: `const createM = useMutation({ mutationFn: createJournalEntry, onSuccess: () => { qc.invalidateQueries({ queryKey: ["accounting-journal"] }); qc.invalidateQueries({ queryKey: ["acco`.
- Line 19: `const accountM = useMutation({ mutationFn: createAccount, onSuccess: () => { qc.invalidateQueries({ queryKey: ["accounting-accounts"] }); setAccount({ code: "", name: "", type: "as`.
- Line 20: `const postM = useMutation({ mutationFn: postJournalEntry, onSuccess: () => { qc.invalidateQueries({ queryKey: ["accounting-journal"] }); qc.invalidateQueries({ queryKey: ["accounti`.
- Line 21: `const voidM = useMutation({ mutationFn: voidJournalEntry, onSuccess: () => qc.invalidateQueries({ queryKey: ["accounting-journal"] }) });`.
- Line 22: `const accounts = Array.isArray(accountsQ.data) ? accountsQ.data : unwrap(accountsQ.data).items || [];`.
- Line 23: `const rows = unwrap(summaryQ.data).accounts || []; const journal = Array.isArray(journalQ.data) ? journalQ.data : unwrap(journalQ.data).items || [];`.
- Line 24: `const totals = useMemo(() => lines.reduce((a, l) => ({ debit: a.debit + Number(l.debit || 0), credit: a.credit + Number(l.credit || 0) }), { debit: 0, credit: 0 }), [lines]);`.
- Line 25: `const balanced = lines.length >= 2 && totals.debit > 0 && Math.abs(totals.debit - totals.credit) < 0.01 && lines.every((l) => l.account && !(Number(l.debit || 0) > 0 && Number(l.cr`.
- Line 26: `const ps = unwrap(summaryQ.data).profitLoss || {}; const bs = unwrap(summaryQ.data).balanceSheet || {}; const ledgerBalanced = Math.abs(Number(unwrap(summaryQ.data).totals?.debit |`.
- Line 27: `const updateLine = (index, field, value) => setLines((prev) => prev.map((line, i) => i === index ? { ...line, [field]: value } : line));`.
- Line 28: `const submit = (e) => { e.preventDefault(); if (!balanced || !description.trim()) return; createM.mutate({ entryDate, description: description.trim(), reference: reference.trim(), `.
- Line 29: `const submitAccount = (e) => { e.preventDefault(); if (!account.code.trim() || !account.name.trim()) return; accountM.mutate(account); };`.
- Line 50: `function Stat({ label, value, icon: Icon, tone }) { return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">{label}`.
- Line 51: `function Summary({ label, value }) { return <div className="rounded-2xl bg-slate-50 p-5"><p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p><p class`.

## Security, errors and performance checkpoints

- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
