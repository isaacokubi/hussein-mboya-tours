# Source explanation: client/src/pages/tourManager/TourAssignments.jsx

**Source:** [client/src/pages/tourManager/TourAssignments.jsx](../../../client/src/pages/tourManager/TourAssignments.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useMemo`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useMutation`, `useQuery`, `useQueryClient` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `AlertTriangle`, `CalendarDays`, `CheckCircle2`, `ChevronDown`, `CircleAlert`, `ClipboardCheck`, `Car`, `Loader2`, `MapPin`, `RefreshCw`, `Search`, `ShieldCheck`, `UserRound`, `Users`, `XCircle` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getTours`, `getGuides`, `getDrivers`, `getVehicles`, `assignTour` from `../../api/tourAssignmentApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/tourAssignmentApi](../../../client/src/api/tourAssignmentApi.js)

## Runtime declarations and data flow

### `getId` — lines 28–28

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `normalizeStatus` — lines 30–33

Parameters: `value`, `fallback (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 31:** `const status = String(value ?? "").trim().toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 32:** `return status || fallback;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getTourIdList` — lines 35–38

Parameters: `resource`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `getResourceAvailability` — lines 40–43

Parameters: `resource`, `type`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 41:** `if (type === "vehicle") return normalizeStatus(resource?.status);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 42:** `return normalizeStatus(resource?.availability);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `isGuideAvailable` — lines 45–51

Parameters: `guide`, `tourId`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 46:** `const currentId = String(tourId || "");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 47:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `isDriverAvailable` — lines 53–59

Parameters: `driver`, `tourId`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 54:** `const currentId = String(tourId || "");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 55:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `isVehicleAvailable` — lines 61–67

Parameters: `vehicle`, `tourId`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 62:** `const currentId = String(tourId || "");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 63:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `resourceTone` — lines 69–75

Parameters: `status`.
3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 70:** `const value = normalizeStatus(status);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 71:** `if (value === "available") return "bg-emerald-50 text-emerald-700 ring-emerald-200";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 72:** `if (["busy", "assigned", "in_use", "in-use"].includes(value)) return "bg-amber-50 text-amber-700 ring-amber-200";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 73:** `if (["unavailable", "on_leave", "on-leave", "maintenance", "inactive"].includes(value)) return "bg-rose-50 text-rose-700 ring-rose-200";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 74:** `return "bg-slate-100 text-slate-600 ring-slate-200";` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `statusLabel` — lines 77–80

Parameters: `status`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `getPersonName` — lines 82–86

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `getVehicleName` — lines 88–93

Parameters: `vehicle`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 89:** `if (!vehicle) return "Not assigned";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 90:** `const name = vehicle.name || "Vehicle";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 91:** `const registration = vehicle.registrationNumber || vehicle.registration;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 92:** `return registration ? \`${name} - ${registration}\` : name;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `formatDate` — lines 95–104

Parameters: `value`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 96:** `if (!value) return "Date not provided";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 97:** `const date = new Date(value);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 98:** `if (Number.isNaN(date.getTime())) return "Date not provided";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 99:** `return new Intl.DateTimeFormat("en-KE", {` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `normalizeList` — lines 106–106

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `TourAssignments` — lines 108–516

Parameters: none.
React hooks used: useState, useQuery, useMutation, useMemo. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 15 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 109:** `const queryClient = useQueryClient();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 110:** `const [assignments, setAssignments] = useState({});` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 111:** `const [search, setSearch] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 112:** `const [statusFilter, setStatusFilter] = useState("all");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 113:** `const [resourceFilter, setResourceFilter] = useState("all");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 115:** `const toursQuery = useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 123:** `const guidesQuery = useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 131:** `const driversQuery = useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 139:** `const vehiclesQuery = useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 147:** `const tours = normalizeList(toursQuery.data);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 148:** `const guides = normalizeList(guidesQuery.data);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 149:** `const drivers = normalizeList(driversQuery.data);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 150:** `const vehicles = normalizeList(vehiclesQuery.data);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 152:** `const mutation = useMutation({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 155:** `const updatedTour = response?.tour || response?.data || response;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 156:** `const tourId = variables?.tourId;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 159:** `const next = { ...current };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 161:** `return next;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `handleChange` — lines 226–234

Parameters: `tourId`, `field`, `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `getCurrentId` — lines 236–243

Parameters: `tour`, `field`.
4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 237:** `const selected = assignments[tour?._id]?.[field];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 238:** `if (selected !== undefined) return selected;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 239:** `if (field === "guideId") return getId(tour?.assignedGuide);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 240:** `if (field === "driverId") return getId(tour?.assignedDriver);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 241:** `if (field === "vehicleId") return getId(tour?.assignedVehicle);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 242:** `return "";` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `handleAssign` — lines 245–267

Parameters: `tour`.
6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 246:** `const tourId = getId(tour);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 247:** `if (!tourId) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 249:** `return;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 252:** `const tourStatus = normalizeStatus(tour?.status);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 253:** `if (["completed", "cancelled", "canceled"].includes(tourStatus)) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 255:** `const selected = assignments[tourId] || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 256:** `const payload = {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 257:** `if (selected.guideId !== undefined) payload.guideId = selected.guideId || null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 258:** `if (selected.driverId !== undefined) payload.driverId = selected.driverId || null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 259:** `if (selected.vehicleId !== undefined) payload.vehicleId = selected.vehicleId || null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 261:** `if (Object.keys(payload).length === 0) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 263:** `return;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `handleRefresh` — lines 269–276

Parameters: none.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller.

Key statements:
- **Line 270:** `await Promise.all([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

## Module-level declarations

- Line 28: `const getId = (value) => value?._id || value?.id || value || "";`.
- Line 30: `const normalizeStatus = (value, fallback = "unknown") => {`.
- Line 31: `const status = String(value ?? "").trim().toLowerCase();`.
- Line 35: `const getTourIdList = (resource) =>`.
- Line 40: `const getResourceAvailability = (resource, type) => {`.
- Line 45: `const isGuideAvailable = (guide, tourId) => {`.
- Line 46: `const currentId = String(tourId || "");`.
- Line 53: `const isDriverAvailable = (driver, tourId) => {`.
- Line 54: `const currentId = String(tourId || "");`.
- Line 61: `const isVehicleAvailable = (vehicle, tourId) => {`.
- Line 62: `const currentId = String(tourId || "");`.
- Line 69: `const resourceTone = (status) => {`.
- Line 70: `const value = normalizeStatus(status);`.
- Line 77: `const statusLabel = (status) =>`.
- Line 82: `const getPersonName = (value) =>`.
- Line 88: `const getVehicleName = (vehicle) => {`.
- Line 90: `const name = vehicle.name || "Vehicle";`.
- Line 91: `const registration = vehicle.registrationNumber || vehicle.registration;`.
- Line 95: `const formatDate = (value) => {`.
- Line 97: `const date = new Date(value);`.
- Line 106: `const normalizeList = (value) => (Array.isArray(value) ? value : []);`.
- Line 109: `const queryClient = useQueryClient();`.
- Line 110: `const [assignments, setAssignments] = useState({});`.
- Line 111: `const [search, setSearch] = useState("");`.
- Line 112: `const [statusFilter, setStatusFilter] = useState("all");`.
- Line 113: `const [resourceFilter, setResourceFilter] = useState("all");`.
- Line 115: `const toursQuery = useQuery({`.
- Line 123: `const guidesQuery = useQuery({`.
- Line 131: `const driversQuery = useQuery({`.
- Line 139: `const vehiclesQuery = useQuery({`.
- Line 147: `const tours = normalizeList(toursQuery.data);`.
- Line 148: `const guides = normalizeList(guidesQuery.data);`.
- Line 149: `const drivers = normalizeList(driversQuery.data);`.
- Line 150: `const vehicles = normalizeList(vehiclesQuery.data);`.
- Line 152: `const mutation = useMutation({`.
- Line 155: `const updatedTour = response?.tour || response?.data || response;`.
- Line 156: `const tourId = variables?.tourId;`.
- Line 159: `const next = { ...current };`.
- Line 181: `const filteredTours = useMemo(() => {`.
- Line 182: `const term = search.trim().toLowerCase();`.
- Line 185: `const tourStatus = normalizeStatus(tour?.status);`.
- Line 186: `const assignmentStatus = normalizeStatus(tour?.assignmentStatus, "pending");`.
- Line 187: `const guide = tour?.assignedGuide;`.
- Line 188: `const driver = tour?.assignedDriver;`.
- Line 189: `const vehicle = tour?.assignedVehicle;`.
- Line 190: `const resourceState =`.
- Line 195: `const matchesSearch = !term || [`.
- Line 206: `const matchesStatus =`.
- Line 211: `const matchesResource = resourceFilter === "all" || resourceState === resourceFilter;`.
- Line 217: `const stats = useMemo(() => {`.
- Line 218: `const completed = tours.filter((tour) => normalizeStatus(tour?.status) === "completed").length;`.
- Line 219: `const locked = tours.filter((tour) => ["completed", "cancelled", "canceled"].includes(normalizeStatus(tour?.status))).length;`.
- Line 220: `const fullyAssigned = tours.filter((tour) => tour?.assignedGuide && tour?.assignedDriver && tour?.assignedVehicle).length;`.
- Line 221: `const needingAssignment = tours.filter((tour) => !tour?.assignedGuide || !tour?.assignedDriver || !tour?.assignedVehicle).length;`.
- Line 226: `const handleChange = (tourId, field, value) => {`.
- Line 236: `const getCurrentId = (tour, field) => {`.
- Line 237: `const selected = assignments[tour?._id]?.[field];`.
- Line 245: `const handleAssign = (tour) => {`.
- Line 246: `const tourId = getId(tour);`.
- Line 252: `const tourStatus = normalizeStatus(tour?.status);`.
- Line 255: `const selected = assignments[tourId] || {};`.
- Line 256: `const payload = {};`.
- Line 269: `const handleRefresh = async () => {`.
- Line 278: `const anyLoading = toursQuery.isLoading || guidesQuery.isLoading || driversQuery.isLoading || vehiclesQuery.isLoading;`.
- Line 279: `const resourceError = guidesQuery.isError || driversQuery.isError || vehiclesQuery.isError;`.
- Line 406: `const tourId = getId(tour);`.
- Line 407: `const assignmentStatus = normalizeStatus(tour?.assignmentStatus, "pending");`.
- Line 408: `const tourStatus = normalizeStatus(tour?.status, "unknown");`.
- Line 409: `const locked = ["completed", "cancelled", "canceled"].includes(tourStatus);`.
- Line 410: `const selected = assignments[tourId] || {};`.
- Line 411: `const isAssigning = mutation.isPending && mutation.variables?.tourId === tourId;`.
- Line 412: `const guide = tour?.assignedGuide;`.
- Line 413: `const driver = tour?.assignedDriver;`.
- Line 414: `const vehicle = tour?.assignedVehicle;`.
- Line 415: `const complete = guide && driver && vehicle;`.
- Line 469: `const currentId = getCurrentId(tour, field);`.
- Line 480: `const resourceId = getId(resource);`.
- Line 481: `const current = String(currentId) === String(resourceId);`.
- Line 482: `const available = availabilityCheck(resource, tourId);`.
- Line 483: `const status = getResourceAvailability(resource, type);`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
