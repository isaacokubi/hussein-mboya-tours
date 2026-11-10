# Source explanation: client/src/pages/tourManager/AssignGuide.jsx

**Source:** [client/src/pages/tourManager/AssignGuide.jsx](../../../client/src/pages/tourManager/AssignGuide.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useParams`, `useNavigate` from `react-router-dom`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useQuery`, `useMutation`, `useQueryClient` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `toast` from `react-toastify`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getGuides`, `assignGuide`, `getTour` from `../../api/tourApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/tourApi](../../../client/src/api/tourApi.js)

## Runtime declarations and data flow

### `AssignGuide` — lines 46–557

Parameters: none.
React hooks used: useState, useQuery, useMutation. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 50:** `const {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 59:** `const navigate = useNavigate();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 63:** `const queryClient = useQueryClient();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 71:** `const [` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 77:** `] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 87:** `const {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 91:** `} = useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 116:** `const {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 122:** `} = useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 150:** `const tour =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 165:** `const guidesRaw =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 172:** `const guides = guidesRaw.filter((item) => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 173:** `const position = String(item?.position || item?.role || "").toLowerCase().replace(/[\s_-]/g, "");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 174:** `return position === "guide" || position === "tourguide";` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 185:** `const {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 191:** `} = useMutation({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 273:** `if(isLoading)` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 275:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 46: `const AssignGuide =()=>{`.
- Line 50: `const {`.
- Line 59: `const navigate = useNavigate();`.
- Line 63: `const queryClient = useQueryClient();`.
- Line 71: `const [`.
- Line 87: `const {`.
- Line 116: `const {`.
- Line 150: `const tour =`.
- Line 165: `const guidesRaw =`.
- Line 172: `const guides = guidesRaw.filter((item) => {`.
- Line 173: `const position = String(item?.position || item?.role || "").toLowerCase().replace(/[\s_-]/g, "");`.
- Line 185: `const {`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
