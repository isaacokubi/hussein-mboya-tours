# Source explanation: client/src/pages/AirportTransferReservation.jsx

**Source:** [client/src/pages/AirportTransferReservation.jsx](../../../client/src/pages/AirportTransferReservation.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Link`, `useNavigate`, `useSearchParams`, `useParams` from `react-router-dom`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useMutation`, `useQuery` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `ArrowLeft`, `Car`, `CheckCircle2`, `Clock3`, `Luggage`, `MapPin`, `Plane`, `ShieldCheck`, `Users` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `createTransferBooking`, `getAirportTransfer` from `../api/airportTransferApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/airportTransferApi](../../../client/src/api/airportTransferApi.js)

## Runtime declarations and data flow

### `money` — lines 8–8

Parameters: `value`, `currency (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `AirportTransferReservation` — lines 10–53

Parameters: none.
React hooks used: useQuery, useState, useMutation. 6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 11:** `const { id } = useParams();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 12:** `const [params] = useSearchParams();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 13:** `const navigate = useNavigate();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 14:** `const { data: item, isLoading, isError } = useQuery({ queryKey: ["airport-transfer-reservation", id], queryFn: () => getAirportTransfer(id), enabled: !!id, staleTime: 30000 });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 15:** `const [form, setForm] = useState({ pickupDateTime: "", pickupLocation: "", dropoffLocation: "", passengerName: "", passengerPhone: "", passengerEmail: "", passengers: 1, luggage: 0, flightNumber: "", airline: "", termina` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 16:** `const update = (key, value) => setForm(f => ({ ...f, [key]: value }));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 17:** `const booking = useMutation({ mutationFn: createTransferBooking, onSuccess: result => { const bookingId = result?._id || result?.id; if (bookingId) navigate(\`/hospitality-payment/${bookingId}?type=airport_transfer\`); }` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 18:** `const total = item ? (item.pricingModel === "per_passenger" ? Number(item.price || 0) * Number(form.passengers || 1) : Number(item.price || 0)) : 0;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 19:** `const valid = item && form.pickupDateTime && form.passengerName.trim() && form.passengerPhone.trim() && form.pickupLocation.trim() && form.dropoffLocation.trim() && Number(form.passengers) >= 1 && Number(form.passengers)` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 21:** `if (isLoading) return <main className="min-h-screen bg-slate-50 px-5 py-16"><div className="mx-auto max-w-5xl animate-pulse space-y-6"><div className="h-32 rounded-3xl bg-slate-200"/><div className="h-96 rounded-3xl bg-s` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 22:** `if (isError || !item) return <main className="min-h-screen bg-slate-50 px-5 py-20"><div className="mx-auto max-w-xl rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200"><Plane className="mx-auto text-sl` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 24:** `return <main className="min-h-screen bg-slate-50">` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `update` — lines 16–16

Parameters: `key`, `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Field` — lines 55–55

Parameters: `{label, children}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Summary` — lines 56–56

Parameters: `{icon, label, value}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 7: `const input = "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-e`.
- Line 8: `const money = (value, currency = "KES") => \`${currency} ${Number(value || 0).toLocaleString("en-KE", { maximumFractionDigits: 2 })}\`;`.
- Line 11: `const { id } = useParams();`.
- Line 12: `const [params] = useSearchParams();`.
- Line 13: `const navigate = useNavigate();`.
- Line 14: `const { data: item, isLoading, isError } = useQuery({ queryKey: ["airport-transfer-reservation", id], queryFn: () => getAirportTransfer(id), enabled: !!id, staleTime: 30000 });`.
- Line 15: `const [form, setForm] = useState({ pickupDateTime: "", pickupLocation: "", dropoffLocation: "", passengerName: "", passengerPhone: "", passengerEmail: "", passengers: 1, luggage: 0`.
- Line 16: `const update = (key, value) => setForm(f => ({ ...f, [key]: value }));`.
- Line 17: `const booking = useMutation({ mutationFn: createTransferBooking, onSuccess: result => { const bookingId = result?._id || result?.id; if (bookingId) navigate(\`/hospitality-payment/`.
- Line 18: `const total = item ? (item.pricingModel === "per_passenger" ? Number(item.price || 0) * Number(form.passengers || 1) : Number(item.price || 0)) : 0;`.
- Line 19: `const valid = item && form.pickupDateTime && form.passengerName.trim() && form.passengerPhone.trim() && form.pickupLocation.trim() && form.dropoffLocation.trim() && Number(form.pas`.
- Line 55: `function Field({ label, children }) { return <label className="text-sm font-semibold text-slate-700">{label}{children}</label>; }`.
- Line 56: `function Summary({ icon, label, value }) { return <div className="rounded-2xl bg-white p-4"><div className="flex items-center gap-2 text-emerald-600">{icon}</div><p className="mt-2`.

## Security, errors and performance checkpoints

- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
