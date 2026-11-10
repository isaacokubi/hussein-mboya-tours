# Source explanation: client/src/pages/admin/HospitalityReservationOperations.jsx

**Source:** [client/src/pages/admin/HospitalityReservationOperations.jsx](../../../client/src/pages/admin/HospitalityReservationOperations.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useMemo`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useMutation`, `useQuery`, `useQueryClient` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `AlertTriangle`, `BedDouble`, `CalendarDays`, `Car`, `CheckCircle2`, `DollarSign`, `Loader2`, `RefreshCw`, `Search`, `ShieldCheck`, `WalletCards`, `XCircle` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getAdminHotels`, `getHotelBookings` from `../../api/hotelApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/hotelApi](../../../client/src/api/hotelApi.js)
- `getTransferBookings` from `../../api/airportTransferApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/airportTransferApi](../../../client/src/api/airportTransferApi.js)
- `assignTransfer`, `blockRooms`, `cancelHotelBooking`, `getHospitalityDeposits`, `getHospitalityDrivers`, `getHospitalityRoomBlocks`, `getHospitalityVehicles`, `getHotelCalendar`, `getTransferDispatch`, `releaseRoomBlock`, `updateHospitalityDeposit`, `updateTransferStatus` from `../../api/hospitalityOperationsApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/hospitalityOperationsApi](../../../client/src/api/hospitalityOperationsApi.js)

## Runtime declarations and data flow

### `list` — lines 9–9

Parameters: `v`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `money` — lines 10–10

Parameters: `v`, `c (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `date` — lines 11–11

Parameters: `v`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `dt` — lines 12–12

Parameters: `v`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `todayKenya` — lines 13–13

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `title` — lines 14–14

Parameters: `v`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `err` — lines 15–15

Parameters: `e`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `HospitalityReservationOperations` — lines 17–40

Parameters: none.
React hooks used: useState, useQuery, useMemo. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 18:** `const qc=useQueryClient();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 19:** `const [tab,setTab]=useState("overview");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 20:** `const [search,setSearch]=useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 21:** `const [hotelId,setHotelId]=useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 22:** `const [dispatchDate,setDispatchDate]=useState(todayKenya());` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 23:** `const [notice,setNotice]=useState(null);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 24:** `const hotelsQ=useQuery({queryKey:["ops-hotels"],queryFn:getAdminHotels,staleTime:30000,retry:1});` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 25:** `const hbQ=useQuery({queryKey:["ops-hotel-bookings"],queryFn:getHotelBookings,staleTime:15000,retry:1});` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 26:** `const tbQ=useQuery({queryKey:["ops-transfer-bookings"],queryFn:getTransferBookings,staleTime:15000,retry:1});` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 27:** `const dispatchQ=useQuery({queryKey:["ops-dispatch",dispatchDate],queryFn:()=>getTransferDispatch({from:new Date(\`${dispatchDate}T00:00:00+03:00\`).toISOString(),to:new Date(new Date(\`${dispatchDate}T00:00:00+03:00\`).g` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 28:** `const driversQ=useQuery({queryKey:["ops-drivers"],queryFn:getHospitalityDrivers,staleTime:60000,retry:1});` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 29:** `const vehiclesQ=useQuery({queryKey:["ops-vehicles"],queryFn:getHospitalityVehicles,staleTime:60000,retry:1});` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 30:** `const depositsQ=useQuery({queryKey:["ops-deposits"],queryFn:getHospitalityDeposits,staleTime:15000,retry:1});` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 31:** `const blocksQ=useQuery({queryKey:["ops-room-blocks"],queryFn:getHospitalityRoomBlocks,staleTime:15000,retry:1});` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 32:** `const hotels=list(hotelsQ.data),bookings=list(hbQ.data),transfers=list(tbQ.data),dispatch=list(dispatchQ.data),drivers=list(driversQ.data),vehicles=list(vehiclesQ.data),deposits=list(depositsQ.data),blocks=list(blocksQ.d` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 33:** `const failedSources=[hotelsQ.isError&&"properties",hbQ.isError&&"hotel reservations",tbQ.isError&&"transfer bookings",dispatchQ.isError&&"dispatch",driversQ.isError&&"drivers",vehiclesQ.isError&&"vehicles",depositsQ.isEr` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 34:** `const initialLoading=[hotelsQ,hbQ,tbQ,dispatchQ,driversQ,vehiclesQ,depositsQ,blocksQ].some(q=>q.isLoading);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 35:** `const refresh=()=>[hotelsQ,hbQ,tbQ,dispatchQ,driversQ,vehiclesQ,depositsQ,blocksQ].forEach(q=>q.refetch());` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `refresh` — lines 35–35

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `notify` — lines 36–36

Parameters: `type`, `msg`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:

### `Overview` — lines 42–42

Parameters: `{hotels, hotelsError, bookings, bookingsError, transfers, transfersError, deposits, depositsError, setTab}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Reservations` — lines 44–44

Parameters: `{bookings, transfers, search, setSearch, bookingsError, transfersError}`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:

### `Calendar` — lines 46–46

Parameters: `{hotels, hotelId, setHotelId, hotelsError}`.
React hooks used: useQuery. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 46:** `function Calendar({hotels,hotelId,setHotelId,hotelsError}){const q=useQuery({queryKey:["ops-calendar",hotelId],queryFn:()=>getHotelCalendar({hotelId}),enabled:Boolean(hotelId)&&!hotelsError,staleTime:15000,retry:1});cons` — Uses a React hook to manage component state, side effects, memoization, or server state.

### `Dispatch` — lines 48–48

Parameters: `{rows, drivers, vehicles, dispatchDate, setDispatchDate, qc, dispatchError, onError, onSuccess}`.
React hooks used: useMutation.

Key statements:
- **Line 48:** `function Dispatch({rows,drivers,vehicles,dispatchDate,setDispatchDate,qc,dispatchError,onError,onSuccess}){const mutation=useMutation({mutationFn:({id,payload})=>assignTransfer(id,payload),onSuccess:()=>{qc.invalidateQue` — Uses a React hook to manage component state, side effects, memoization, or server state.

### `DispatchRow` — lines 50–50

Parameters: `{row, drivers, vehicles, assign, update, busy}`.
React hooks used: useState.

Key statements:
- **Line 50:** `function DispatchRow({row,drivers,vehicles,assign,update,busy}){const [driver,setDriver]=useState(row.assignedDriver?._id||row.assignedDriver||"");const [vehicle,setVehicle]=useState(row.assignedVehicle?._id||row.assigne` — Uses a React hook to manage component state, side effects, memoization, or server state.

### `Inventory` — lines 52–52

Parameters: `{hotels, blocks, hotelsError, blocksError, qc, onError, onSuccess}`.
React hooks used: useState, useMutation. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 52:** `function Inventory({hotels,blocks,hotelsError,blocksError,qc,onError,onSuccess}){const [hotelId,setHotelId]=useState("");const [roomTypeId,setRoomTypeId]=useState("");const [blockType,setBlockType]=useState("Maintenance"` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.

### `Deposits` — lines 54–54

Parameters: `{rows, depositsError, qc, onError, onSuccess}`.
React hooks used: useState, useMutation. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 54:** `function Deposits({rows,depositsError,qc,onError,onSuccess}){const [busyId,setBusyId]=useState("");const [editingId,setEditingId]=useState("");const [paidInput,setPaidInput]=useState("");const mutation=useMutation({mutat` — Uses a React hook to manage component state, side effects, memoization, or server state.

### `record` — lines 54–54

Parameters: `d`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:

### `DepositRow` — lines 56–56

Parameters: `{d, editing, paidInput, setPaidInput, onEdit, onCancel, onRecord, busy}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Kpi` — lines 58–58

Parameters: `{label, value}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `StatCard` — lines 59–59

Parameters: `{title, value, hint, icon}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Field` — lines 60–60

Parameters: `{label, children}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Rule` — lines 61–61

Parameters: `{title, text}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `statusTone` — lines 62–62

Parameters: `v`.
3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:

### `Badge` — lines 63–63

Parameters: `{text, tone}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Empty` — lines 64–64

Parameters: `{text, tone}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Loading` — lines 65–65

Parameters: `{text}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 8: `const input="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled`.
- Line 9: `const list=v=>Array.isArray(v)?v:(v?.items||v?.data||v?.bookings||v?.hotels||v?.rows||[]);`.
- Line 10: `const money=(v,c="KES")=>\`${c||"KES"} ${Number(v||0).toLocaleString("en-KE",{minimumFractionDigits:2,maximumFractionDigits:2})}\`;`.
- Line 11: `const date=v=>v?new Date(v).toLocaleDateString("en-KE",{day:"2-digit",month:"short",year:"numeric",timeZone:"Africa/Nairobi"}):"—";`.
- Line 12: `const dt=v=>v?new Date(v).toLocaleString("en-KE",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit",timeZone:"Africa/Nairobi"}):"—";`.
- Line 13: `const todayKenya=()=>new Intl.DateTimeFormat("en-CA",{timeZone:"Africa/Nairobi",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());`.
- Line 14: `const title=v=>String(v||"").replaceAll("_"," ").replace(/\b\w/g,m=>m.toUpperCase());`.
- Line 15: `const err=e=>e?.response?.data?.message||e?.message||"The operation could not be completed.";`.
- Line 18: `const qc=useQueryClient();`.
- Line 19: `const [tab,setTab]=useState("overview");`.
- Line 20: `const [search,setSearch]=useState("");`.
- Line 21: `const [hotelId,setHotelId]=useState("");`.
- Line 22: `const [dispatchDate,setDispatchDate]=useState(todayKenya());`.
- Line 23: `const [notice,setNotice]=useState(null);`.
- Line 24: `const hotelsQ=useQuery({queryKey:["ops-hotels"],queryFn:getAdminHotels,staleTime:30000,retry:1});`.
- Line 25: `const hbQ=useQuery({queryKey:["ops-hotel-bookings"],queryFn:getHotelBookings,staleTime:15000,retry:1});`.
- Line 26: `const tbQ=useQuery({queryKey:["ops-transfer-bookings"],queryFn:getTransferBookings,staleTime:15000,retry:1});`.
- Line 27: `const dispatchQ=useQuery({queryKey:["ops-dispatch",dispatchDate],queryFn:()=>getTransferDispatch({from:new Date(\`${dispatchDate}T00:00:00+03:00\`).toISOString(),to:new Date(new Da`.
- Line 28: `const driversQ=useQuery({queryKey:["ops-drivers"],queryFn:getHospitalityDrivers,staleTime:60000,retry:1});`.
- Line 29: `const vehiclesQ=useQuery({queryKey:["ops-vehicles"],queryFn:getHospitalityVehicles,staleTime:60000,retry:1});`.
- Line 30: `const depositsQ=useQuery({queryKey:["ops-deposits"],queryFn:getHospitalityDeposits,staleTime:15000,retry:1});`.
- Line 31: `const blocksQ=useQuery({queryKey:["ops-room-blocks"],queryFn:getHospitalityRoomBlocks,staleTime:15000,retry:1});`.
- Line 32: `const hotels=list(hotelsQ.data),bookings=list(hbQ.data),transfers=list(tbQ.data),dispatch=list(dispatchQ.data),drivers=list(driversQ.data),vehicles=list(vehiclesQ.data),deposits=li`.
- Line 33: `const failedSources=[hotelsQ.isError&&"properties",hbQ.isError&&"hotel reservations",tbQ.isError&&"transfer bookings",dispatchQ.isError&&"dispatch",driversQ.isError&&"drivers",vehi`.
- Line 34: `const initialLoading=[hotelsQ,hbQ,tbQ,dispatchQ,driversQ,vehiclesQ,depositsQ,blocksQ].some(q=>q.isLoading);`.
- Line 35: `const refresh=()=>[hotelsQ,hbQ,tbQ,dispatchQ,driversQ,vehiclesQ,depositsQ,blocksQ].forEach(q=>q.refetch());`.
- Line 36: `const notify=(type,msg)=>{setNotice({type,msg});if(type==="success")setTimeout(()=>setNotice(null),4500)};`.
- Line 37: `const metrics=useMemo(()=>{const today=todayKenya();const dispatchToday=transfers.filter(x=>String(x.pickupDateTime||"").slice(0,10)===today).length;const pending=bookings.filter(x`.
- Line 38: `const tabs=[["overview","Overview",CheckCircle2,metrics.pending],["reservations","Reservations",CalendarDays,metrics.reservations],["calendar","Hotel calendar",BedDouble,null],["di`.
- Line 42: `function Overview({hotels,hotelsError,bookings,bookingsError,transfers,transfersError,deposits,depositsError,setTab}){const pending=[...bookings.filter(x=>["pending","awaiting_conf`.
- Line 44: `function Reservations({bookings,transfers,search,setSearch,bookingsError,transfersError}){const rows=[...bookings.map(x=>({...x,_type:"Hotel",_when:x.checkIn,_name:x.hotel?.name||"`.
- Line 46: `function Calendar({hotels,hotelId,setHotelId,hotelsError}){const q=useQuery({queryKey:["ops-calendar",hotelId],queryFn:()=>getHotelCalendar({hotelId}),enabled:Boolean(hotelId)&&!ho`.
- Line 48: `function Dispatch({rows,drivers,vehicles,dispatchDate,setDispatchDate,qc,dispatchError,onError,onSuccess}){const mutation=useMutation({mutationFn:({id,payload})=>assignTransfer(id,`.
- Line 50: `function DispatchRow({row,drivers,vehicles,assign,update,busy}){const [driver,setDriver]=useState(row.assignedDriver?._id||row.assignedDriver||"");const [vehicle,setVehicle]=useSta`.
- Line 52: `function Inventory({hotels,blocks,hotelsError,blocksError,qc,onError,onSuccess}){const [hotelId,setHotelId]=useState("");const [roomTypeId,setRoomTypeId]=useState("");const [blockT`.
- Line 54: `function Deposits({rows,depositsError,qc,onError,onSuccess}){const [busyId,setBusyId]=useState("");const [editingId,setEditingId]=useState("");const [paidInput,setPaidInput]=useSta`.
- Line 56: `function DepositRow({d,editing,paidInput,setPaidInput,onEdit,onCancel,onRecord,busy}){const outstanding=Math.max(0,Number(d.amount||0)-Number(d.paidAmount||0));return <div classNam`.
- Line 58: `const Kpi=({label,value})=><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}<`.
- Line 59: `const StatCard=({title:heading,value,hint,icon:Icon=CheckCircle2})=><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start jus`.
- Line 60: `const Field=({label,children})=><label className="block text-xs font-black uppercase tracking-wider text-slate-500">{label}<div className="mt-1.5">{children}</div></label>;`.
- Line 61: `const Rule=({title:heading,text})=><div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-sm font-black text-slate-900">{heading}</p><p className="m`.
- Line 62: `const statusTone=v=>{const s=String(v||"").toLowerCase();if(["paid","completed","confirmed","assigned","checked_in","checked_out"].includes(s))return "success";if(["cancelled","fai`.
- Line 63: `const Badge=({text,tone="neutral"})=>{const tones={neutral:"bg-slate-100 text-slate-600",success:"bg-emerald-100 text-emerald-700",warning:"bg-amber-100 text-amber-700",danger:"bg-`.
- Line 64: `const Empty=({text,tone="neutral"})=>{const tones={neutral:"border-slate-300 text-slate-500",success:"border-emerald-200 bg-emerald-50/40 text-emerald-700",warning:"border-amber-30`.
- Line 65: `const Loading=({text="Loading operational data…"})=><div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 p-10 text-sm text-slate-`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
