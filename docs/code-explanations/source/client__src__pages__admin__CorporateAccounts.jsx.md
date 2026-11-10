# Source explanation: client/src/pages/admin/CorporateAccounts.jsx

**Source:** [client/src/pages/admin/CorporateAccounts.jsx](../../../client/src/pages/admin/CorporateAccounts.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useMutation`, `useQuery`, `useQueryClient` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Building2`, `CircleDollarSign`, `Plus`, `RefreshCw`, `ShieldCheck` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getCorporateAccounts`, `createCorporateAccount`, `reconcileCorporateAccount` from `../../api/operationsModuleApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/operationsModuleApi](../../../client/src/api/operationsModuleApi.js)

## Runtime declarations and data flow

### `money` — lines 7–7

Parameters: `v`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `unwrap` — lines 8–8

Parameters: `v`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `CorporateAccounts` — lines 9–19

Parameters: none.
React hooks used: useState, useQuery, useMutation. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 10:** `const qc=useQueryClient(); const [open,setOpen]=useState(false); const q=useQuery({queryKey:["operations-corporate"],queryFn:getCorporateAccounts,staleTime:10000});` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 11:** `const refresh=async()=>{await qc.invalidateQueries({queryKey:["operations-corporate"],refetchType:"active"});await q.refetch();};` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 12:** `const create=useMutation({mutationFn:createCorporateAccount,onSuccess:async()=>{setOpen(false);await refresh();},onError:e=>alert(e?.response?.data?.message||e?.message||"Unable to create corporate account.")});` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 13:** `const reconcile=useMutation({mutationFn:reconcileCorporateAccount,onSuccess:refresh,onError:e=>alert(e?.response?.data?.message||e?.message||"Unable to reconcile account.")});` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 14:** `const rows=unwrap(q.data); const active=rows.filter(x=>x.status==="active"); const exposure=active.reduce((s,x)=>s+Number(x.currentBalance||0),0); const limits=active.reduce((s,x)=>s+Number(x.creditLimit||0),0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 15:** `return <main className="min-h-screen bg-slate-50"><div className="mx-auto max-w-[1450px] px-4 py-6 sm:px-6 lg:px-8"><header className="rounded-[28px] bg-slate-950 p-6 text-white shadow-xl sm:p-8"><div className="flex fle` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `refresh` — lines 11–11

Parameters: none.
2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller.

Key statements:

### `Kpi` — lines 20–20

Parameters: `{icon, label, value}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Modal` — lines 21–21

Parameters: `{onClose, onSubmit, busy}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Field` — lines 22–22

Parameters: `{name, label, type, required, min, step}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Select` — lines 23–23

Parameters: `{name, label, options}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 6: `const input="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10";`.
- Line 7: `const money=v=>\`KES ${Number(v||0).toLocaleString("en-KE",{maximumFractionDigits:2})}\`;`.
- Line 8: `const unwrap=v=>Array.isArray(v)?v:(v?.items||v?.data||[]);`.
- Line 10: `const qc=useQueryClient(); const [open,setOpen]=useState(false); const q=useQuery({queryKey:["operations-corporate"],queryFn:getCorporateAccounts,staleTime:10000});`.
- Line 11: `const refresh=async()=>{await qc.invalidateQueries({queryKey:["operations-corporate"],refetchType:"active"});await q.refetch();};`.
- Line 12: `const create=useMutation({mutationFn:createCorporateAccount,onSuccess:async()=>{setOpen(false);await refresh();},onError:e=>alert(e?.response?.data?.message||e?.message||"Unable to`.
- Line 13: `const reconcile=useMutation({mutationFn:reconcileCorporateAccount,onSuccess:refresh,onError:e=>alert(e?.response?.data?.message||e?.message||"Unable to reconcile account.")});`.
- Line 14: `const rows=unwrap(q.data); const active=rows.filter(x=>x.status==="active"); const exposure=active.reduce((s,x)=>s+Number(x.currentBalance||0),0); const limits=active.reduce((s,x)=`.
- Line 20: `const Kpi=({icon:Icon,label,value})=><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><Icon size={18} className="text-emerald-600"/><p className="mt-3 te`.
- Line 21: `function Modal({onClose,onSubmit,busy}){return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"><div className="w-full max-w-2xl rounded-3xl`.
- Line 22: `const Field=({name,label,type="text",required,min,step})=><label className="text-xs font-semibold text-slate-600">{label}<input className={input} name={name} type={type} required={`.
- Line 23: `const Select=({name,label,options})=><label className="text-xs font-semibold text-slate-600">{label}<select className={input} name={name} defaultValue={options[0]}>{options.map(x=>`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
