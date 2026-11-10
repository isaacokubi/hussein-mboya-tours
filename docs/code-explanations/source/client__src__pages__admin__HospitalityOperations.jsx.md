# Source explanation: client/src/pages/admin/HospitalityOperations.jsx

**Source:** [client/src/pages/admin/HospitalityOperations.jsx](../../../client/src/pages/admin/HospitalityOperations.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useMemo`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useMutation`, `useQuery`, `useQueryClient` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Activity`, `BedDouble`, `CalendarDays`, `Car`, `CheckCircle2`, `ClipboardList`, `Gauge`, `Plane`, `RefreshCw`, `WalletCards` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getHospitalityDashboard`, `getHotelCalendar`, `getHotelPerformance`, `getTransferDispatch`, `assignTransfer`, `updateTransferStatus`, `getHospitalityDrivers`, `getHospitalityVehicles`, `getHospitalityPaymentReconciliation` from `../../api/hospitalityOperationsApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/hospitalityOperationsApi](../../../client/src/api/hospitalityOperationsApi.js)
- `getAdminHotels` from `../../api/hotelApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/hotelApi](../../../client/src/api/hotelApi.js)

## Runtime declarations and data flow

### `money` — lines 7–7

Parameters: `v`, `c (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `fmt` — lines 8–8

Parameters: `v`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `unwrap` — lines 10–10

Parameters: `v`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `HospitalityOperations` — lines 11–31

Parameters: none.
React hooks used: useState, useQuery, useMutation. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 12:** `const qc=useQueryClient();const [tab,setTab]=useState("overview"),[hotelId,setHotelId]=useState(""),[date,setDate]=useState(new Date().toISOString().slice(0,10));` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 13:** `const dashboard=useQuery({queryKey:["hospitality-ops-dashboard"],queryFn:getHospitalityDashboard,staleTime:15000});` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 14:** `const hotels=useQuery({queryKey:["admin-hotels"],queryFn:getAdminHotels,staleTime:30000});` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 15:** `const perf=useQuery({queryKey:["hospitality-performance",hotelId],queryFn:()=>getHotelPerformance({hotelId:hotelId||undefined}),staleTime:15000});` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 16:** `const calendar=useQuery({queryKey:["hospitality-calendar",hotelId,date],queryFn:()=>getHotelCalendar({hotelId,from:date,to:new Date(new Date(\`${date}T00:00:00\`).getTime()+14*86400000).toISOString()}),enabled:!!hotelId}` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 17:** `const dispatch=useQuery({queryKey:["transfer-dispatch",date],queryFn:()=>getTransferDispatch({from:\`${date}T00:00:00\`,to:new Date(new Date(\`${date}T00:00:00\`).getTime()+86400000).toISOString()}),enabled:tab==="dispat` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 18:** `const drivers=useQuery({queryKey:["hospitality-drivers"],queryFn:getHospitalityDrivers,enabled:tab==="dispatch"});const vehicles=useQuery({queryKey:["hospitality-vehicles"],queryFn:getHospitalityVehicles,enabled:tab==="d` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 19:** `const reconciliation=useQuery({queryKey:["hospitality-reconciliation"],queryFn:()=>getHospitalityPaymentReconciliation({from:new Date(Date.now()-30*86400000).toISOString()}),enabled:tab==="reconciliation"});` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 20:** `const assign=useMutation({mutationFn:({id,payload})=>assignTransfer(id,payload),onSuccess:()=>qc.invalidateQueries({queryKey:["transfer-dispatch"]})});` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 21:** `const status=useMutation({mutationFn:({id,payload})=>updateTransferStatus(id,payload),onSuccess:()=>qc.invalidateQueries({queryKey:["transfer-dispatch"]})});` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 22:** `const refreshQueries=[dashboard,hotels,perf,calendar,dispatch,drivers,vehicles,reconciliation];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 23:** `const isRefreshing=refreshQueries.some(q=>q.isFetching);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 24:** `const refresh=async()=>{await Promise.all(refreshQueries.filter(q=>q.isEnabled!==false).map(q=>q.refetch()));};` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 25:** `const rooms=dashboard.data?.inventory||0;const p=perf.data||{};const days=calendar.data?.days||[];const transfers=unwrap(dispatch.data);const driversList=unwrap(drivers.data);const vehicleList=unwrap(vehicles.data);const` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 26:** `return <main className="min-h-screen bg-slate-50"><div className="mx-auto max-w-[1550px] px-4 py-6 sm:px-6 lg:px-8"><header className="rounded-[28px] bg-slate-950 p-6 text-white shadow-xl sm:p-8"><div className="flex fle` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `refresh` — lines 24–24

Parameters: none.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller.

Key statements:

### `DispatchCard` — lines 32–32

Parameters: `{booking, drivers, vehicles, assign, status}`.
React hooks used: useState.

Key statements:
- **Line 32:** `function DispatchCard({booking,drivers,vehicles,assign,status}){const [driver,setDriver]=useState(booking.assignedDriver?._id||booking.assignedDriver||"");const [vehicle,setVehicle]=useState(booking.assignedVehicle?._id|` — Uses a React hook to manage component state, side effects, memoization, or server state.

### `Kpi` — lines 33–33

Parameters: `{icon, label, value}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Panel` — lines 34–34

Parameters: `{title, icon, children}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Metric` — lines 35–35

Parameters: `{label, value}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Empty` — lines 36–36

Parameters: `{text}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 7: `const money=(v,c="KES")=>\`${c} ${Number(v||0).toLocaleString("en-KE",{maximumFractionDigits:2})}\`;`.
- Line 8: `const fmt=v=>v?new Date(v).toLocaleString("en-KE",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}):"—";`.
- Line 9: `const input="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10";`.
- Line 10: `const unwrap=v=>Array.isArray(v)?v:(v?.items||v?.data||[]);`.
- Line 12: `const qc=useQueryClient();const [tab,setTab]=useState("overview"),[hotelId,setHotelId]=useState(""),[date,setDate]=useState(new Date().toISOString().slice(0,10));`.
- Line 13: `const dashboard=useQuery({queryKey:["hospitality-ops-dashboard"],queryFn:getHospitalityDashboard,staleTime:15000});`.
- Line 14: `const hotels=useQuery({queryKey:["admin-hotels"],queryFn:getAdminHotels,staleTime:30000});`.
- Line 15: `const perf=useQuery({queryKey:["hospitality-performance",hotelId],queryFn:()=>getHotelPerformance({hotelId:hotelId||undefined}),staleTime:15000});`.
- Line 16: `const calendar=useQuery({queryKey:["hospitality-calendar",hotelId,date],queryFn:()=>getHotelCalendar({hotelId,from:date,to:new Date(new Date(\`${date}T00:00:00\`).getTime()+14*8640`.
- Line 17: `const dispatch=useQuery({queryKey:["transfer-dispatch",date],queryFn:()=>getTransferDispatch({from:\`${date}T00:00:00\`,to:new Date(new Date(\`${date}T00:00:00\`).getTime()+8640000`.
- Line 18: `const drivers=useQuery({queryKey:["hospitality-drivers"],queryFn:getHospitalityDrivers,enabled:tab==="dispatch"});const vehicles=useQuery({queryKey:["hospitality-vehicles"],queryFn`.
- Line 19: `const reconciliation=useQuery({queryKey:["hospitality-reconciliation"],queryFn:()=>getHospitalityPaymentReconciliation({from:new Date(Date.now()-30*86400000).toISOString()}),enable`.
- Line 20: `const assign=useMutation({mutationFn:({id,payload})=>assignTransfer(id,payload),onSuccess:()=>qc.invalidateQueries({queryKey:["transfer-dispatch"]})});`.
- Line 21: `const status=useMutation({mutationFn:({id,payload})=>updateTransferStatus(id,payload),onSuccess:()=>qc.invalidateQueries({queryKey:["transfer-dispatch"]})});`.
- Line 22: `const refreshQueries=[dashboard,hotels,perf,calendar,dispatch,drivers,vehicles,reconciliation];`.
- Line 23: `const isRefreshing=refreshQueries.some(q=>q.isFetching);`.
- Line 24: `const refresh=async()=>{await Promise.all(refreshQueries.filter(q=>q.isEnabled!==false).map(q=>q.refetch()));};`.
- Line 25: `const rooms=dashboard.data?.inventory||0;const p=perf.data||{};const days=calendar.data?.days||[];const transfers=unwrap(dispatch.data);const driversList=unwrap(drivers.data);const`.
- Line 32: `function DispatchCard({booking,drivers,vehicles,assign,status}){const [driver,setDriver]=useState(booking.assignedDriver?._id||booking.assignedDriver||"");const [vehicle,setVehicle`.
- Line 33: `const Kpi=({icon:Icon,label,value})=><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><Icon size={17} className="text-emerald-300"/><p className="mt-3 text-xl fon`.
- Line 34: `const Panel=({title,icon:Icon,children})=><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h2 className="mb-5 flex items-center gap-2 text-lg fon`.
- Line 35: `const Metric=({label,value})=><div className="rounded-2xl bg-slate-50 p-4"><p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</p><p className="mt`.
- Line 36: `const Empty=({text})=><div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">{text}</div>;`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
