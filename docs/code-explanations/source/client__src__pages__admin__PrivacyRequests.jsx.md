# Source explanation: client/src/pages/admin/PrivacyRequests.jsx

**Source:** [client/src/pages/admin/PrivacyRequests.jsx](../../../client/src/pages/admin/PrivacyRequests.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useMemo`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useMutation`, `useQuery`, `useQueryClient` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `CheckCircle2`, `Clock3`, `RefreshCw`, `ShieldCheck`, `UserRound` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `toast` from `react-toastify`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getPrivacyRequests`, `updatePrivacyRequest` from `../../api/privacyApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/privacyApi](../../../client/src/api/privacyApi.js)

## Runtime declarations and data flow

### `clean` — lines 10–13

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 11:** `const text = String(value ?? "").trim().replace(/\s+/g, " ");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 12:** `return text && !/^undefined( undefined)?$/i.test(text) && !/^null( null)?$/i.test(text) ? text : "";` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `requester` — lines 14–22

Parameters: `r`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 15:** `const person = r?.requester || r?.customer || r?.user || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 16:** `const personName = clean(person?.name) || clean(person?.fullName) || \`${clean(person?.firstName)} ${clean(person?.lastName)}\`.trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 17:** `const snapshotName = clean(r?.requesterName) || \`${clean(r?.requesterFirstName)} ${clean(r?.requesterLastName)}\`.trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 18:** `const name = personName || snapshotName || "Requester";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 19:** `const email = clean(person?.email) || clean(r?.requesterEmail);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 20:** `const phone = clean(person?.phone) || clean(r?.requesterPhone);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 21:** `return { name, email, phone };` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `formatDate` — lines 23–28

Parameters: `value`, `withTime (defaulted)`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 24:** `if (!value) return "—";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 25:** `const date = new Date(value);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 26:** `if (Number.isNaN(date.getTime())) return "—";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 27:** `return date.toLocaleString(undefined, withTime ? {} : { year: "numeric", month: "numeric", day: "numeric" });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `nextStatuses` — lines 29–36

Parameters: `status`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `PrivacyRequests` — lines 38–72

Parameters: none.
React hooks used: useState, useQuery, useMemo, useMutation. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 39:** `const qc = useQueryClient();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 40:** `const [filter, setFilter] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 41:** `const [selected, setSelected] = useState(null);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 42:** `const [resolutionNotes, setResolutionNotes] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 43:** `const query = useQuery({ queryKey: ["privacy-requests"], queryFn: () => getPrivacyRequests(), staleTime: 15000 });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 44:** `const allRequests = Array.isArray(query.data?.data) ? query.data.data : Array.isArray(query.data) ? query.data : [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 45:** `const requests = useMemo(() => {` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 46:** `if (!filter) return allRequests;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 47:** `return allRequests.filter((r) => String(r?.status || "").toLowerCase() === filter);` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 49:** `const mutation = useMutation({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 57:** `const summary = useMemo(() => STATUSES.reduce((acc, status) => ({ ...acc, [status]: allRequests.filter((r) => String(r?.status || "").toLowerCase() === status).length }), {}), [allRequests]);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 58:** `const selectRequest = (request) => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 63:** `return <div className="admin-control-center min-h-screen bg-[var(--tenant-background,#f8fafc)] p-4 text-[var(--tenant-text,#0f172a)] md:p-6"><div className="mx-auto max-w-7xl">` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `selectRequest` — lines 58–61

Parameters: `request`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 7: `const STATUSES = ["received", "identity_verification", "in_progress", "completed", "rejected", "cancelled"];`.
- Line 8: `const TYPES = { access: "Access", correction: "Correction", deletion: "Deletion", portability: "Portability", objection: "Objection", restriction: "Restriction" };`.
- Line 9: `const STATUS_LABELS = { received: "Received", identity_verification: "Identity verification", in_progress: "In progress", completed: "Completed", rejected: "Rejected", cancelled: "`.
- Line 10: `const clean = (value) => {`.
- Line 11: `const text = String(value ?? "").trim().replace(/\s+/g, " ");`.
- Line 14: `const requester = (r) => {`.
- Line 15: `const person = r?.requester || r?.customer || r?.user || {};`.
- Line 16: `const personName = clean(person?.name) || clean(person?.fullName) || \`${clean(person?.firstName)} ${clean(person?.lastName)}\`.trim();`.
- Line 17: `const snapshotName = clean(r?.requesterName) || \`${clean(r?.requesterFirstName)} ${clean(r?.requesterLastName)}\`.trim();`.
- Line 18: `const name = personName || snapshotName || "Requester";`.
- Line 19: `const email = clean(person?.email) || clean(r?.requesterEmail);`.
- Line 20: `const phone = clean(person?.phone) || clean(r?.requesterPhone);`.
- Line 23: `const formatDate = (value, withTime = false) => {`.
- Line 25: `const date = new Date(value);`.
- Line 29: `const nextStatuses = (status) => ({`.
- Line 39: `const qc = useQueryClient();`.
- Line 40: `const [filter, setFilter] = useState("");`.
- Line 41: `const [selected, setSelected] = useState(null);`.
- Line 42: `const [resolutionNotes, setResolutionNotes] = useState("");`.
- Line 43: `const query = useQuery({ queryKey: ["privacy-requests"], queryFn: () => getPrivacyRequests(), staleTime: 15000 });`.
- Line 44: `const allRequests = Array.isArray(query.data?.data) ? query.data.data : Array.isArray(query.data) ? query.data : [];`.
- Line 45: `const requests = useMemo(() => {`.
- Line 49: `const mutation = useMutation({`.
- Line 57: `const summary = useMemo(() => STATUSES.reduce((acc, status) => ({ ...acc, [status]: allRequests.filter((r) => String(r?.status || "").toLowerCase() === status).length }), {}), [all`.
- Line 58: `const selectRequest = (request) => {`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
