# Source explanation: client/src/pages/HotelsMarketplace.jsx

**Source:** [client/src/pages/HotelsMarketplace.jsx](../../../client/src/pages/HotelsMarketplace.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useMemo`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Link` from `react-router-dom`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useQuery` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `BedDouble`, `Building2`, `CheckCircle2`, `MapPin`, `Search`, `ShieldCheck`, `Star` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getHotels`, `hotelQueryScope` from `../api/hotelApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/hotelApi](../../../client/src/api/hotelApi.js)

## Runtime declarations and data flow

### `money` — lines 9–9

Parameters: `value`, `currency (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `HotelsMarketplace` — lines 10–21

Parameters: none.
React hooks used: useQuery, useState, useMemo. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 11:** `const { data = [], isLoading, isError } = useQuery({ queryKey: ["public-hotels", hotelQueryScope()], queryFn: getHotels, staleTime: 30000 });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 12:** `const [search, setSearch] = useState(""); const [city, setCity] = useState("all");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 15:** `const publicHotels = useMemo(() => data, [data]);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 16:** `const cities = useMemo(() => [...new Set(publicHotels.map(h => h.city || h.county).filter(Boolean))].sort(), [publicHotels]);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 17:** `const filtered = useMemo(() => publicHotels` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 20:** `return <main className="min-h-screen bg-slate-50"><section className="relative overflow-hidden bg-slate-950 text-white"><div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(16,185,129,.3),transpare` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `Trust` — lines 22–22

Parameters: `{title, text}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Empty` — lines 23–23

Parameters: `{title, text}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 7: `const HOTEL_IMAGES = { "Global Demo Nairobi Hotel": "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=85", "Global Demo Coast Resort": "ht`.
- Line 8: `const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1601918774946-25832a4be0d6?auto=format&fit=crop&w=1200&q=85";`.
- Line 9: `const money = (value, currency = "KES") => \`${currency} ${Number(value || 0).toLocaleString("en-KE", { maximumFractionDigits: 0 })}\`;`.
- Line 11: `const { data = [], isLoading, isError } = useQuery({ queryKey: ["public-hotels", hotelQueryScope()], queryFn: getHotels, staleTime: 30000 });`.
- Line 12: `const [search, setSearch] = useState(""); const [city, setCity] = useState("all");`.
- Line 15: `const publicHotels = useMemo(() => data, [data]);`.
- Line 16: `const cities = useMemo(() => [...new Set(publicHotels.map(h => h.city || h.county).filter(Boolean))].sort(), [publicHotels]);`.
- Line 17: `const filtered = useMemo(() => publicHotels`.
- Line 22: `function Trust({title,text}){return <div className="rounded-2xl bg-slate-50 p-5"><CheckCircle2 className="text-emerald-600" size={20}/><h3 className="mt-3 font-black text-slate-950`.
- Line 23: `function Empty({title,text}){return <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-14 text-center"><Building2 className="mx-auto text-slate-300" size=`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
