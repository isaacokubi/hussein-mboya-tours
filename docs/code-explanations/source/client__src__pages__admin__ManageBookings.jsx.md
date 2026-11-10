# Source explanation: client/src/pages/admin/ManageBookings.jsx

**Source:** [client/src/pages/admin/ManageBookings.jsx](../../../client/src/pages/admin/ManageBookings.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useQuery`, `useMutation`, `useQueryClient` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getBookings`, `updateBookingStatus` from `../../api/adminBookingApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/adminBookingApi](../../../client/src/api/adminBookingApi.js)

## Runtime declarations and data flow

### `ManageBookings` — lines 13–278

Parameters: none.
React hooks used: useQuery, useMutation. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 15:** `const queryClient = useQueryClient();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 18:** `const {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 21:** `}=useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 30:** `const statusMutation = useMutation({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 44:** `const bookings =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 52:** `if(isLoading){` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 54:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 66:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `Card` — lines 282–307

Parameters: `{title, value}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 284:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 15: `const queryClient = useQueryClient();`.
- Line 18: `const {`.
- Line 30: `const statusMutation = useMutation({`.
- Line 44: `const bookings =`.
- Line 282: `function Card({title,value}){`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
