# Source explanation: client/src/pages/Wishlist.jsx

**Source:** [client/src/pages/Wishlist.jsx](../../../client/src/pages/Wishlist.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `getTourImage` from `../utils/tourImage`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/utils/tourImage](../../../client/src/utils/tourImage.js)
- `Link`, `Navigate` from `react-router-dom`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Heart`, `MapPin` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useQuery` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useAuth` from `../context/AuthContext`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/context/AuthContext](../../../client/src/context/AuthContext.jsx)
- `getWishlist` from `../api/wishlistApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/wishlistApi](../../../client/src/api/wishlistApi.js)

## Runtime declarations and data flow

### `Wishlist` — lines 15–419

Parameters: none.
React hooks used: useQuery. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 17:** Sensitive-configuration/data operation; inspect source without copying secret values. — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 20:** `const {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 24:** `} = useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 32:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 33:** `return <Navigate to="/login" replace />;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 38:** `if (isLoading) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 39:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 116:** `if (error) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 117:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 143:** `const wishlist = Array.isArray(data)` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 150:** `if (wishlist.length === 0) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 151:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 222:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 272:** `const media =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 278:** `const tourImage = getTourImage(tour);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 282:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 17: `<sensitive declaration redacted>`.
- Line 20: `const {`.
- Line 143: `const wishlist = Array.isArray(data)`.
- Line 272: `const media =`.
- Line 278: `const tourImage = getTourImage(tour);`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
