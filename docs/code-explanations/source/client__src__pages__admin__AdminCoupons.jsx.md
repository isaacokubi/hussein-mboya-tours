# Source explanation: client/src/pages/admin/AdminCoupons.jsx

**Source:** [client/src/pages/admin/AdminCoupons.jsx](../../../client/src/pages/admin/AdminCoupons.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useEffect`, `useMemo`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Search`, `Plus`, `RefreshCw`, `Pencil`, `Trash2`, `Tag`, `CheckCircle2`, `Clock3`, `XCircle`, `TicketPercent` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getCoupons`, `createCoupon`, `updateCoupon`, `deleteCoupon` from `../../api/couponApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/couponApi](../../../client/src/api/couponApi.js)

## Runtime declarations and data flow

### `money` — lines 6–6

Parameters: `v`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `date` — lines 7–7

Parameters: `v`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `status` — lines 8–8

Parameters: `c`.
4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:

### `Badge` — lines 10–10

Parameters: `{coupon}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `AdminCoupons` — lines 12–41

Parameters: none.
React hooks used: useState, useEffect, useMemo. 6 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true. 11 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 13:** `const[coupons,setCoupons]=useState([]),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[error,setError]=useState(""),[search,setSearch]=useState(""),[filter,setFilter]=useState("all"),[show,setShow` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 14:** `const load=async()=>{try{setLoading(true);setError("");const r=await getCoupons();setCoupons(Array.isArray(r?.coupons)?r.coupons:[])}catch(e){setError(e?.response?.data?.message||"Failed to load coupons. Please try again` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 15:** `useEffect(()=>{load()},[]);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 16:** `const field=(k,v)=>setForm(x=>({...x,[k]:v}));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 17:** `const create=()=>{setEditing(null);setForm({...EMPTY,startDate:new Date().toISOString().slice(0,10)});setShow(true);setError("")};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 18:** `const edit=c=>{setEditing(c);setForm({code:c.code||"",description:c.description||"",discountType:c.discountType||"percentage",amount:c.amount??"",startDate:c.startDate?new Date(c.startDate).toISOString().slice(0,10):"",e` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 19:** `const submit=async e=>{e.preventDefault();const amount=Number(form.amount),limit=Number(form.usageLimit),min=Number(form.minimumBookingAmount||0),max=form.maximumDiscount===""?null:Number(form.maximumDiscount);if(!form.c` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 20:** `const remove=async c=>{if(!window.confirm(\`Delete coupon ${c.code}? This cannot be undone.\`))return;try{await deleteCoupon(c._id);await load()}catch(e){setError(e?.response?.data?.message||"Delete failed.")}};` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 21:** `const filtered=useMemo(()=>{const q=search.trim().toLowerCase();return coupons.filter(c=>(!q||\`${c.code||""} ${c.description||""}\`.toLowerCase().includes(q))&&(filter==="all"||status(c)===filter))},[coupons,search,filt` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 22:** `useEffect(()=>setPage(1),[search,filter]);const pages=Math.max(1,Math.ceil(filtered.length/10)),p=Math.min(page,pages),rows=filtered.slice((p-1)*10,p*10);const active=coupons.filter(c=>status(c)==="active").length,expire` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 23:** `return <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8"><div className="mx-auto max-w-7xl space-y-6">` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `load` — lines 14–14

Parameters: none.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true.

Key statements:

### `field` — lines 16–16

Parameters: `k`, `v`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `create` — lines 17–17

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `edit` — lines 18–18

Parameters: `c`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `submit` — lines 19–19

Parameters: `e`.
3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true. 9 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:

### `remove` — lines 20–20

Parameters: `c`.
2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:

## Module-level declarations

- Line 5: `const EMPTY={code:"",description:"",discountType:"percentage",amount:"",startDate:"",expiresAt:"",usageLimit:1,minimumBookingAmount:0,maximumDiscount:"",active:true};`.
- Line 6: `const money=v=>\`KES ${Number(v||0).toLocaleString("en-KE",{minimumFractionDigits:2,maximumFractionDigits:2})}\`;`.
- Line 7: `const date=v=>v?new Date(v).toLocaleDateString("en-KE",{day:"2-digit",month:"short",year:"numeric"}):"—";`.
- Line 8: `const status=c=>{const n=new Date(),s=c.startDate&&new Date(c.startDate),e=c.expiresAt&&new Date(c.expiresAt);if(c.active===false)return"inactive";if(e&&e<n)return"expired";if(s&&s`.
- Line 9: `const META={active:["Active","bg-emerald-50 text-emerald-700 border-emerald-200",CheckCircle2],scheduled:["Scheduled","bg-amber-50 text-amber-700 border-amber-200",Clock3],expired:`.
- Line 10: `function Badge({coupon}){const [label,cls,Icon]=META[status(coupon)];return <span className={\`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibol`.
- Line 14: `const load=async()=>{try{setLoading(true);setError("");const r=await getCoupons();setCoupons(Array.isArray(r?.coupons)?r.coupons:[])}catch(e){setError(e?.response?.data?.message||"`.
- Line 16: `const field=(k,v)=>setForm(x=>({...x,[k]:v}));`.
- Line 17: `const create=()=>{setEditing(null);setForm({...EMPTY,startDate:new Date().toISOString().slice(0,10)});setShow(true);setError("")};`.
- Line 18: `const edit=c=>{setEditing(c);setForm({code:c.code||"",description:c.description||"",discountType:c.discountType||"percentage",amount:c.amount??"",startDate:c.startDate?new Date(c.s`.
- Line 19: `const submit=async e=>{e.preventDefault();const amount=Number(form.amount),limit=Number(form.usageLimit),min=Number(form.minimumBookingAmount||0),max=form.maximumDiscount===""?null`.
- Line 20: `const remove=async c=>{if(!window.confirm(\`Delete coupon ${c.code}? This cannot be undone.\`))return;try{await deleteCoupon(c._id);await load()}catch(e){setError(e?.response?.data`.
- Line 21: `const filtered=useMemo(()=>{const q=search.trim().toLowerCase();return coupons.filter(c=>(!q||\`${c.code||""} ${c.description||""}\`.toLowerCase().includes(q))&&(filter==="all"||st`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
