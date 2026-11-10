# Source explanation: client/src/pages/HotelDetails.jsx

**Source:** [client/src/pages/HotelDetails.jsx](../../../client/src/pages/HotelDetails.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `Link`, `useParams` from `react-router-dom`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useQuery` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `ArrowLeft`, `BedDouble`, `Building2`, `CheckCircle2`, `Clock3`, `Coffee`, `CreditCard`, `MapPin`, `ShieldCheck`, `Star`, `Users` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getPublicHotel`, `hotelQueryScope` from `../api/hotelApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/hotelApi](../../../client/src/api/hotelApi.js)

## Runtime declarations and data flow

### `money` — lines 8–8

Parameters: `value`, `currency (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `meal` — lines 9–9

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `HotelDetails` — lines 11–28

Parameters: none.
React hooks used: useQuery. 7 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 12:** `const { id } = useParams();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 13:** `const { data: hotel, isLoading, isError } = useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 19:** `if (isLoading) return <main className="min-h-screen bg-slate-50 px-5 py-16"><div className="mx-auto max-w-6xl animate-pulse space-y-6"><div className="h-80 rounded-3xl bg-slate-200"/><div className="h-10 w-1/2 rounded bg` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 20:** `if (isError || !hotel) return <main className="min-h-screen bg-slate-50 px-5 py-20"><div className="mx-auto max-w-xl rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200"><Building2 className="mx-auto te` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 24:** `const rooms = hotel.roomTypes || [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 25:** `const image = hotel.images?.[0] || HOTEL_IMAGES[hotel.name] || FALLBACK_IMAGE;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 26:** `const location = hotel.location || [hotel.city, hotel.county].filter(Boolean).join(", ") || "Kenya";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 27:** `return <main className="min-h-screen bg-slate-50"><section className="relative overflow-hidden bg-slate-950 text-white"><img src={image} alt={hotel.name} className="absolute inset-0 h-full w-full object-cover opacity-45"` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 6: `const HOTEL_IMAGES = { "Global Demo Nairobi Hotel": "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1600&q=85", "Global Demo Coast Resort": "ht`.
- Line 7: `const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1601918774946-25832a4be0d6?auto=format&fit=crop&w=1600&q=85";`.
- Line 8: `const money = (value, currency = "KES") => \`${currency} ${Number(value || 0).toLocaleString("en-KE", { maximumFractionDigits: 0 })}\`;`.
- Line 9: `const meal = value => String(value || "room_only").replaceAll("_", " ").replace(/\b\w/g, x => x.toUpperCase());`.
- Line 12: `const { id } = useParams();`.
- Line 13: `const { data: hotel, isLoading, isError } = useQuery({`.
- Line 24: `const rooms = hotel.roomTypes || [];`.
- Line 25: `const image = hotel.images?.[0] || HOTEL_IMAGES[hotel.name] || FALLBACK_IMAGE;`.
- Line 26: `const location = hotel.location || [hotel.city, hotel.county].filter(Boolean).join(", ") || "Kenya";`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
