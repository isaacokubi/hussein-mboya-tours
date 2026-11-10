# Source explanation: client/src/pages/CustomTourRequest.jsx

**Source:** [client/src/pages/CustomTourRequest.jsx](../../../client/src/pages/CustomTourRequest.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useMemo`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useMutation`, `useQueryClient` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `createCustomTourRequest` from `../api/customTourApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/customTourApi](../../../client/src/api/customTourApi.js)

## Runtime declarations and data flow

### `formatDate` — lines 23–28

Parameters: `value`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 24:** `if (!value) return "";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 25:** `const date = new Date(\`${value}T00:00:00\`);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 26:** `if (Number.isNaN(date.getTime())) return "";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 27:** `return date.toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `CustomTourRequest` — lines 30–114

Parameters: none.
React hooks used: useState, useMemo, useMutation. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 31:** `const [form, setForm] = useState(initialForm);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 32:** `const queryClient = useQueryClient();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 34:** `const endDate = useMemo(() => {` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 35:** `if (!form.startDate) return "";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 36:** `const date = new Date(\`${form.startDate}T00:00:00\`);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 37:** `const days = Math.max(1, Number(form.durationDays || 1));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 38:** `if (Number.isNaN(date.getTime())) return "";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 40:** `return date.toISOString().slice(0, 10);` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 43:** `const mutation = useMutation({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 46:** `await queryClient.invalidateQueries({ queryKey: ["my-custom-tours"] });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 56:** `const updateField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 58:** `const handleSubmit = (event) => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 60:** `if (!form.startDate) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 62:** `return;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 72:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `updateField` — lines 56–56

Parameters: `field`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `handleSubmit` — lines 58–70

Parameters: `event`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 60:** `if (!form.startDate) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 62:** `return;` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 5: `const initialForm = {`.
- Line 23: `const formatDate = (value) => {`.
- Line 25: `const date = new Date(\`${value}T00:00:00\`);`.
- Line 31: `const [form, setForm] = useState(initialForm);`.
- Line 32: `const queryClient = useQueryClient();`.
- Line 34: `const endDate = useMemo(() => {`.
- Line 36: `const date = new Date(\`${form.startDate}T00:00:00\`);`.
- Line 37: `const days = Math.max(1, Number(form.durationDays || 1));`.
- Line 43: `const mutation = useMutation({`.
- Line 56: `const updateField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));`.
- Line 58: `const handleSubmit = (event) => {`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
