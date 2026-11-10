# Source explanation: client/src/pages/tourManager/AssignGuides.jsx

**Source:** [client/src/pages/tourManager/AssignGuides.jsx](../../../client/src/pages/tourManager/AssignGuides.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useParams`, `useNavigate` from `react-router-dom`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useQuery`, `useMutation`, `useQueryClient` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `toast` from `react-toastify`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getGuides`, `assignGuide` from `../../api/tourManagerApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/tourManagerApi](../../../client/src/api/tourManagerApi.js)
- `getTour` from `../../api/tourApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/tourApi](../../../client/src/api/tourApi.js)

## Runtime declarations and data flow

### `AssignGuides` — lines 25–288

Parameters: none.
React hooks used: useQuery, useMutation. 4 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 26:** `const { id } = useParams();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 28:** `const navigate = useNavigate();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 30:** `const queryClient = useQueryClient();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 38:** `const {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 42:** `} = useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 54:** `const {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 57:** `} = useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 62:** `const guidesRaw =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 69:** `const guides = (Array.isArray(guidesRaw) ? guidesRaw : []).filter((item) => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 70:** `const position = String(item?.position || item?.role || "").toLowerCase().replace(/[\s_-]/g, "");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 71:** `return position === "guide" || position === "tourguide" || position === "tour_guide".replace(/[\s_-]/g, "");` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 74:** `const tour =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 86:** `const {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 89:** `} = useMutation({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 98:** `await queryClient.invalidateQueries({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 102:** `await queryClient.invalidateQueries({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 106:** `await queryClient.invalidateQueries({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 110:** `await queryClient.invalidateQueries({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 25: `const AssignGuides = () => {`.
- Line 26: `const { id } = useParams();`.
- Line 28: `const navigate = useNavigate();`.
- Line 30: `const queryClient = useQueryClient();`.
- Line 38: `const {`.
- Line 54: `const {`.
- Line 62: `const guidesRaw =`.
- Line 69: `const guides = (Array.isArray(guidesRaw) ? guidesRaw : []).filter((item) => {`.
- Line 70: `const position = String(item?.position || item?.role || "").toLowerCase().replace(/[\s_-]/g, "");`.
- Line 74: `const tour =`.
- Line 86: `const {`.
- Line 120: `const message =`.
- Line 219: `const guideName =`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
