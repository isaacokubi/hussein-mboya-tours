# Source explanation: client/src/pages/guide/TourGuideDashboard.jsx

**Source:** [client/src/pages/guide/TourGuideDashboard.jsx](../../../client/src/pages/guide/TourGuideDashboard.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useMutation`, `useQuery`, `useQueryClient` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `CalendarDays`, `CheckCircle2`, `Clock3`, `MapPinned`, `PlayCircle`, `RefreshCw`, `Send`, `Users`, `X` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useMemo`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `toast` from `react-toastify`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Link` from `react-router-dom`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getGuideDashboard`, `getTourGuests`, `submitTourReport`, `updateTourStatus` from `../../api/guideApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/guideApi](../../../client/src/api/guideApi.js)
- `asArray`, `firstNumeric`, `unwrapData` from `../../utils/dashboardData`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/utils/dashboardData](../../../client/src/utils/dashboardData.js)

## Runtime declarations and data flow

### `startDateOf` — lines 9–9

Parameters: `tour`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `endDateOf` — lines 10–10

Parameters: `tour`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `firstValue` — lines 11–11

Parameters: `...values`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 11:** `(...values) => values.find((value) => value !== undefined && value !== null && String(value).trim() !== "")` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.

### `lower` — lines 12–12

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `getPickupLocation` — lines 14–19

Parameters: `guest`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `getRouteLabel` — lines 21–27

Parameters: `tour`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `customerName` — lines 29–33

Parameters: `guest`, `index`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 30:** `const customer = guest?.customer || guest?.user || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 31:** `const composed = [customer?.firstName, customer?.lastName].filter(Boolean).join(" ").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 32:** `return firstValue(customer?.name, composed, guest?.customerName, guest?.name, \`Guest ${index + 1}\`);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `formatDate` — lines 35–38

Parameters: `value`, `options (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 36:** `const date = new Date(value);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 37:** `return Number.isNaN(date.getTime()) ? "Unavailable" : date.toLocaleDateString("en-KE", options);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `statusLabel` — lines 40–40

Parameters: `status`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `TourGuideDashboard` — lines 42–263

Parameters: none.
React hooks used: useState, useQuery, useMemo, useMutation. 10 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 43:** `const queryClient = useQueryClient();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 44:** `const [openTour, setOpenTour] = useState(null);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 45:** `const [openReadiness, setOpenReadiness] = useState(null);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 46:** `const [reportSummary, setReportSummary] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 47:** `const [reportIssues, setReportIssues] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 49:** `const dashboardQuery = useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 58:** `const payload = unwrapData(dashboardQuery.data);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 59:** `const tours = asArray(payload?.tours ?? payload?.data?.tours ?? dashboardQuery.data?.tours ?? []).filter((tour) => tour?.isDeleted !== true);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 60:** `const stats = payload?.stats || dashboardQuery.data?.stats || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 61:** `const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 63:** `const upcoming = useMemo(() => tours` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 69:** `const activeTours = tours.filter((tour) => lower(tour?.status) === "ongoing");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 70:** `const nextTour = upcoming[0]?.tour;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 71:** `const nextTourId = nextTour?._id || nextTour?.id;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 72:** `const selectedTour = openTour || nextTour;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 73:** `const selectedTourId = selectedTour?._id || selectedTour?.id;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 75:** `const guestQuery = useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 84:** `const guestPayload = unwrapData(guestQuery.data);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `startTour` — lines 124–128

Parameters: `tour`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 125:** `const id = tour?._id || tour?.id;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 126:** `if (!id) return toast.error("This assignment has no valid tour identifier.");` — This branch gates the following work on a condition; test both true and false paths when changing it.

### `completeTour` — lines 130–134

Parameters: `tour`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 131:** `const id = tour?._id || tour?.id;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 132:** `if (!id) return toast.error("This assignment has no valid tour identifier.");` — This branch gates the following work on a condition; test both true and false paths when changing it.

### `submitReport` — lines 136–147

Parameters: none.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 137:** `if (!selectedTourId) return toast.error("Select an assigned tour first.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 138:** `if (!reportSummary.trim()) return toast.error("Add a short tour summary before submitting the report.");` — This branch gates the following work on a condition; test both true and false paths when changing it.

## Module-level declarations

- Line 9: `const startDateOf = (tour) => tour?.startDate || tour?.date || tour?.travelDate;`.
- Line 10: `const endDateOf = (tour) => tour?.endDate || startDateOf(tour);`.
- Line 11: `const firstValue = (...values) => values.find((value) => value !== undefined && value !== null && String(value).trim() !== "");`.
- Line 12: `const lower = (value) => String(value || "").toLowerCase();`.
- Line 14: `const getPickupLocation = (guest) => firstValue(`.
- Line 21: `const getRouteLabel = (tour) => firstValue(`.
- Line 29: `const customerName = (guest, index) => {`.
- Line 30: `const customer = guest?.customer || guest?.user || {};`.
- Line 31: `const composed = [customer?.firstName, customer?.lastName].filter(Boolean).join(" ").trim();`.
- Line 35: `const formatDate = (value, options = { weekday: "short", day: "numeric", month: "short", year: "numeric" }) => {`.
- Line 36: `const date = new Date(value);`.
- Line 40: `const statusLabel = (status) => ({ scheduled: "Scheduled", upcoming: "Upcoming", ongoing: "In progress", completed: "Completed", cancelled: "Cancelled" }[lower(status)] || "Status `.
- Line 43: `const queryClient = useQueryClient();`.
- Line 44: `const [openTour, setOpenTour] = useState(null);`.
- Line 45: `const [openReadiness, setOpenReadiness] = useState(null);`.
- Line 46: `const [reportSummary, setReportSummary] = useState("");`.
- Line 47: `const [reportIssues, setReportIssues] = useState("");`.
- Line 49: `const dashboardQuery = useQuery({`.
- Line 58: `const payload = unwrapData(dashboardQuery.data);`.
- Line 59: `const tours = asArray(payload?.tours ?? payload?.data?.tours ?? dashboardQuery.data?.tours ?? []).filter((tour) => tour?.isDeleted !== true);`.
- Line 60: `const stats = payload?.stats || dashboardQuery.data?.stats || {};`.
- Line 61: `const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);`.
- Line 63: `const upcoming = useMemo(() => tours`.
- Line 69: `const activeTours = tours.filter((tour) => lower(tour?.status) === "ongoing");`.
- Line 70: `const nextTour = upcoming[0]?.tour;`.
- Line 71: `const nextTourId = nextTour?._id || nextTour?.id;`.
- Line 72: `const selectedTour = openTour || nextTour;`.
- Line 73: `const selectedTourId = selectedTour?._id || selectedTour?.id;`.
- Line 75: `const guestQuery = useQuery({`.
- Line 84: `const guestPayload = unwrapData(guestQuery.data);`.
- Line 85: `const guests = asArray(guestPayload?.guests ?? guestPayload?.bookings ?? guestPayload?.data ?? guestQuery.data?.guests ?? guestQuery.data?.bookings ?? []);`.
- Line 86: `const pickupLocations = [...new Set(guests.map(getPickupLocation).filter(Boolean))];`.
- Line 88: `const statusMutation = useMutation({`.
- Line 98: `const reportMutation = useMutation({`.
- Line 110: `const assignedTours = firstNumeric(stats.totalTours, payload?.count, tours.length);`.
- Line 111: `const completedTours = firstNumeric(stats.completedTours, tours.filter((tour) => lower(tour?.status) === "completed").length);`.
- Line 112: `const assignedGuests = tours.reduce((sum, tour) => sum + firstNumeric(tour?.guests, tour?.guestsCount, 0), 0);`.
- Line 113: `const departureDate = nextTour ? new Date(startDateOf(nextTour)) : null;`.
- Line 114: `const routeReady = Boolean(nextTour && getRouteLabel(nextTour) && pickupLocations.length > 0);`.
- Line 115: `const manifestReady = Boolean(nextTourId && !guestQuery.isLoading && guests.length > 0);`.
- Line 116: `const departureReady = Boolean(departureDate && !Number.isNaN(departureDate.getTime()) && departureDate >= today);`.
- Line 117: `const readiness = [`.
- Line 122: `const readinessComplete = Boolean(nextTour && readiness.every((item) => item.ready));`.
- Line 124: `const startTour = (tour) => {`.
- Line 125: `const id = tour?._id || tour?.id;`.
- Line 130: `const completeTour = (tour) => {`.
- Line 131: `const id = tour?._id || tour?.id;`.
- Line 136: `const submitReport = () => {`.
- Line 193: `const tourId = tour?._id || tour?.id;`.
- Line 194: `const isOngoing = lower(tour?.status) === "ongoing";`.
- Line 219: `const Icon = item.icon;`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
