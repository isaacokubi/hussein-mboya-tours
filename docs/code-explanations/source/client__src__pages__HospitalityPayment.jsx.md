# Source explanation: client/src/pages/HospitalityPayment.jsx

**Source:** [client/src/pages/HospitalityPayment.jsx](../../../client/src/pages/HospitalityPayment.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useMutation`, `useQuery`, `useQueryClient` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Link`, `useNavigate`, `useParams`, `useSearchParams` from `react-router-dom`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Building2`, `CheckCircle2`, `CreditCard`, `Landmark`, `Smartphone` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getHospitalityPayments`, `initiateHospitalityMpesa`, `initiateHospitalityCard`, `submitHospitalityBank` from `../api/hospitalityPaymentApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/hospitalityPaymentApi](../../../client/src/api/hospitalityPaymentApi.js)

## Runtime declarations and data flow

### `HospitalityPayment` — lines 8–19

Parameters: none.
React hooks used: useState, useQuery, useMutation. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 9:** `const {id}=useParams();const [params]=useSearchParams();const type=params.get("type")||"hotel";const navigate=useNavigate();const qc=useQueryClient();const [method,setMethod]=useState("mpesa");const [phone,setPhone]=useS` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 10:** `const payload={type,bookingId:id};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 11:** `const mpesa=useMutation({mutationFn:()=>initiateHospitalityMpesa({...payload,phoneNumber:phone,amount:amount?Number(amount):undefined}),onSuccess:()=>qc.invalidateQueries({queryKey:["hospitality-payment",id,type]})});` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 12:** `const card=useMutation({mutationFn:()=>initiateHospitalityCard(payload),onSuccess:d=>{if(d?.data?.url)window.location.assign(d.data.url);}});` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 13:** `const bank=useMutation({mutationFn:()=>submitHospitalityBank({...payload,amount:amount?Number(amount):undefined,reference,notes}),onSuccess:()=>qc.invalidateQueries({queryKey:["hospitality-payment",id,type]})});` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 14:** `const data=q.data||{};const booking=data.booking||data.data?.booking;const invoice=data.invoice||data.data?.invoice;const balance=Number(data.balance??data.data?.balance??booking?.totalAmount??0);const paid=Number(data.p` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 15:** `if(q.isLoading)return <div className="min-h-screen grid place-items-center bg-slate-50">Loading reservation payment…</div>;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 16:** `if(q.isError||!booking)return <div className="min-h-screen grid place-items-center bg-slate-50 p-6"><div className="max-w-md rounded-3xl bg-white p-8 text-center shadow-xl"><h1 className="text-2xl font-black">Reservation` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 17:** `const complete=balance<=0;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 18:** `return <main className="min-h-screen bg-slate-50 px-4 py-8"><div className="mx-auto max-w-4xl"><header className="rounded-3xl bg-slate-950 p-6 text-white sm:p-8"><p className="text-xs font-black uppercase tracking-[.16em` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `Method` — lines 20–20

Parameters: `{active, onClick, icon, label}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 7: `const input="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10";`.
- Line 9: `const {id}=useParams();const [params]=useSearchParams();const type=params.get("type")||"hotel";const navigate=useNavigate();const qc=useQueryClient();const [method,setMethod]=useSt`.
- Line 10: `const payload={type,bookingId:id};`.
- Line 11: `const mpesa=useMutation({mutationFn:()=>initiateHospitalityMpesa({...payload,phoneNumber:phone,amount:amount?Number(amount):undefined}),onSuccess:()=>qc.invalidateQueries({queryKey`.
- Line 12: `const card=useMutation({mutationFn:()=>initiateHospitalityCard(payload),onSuccess:d=>{if(d?.data?.url)window.location.assign(d.data.url);}});`.
- Line 13: `const bank=useMutation({mutationFn:()=>submitHospitalityBank({...payload,amount:amount?Number(amount):undefined,reference,notes}),onSuccess:()=>qc.invalidateQueries({queryKey:["hos`.
- Line 14: `const data=q.data||{};const booking=data.booking||data.data?.booking;const invoice=data.invoice||data.data?.invoice;const balance=Number(data.balance??data.data?.balance??booking?.`.
- Line 17: `const complete=balance<=0;`.
- Line 20: `const Method=({active,onClick,icon:Icon,label})=><button type="button" onClick={onClick} className={\`rounded-xl border px-3 py-3 text-sm font-black ${active?"border-emerald-500 bg`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
