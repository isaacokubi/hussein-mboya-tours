# Source explanation: client/src/components/admin/FinanceLifecycleCenter.jsx

**Source:** [client/src/components/admin/FinanceLifecycleCenter.jsx](../../../client/src/components/admin/FinanceLifecycleCenter.jsx)

## Purpose

A reusable UI component used by one or more pages/layouts. Props and callbacks form its input/output boundary.

## Imports and dependencies

- `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useMutation`, `useQuery`, `useQueryClient` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `CheckCircle2`, `Copy`, `Link`, `Plus`, `ReceiptText`, `RefreshCw`, `XCircle` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `createPaymentLink`, `getPaymentLinks`, `cancelPaymentLink`, `createCreditDebitNote`, `getCreditDebitNotes`, `issueCreditDebitNote`, `cancelCreditDebitNote` from `../../api/financeLifecycleApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/financeLifecycleApi](../../../client/src/api/financeLifecycleApi.js)

## Runtime declarations and data flow

### `money` — lines 6–6

Parameters: `v`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `list` — lines 7–7

Parameters: `v`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `errorText` — lines 8–8

Parameters: `e`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `FinanceLifecycleCenter` — lines 10–27

Parameters: `{enableCreditDebitNotes}`.
React hooks used: useState, useQuery, useMutation. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 11:** `const qc = useQueryClient(); const [bookingId, setBookingId] = useState(""); const [linkAmount, setLinkAmount] = useState(""); const [invoiceId, setInvoiceId] = useState(""); const [noteType, setNoteType] = useState("cre` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 12:** `const linksQ = useQuery({ queryKey: ["finance-payment-links"], queryFn: getPaymentLinks, staleTime: 30000, retry: 2 }); const notesQ = useQuery({ queryKey: ["finance-credit-debit-notes"], queryFn: getCreditDebitNotes, st` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 13:** `const refresh = () => { qc.invalidateQueries({ queryKey: ["finance-payment-links"] }); qc.invalidateQueries({ queryKey: ["finance-credit-debit-notes"] }); qc.invalidateQueries({ queryKey: ["admin-finance-accounting"] });` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 14:** `const linkMutation = useMutation({ mutationFn: createPaymentLink, onSuccess: (data) => { setCreatedPath(data?.paymentPath || ""); setBookingId(""); setLinkAmount(""); refresh(); } });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 15:** `const cancelLink = useMutation({ mutationFn: cancelPaymentLink, onSuccess: refresh });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 16:** `const noteMutation = useMutation({ mutationFn: createCreditDebitNote, onSuccess: () => { setInvoiceId(""); setNoteAmount(""); setReason(""); refresh(); } });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 17:** `const issueNote = useMutation({ mutationFn: issueCreditDebitNote, onSuccess: refresh }); const cancelNote = useMutation({ mutationFn: cancelCreditDebitNote, onSuccess: refresh });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 18:** `const copy = async (text) => { try { await navigator.clipboard.writeText(\`${window.location.origin}${text}\`); } catch (error) { console.warn("Unable to copy payment link:", error); } };` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 19:** `return <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `refresh` — lines 13–13

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `copy` — lines 18–18

Parameters: `text`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:

### `ListPanel` — lines 28–28

Parameters: `{title, items, loading, empty, render}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 6: `const money = (v) => \`KES ${Number(v || 0).toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\`;`.
- Line 7: `const list = (v) => Array.isArray(v) ? v : v?.data || [];`.
- Line 8: `const errorText = (e) => e?.response?.data?.message || e?.message || "The request could not be completed.";`.
- Line 11: `const qc = useQueryClient(); const [bookingId, setBookingId] = useState(""); const [linkAmount, setLinkAmount] = useState(""); const [invoiceId, setInvoiceId] = useState(""); const`.
- Line 12: `const linksQ = useQuery({ queryKey: ["finance-payment-links"], queryFn: getPaymentLinks, staleTime: 30000, retry: 2 }); const notesQ = useQuery({ queryKey: ["finance-credit-debit-n`.
- Line 13: `const refresh = () => { qc.invalidateQueries({ queryKey: ["finance-payment-links"] }); qc.invalidateQueries({ queryKey: ["finance-credit-debit-notes"] }); qc.invalidateQueries({ qu`.
- Line 14: `const linkMutation = useMutation({ mutationFn: createPaymentLink, onSuccess: (data) => { setCreatedPath(data?.paymentPath || ""); setBookingId(""); setLinkAmount(""); refresh(); } `.
- Line 15: `const cancelLink = useMutation({ mutationFn: cancelPaymentLink, onSuccess: refresh });`.
- Line 16: `const noteMutation = useMutation({ mutationFn: createCreditDebitNote, onSuccess: () => { setInvoiceId(""); setNoteAmount(""); setReason(""); refresh(); } });`.
- Line 17: `const issueNote = useMutation({ mutationFn: issueCreditDebitNote, onSuccess: refresh }); const cancelNote = useMutation({ mutationFn: cancelCreditDebitNote, onSuccess: refresh });`.
- Line 18: `const copy = async (text) => { try { await navigator.clipboard.writeText(\`${window.location.origin}${text}\`); } catch (error) { console.warn("Unable to copy payment link:", error`.
- Line 28: `function ListPanel({ title, items, loading, empty, render }) { return <div><h3 className="font-black text-slate-950">{title}</h3><div className="mt-3 space-y-2">{loading ? <div cla`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
