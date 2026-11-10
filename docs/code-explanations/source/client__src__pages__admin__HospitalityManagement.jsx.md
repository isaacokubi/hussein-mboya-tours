# Source explanation: client/src/pages/admin/HospitalityManagement.jsx

**Source:** [client/src/pages/admin/HospitalityManagement.jsx](../../../client/src/pages/admin/HospitalityManagement.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useMemo`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useMutation`, `useQuery`, `useQueryClient` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Building2`, `BedDouble`, `Car`, `CheckCircle2`, `ChevronDown`, `Clock3`, `Edit3`, `ExternalLink`, `MapPin`, `PackagePlus`, `Plane`, `Plus`, `RefreshCw`, `Search`, `ShieldCheck`, `WalletCards`, `X` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useSearchParams`, `Link` from `react-router-dom`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `createHotel`, `createRoomType`, `getAdminHotels`, `getHotelBookings`, `updateHotel`, `updateHotelBooking`, `updateRoomType` from `../../api/hotelApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/hotelApi](../../../client/src/api/hotelApi.js)
- `createTransfer`, `getAdminTransfers`, `getTransferBookings`, `updateTransfer`, `updateTransferBooking` from `../../api/airportTransferApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/airportTransferApi](../../../client/src/api/airportTransferApi.js)

## Runtime declarations and data flow

### `money` — lines 12–12

Parameters: `v`, `c (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `unwrap` — lines 13–13

Parameters: `v`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `err` — lines 14–14

Parameters: `e`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `nice` — lines 15–15

Parameters: `v`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `HospitalityManagement` — lines 17–47

Parameters: none.
React hooks used: useState, useQuery, useMutation, useMemo. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 18:** `const qc=useQueryClient(); const [params,setParams]=useSearchParams(); const tab=["hotels","transfers","bookings"].includes(params.get("tab"))?params.get("tab"):"hotels";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 19:** `const [hotelForm,setHotelForm]=useState(hotelInitial),[roomForm,setRoomForm]=useState(roomInitial),[transferForm,setTransferForm]=useState(transferInitial);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 20:** `const [roomOpen,setRoomOpen]=useState(true),[hotelOpen,setHotelOpen]=useState(true),[transferOpen,setTransferOpen]=useState(true),[hotelSearch,setHotelSearch]=useState(""),[transferSearch,setTransferSearch]=useState(""),` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 21:** `const hq=useQuery({queryKey:["admin-hotels"],queryFn:getAdminHotels,staleTime:0,retry:1}),tq=useQuery({queryKey:["admin-transfers"],queryFn:getAdminTransfers,staleTime:0,retry:1}),hb=useQuery({queryKey:["hotel-bookings"]` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 22:** `const hotels=unwrap(hq.data),transfers=unwrap(tq.data),hotelBookings=unwrap(hb.data),transferBookings=unwrap(tb.data);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 23:** `const rooms=hotels.reduce((n,h)=>n+(h.roomTypes?.length||0),0),activeHotels=hotels.filter(h=>h.status==="active").length,activeTransfers=transfers.filter(t=>t.status==="active").length,reservations=hotelBookings.length+t` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 24:** `const refresh=()=>[hq,tq,hb,tb].forEach(q=>q.refetch());` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 25:** `const createHotelM=useMutation({mutationFn:createHotel,onSuccess:()=>{qc.invalidateQueries({queryKey:["admin-hotels"]});setHotelForm(hotelInitial)},onError:e=>window.alert(err(e))});` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 26:** `const createRoomM=useMutation({mutationFn:({hotelId,payload})=>createRoomType(hotelId,payload),onSuccess:()=>{qc.invalidateQueries({queryKey:["admin-hotels"]});setRoomForm(roomInitial)},onError:e=>window.alert(err(e))});` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 27:** `const updateRoomM=useMutation({mutationFn:({id,payload})=>updateRoomType(id,payload),onSuccess:()=>qc.invalidateQueries({queryKey:["admin-hotels"]}),onError:e=>window.alert(err(e))});` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 28:** `const updateHotelM=useMutation({mutationFn:({id,payload})=>updateHotel(id,payload),onSuccess:()=>qc.invalidateQueries({queryKey:["admin-hotels"]}),onError:e=>window.alert(err(e))});` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 29:** `const createTransferM=useMutation({mutationFn:createTransfer,onSuccess:()=>{qc.invalidateQueries({queryKey:["admin-transfers"]});setTransferForm(transferInitial)},onError:e=>window.alert(err(e))});` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 30:** `const updateTransferM=useMutation({mutationFn:({id,payload})=>updateTransfer(id,payload),onSuccess:()=>qc.invalidateQueries({queryKey:["admin-transfers"]}),onError:e=>window.alert(err(e))});` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 31:** `const updateHotelBookingM=useMutation({mutationFn:({id,status})=>updateHotelBooking(id,{status}),onSuccess:()=>qc.invalidateQueries({queryKey:["hotel-bookings"]}),onError:e=>window.alert(err(e))});` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 32:** `const updateTransferBookingM=useMutation({mutationFn:({id,status})=>updateTransferBooking(id,{status}),onSuccess:()=>qc.invalidateQueries({queryKey:["transfer-bookings"]}),onError:e=>window.alert(err(e))});` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 33:** `const fh=useMemo(()=>hotels.filter(h=>\`${h.name} ${h.city} ${h.county} ${h.location}\`.toLowerCase().includes(hotelSearch.toLowerCase())),[hotels,hotelSearch]);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 34:** `const ft=useMemo(()=>transfers.filter(t=>\`${t.name} ${t.airportName} ${t.airportCode} ${t.pickupLocation} ${t.dropoffLocation}\`.toLowerCase().includes(transferSearch.toLowerCase())),[transfers,transferSearch]);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 35:** `const filteredHB=hotelBookings.filter(b=>(bookingStatus==="all"||b.status===bookingStatus)&&\`${b.reference} ${b.hotel?.name||""} ${b.customer?.name||""}\`.toLowerCase().includes(bookingSearch.toLowerCase()));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `refresh` — lines 24–24

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `HotelPanel` — lines 48–48

Parameters: `{hotel, updateHotel, updateRoom, onAddRoom}`.
React hooks used: useState.

Key statements:
- **Line 48:** `function HotelPanel({hotel,updateHotel,updateRoom,onAddRoom}){const [open,setOpen]=useState(true),[edit,setEdit]=useState(false),[form,setForm]=useState(()=>({...hotel,amenities:Array.isArray(hotel.amenities)?hotel.ameni` — Uses a React hook to manage component state, side effects, memoization, or server state.

### `patch` — lines 48–48

Parameters: `k`, `v`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `save` — lines 48–48

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `HotelEditModal` — lines 49–49

Parameters: `{form, patch, save, busy, close}`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:

### `RoomRow` — lines 50–50

Parameters: `{room, update}`.
React hooks used: useState.

Key statements:
- **Line 50:** `function RoomRow({room,update}){const [edit,setEdit]=useState(false),[form,setForm]=useState(()=>({...room,beds:Array.isArray(room.beds)?room.beds.join(", "):room.beds||"",amenities:Array.isArray(room.amenities)?room.ame` — Uses a React hook to manage component state, side effects, memoization, or server state.

### `patch` — lines 50–50

Parameters: `k`, `v`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `save` — lines 50–50

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `TransferPanel` — lines 51–51

Parameters: `{transfer, update}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `ReservationList` — lines 52–52

Parameters: `{title, rows, type, update}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Form` — lines 53–53

Parameters: `{title, icon, open, setOpen, children}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Field` — lines 54–54

Parameters: `{label, children}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `SearchBox` — lines 55–55

Parameters: `{value, onChange, placeholder}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Kpi` — lines 56–56

Parameters: `{icon, label, value}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Tab` — lines 57–57

Parameters: `{active, onClick, icon, children}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Badge` — lines 58–58

Parameters: `{children}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Status` — lines 59–59

Parameters: `{value}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Empty` — lines 60–60

Parameters: `{icon, title, text}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 8: `const input="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-`.
- Line 9: `const hotelInitial={name:"",location:"",address:"",city:"",county:"",country:"Kenya",starRating:3,description:"",contactPhone:"",contactEmail:"",checkInTime:"14:00",checkOutTime:"1`.
- Line 10: `const roomInitial={hotelId:"",name:"",description:"",totalRooms:1,availableRooms:1,nightlyRate:0,maxAdults:2,maxChildren:1,beds:"Double bed",mealPlans:"room_only",currency:"KES",st`.
- Line 11: `const transferInitial={name:"",airportName:"Jomo Kenyatta International Airport",airportCode:"NBO",direction:"airport_to_destination",pickupLocation:"JKIA Arrivals",dropoffLocation`.
- Line 12: `const money=(v,c="KES")=>\`${c} ${Number(v||0).toLocaleString("en-KE",{maximumFractionDigits:2})}\`;`.
- Line 13: `const unwrap=v=>Array.isArray(v)?v:(v?.items||v?.data||v?.hotels||v?.transfers||v?.bookings||[]);`.
- Line 14: `const err=e=>e?.response?.data?.message||e?.message||"The operation could not be completed.";`.
- Line 15: `const nice=v=>String(v||"").replaceAll("_"," ").replace(/\b\w/g,m=>m.toUpperCase());`.
- Line 18: `const qc=useQueryClient(); const [params,setParams]=useSearchParams(); const tab=["hotels","transfers","bookings"].includes(params.get("tab"))?params.get("tab"):"hotels";`.
- Line 19: `const [hotelForm,setHotelForm]=useState(hotelInitial),[roomForm,setRoomForm]=useState(roomInitial),[transferForm,setTransferForm]=useState(transferInitial);`.
- Line 20: `const [roomOpen,setRoomOpen]=useState(true),[hotelOpen,setHotelOpen]=useState(true),[transferOpen,setTransferOpen]=useState(true),[hotelSearch,setHotelSearch]=useState(""),[transfe`.
- Line 21: `const hq=useQuery({queryKey:["admin-hotels"],queryFn:getAdminHotels,staleTime:0,retry:1}),tq=useQuery({queryKey:["admin-transfers"],queryFn:getAdminTransfers,staleTime:0,retry:1}),`.
- Line 22: `const hotels=unwrap(hq.data),transfers=unwrap(tq.data),hotelBookings=unwrap(hb.data),transferBookings=unwrap(tb.data);`.
- Line 23: `const rooms=hotels.reduce((n,h)=>n+(h.roomTypes?.length||0),0),activeHotels=hotels.filter(h=>h.status==="active").length,activeTransfers=transfers.filter(t=>t.status==="active").le`.
- Line 24: `const refresh=()=>[hq,tq,hb,tb].forEach(q=>q.refetch());`.
- Line 25: `const createHotelM=useMutation({mutationFn:createHotel,onSuccess:()=>{qc.invalidateQueries({queryKey:["admin-hotels"]});setHotelForm(hotelInitial)},onError:e=>window.alert(err(e))}`.
- Line 26: `const createRoomM=useMutation({mutationFn:({hotelId,payload})=>createRoomType(hotelId,payload),onSuccess:()=>{qc.invalidateQueries({queryKey:["admin-hotels"]});setRoomForm(roomInit`.
- Line 27: `const updateRoomM=useMutation({mutationFn:({id,payload})=>updateRoomType(id,payload),onSuccess:()=>qc.invalidateQueries({queryKey:["admin-hotels"]}),onError:e=>window.alert(err(e))`.
- Line 28: `const updateHotelM=useMutation({mutationFn:({id,payload})=>updateHotel(id,payload),onSuccess:()=>qc.invalidateQueries({queryKey:["admin-hotels"]}),onError:e=>window.alert(err(e))})`.
- Line 29: `const createTransferM=useMutation({mutationFn:createTransfer,onSuccess:()=>{qc.invalidateQueries({queryKey:["admin-transfers"]});setTransferForm(transferInitial)},onError:e=>window`.
- Line 30: `const updateTransferM=useMutation({mutationFn:({id,payload})=>updateTransfer(id,payload),onSuccess:()=>qc.invalidateQueries({queryKey:["admin-transfers"]}),onError:e=>window.alert(`.
- Line 31: `const updateHotelBookingM=useMutation({mutationFn:({id,status})=>updateHotelBooking(id,{status}),onSuccess:()=>qc.invalidateQueries({queryKey:["hotel-bookings"]}),onError:e=>window`.
- Line 32: `const updateTransferBookingM=useMutation({mutationFn:({id,status})=>updateTransferBooking(id,{status}),onSuccess:()=>qc.invalidateQueries({queryKey:["transfer-bookings"]}),onError:`.
- Line 33: `const fh=useMemo(()=>hotels.filter(h=>\`${h.name} ${h.city} ${h.county} ${h.location}\`.toLowerCase().includes(hotelSearch.toLowerCase())),[hotels,hotelSearch]);`.
- Line 34: `const ft=useMemo(()=>transfers.filter(t=>\`${t.name} ${t.airportName} ${t.airportCode} ${t.pickupLocation} ${t.dropoffLocation}\`.toLowerCase().includes(transferSearch.toLowerCase(`.
- Line 35: `const filteredHB=hotelBookings.filter(b=>(bookingStatus==="all"||b.status===bookingStatus)&&\`${b.reference} ${b.hotel?.name||""} ${b.customer?.name||""}\`.toLowerCase().includes(b`.
- Line 36: `const filteredTB=transferBookings.filter(b=>(bookingStatus==="all"||b.status===bookingStatus)&&\`${b.reference} ${b.transfer?.name||""} ${b.passengerName||""}\`.toLowerCase().inclu`.
- Line 48: `function HotelPanel({hotel,updateHotel,updateRoom,onAddRoom}){const [open,setOpen]=useState(true),[edit,setEdit]=useState(false),[form,setForm]=useState(()=>({...hotel,amenities:Ar`.
- Line 49: `function HotelEditModal({form,patch,save,busy,close}){return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" onMouseDown={e=>{if(e.target==`.
- Line 50: `function RoomRow({room,update}){const [edit,setEdit]=useState(false),[form,setForm]=useState(()=>({...room,beds:Array.isArray(room.beds)?room.beds.join(", "):room.beds||"",amenitie`.
- Line 51: `function TransferPanel({transfer,update}){return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-col gap-4 lg:flex-row lg:`.
- Line 52: `function ReservationList({title,rows,type,update}){return <div className="rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 p-5"><h3`.
- Line 53: `function Form({title,icon:Icon,open,setOpen,children}){return <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><button className="flex w-full`.
- Line 54: `function Field({label,children}){return <label className="block"><span className="mb-1.5 block text-[11px] font-black uppercase tracking-[.08em] text-slate-500">{label}</span>{chil`.
- Line 55: `function SearchBox({value,onChange,placeholder}){return <div className="flex min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3"><Search size={16} classNam`.
- Line 56: `function Kpi({icon:Icon,label,value}){return <div className="rounded-2xl border border-white/10 bg-white/10 p-4"><Icon size={18} className="text-emerald-300"/><p className="mt-3 te`.
- Line 57: `function Tab({active,onClick,icon:Icon,children}){return <button onClick={onClick} className={\`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black ${active?`.
- Line 58: `function Badge({children}){return <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700">{children}</span>}`.
- Line 59: `function Status({value}){return <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-600">{nice(value||"draft")}</span>}`.
- Line 60: `function Empty({icon:Icon,title,text}){return <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center"><Icon className="mx-auto text-slate-300" `.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
