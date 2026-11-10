# Source explanation: client/src/pages/admin/HospitalityCommercial.jsx

**Source:** [client/src/pages/admin/HospitalityCommercial.jsx](../../../client/src/pages/admin/HospitalityCommercial.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useEffect`, `useMemo`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useMutation`, `useQuery`, `useQueryClient` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `AlertCircle`, `CheckCircle2`, `FileText`, `Handshake`, `Loader2`, `Plus`, `RefreshCw`, `WalletCards`, `XCircle` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getAdminHotels`, `getHotelBookings` from `../../api/hotelApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/hotelApi](../../../client/src/api/hotelApi.js)
- `getTransferBookings` from `../../api/airportTransferApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/airportTransferApi](../../../client/src/api/airportTransferApi.js)
- `createRatePlan`, `getRatePlans`, `updateRatePlan`, `createSupplierContract`, `getSupplierContracts`, `updateSupplierContract`, `createHospitalityDeposit`, `getHospitalityDeposits`, `updateHospitalityDeposit` from `../../api/hospitalityOperationsApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/hospitalityOperationsApi](../../../client/src/api/hospitalityOperationsApi.js)

## Runtime declarations and data flow

### `money` — lines 13–13

Parameters: `v`, `c (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `countDisplay` — lines 14–14

Parameters: `v`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `amountDisplay` — lines 15–15

Parameters: `v`, `c (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `unwrap` — lines 16–16

Parameters: `v`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `dateOnly` — lines 17–17

Parameters: `v`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `HospitalityCommercial` — lines 20–93

Parameters: none.
React hooks used: useState, useQuery, useEffect, useMutation, useMemo. 15 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 21:** `const qc=useQueryClient();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 22:** `const [tab,setTab]=useState("rates");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 23:** `const [notice,setNotice]=useState(null);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 24:** `const [rate,setRate]=useState({hotel:"",roomType:"",name:"",code:"",nightlyRate:"",mealPlan:"room_only",validFrom:today,validTo:"",minNights:1,maxNights:"",refundable:true,cancellationPolicy:"",stopSell:false,status:"act` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 25:** `const [supplier,setSupplier]=useState({supplierName:"",supplierType:"hotel",hotel:"",contractNumber:"",contactName:"",contactPhone:"",contactEmail:"",commissionPercent:0,depositPercent:0,validFrom:today,validTo:"",paymen` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 26:** `const [deposit,setDeposit]=useState({hospitalityType:"hotel",hospitalityBooking:"",amount:"",dueDate:today,notes:"",paidAmount:0,status:"pending"});` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 28:** `const hotelsQ=useQuery({queryKey:["admin-hotels"],queryFn:getAdminHotels,staleTime:15000,retry:1});` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 29:** `const hotelBookingsQ=useQuery({queryKey:["commercial-hotel-bookings"],queryFn:getHotelBookings,staleTime:15000,retry:1});` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 30:** `const transferBookingsQ=useQuery({queryKey:["commercial-transfer-bookings"],queryFn:getTransferBookings,staleTime:15000,retry:1});` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 31:** `const ratesQ=useQuery({queryKey:["hospitality-rate-plans"],queryFn:getRatePlans,staleTime:15000,retry:1});` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 32:** `const suppliersQ=useQuery({queryKey:["hospitality-suppliers"],queryFn:getSupplierContracts,staleTime:15000,retry:1});` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 33:** `const depositsQ=useQuery({queryKey:["hospitality-deposits"],queryFn:getHospitalityDeposits,staleTime:15000,retry:1});` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 35:** `const hotels=unwrap(hotelsQ.data), hotelBookings=unwrap(hotelBookingsQ.data), transferBookings=unwrap(transferBookingsQ.data);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 36:** `const rates=unwrap(ratesQ.data), suppliers=unwrap(suppliersQ.data), deposits=unwrap(depositsQ.data);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 37:** `const selectedHotel=hotels.find(h=>String(h._id)===String(rate.hotel));` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 38:** `const roomTypes=selectedHotel?.roomTypes||selectedHotel?.rooms||[];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 39:** `const bookingOptions=deposit.hospitalityType==="hotel"?hotelBookings:transferBookings;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 41:** `useEffect(()=>{` — Uses a React hook to manage component state, side effects, memoization, or server state.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `refresh` — lines 55–55

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `success` — lines 56–56

Parameters: `msg`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `failure` — lines 57–57

Parameters: `err`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `invalidate` — lines 58–58

Parameters: `keys`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `rateValidation` — lines 67–76

Parameters: none.
7 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 68:** `if(!rate.hotel)return "Select a hotel.";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 69:** `if(!rate.roomType)return roomTypes.length?"Select a room type.":"The selected hotel has no room types. Create a room type first.";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 70:** `if(!rate.name.trim())return "Enter a plan name.";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 71:** `if(rate.nightlyRate===""||Number(rate.nightlyRate)<0||!Number.isFinite(Number(rate.nightlyRate)))return "Enter a valid nightly selling rate.";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 72:** `if(!rate.validFrom)return "Select a valid-from date.";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 73:** `if(rate.validTo&&new Date(rate.validTo)<new Date(rate.validFrom))return "Valid-to cannot be before valid-from.";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 74:** `if(rate.maxNights&&Number(rate.maxNights)<Number(rate.minNights||1))return "Maximum nights cannot be below minimum nights.";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 75:** `return "";` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `submitRate` — lines 77–77

Parameters: none.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:

### `recordDepositPayment` — lines 80–80

Parameters: `d`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:

### `Metric` — lines 94–94

Parameters: `{label, value}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Field` — lines 95–95

Parameters: `{label, children}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Form` — lines 96–96

Parameters: `{title, hint, children}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `List` — lines 97–97

Parameters: `{title, children, loading}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Row` — lines 98–98

Parameters: `{title, meta, value, badge, action}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 12: `const input="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10";`.
- Line 13: `const money=(v,c="KES")=>\`${c||"KES"} ${Number(v||0).toLocaleString("en-KE",{minimumFractionDigits:2,maximumFractionDigits:2})}\`;`.
- Line 14: `const countDisplay=v=>Number(v)>0?Number(v):"—";`.
- Line 15: `const amountDisplay=(v,c="KES")=>Number(v)>0?money(v,c):"—";`.
- Line 16: `const unwrap=v=>Array.isArray(v)?v:(v?.items||v?.data||v?.hotels||v?.bookings||[]);`.
- Line 17: `const dateOnly=v=>v?new Date(v).toISOString().slice(0,10):"";`.
- Line 18: `const today=new Date().toISOString().slice(0,10);`.
- Line 21: `const qc=useQueryClient();`.
- Line 22: `const [tab,setTab]=useState("rates");`.
- Line 23: `const [notice,setNotice]=useState(null);`.
- Line 24: `const [rate,setRate]=useState({hotel:"",roomType:"",name:"",code:"",nightlyRate:"",mealPlan:"room_only",validFrom:today,validTo:"",minNights:1,maxNights:"",refundable:true,cancella`.
- Line 25: `const [supplier,setSupplier]=useState({supplierName:"",supplierType:"hotel",hotel:"",contractNumber:"",contactName:"",contactPhone:"",contactEmail:"",commissionPercent:0,depositPer`.
- Line 26: `const [deposit,setDeposit]=useState({hospitalityType:"hotel",hospitalityBooking:"",amount:"",dueDate:today,notes:"",paidAmount:0,status:"pending"});`.
- Line 28: `const hotelsQ=useQuery({queryKey:["admin-hotels"],queryFn:getAdminHotels,staleTime:15000,retry:1});`.
- Line 29: `const hotelBookingsQ=useQuery({queryKey:["commercial-hotel-bookings"],queryFn:getHotelBookings,staleTime:15000,retry:1});`.
- Line 30: `const transferBookingsQ=useQuery({queryKey:["commercial-transfer-bookings"],queryFn:getTransferBookings,staleTime:15000,retry:1});`.
- Line 31: `const ratesQ=useQuery({queryKey:["hospitality-rate-plans"],queryFn:getRatePlans,staleTime:15000,retry:1});`.
- Line 32: `const suppliersQ=useQuery({queryKey:["hospitality-suppliers"],queryFn:getSupplierContracts,staleTime:15000,retry:1});`.
- Line 33: `const depositsQ=useQuery({queryKey:["hospitality-deposits"],queryFn:getHospitalityDeposits,staleTime:15000,retry:1});`.
- Line 35: `const hotels=unwrap(hotelsQ.data), hotelBookings=unwrap(hotelBookingsQ.data), transferBookings=unwrap(transferBookingsQ.data);`.
- Line 36: `const rates=unwrap(ratesQ.data), suppliers=unwrap(suppliersQ.data), deposits=unwrap(depositsQ.data);`.
- Line 37: `const selectedHotel=hotels.find(h=>String(h._id)===String(rate.hotel));`.
- Line 38: `const roomTypes=selectedHotel?.roomTypes||selectedHotel?.rooms||[];`.
- Line 39: `const bookingOptions=deposit.hospitalityType==="hotel"?hotelBookings:transferBookings;`.
- Line 44: `const hotelExists=hotels.some(h=>String(h._id)===String(current.hotel));`.
- Line 45: `const hotel=hotelExists?current.hotel:String(hotels[0]._id);`.
- Line 46: `const property=hotels.find(h=>String(h._id)===hotel);`.
- Line 47: `const rooms=property?.roomTypes||property?.rooms||[];`.
- Line 48: `const roomExists=rooms.some(r=>String(r._id)===String(current.roomType));`.
- Line 55: `const refresh=()=>[hotelsQ,hotelBookingsQ,transferBookingsQ,ratesQ,suppliersQ,depositsQ].forEach(q=>q.refetch());`.
- Line 56: `const success=msg=>{setNotice({type:"success",msg});setTimeout(()=>setNotice(null),4500)};`.
- Line 57: `const failure=err=>setNotice({type:"error",msg:err?.response?.data?.message||err?.message||"The operation could not be completed."});`.
- Line 58: `const invalidate=keys=>keys.forEach(key=>qc.invalidateQueries({queryKey:[key]}));`.
- Line 60: `const saveRate=useMutation({mutationFn:()=>createRatePlan({...rate,nightlyRate:Number(rate.nightlyRate),minNights:Number(rate.minNights||1),maxNights:rate.maxNights?Number(rate.max`.
- Line 61: `const saveSupplier=useMutation({mutationFn:()=>createSupplierContract({...supplier,commissionPercent:Number(supplier.commissionPercent||0),depositPercent:Number(supplier.depositPer`.
- Line 62: `const saveDeposit=useMutation({mutationFn:()=>createHospitalityDeposit({...deposit,amount:Number(deposit.amount),paidAmount:Number(deposit.paidAmount||0)}),onSuccess:()=>{setDeposi`.
- Line 63: `const toggleRate=useMutation({mutationFn:r=>updateRatePlan(r._id,{stopSell:!r.stopSell}),onSuccess:()=>{invalidate(["hospitality-rate-plans"]);success("Rate plan selling status upd`.
- Line 64: `const toggleSupplier=useMutation({mutationFn:s=>updateSupplierContract(s._id,{status:s.status==="active"?"inactive":"active"}),onSuccess:()=>{invalidate(["hospitality-suppliers"]);`.
- Line 65: `const recordDeposit=useMutation({mutationFn:({d,paidAmount})=>updateHospitalityDeposit(d._id,{paidAmount:Number(paidAmount)}),onSuccess:()=>{invalidate(["hospitality-deposits"]);su`.
- Line 67: `const rateValidation=()=>{`.
- Line 77: `const submitRate=()=>{const message=rateValidation();if(message){setNotice({type:"error",msg:message});return;}saveRate.mutate();};`.
- Line 79: `const metrics=useMemo(()=>({rates:rates.length,suppliers:suppliers.length,outstanding:deposits.filter(d=>["pending","partial"].includes(d.status)).reduce((s,d)=>s+Math.max(0,Number`.
- Line 80: `const recordDepositPayment=(d)=>{const paid=prompt("Record total amount received for this deposit ("+money(d.amount,d.currency)+")",String(d.paidAmount||0));if(paid!==null&&Number(`.
- Line 94: `const Metric=({label,value})=><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{labe`.
- Line 95: `const Field=({label,children})=><label className="block text-xs font-black uppercase tracking-wider text-slate-500">{label}<div className="mt-1.5">{children}</div></label>;`.
- Line 96: `const Form=({title,hint,children})=><div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div><h2 className="text-lg font-black text-slate-9`.
- Line 97: `const List=({title,children,loading})=><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h2 className="mb-4 text-lg font-black text-slate-900">{ti`.
- Line 98: `const Row=({title,meta,value,badge,action})=><div className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 lg:flex-row lg:items-center lg:justify-between">`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
