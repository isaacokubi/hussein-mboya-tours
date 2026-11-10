# Source explanation: client/src/components/tours/tourManager/Notifications.jsx

**Source:** [client/src/components/tours/tourManager/Notifications.jsx](../../../client/src/components/tours/tourManager/Notifications.jsx)

## Purpose

A reusable UI component used by one or more pages/layouts. Props and callbacks form its input/output boundary.

## Imports and dependencies

- `Bell`, `ChevronLeft`, `ChevronRight` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useQuery` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getNotifications` from `../../../api/notificationApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/notificationApi](../../../client/src/api/notificationApi.js)
- `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.

## Runtime declarations and data flow

### `Notifications` — lines 7–130

Parameters: none.
React hooks used: useState, useQuery. 8 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 8:** `const [page,setPage]=useState(1);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 9:** `const {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 14:** `} = useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 28:** `const notifications =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 39:** `const notificationStyle = (type) => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 40:** `switch (type?.toLowerCase()) {` — This branch selects behavior by the current value; verify every case and the default path.
- **Line 41:** `case "booking":` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 42:** `return "bg-blue-100 text-blue-700";` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 44:** `case "payment":` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 45:** `return "bg-green-100 text-green-700";` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 47:** `case "vehicle":` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 48:** `return "bg-yellow-100 text-yellow-700";` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 50:** `case "guide":` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 51:** `return "bg-purple-100 text-purple-700";` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 53:** `case "warning":` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 54:** `return "bg-red-100 text-red-700";` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 57:** `return "bg-gray-100 text-gray-700";` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 61:** `if (isLoading) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `notificationStyle` — lines 39–59

Parameters: `type`.
6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 40:** `switch (type?.toLowerCase()) {` — This branch selects behavior by the current value; verify every case and the default path.
- **Line 41:** `case "booking":` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 42:** `return "bg-blue-100 text-blue-700";` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 44:** `case "payment":` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 45:** `return "bg-green-100 text-green-700";` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 47:** `case "vehicle":` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 48:** `return "bg-yellow-100 text-yellow-700";` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 50:** `case "guide":` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 51:** `return "bg-purple-100 text-purple-700";` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 53:** `case "warning":` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 54:** `return "bg-red-100 text-red-700";` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 57:** `return "bg-gray-100 text-gray-700";` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 8: `const [page,setPage]=useState(1);`.
- Line 9: `const {`.
- Line 28: `const notifications =`.
- Line 39: `const notificationStyle = (type) => {`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
