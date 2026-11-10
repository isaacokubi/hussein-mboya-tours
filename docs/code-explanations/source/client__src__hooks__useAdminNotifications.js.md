# Source explanation: client/src/hooks/useAdminNotifications.js

**Source:** [client/src/hooks/useAdminNotifications.js](../../../client/src/hooks/useAdminNotifications.js)

## Purpose

A reusable React hook that packages state, query, or interaction behavior for components.

## Imports and dependencies

- `useEffect` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `socket` from `../socket/socket`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/socket/socket](../../../client/src/socket/socket.js)

## Runtime declarations and data flow

### `useAdminNotifications` — lines 6–59

Parameters: none.
React hooks used: useEffect.

Key statements:
- **Line 8:** `useEffect(() => {` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 10:** `const handleNewBooking = (data) => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 20:** `const handlePaymentReceived = (data) => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 42:** `return () => {` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `handleNewBooking` — lines 10–17

Parameters: `data`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `handlePaymentReceived` — lines 20–27

Parameters: `data`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 10: `const handleNewBooking = (data) => {`.
- Line 20: `const handlePaymentReceived = (data) => {`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
