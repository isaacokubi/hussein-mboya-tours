# Source explanation: client/src/pages/admin/ManageTours.jsx

**Source:** [client/src/pages/admin/ManageTours.jsx](../../../client/src/pages/admin/ManageTours.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Link` from `react-router-dom`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useMutation`, `useQuery`, `useQueryClient` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `toast` from `react-toastify`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `deleteTour`, `getAdminTours` from `../../api/adminTourApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/adminTourApi](../../../client/src/api/adminTourApi.js)

## Runtime declarations and data flow

### `getTourDestination` — lines 7–11

Parameters: `tour`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 8:** `const destination = tour?.destination;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 9:** `if (destination && typeof destination === "object") return destination;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 10:** `return null;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getTourList` — lines 13–19

Parameters: `data`.
4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 14:** `if (Array.isArray(data)) return data;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 15:** `if (Array.isArray(data?.tours)) return data.tours;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 16:** `if (Array.isArray(data?.data)) return data.data;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 17:** `if (Array.isArray(data?.data?.tours)) return data.data.tours;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 18:** `return [];` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `ManageTours` — lines 21–122

Parameters: none.
React hooks used: useState, useQuery, useMutation. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 22:** `const queryClient = useQueryClient();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 23:** `const [search, setSearch] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 24:** `const { data, isLoading, error } = useQuery({ queryKey: ["adminTours"], queryFn: getAdminTours });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 25:** `const tours = getTourList(data);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 27:** `const { mutate: removeTour, isPending } = useMutation({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 38:** `const filteredTours = tours.filter((tour) => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 39:** `const destination = getTourDestination(tour);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 40:** `const haystack = [tour?.title, destination?.name, destination?.slug, tour?.country, tour?.location]` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 44:** `return haystack.includes(search.trim().toLowerCase());` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 47:** `if (isLoading) return <div className="flex justify-center py-20">Loading tours...</div>;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 48:** `if (error) return <div className="p-6 text-red-600">Failed loading tours.</div>;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 50:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 79:** `const destination = getTourDestination(tour);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 80:** `const destinationSlug = destination?.slug || destination?._id;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 81:** `const destinationName = destination?.name || "Destination not assigned";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 82:** `const image = tour?.featuredImage?.url || tour?.image || tour?.images?.[0]?.url || tour?.images?.[0] || "/images/tour-placeholder.jpg";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 84:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 7: `const getTourDestination = (tour) => {`.
- Line 8: `const destination = tour?.destination;`.
- Line 13: `const getTourList = (data) => {`.
- Line 22: `const queryClient = useQueryClient();`.
- Line 23: `const [search, setSearch] = useState("");`.
- Line 24: `const { data, isLoading, error } = useQuery({ queryKey: ["adminTours"], queryFn: getAdminTours });`.
- Line 25: `const tours = getTourList(data);`.
- Line 27: `const { mutate: removeTour, isPending } = useMutation({`.
- Line 38: `const filteredTours = tours.filter((tour) => {`.
- Line 39: `const destination = getTourDestination(tour);`.
- Line 40: `const haystack = [tour?.title, destination?.name, destination?.slug, tour?.country, tour?.location]`.
- Line 79: `const destination = getTourDestination(tour);`.
- Line 80: `const destinationSlug = destination?.slug || destination?._id;`.
- Line 81: `const destinationName = destination?.name || "Destination not assigned";`.
- Line 82: `const image = tour?.featuredImage?.url || tour?.image || tour?.images?.[0]?.url || tour?.images?.[0] || "/images/tour-placeholder.jpg";`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
