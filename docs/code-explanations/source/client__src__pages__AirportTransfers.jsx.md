# Source explanation: client/src/pages/AirportTransfers.jsx

**Source:** [client/src/pages/AirportTransfers.jsx](../../../client/src/pages/AirportTransfers.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useMemo`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Link` from `react-router-dom`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useMutation`, `useQuery` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Car`, `Check`, `Clock3`, `Luggage`, `MapPin`, `Plane`, `Search`, `ShieldCheck`, `Users`, `X` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `createTransferBooking`, `getAirportTransfers` from `../api/airportTransferApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/airportTransferApi](../../../client/src/api/airportTransferApi.js)

## Runtime declarations and data flow

### `field` — lines 8–8

Parameters: `label`, `control`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `money` — lines 9–9

Parameters: `value`, `currency (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `AirportTransfers` — lines 11–30

Parameters: none.
React hooks used: useQuery, useState, useMemo, useMutation.

Key statements:
- **Line 12:** `const { data = [], isLoading, isError } = useQuery({ queryKey: ["airport-transfers"], queryFn: getAirportTransfers, staleTime: 30000 });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 13:** `const [selected, setSelected] = useState(null);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 14:** `const [search, setSearch] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 15:** `const [form, setForm] = useState({ pickupDateTime: "", pickupLocation: "", dropoffLocation: "", passengerName: "", passengerPhone: "", passengerEmail: "", passengers: 1, luggage: 0, flightNumber: "", airline: "", termina` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 16:** `const update = (key, value) => setForm(f => ({ ...f, [key]: value }));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 17:** `const filtered = useMemo(() => data.filter(x => { const publicText = \`${x.name || ""} ${x.description || ""} ${x.airportName || ""} ${x.airportCode || ""} ${x.pickupLocation || ""} ${x.dropoffLocation || ""} ${x.vehicle` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 18:** `const booking = useMutation({ mutationFn: createTransferBooking, onSuccess: d => setSelected({ success: d }), onError: e => window.alert(e?.response?.data?.message || "Unable to create the transfer request. Please sign i` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 19:** `const choose = item => { setSelected({ item }); setForm(f => ({ ...f, pickupLocation: item.pickupLocation || "", dropoffLocation: item.dropoffLocation || "", passengers: 1, luggage: 0, pickupDateTime: "", flightNumber: "` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 20:** `const total = selected?.item ? (selected.item.pricingModel === "per_passenger" ? Number(selected.item.price || 0) * Number(form.passengers || 1) : Number(selected.item.price || 0)) : 0;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 21:** `const valid = selected?.item && form.pickupDateTime && form.passengerName.trim() && form.passengerPhone.trim() && form.pickupLocation.trim() && form.dropoffLocation.trim() && Number(form.passengers) >= 1 && Number(form.p` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 23:** `return <main className="min-h-screen bg-slate-50">` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `update` — lines 16–16

Parameters: `key`, `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `choose` — lines 19–19

Parameters: `item`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `TransferCard` — lines 32–32

Parameters: `{item, onChoose}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `BookingModal` — lines 34–34

Parameters: `{item, form, update, total, valid, booking, onClose}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `SuccessModal` — lines 36–36

Parameters: `{booking, onClose}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 7: `const input = "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-e`.
- Line 8: `const field = (label, control) => <label className="text-sm font-semibold text-slate-700">{label}{control}</label>;`.
- Line 9: `const money = (value, currency = "KES") => \`${currency} ${Number(value || 0).toLocaleString("en-KE", { maximumFractionDigits: 2 })}\`;`.
- Line 12: `const { data = [], isLoading, isError } = useQuery({ queryKey: ["airport-transfers"], queryFn: getAirportTransfers, staleTime: 30000 });`.
- Line 13: `const [selected, setSelected] = useState(null);`.
- Line 14: `const [search, setSearch] = useState("");`.
- Line 15: `const [form, setForm] = useState({ pickupDateTime: "", pickupLocation: "", dropoffLocation: "", passengerName: "", passengerPhone: "", passengerEmail: "", passengers: 1, luggage: 0`.
- Line 16: `const update = (key, value) => setForm(f => ({ ...f, [key]: value }));`.
- Line 17: `const filtered = useMemo(() => data.filter(x => { const publicText = \`${x.name || ""} ${x.description || ""} ${x.airportName || ""} ${x.airportCode || ""} ${x.pickupLocation || ""`.
- Line 18: `const booking = useMutation({ mutationFn: createTransferBooking, onSuccess: d => setSelected({ success: d }), onError: e => window.alert(e?.response?.data?.message || "Unable to cr`.
- Line 19: `const choose = item => { setSelected({ item }); setForm(f => ({ ...f, pickupLocation: item.pickupLocation || "", dropoffLocation: item.dropoffLocation || "", passengers: 1, luggage`.
- Line 20: `const total = selected?.item ? (selected.item.pricingModel === "per_passenger" ? Number(selected.item.price || 0) * Number(form.passengers || 1) : Number(selected.item.price || 0))`.
- Line 21: `const valid = selected?.item && form.pickupDateTime && form.passengerName.trim() && form.passengerPhone.trim() && form.pickupLocation.trim() && form.dropoffLocation.trim() && Numbe`.
- Line 32: `function TransferCard({ item, onChoose }) { return <article className="group overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200/70 transition hover:-translate-y-1`.
- Line 34: `function BookingModal({ item, form, update, total, valid, booking, onClose }) { return <div className="fixed inset-0 z-[60] overflow-y-auto bg-slate-950/75 p-3 backdrop-blur-sm md:`.
- Line 36: `function SuccessModal({ booking, onClose }) { return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm"><div className="w-f`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
