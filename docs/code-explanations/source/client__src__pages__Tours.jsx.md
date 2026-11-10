# Source explanation: client/src/pages/Tours.jsx

**Source:** [client/src/pages/Tours.jsx](../../../client/src/pages/Tours.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useTenant` from `../context/TenantContext`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/context/TenantContext](../../../client/src/context/TenantContext.jsx)
- `useSettings` from `../context/SettingsContext`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/context/SettingsContext](../../../client/src/context/SettingsContext.jsx)
- `useQuery` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useSearchParams` from `react-router-dom`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Search`, `SlidersHorizontal` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `TourCard` from `../components/tours/TourCard`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/components/tours/TourCard](../../../client/src/components/tours/TourCard.jsx)
- `getTours` from `../api/tourApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/tourApi](../../../client/src/api/tourApi.js)

## Runtime declarations and data flow

### `Tours` — lines 9–77

Parameters: none.
React hooks used: useQuery. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 10:** `const { tenant } = useTenant();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 11:** `const { settings } = useSettings();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 12:** `const [searchParams, setSearchParams] = useSearchParams();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 13:** `const destinationId = searchParams.get("destination") || "";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 14:** `const category = searchParams.get("category") || "";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 15:** `const search = searchParams.get("search") || "";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 16:** `const duration = searchParams.get("duration") || "";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 17:** `const travellers = searchParams.get("travellers") || "";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 18:** `const page = Math.max(1, Number(searchParams.get("page")) || 1);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 20:** `const { data, isLoading, error } = useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 34:** `if (isLoading) return <div className="min-h-[500px] bg-slate-950 flex items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent" /></div>;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 35:** `if (error) return <div className="min-h-[400px] bg-slate-950 px-6 py-20 text-center text-white"><h2 className="text-2xl font-bold">We are refreshing our tour inventory.</h2><p className="mt-2 text-slate-400">Please try a` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 37:** `const allTours = Array.isArray(data) ? data : data?.data || data?.tours || [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 38:** `const totalPages = Number(data?.pagination?.pages || 1);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 39:** `const tours = (Array.isArray(allTours) ? allTours : []).filter((tour) => { const days = Number((tour?.durationDays ?? tour?.durationDetails?.days ?? String(tour?.duration || "").match(/\d+/)?.[0]) || 0); const withinDura` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 41:** `const updateSearch = (event) => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 43:** `const value = new FormData(event.currentTarget).get("search")?.toString().trim() || "";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 44:** `const next = new URLSearchParams(searchParams);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `updateSearch` — lines 41–48

Parameters: `event`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 43:** `const value = new FormData(event.currentTarget).get("search")?.toString().trim() || "";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 44:** `const next = new URLSearchParams(searchParams);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 45:** `if (value) next.set("search", value); else next.delete("search");` — This branch gates the following work on a condition; test both true and false paths when changing it.

## Module-level declarations

- Line 10: `const { tenant } = useTenant();`.
- Line 11: `const { settings } = useSettings();`.
- Line 12: `const [searchParams, setSearchParams] = useSearchParams();`.
- Line 13: `const destinationId = searchParams.get("destination") || "";`.
- Line 14: `const category = searchParams.get("category") || "";`.
- Line 15: `const search = searchParams.get("search") || "";`.
- Line 16: `const duration = searchParams.get("duration") || "";`.
- Line 17: `const travellers = searchParams.get("travellers") || "";`.
- Line 18: `const page = Math.max(1, Number(searchParams.get("page")) || 1);`.
- Line 20: `const { data, isLoading, error } = useQuery({`.
- Line 37: `const allTours = Array.isArray(data) ? data : data?.data || data?.tours || [];`.
- Line 38: `const totalPages = Number(data?.pagination?.pages || 1);`.
- Line 39: `const tours = (Array.isArray(allTours) ? allTours : []).filter((tour) => { const days = Number((tour?.durationDays ?? tour?.durationDetails?.days ?? String(tour?.duration || "").ma`.
- Line 41: `const updateSearch = (event) => {`.
- Line 43: `const value = new FormData(event.currentTarget).get("search")?.toString().trim() || "";`.
- Line 44: `const next = new URLSearchParams(searchParams);`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
