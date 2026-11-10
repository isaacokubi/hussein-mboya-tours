# Source explanation: client/src/components/tourManager/TourManagerSidebar.jsx

**Source:** [client/src/components/tourManager/TourManagerSidebar.jsx](../../../client/src/components/tourManager/TourManagerSidebar.jsx)

## Purpose

A reusable UI component used by one or more pages/layouts. Props and callbacks form its input/output boundary.

## Imports and dependencies

- `NavLink` from `react-router-dom`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `CalendarDays`, `Bot`, `ChevronDown`, `ClipboardCheck`, `ClipboardList`, `FileText`, `LayoutDashboard`, `Map`, `PlusCircle`, `UserRoundCheck`, `UserRound` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useEffect`, `useRef`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useSettings` from `../../context/SettingsContext`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/context/SettingsContext](../../../client/src/context/SettingsContext.jsx)

## Runtime declarations and data flow

### `TourManagerSidebar` — lines 32–81

Parameters: none.
React hooks used: useState, useEffect. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 33:** `const { companyName } = useSettings() || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 34:** `const navRef = useRef(null);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 35:** `const [showScrollButton, setShowScrollButton] = useState(false);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 37:** `useEffect(() => {` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 38:** `const nav = navRef.current;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 39:** `if (!nav) return undefined;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 40:** `const update = () => setShowScrollButton(nav.scrollHeight > nav.clientHeight + 8);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 44:** `return () => {` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 50:** `const scrollToBottom = () => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 54:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `update` — lines 40–40

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `scrollToBottom` — lines 50–52

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 20: `const links = [`.
- Line 33: `const { companyName } = useSettings() || {};`.
- Line 34: `const navRef = useRef(null);`.
- Line 35: `const [showScrollButton, setShowScrollButton] = useState(false);`.
- Line 38: `const nav = navRef.current;`.
- Line 40: `const update = () => setShowScrollButton(nav.scrollHeight > nav.clientHeight + 8);`.
- Line 50: `const scrollToBottom = () => {`.

## Security, errors and performance checkpoints

- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
