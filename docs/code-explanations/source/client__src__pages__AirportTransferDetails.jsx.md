# Source explanation: client/src/pages/AirportTransferDetails.jsx

**Source:** [client/src/pages/AirportTransferDetails.jsx](../../../client/src/pages/AirportTransferDetails.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `Link`, `useNavigate`, `useParams` from `react-router-dom`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useQuery` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `ArrowLeft`, `Car`, `CheckCircle2`, `Clock3`, `Luggage`, `MapPin`, `Plane`, `ShieldCheck`, `Users` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getAirportTransfer` from `../api/airportTransferApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/airportTransferApi](../../../client/src/api/airportTransferApi.js)

## Runtime declarations and data flow

### `money` — lines 6–6

Parameters: `value`, `currency (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `AirportTransferDetails` — lines 8–29

Parameters: none.
React hooks used: useQuery. 7 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 9:** `const { id } = useParams();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 10:** `const navigate = useNavigate();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 11:** `const reservationPath = \`/airport-transfers/${id}/reserve\`;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 12:** `const { data: item, isLoading, isError } = useQuery({ queryKey: ["airport-transfer", id], queryFn: () => getAirportTransfer(id), enabled: !!id, staleTime: 30000 });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 14:** `const openReservation = () => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 15:** `if (id) navigate(reservationPath);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 18:** `if (isLoading) return <main className="min-h-screen bg-slate-50 px-5 py-16"><div className="mx-auto max-w-6xl animate-pulse space-y-6"><div className="h-72 rounded-3xl bg-slate-200"/><div className="h-12 w-1/2 rounded bg` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 19:** `if (isError || !item) return <main className="min-h-screen bg-slate-50 px-5 py-20"><div className="mx-auto max-w-xl rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200"><Plane className="mx-auto text-sl` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 21:** `const publicListingText = \`${item.name || ""} ${item.description || ""} ${item.airportName || ""} ${item.airportCode || ""} ${item.pickupLocation || ""} ${item.dropoffLocation || ""} ${item.vehicleType || ""}\`;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 22:** `if (/\b(test|demo|synthetic|sample|placeholder|seed data)\b/i.test(publicListingText)) return <main className="min-h-screen bg-slate-50 px-5 py-20"><div className="mx-auto max-w-xl rounded-3xl bg-white p-10 text-center s` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 24:** `return <main className="min-h-screen bg-slate-50">` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `openReservation` — lines 14–16

Parameters: none.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 15:** `if (id) navigate(reservationPath);` — This branch gates the following work on a condition; test both true and false paths when changing it.

### `Stat` — lines 31–31

Parameters: `{icon, label, value}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Info` — lines 32–32

Parameters: `{label, value}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 6: `const money = (value, currency = "KES") => \`${currency} ${Number(value || 0).toLocaleString("en-KE", { maximumFractionDigits: 2 })}\`;`.
- Line 9: `const { id } = useParams();`.
- Line 10: `const navigate = useNavigate();`.
- Line 11: `const reservationPath = \`/airport-transfers/${id}/reserve\`;`.
- Line 12: `const { data: item, isLoading, isError } = useQuery({ queryKey: ["airport-transfer", id], queryFn: () => getAirportTransfer(id), enabled: !!id, staleTime: 30000 });`.
- Line 14: `const openReservation = () => {`.
- Line 21: `const publicListingText = \`${item.name || ""} ${item.description || ""} ${item.airportName || ""} ${item.airportCode || ""} ${item.pickupLocation || ""} ${item.dropoffLocation || `.
- Line 31: `function Stat({ icon, label, value }) { return <div className="bg-white p-5"><div className="flex items-center gap-2 text-emerald-600">{icon}</div><p className="mt-2 text-[10px] fo`.
- Line 32: `function Info({ label, value }) { return <div className="rounded-2xl bg-slate-50 p-5"><p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</p><p cl`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
