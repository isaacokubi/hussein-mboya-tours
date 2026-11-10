# Source explanation: client/src/pages/tourManager/TourManagerGuides.jsx

**Source:** [client/src/pages/tourManager/TourManagerGuides.jsx](../../../client/src/pages/tourManager/TourManagerGuides.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useMemo`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useQuery` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `AlertTriangle`, `BriefcaseBusiness`, `CalendarDays`, `CheckCircle2`, `Mail`, `Phone`, `RefreshCw`, `Search`, `ShieldCheck`, `UserRound`, `UsersRound`, `XCircle` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getGuides` from `../../api/tourManagerApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/tourManagerApi](../../../client/src/api/tourManagerApi.js)

## Runtime declarations and data flow

### `normalizeGuides` — lines 19–26

Parameters: `response`.
5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 20:** `if (Array.isArray(response)) return response;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 21:** `if (Array.isArray(response?.guides)) return response.guides;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 22:** `if (Array.isArray(response?.data)) return response.data;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 23:** `if (Array.isArray(response?.data?.guides)) return response.data.guides;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 24:** `if (Array.isArray(response?.items)) return response.items;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 25:** `return [];` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `availabilityOf` — lines 28–28

Parameters: `guide`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `availabilityLabel` — lines 30–36

Parameters: `value`.
4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 31:** `if (value === "available") return "Available";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 32:** `if (value === "busy") return "Busy";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 33:** `if (value === "unavailable") return "Unavailable";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 34:** `if (value === "on_leave" || value === "leave") return "On leave";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 35:** `return "Status unavailable";` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `availabilityClasses` — lines 38–43

Parameters: `value`.
3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 39:** `if (value === "available") return "bg-emerald-50 text-emerald-700 ring-emerald-200";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 40:** `if (value === "busy") return "bg-amber-50 text-amber-700 ring-amber-200";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 41:** `if (value === "unavailable" || value === "on_leave" || value === "leave") return "bg-rose-50 text-rose-700 ring-rose-200";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 42:** `return "bg-slate-100 text-slate-600 ring-slate-200";` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `displayName` — lines 45–49

Parameters: `guide`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 46:** `if (guide?.name) return guide.name;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 47:** `const fullName = [guide?.firstName, guide?.lastName].filter(Boolean).join(" ");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 48:** `return fullName || "Unnamed guide";` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `assignedCount` — lines 51–56

Parameters: `guide`.
3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 52:** `if (Array.isArray(guide?.assignedTours)) return guide.assignedTours.length;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 53:** `if (Number.isFinite(Number(guide?.assignedTours))) return Number(guide.assignedTours);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 54:** `if (Number.isFinite(Number(guide?.assignedTourCount))) return Number(guide.assignedTourCount);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 55:** `return null;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `completedCount` — lines 58–62

Parameters: `guide`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 59:** `if (Number.isFinite(Number(guide?.completedTours))) return Number(guide.completedTours);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 60:** `if (Number.isFinite(Number(guide?.completedTourCount))) return Number(guide.completedTourCount);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 61:** `return null;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `contactValue` — lines 64–64

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `TourManagerGuides` — lines 66–239

Parameters: none.
React hooks used: useState, useQuery, useMemo. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 67:** `const [search, setSearch] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 69:** `const guidesQuery = useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 76:** `const guides = useMemo(() => {` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 77:** `const normalized = normalizeGuides(guidesQuery.data);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 78:** `return Array.from(` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 88:** `const filtered = useMemo(() => {` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 89:** `const query = search.trim().toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 90:** `if (!query) return guides;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 92:** `return guides.filter((guide) =>` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 104:** `const stats = useMemo(() => {` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 105:** `const knownAvailability = guides.filter((guide) => availabilityOf(guide) !== "unknown");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 106:** `return {` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 114:** `if (guidesQuery.isLoading) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 115:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 127:** `if (guidesQuery.isError) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 128:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 142:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 201:** `const availability = availabilityOf(guide);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 19: `const normalizeGuides = (response) => {`.
- Line 28: `const availabilityOf = (guide) => String(guide?.availability || "unknown").trim().toLowerCase();`.
- Line 30: `const availabilityLabel = (value) => {`.
- Line 38: `const availabilityClasses = (value) => {`.
- Line 45: `const displayName = (guide) => {`.
- Line 47: `const fullName = [guide?.firstName, guide?.lastName].filter(Boolean).join(" ");`.
- Line 51: `const assignedCount = (guide) => {`.
- Line 58: `const completedCount = (guide) => {`.
- Line 64: `const contactValue = (value) => value ? String(value) : null;`.
- Line 67: `const [search, setSearch] = useState("");`.
- Line 69: `const guidesQuery = useQuery({`.
- Line 76: `const guides = useMemo(() => {`.
- Line 77: `const normalized = normalizeGuides(guidesQuery.data);`.
- Line 88: `const filtered = useMemo(() => {`.
- Line 89: `const query = search.trim().toLowerCase();`.
- Line 104: `const stats = useMemo(() => {`.
- Line 105: `const knownAvailability = guides.filter((guide) => availabilityOf(guide) !== "unknown");`.
- Line 201: `const availability = availabilityOf(guide);`.
- Line 202: `const assigned = assignedCount(guide);`.
- Line 203: `const completed = completedCount(guide);`.
- Line 204: `const email = contactValue(guide?.email);`.
- Line 205: `const phone = contactValue(guide?.phone);`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
