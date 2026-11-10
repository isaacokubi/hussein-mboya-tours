# Source explanation: client/src/pages/admin/EditDestination.jsx

**Source:** [client/src/pages/admin/EditDestination.jsx](../../../client/src/pages/admin/EditDestination.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useEffect`, `useMemo`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useNavigate`, `useParams` from `react-router-dom`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useMutation`, `useQuery`, `useQueryClient` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getAdminDestinationById`, `getAdminDestinations`, `updateDestination` from `../../api/adminDestinationApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/adminDestinationApi](../../../client/src/api/adminDestinationApi.js)

## Runtime declarations and data flow

### `normalizeDestination` — lines 24–40

Parameters: `destination`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 25:** `const d = destination?.data || destination?.destination || destination;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 26:** `if (!d || typeof d !== "object" || !d._id) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 28:** `const keywords = Array.isArray(d.seo?.keywords)` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 32:** `return {` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `destinationToForm` — lines 42–56

Parameters: `destination`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `EditDestination` — lines 58–297

Parameters: none.
React hooks used: useState, useQuery, useEffect, useMemo, useMutation. 6 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 7 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 59:** `const { id } = useParams();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 60:** `const navigate = useNavigate();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 61:** `const queryClient = useQueryClient();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 62:** `const [form, setForm] = useState(emptyForm);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 63:** `const [images, setImages] = useState([]);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 65:** `const destinationQuery = useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 73:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 74:** `const direct = normalizeDestination(await getAdminDestinationById(id));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 75:** `if (direct) return direct;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 77:** `const list = await getAdminDestinations();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 78:** `const destinations = Array.isArray(list)` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 83:** `const fallback = destinations.find((item) => String(item?._id) === String(id));` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 84:** `if (fallback) return normalizeDestination(fallback);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 85:** `throw directError;` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 88:** `const list = await getAdminDestinations();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 89:** `const destinations = Array.isArray(list)` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 94:** `const fallback = destinations.find((item) => String(item?._id) === String(id));` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 95:** `if (fallback) return normalizeDestination(fallback);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 10: `const emptyForm = {`.
- Line 24: `const normalizeDestination = (destination) => {`.
- Line 25: `const d = destination?.data || destination?.destination || destination;`.
- Line 28: `const keywords = Array.isArray(d.seo?.keywords)`.
- Line 42: `const destinationToForm = (destination) => ({`.
- Line 58: `const EditDestination = () => {`.
- Line 59: `const { id } = useParams();`.
- Line 60: `const navigate = useNavigate();`.
- Line 61: `const queryClient = useQueryClient();`.
- Line 62: `const [form, setForm] = useState(emptyForm);`.
- Line 63: `const [images, setImages] = useState([]);`.
- Line 65: `const destinationQuery = useQuery({`.
- Line 74: `const direct = normalizeDestination(await getAdminDestinationById(id));`.
- Line 77: `const list = await getAdminDestinations();`.
- Line 78: `const destinations = Array.isArray(list)`.
- Line 83: `const fallback = destinations.find((item) => String(item?._id) === String(id));`.
- Line 88: `const list = await getAdminDestinations();`.
- Line 89: `const destinations = Array.isArray(list)`.
- Line 94: `const fallback = destinations.find((item) => String(item?._id) === String(id));`.
- Line 97: `const error = new Error("Destination could not be found in the current tenant.");`.
- Line 110: `const existingImages = useMemo(() => {`.
- Line 111: `const source = destinationQuery.data?.images;`.
- Line 115: `const mutation = useMutation({`.
- Line 117: `const data = new FormData();`.
- Line 260: `const url = typeof image === "string" ? image : image?.url;`.

## Security, errors and performance checkpoints

- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
