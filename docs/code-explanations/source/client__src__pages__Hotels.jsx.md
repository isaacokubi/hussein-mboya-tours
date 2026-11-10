# Source explanation: client/src/pages/Hotels.jsx

**Source:** [client/src/pages/Hotels.jsx](../../../client/src/pages/Hotels.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useMemo`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Link` from `react-router-dom`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useMutation`, `useQuery` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Building2`, `BedDouble`, `CalendarDays`, `Check`, `Clock3`, `Coffee`, `MapPin`, `Search`, `ShieldCheck`, `Star`, `Users`, `X` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `createHotelBooking`, `getHotelAvailability`, `getHotels` from `../api/hotelApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/hotelApi](../../../client/src/api/hotelApi.js)

## Runtime declarations and data flow

### `Field` — lines 8–8

Parameters: `label`, `control`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `money` — lines 9–9

Parameters: `value`, `currency (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `niceMeal` — lines 10–10

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `dateOnly` — lines 11–11

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Hotels` — lines 13–39

Parameters: none.
React hooks used: useQuery, useState, useMemo, useMutation. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 14:** `const { data = [], isLoading, isError } = useQuery({ queryKey: ["public-hotels"], queryFn: getHotels, staleTime: 30000 });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 15:** `const [selected, setSelected] = useState(null);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 16:** `const [search, setSearch] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 17:** `const [stay, setStay] = useState({ checkIn: "", checkOut: "", rooms: 1, adults: 2, children: 0 });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 18:** `const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", email: "", mealPlan: "room_only", estimatedArrivalTime: "", bedPreference: "", dietaryRequirements: "", accessibilityNeeds: "", airportTransferRe` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 19:** `const updateStay = (key, value) => setStay(s => ({ ...s, [key]: value }));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 20:** `const updateForm = (key, value) => setForm(f => ({ ...f, [key]: value }));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 21:** `const filtered = useMemo(() => data.filter(h => { const publicText = \`${h.name || ""} ${h.description || ""} ${h.location || ""} ${h.city || ""} ${h.county || ""}\`; const isDemoListing = /\b(test|demo|synthetic|sample|` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 22:** `const availability = useQuery({ queryKey: ["hotel-availability", selected?.hotel?._id, stay.checkIn, stay.checkOut], queryFn: () => getHotelAvailability({ hotelId: selected.hotel._id, checkIn: stay.checkIn, checkOut: sta` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 23:** `const liveRooms = availability.data?.roomTypes || selected?.hotel?.roomTypes || [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 24:** `const selectedRoom = selected ? liveRooms.find(r => r._id === selected.room._id) || selected.room : null;` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 25:** `const nights = stay.checkIn && stay.checkOut && dateOnly(stay.checkOut) > dateOnly(stay.checkIn) ? Math.ceil((dateOnly(stay.checkOut) - dateOnly(stay.checkIn)) / 86400000) : 0;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 26:** `const total = nights * Number(selectedRoom?.nightlyRate || 0) * Number(stay.rooms || 1);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 27:** `const booking = useMutation({ mutationFn: createHotelBooking, onSuccess: d => { setSelected({ success: d }); }, onError: e => window.alert(e?.response?.data?.message || "Unable to create the hotel reservation. Please sig` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 28:** `const choose = hotel => { setSelected({ hotel, room: hotel.roomTypes?.[0] || null }); if (hotel.roomTypes?.[0]) updateForm("mealPlan", hotel.roomTypes[0].mealPlans?.[0] || "room_only"); };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 29:** `const chooseRoom = room => { setSelected(s => ({ ...s, room })); updateForm("mealPlan", room.mealPlans?.[0] || "room_only"); };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 30:** `const canBook = selectedRoom && Number(selectedRoom.availableRooms ?? selectedRoom.totalRooms ?? 0) >= Number(stay.rooms) && nights > 0 && form.firstName.trim() && form.lastName.trim() && form.phone.trim() && form.email.` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 32:** `return <main className="min-h-screen bg-slate-50">` — Exits this function and supplies its result (or response short-circuit) to the caller.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `updateStay` — lines 19–19

Parameters: `key`, `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `updateForm` — lines 20–20

Parameters: `key`, `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `choose` — lines 28–28

Parameters: `hotel`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:

### `chooseRoom` — lines 29–29

Parameters: `room`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `HotelCard` — lines 41–41

Parameters: `{hotel, onChoose}`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:

### `BookingModal` — lines 43–43

Parameters: `{selected, room, liveRooms, availability, stay, updateStay, form, updateForm, nights, total, chooseRoom, canBook, booking, onClose}`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:

### `SuccessModal` — lines 45–45

Parameters: `{booking, onClose}`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:

## Module-level declarations

- Line 7: `const input = "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-e`.
- Line 8: `const Field = (label, control) => <label className="text-sm font-semibold text-slate-700">{label}{control}</label>;`.
- Line 9: `const money = (value, currency = "KES") => \`${currency} ${Number(value || 0).toLocaleString("en-KE", { maximumFractionDigits: 2 })}\`;`.
- Line 10: `const niceMeal = value => String(value || "room_only").replaceAll("_", " ").replace(/\b\w/g, x => x.toUpperCase());`.
- Line 11: `const dateOnly = value => value ? new Date(\`${value}T00:00:00\`) : null;`.
- Line 14: `const { data = [], isLoading, isError } = useQuery({ queryKey: ["public-hotels"], queryFn: getHotels, staleTime: 30000 });`.
- Line 15: `const [selected, setSelected] = useState(null);`.
- Line 16: `const [search, setSearch] = useState("");`.
- Line 17: `const [stay, setStay] = useState({ checkIn: "", checkOut: "", rooms: 1, adults: 2, children: 0 });`.
- Line 18: `const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", email: "", mealPlan: "room_only", estimatedArrivalTime: "", bedPreference: "", dietaryRequirements: "", a`.
- Line 19: `const updateStay = (key, value) => setStay(s => ({ ...s, [key]: value }));`.
- Line 20: `const updateForm = (key, value) => setForm(f => ({ ...f, [key]: value }));`.
- Line 21: `const filtered = useMemo(() => data.filter(h => { const publicText = \`${h.name || ""} ${h.description || ""} ${h.location || ""} ${h.city || ""} ${h.county || ""}\`; const isDemoL`.
- Line 22: `const availability = useQuery({ queryKey: ["hotel-availability", selected?.hotel?._id, stay.checkIn, stay.checkOut], queryFn: () => getHotelAvailability({ hotelId: selected.hotel._`.
- Line 23: `const liveRooms = availability.data?.roomTypes || selected?.hotel?.roomTypes || [];`.
- Line 24: `const selectedRoom = selected ? liveRooms.find(r => r._id === selected.room._id) || selected.room : null;`.
- Line 25: `const nights = stay.checkIn && stay.checkOut && dateOnly(stay.checkOut) > dateOnly(stay.checkIn) ? Math.ceil((dateOnly(stay.checkOut) - dateOnly(stay.checkIn)) / 86400000) : 0;`.
- Line 26: `const total = nights * Number(selectedRoom?.nightlyRate || 0) * Number(stay.rooms || 1);`.
- Line 27: `const booking = useMutation({ mutationFn: createHotelBooking, onSuccess: d => { setSelected({ success: d }); }, onError: e => window.alert(e?.response?.data?.message || "Unable to `.
- Line 28: `const choose = hotel => { setSelected({ hotel, room: hotel.roomTypes?.[0] || null }); if (hotel.roomTypes?.[0]) updateForm("mealPlan", hotel.roomTypes[0].mealPlans?.[0] || "room_on`.
- Line 29: `const chooseRoom = room => { setSelected(s => ({ ...s, room })); updateForm("mealPlan", room.mealPlans?.[0] || "room_only"); };`.
- Line 30: `const canBook = selectedRoom && Number(selectedRoom.availableRooms ?? selectedRoom.totalRooms ?? 0) >= Number(stay.rooms) && nights > 0 && form.firstName.trim() && form.lastName.tr`.
- Line 41: `function HotelCard({ hotel, onChoose }) { return <article className="group overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200/70 transition hover:-translate-y-1 h`.
- Line 43: `function BookingModal({ selected, room, liveRooms, availability, stay, updateStay, form, updateForm, nights, total, chooseRoom, canBook, booking, onClose }) { const hotel = selecte`.
- Line 45: `function SuccessModal({ booking, onClose }) { return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm"><div className="w-f`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
