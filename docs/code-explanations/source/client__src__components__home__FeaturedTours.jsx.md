# Source explanation: client/src/components/home/FeaturedTours.jsx

**Source:** [client/src/components/home/FeaturedTours.jsx](../../../client/src/components/home/FeaturedTours.jsx)

## Purpose

A reusable UI component used by one or more pages/layouts. Props and callbacks form its input/output boundary.

## Imports and dependencies

- `getTourImage`, `TOUR_FALLBACK_IMAGES` from `../../utils/tourImage`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/utils/tourImage](../../../client/src/utils/tourImage.js)
- `useQuery` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Link` from `react-router-dom`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `ArrowRight`, `Clock3`, `MapPin`, `Star` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getFeaturedTours` from `../../api/tourApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/tourApi](../../../client/src/api/tourApi.js)
- `LazyImage` from `../common/LazyImage`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/components/common/LazyImage](../../../client/src/components/common/LazyImage.jsx)
- `useTenant` from `../../context/TenantContext`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/context/TenantContext](../../../client/src/context/TenantContext.jsx)

## Runtime declarations and data flow

### `FeaturedTours` — lines 9–64

Parameters: none.
React hooks used: useQuery.

Key statements:
- **Line 10:** `const { tenant = {} } = useTenant() || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 11:** `const tenantKey = tenant?._id || tenant?.id || tenant?.slug || "public";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 12:** `const { data, isLoading, isError, refetch } = useQuery({ queryKey: ["featuredTours", tenantKey], queryFn: getFeaturedTours, staleTime: 1000 * 60 * 5 });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 13:** `const tours = Array.isArray(data) ? data : [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 15:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 35:** `const fallbackImage = TOUR_FALLBACK_IMAGES[index % TOUR_FALLBACK_IMAGES.length];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 36:** `const rating = Number(tour?.rating ?? tour?.averageRating ?? 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 37:** `const reviewCount = Number(tour?.reviewCount ?? tour?.reviewsCount ?? 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 38:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 10: `const { tenant = {} } = useTenant() || {};`.
- Line 11: `const tenantKey = tenant?._id || tenant?.id || tenant?.slug || "public";`.
- Line 12: `const { data, isLoading, isError, refetch } = useQuery({ queryKey: ["featuredTours", tenantKey], queryFn: getFeaturedTours, staleTime: 1000 * 60 * 5 });`.
- Line 13: `const tours = Array.isArray(data) ? data : [];`.
- Line 35: `const fallbackImage = TOUR_FALLBACK_IMAGES[index % TOUR_FALLBACK_IMAGES.length];`.
- Line 36: `const rating = Number(tour?.rating ?? tour?.averageRating ?? 0);`.
- Line 37: `const reviewCount = Number(tour?.reviewCount ?? tour?.reviewsCount ?? 0);`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
