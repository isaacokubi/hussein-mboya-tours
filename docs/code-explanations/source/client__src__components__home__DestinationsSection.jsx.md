# Source explanation: client/src/components/home/DestinationsSection.jsx

**Source:** [client/src/components/home/DestinationsSection.jsx](../../../client/src/components/home/DestinationsSection.jsx)

## Purpose

A reusable UI component used by one or more pages/layouts. Props and callbacks form its input/output boundary.

## Imports and dependencies

- `useQuery` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Link` from `react-router-dom`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `ArrowUpRight`, `MapPin` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getFeaturedDestinations` from `../../api/destinationApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/destinationApi](../../../client/src/api/destinationApi.js)
- `LazyImage` from `../common/LazyImage`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/components/common/LazyImage](../../../client/src/components/common/LazyImage.jsx)
- `useTenant` from `../../context/TenantContext`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/context/TenantContext](../../../client/src/context/TenantContext.jsx)

## Runtime declarations and data flow

### `DestinationsSection` — lines 8–20

Parameters: none.
React hooks used: useQuery. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 9:** `const { tenant = {} } = useTenant() || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 10:** `const tenantKey = tenant?._id || tenant?.id || tenant?.slug || "public";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 11:** `const { data = [], isLoading, isError, refetch } = useQuery({ queryKey: ["featuredDestinations", tenantKey], queryFn: getFeaturedDestinations, staleTime: 1000 * 60 * 10 });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 12:** `const destinations = Array.isArray(data) ? data : [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 13:** `if (isLoading) return <section className="py-12" aria-live="polite"><div className="mb-8 h-10 w-64 animate-pulse rounded bg-slate-200"/><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3].map((i)=><div key` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 14:** `if (isError) return <section className="rounded-3xl border border-amber-200 bg-amber-50 p-10 text-center text-amber-900" role="alert"><p className="font-bold">We are refreshing our destination guide.</p><p className="mt-` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 15:** `if (!destinations.length) return <section className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500">No destinations are currently published for this travel company.</section>;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 16:** `return <section aria-labelledby="destinations-heading">` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 9: `const { tenant = {} } = useTenant() || {};`.
- Line 10: `const tenantKey = tenant?._id || tenant?.id || tenant?.slug || "public";`.
- Line 11: `const { data = [], isLoading, isError, refetch } = useQuery({ queryKey: ["featuredDestinations", tenantKey], queryFn: getFeaturedDestinations, staleTime: 1000 * 60 * 10 });`.
- Line 12: `const destinations = Array.isArray(data) ? data : [];`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
