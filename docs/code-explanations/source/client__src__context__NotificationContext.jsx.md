# Source explanation: client/src/context/NotificationContext.jsx

**Source:** [client/src/context/NotificationContext.jsx](../../../client/src/context/NotificationContext.jsx)

## Purpose

A React context/provider module for state shared across component branches.

## Imports and dependencies

- `createContext`, `useContext`, `useEffect`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getNotifications` from `../api/notificationApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/notificationApi](../../../client/src/api/notificationApi.js)
- `socket` from `../socket/socket`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/socket/socket](../../../client/src/socket/socket.js)
- `useAuth` from `./AuthContext`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/context/AuthContext](../../../client/src/context/AuthContext.jsx)

## Runtime declarations and data flow

### `NotificationProvider` — lines 22–321

Parameters: `{children}`.
React hooks used: useState, useEffect. Error control: try=false, catch=true, finally=false. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 26:** `const {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 32:** `const [` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 35:** `] = useState([]);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 38:** `const [` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 41:** `] = useState(0);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 50:** `useEffect(() => {` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 52:** `if (` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 56:** `return;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 60:** `let cancelled = false;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 69:** `if (cancelled) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 70:** `return;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 74:** `const items =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 99:** `return () => {` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 117:** `useEffect(() => {` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 119:** `if (` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 123:** `return;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 127:** `const handleConnect = () => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 139:** `const handleNotification = (` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `handleConnect` — lines 127–136

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `handleNotification` — lines 139–161

Parameters: `notification`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `handleConnectError` — lines 164–173

Parameters: `error`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `handleDisconnect` — lines 176–185

Parameters: `reason`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `markAllRead` — lines 296–300

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `useNotifications` — lines 324–327

Parameters: none.
React hooks used: useContext.

Key statements:
- **Line 325:** `useContext(` — Uses a React hook to manage component state, side effects, memoization, or server state.

## Module-level declarations

- Line 18: `const NotificationContext =`.
- Line 22: `export function NotificationProvider({`.
- Line 26: `const {`.
- Line 32: `const [`.
- Line 38: `const [`.
- Line 60: `let cancelled = false;`.
- Line 74: `const items =`.
- Line 127: `const handleConnect = () => {`.
- Line 139: `const handleNotification = (`.
- Line 164: `const handleConnectError = (`.
- Line 176: `const handleDisconnect = (`.
- Line 296: `const markAllRead = () => {`.
- Line 324: `export const useNotifications = () =>`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
