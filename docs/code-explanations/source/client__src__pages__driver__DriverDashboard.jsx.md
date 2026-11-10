# Source explanation: client/src/pages/driver/DriverDashboard.jsx

**Source:** [client/src/pages/driver/DriverDashboard.jsx](../../../client/src/pages/driver/DriverDashboard.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useMemo`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useQuery` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `AlertTriangle`, `Car`, `CalendarDays`, `CheckCircle2`, `Clock3`, `Fuel`, `MapPin`, `RefreshCw`, `ShieldCheck`, `Users`, `Wrench`, `Play`, `Flag`, `Gauge` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `toast` from `react-toastify`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getDriverDashboard`, `getDriverAssignedTours`, `updateDriverTourStatus` from `../../api/driverApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/driverApi](../../../client/src/api/driverApi.js)
- `firstNumeric`, `numeric`, `unwrapData` from `../../utils/dashboardData`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/utils/dashboardData](../../../client/src/utils/dashboardData.js)

## Runtime declarations and data flow

### `idOf` — lines 27–27

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `clean` — lines 28–28

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `startOfDay` — lines 29–34

Parameters: `value`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 30:** `const date = new Date(value);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 31:** `if (Number.isNaN(date.getTime())) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 33:** `return date;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `tourStart` — lines 35–35

Parameters: `tour`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `tourEnd` — lines 36–44

Parameters: `tour`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 37:** `if (tour?.endDate) return tour.endDate;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 38:** `const start = tourStart(tour);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 39:** `if (!start) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 40:** `const days = Math.max(1, Number(tour?.durationDetails?.days || tour?.duration || 1));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 41:** `const end = new Date(start);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 43:** `return end;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `isTourActiveOnDate` — lines 45–50

Parameters: `tour`, `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 46:** `const day = startOfDay(value);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 47:** `const start = startOfDay(tourStart(tour));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 48:** `const end = startOfDay(tourEnd(tour));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 49:** `return Boolean(day && start && end && day >= start && day <= end);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `validDate` — lines 51–54

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 52:** `const date = new Date(value);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 53:** `return Number.isNaN(date.getTime()) ? null : date;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `formatDate` — lines 55–58

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 56:** `const date = validDate(value);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 57:** `return date ? date.toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" }) : "Unavailable";` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `formatDateTime` — lines 59–62

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 60:** `const date = validDate(value);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 61:** `return date ? date.toLocaleString("en-KE", { timeZone: "Africa/Nairobi", dateStyle: "medium", timeStyle: "short" }) : "Not scheduled";` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `display` — lines 63–63

Parameters: `value`, `fallback (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `statusTone` — lines 64–70

Parameters: `status`.
3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 65:** `const value = clean(status).toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 66:** `if (["ongoing", "active", "ready", "assigned"].includes(value)) return "border-emerald-200 bg-emerald-50 text-emerald-700";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 67:** `if (["completed", "available"].includes(value)) return "border-sky-200 bg-sky-50 text-sky-700";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 68:** `if (["cancelled", "maintenance", "unavailable"].includes(value)) return "border-rose-200 bg-rose-50 text-rose-700";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 69:** `return "border-amber-200 bg-amber-50 text-amber-700";` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `DriverDashboard` — lines 72–235

Parameters: none.
React hooks used: useState, useQuery, useMemo. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true. 6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 73:** `const [actionId, setActionId] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 74:** `const dashboardQuery = useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 82:** `const toursQuery = useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 91:** `const loading = dashboardQuery.isLoading || toursQuery.isLoading;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 92:** `const error = dashboardQuery.error || toursQuery.error;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 93:** `const dashboard = unwrapData(dashboardQuery.data) || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 94:** `const tourPayload = unwrapData(toursQuery.data);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 95:** `const assignedTours = Array.isArray(tourPayload?.tours) ? tourPayload.tours : Array.isArray(tourPayload) ? tourPayload : [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 96:** `const dashboardTours = Array.isArray(dashboard?.tours)` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 103:** `const source = assignedTours.length ? assignedTours : dashboardTours;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 104:** `const tours = useMemo(() => source.map((tour) => {` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 105:** `const dashboardTour = dashboardTours.find((item) => String(idOf(item)) === String(idOf(tour)));` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 106:** `return {` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 113:** `const vehicle = dashboard?.vehicle || dashboard?.assignedVehicle || tours.find((tour) => tour?.assignedVehicle)?.assignedVehicle || null;` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 114:** `const today = new Date();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 115:** `const activeStatuses = ["completed", "cancelled"];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 116:** `const todayTrips = tours.filter((tour) => isTourActiveOnDate(tour, today) && !activeStatuses.includes(clean(tour?.status).toLowerCase()));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 117:** `const nextTour = tours` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `refresh` — lines 132–135

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `changeStatus` — lines 137–153

Parameters: `tour`, `status`.
2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 138:** `const tourId = idOf(tour);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 139:** `if (!tourId) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 141:** `return;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 143:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 145:** `await updateDriverTourStatus(tourId, status);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 147:** `await Promise.all([dashboardQuery.refetch(), toursQuery.refetch()]);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

## Module-level declarations

- Line 27: `const idOf = (value) => value?._id || value?.id || value;`.
- Line 28: `const clean = (value) => String(value ?? "").trim();`.
- Line 29: `const startOfDay = (value) => {`.
- Line 30: `const date = new Date(value);`.
- Line 35: `const tourStart = (tour) => tour?.startDate || tour?.date || tour?.tourDate || tour?.travelDate;`.
- Line 36: `const tourEnd = (tour) => {`.
- Line 38: `const start = tourStart(tour);`.
- Line 40: `const days = Math.max(1, Number(tour?.durationDetails?.days || tour?.duration || 1));`.
- Line 41: `const end = new Date(start);`.
- Line 45: `const isTourActiveOnDate = (tour, value) => {`.
- Line 46: `const day = startOfDay(value);`.
- Line 47: `const start = startOfDay(tourStart(tour));`.
- Line 48: `const end = startOfDay(tourEnd(tour));`.
- Line 51: `const validDate = (value) => {`.
- Line 52: `const date = new Date(value);`.
- Line 55: `const formatDate = (value) => {`.
- Line 56: `const date = validDate(value);`.
- Line 59: `const formatDateTime = (value) => {`.
- Line 60: `const date = validDate(value);`.
- Line 63: `const display = (value, fallback = "Unavailable") => clean(value) || fallback;`.
- Line 64: `const statusTone = (status) => {`.
- Line 65: `const value = clean(status).toLowerCase();`.
- Line 73: `const [actionId, setActionId] = useState("");`.
- Line 74: `const dashboardQuery = useQuery({`.
- Line 82: `const toursQuery = useQuery({`.
- Line 91: `const loading = dashboardQuery.isLoading || toursQuery.isLoading;`.
- Line 92: `const error = dashboardQuery.error || toursQuery.error;`.
- Line 93: `const dashboard = unwrapData(dashboardQuery.data) || {};`.
- Line 94: `const tourPayload = unwrapData(toursQuery.data);`.
- Line 95: `const assignedTours = Array.isArray(tourPayload?.tours) ? tourPayload.tours : Array.isArray(tourPayload) ? tourPayload : [];`.
- Line 96: `const dashboardTours = Array.isArray(dashboard?.tours)`.
- Line 103: `const source = assignedTours.length ? assignedTours : dashboardTours;`.
- Line 104: `const tours = useMemo(() => source.map((tour) => {`.
- Line 105: `const dashboardTour = dashboardTours.find((item) => String(idOf(item)) === String(idOf(tour)));`.
- Line 113: `const vehicle = dashboard?.vehicle || dashboard?.assignedVehicle || tours.find((tour) => tour?.assignedVehicle)?.assignedVehicle || null;`.
- Line 114: `const today = new Date();`.
- Line 115: `const activeStatuses = ["completed", "cancelled"];`.
- Line 116: `const todayTrips = tours.filter((tour) => isTourActiveOnDate(tour, today) && !activeStatuses.includes(clean(tour?.status).toLowerCase()));`.
- Line 117: `const nextTour = tours`.
- Line 120: `const todayStart = startOfDay(today);`.
- Line 121: `const tourDay = startOfDay(date);`.
- Line 125: `const nextPickup = nextTour?.pickupTime || nextTour?.pickupDateTime || tourStart(nextTour);`.
- Line 126: `const stats = dashboard?.stats || dashboard?.summary || {};`.
- Line 127: `const completedTours = firstNumeric(stats.completedTours, dashboard?.completedTours, tours.filter((tour) => clean(tour?.status).toLowerCase() === "completed").length);`.
- Line 128: `const ongoingTours = firstNumeric(stats.ongoingTours, dashboard?.ongoingTours, tours.filter((tour) => clean(tour?.status).toLowerCase() === "ongoing").length);`.
- Line 129: `const totalTours = firstNumeric(stats.totalTours, dashboard?.totalTours, tours.length);`.
- Line 130: `const vehicleStatus = vehicle?.status || vehicle?.availability || null;`.
- Line 131: `const driverName = dashboard?.driver?.name || dashboard?.profile?.name || "Driver";`.
- Line 132: `const refresh = () => {`.
- Line 137: `const changeStatus = async (tour, status) => {`.
- Line 138: `const tourId = idOf(tour);`.
- Line 208: `const tourId = idOf(tour);`.
- Line 209: `const status = clean(tour?.status || "scheduled").toLowerCase();`.
- Line 210: `const isToday = isTourActiveOnDate(tour, today);`.
- Line 211: `const title = tour?.title || tour?.destination?.name || tour?.destinationName || tour?.location || "Tour assignment";`.
- Line 212: `const startLabel = formatDate(tourStart(tour));`.
- Line 213: `const guests = tour?.guests ?? tour?.guestCount ?? tour?.numberOfGuests ?? null;`.
- Line 214: `const destination = tour?.destination?.name || tour?.destinationName || tour?.location;`.

## Security, errors and performance checkpoints

- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
