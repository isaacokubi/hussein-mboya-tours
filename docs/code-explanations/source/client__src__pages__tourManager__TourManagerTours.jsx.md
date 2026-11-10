# Source explanation: client/src/pages/tourManager/TourManagerTours.jsx

**Source:** [client/src/pages/tourManager/TourManagerTours.jsx](../../../client/src/pages/tourManager/TourManagerTours.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useCallback`, `useEffect`, `useMemo`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `AlertCircle`, `CalendarDays`, `Car`, `CheckCircle2`, `ChevronLeft`, `ChevronRight`, `Clock3`, `Eye`, `MapPin`, `Pencil`, `PlayCircle`, `Plus`, `RefreshCw`, `Search`, `Trash2`, `UserRound`, `UserRoundCheck`, `Users`, `X` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useNavigate` from `react-router-dom`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getManagerTours`, `deleteManagerTour` from `../../api/tourManagerApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/tourManagerApi](../../../client/src/api/tourManagerApi.js)

## Runtime declarations and data flow

### `normalizeResponse` — lines 29–33

Parameters: `response`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 30:** `const data = response?.data ?? response;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 31:** `if (Array.isArray(data)) return data;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 32:** `return data?.tours || data?.data || data?.results || data?.items || [];` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getTourName` — lines 35–37

Parameters: `tour`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 36:** `return tour?.title || tour?.name || "Untitled tour";` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getDestination` — lines 39–44

Parameters: `tour`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 40:** `const value = tour?.destination;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 41:** `if (!value) return "Destination not assigned";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 42:** `if (typeof value === "string") return value;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 43:** `return value.name || value.title || value.city || value.country || "Destination not assigned";` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getStatus` — lines 46–53

Parameters: `tour`.
4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 47:** `const status = String(tour?.status || "draft").toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 48:** `if (["ongoing", "in-progress", "in_progress", "active"].includes(status)) return "active";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 49:** `if (["completed", "complete", "finished"].includes(status)) return "completed";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 50:** `if (["cancelled", "canceled"].includes(status)) return "cancelled";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 51:** `if (["upcoming", "scheduled"].includes(status)) return "upcoming";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 52:** `return "draft";` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getAssignmentStatus` — lines 55–62

Parameters: `tour`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 56:** `const explicit = String(tour?.assignmentStatus || "").toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 57:** `if (explicit === "partial" || explicit.includes("partial")) return "partial";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 58:** `if (explicit === "assigned" || explicit === "completed" || explicit === "ready" || explicit.includes("assigned")) return "assigned";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 59:** `const resources = [tour?.assignedGuide || tour?.guide, tour?.assignedDriver || tour?.driver, tour?.assignedVehicle || tour?.vehicle];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 60:** `const count = resources.filter(Boolean).length;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 61:** `return count === 3 ? "assigned" : count > 0 ? "partial" : "pending";` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getPersonName` — lines 64–68

Parameters: `value`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 65:** `if (!value) return "Unassigned";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 66:** `if (typeof value === "string") return value;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 67:** `return value.name || value.fullName || \`${value.firstName || ""} ${value.lastName || ""}\`.trim() || value.email || "Unassigned";` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getVehicleName` — lines 70–74

Parameters: `value`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 71:** `if (!value) return "Unassigned";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 72:** `if (typeof value === "string") return value;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 73:** `return value.name || value.registrationNumber || value.registration || value.model || value.type || "Unassigned";` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getDate` — lines 76–81

Parameters: `tour`, `field`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 77:** `const value = tour?.[field];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 78:** `if (!value) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 79:** `const date = new Date(value);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 80:** `return Number.isNaN(date.getTime()) ? null : date;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `formatDate` — lines 83–86

Parameters: `value`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 84:** `if (!value) return "Not scheduled";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 85:** `return value.toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `formatCurrency` — lines 88–93

Parameters: `value`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 89:** `if (value === null || value === undefined || value === "") return DASH;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 90:** `const amount = Number(value);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 91:** `if (!Number.isFinite(amount)) return DASH;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 92:** `return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(amount);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getBookings` — lines 95–98

Parameters: `tour`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 96:** `const value = tour?.bookedGuests ?? tour?.bookedSlots ?? tour?.totalGuests ?? tour?.guestsBooked ?? tour?.totalBookings;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 97:** `return value === null || value === undefined || value === "" ? null : Number(value);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getCapacity` — lines 100–103

Parameters: `tour`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 101:** `const value = tour?.capacity ?? tour?.maxGuests ?? tour?.availabilitySettings?.totalSlots;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 102:** `return value === null || value === undefined || value === "" ? null : Number(value);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `StatusBadge` — lines 113–116

Parameters: `{status}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 114:** `const [label, classes, Icon] = statusConfig[status] || statusConfig.draft;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 115:** `return <span className={\`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${classes}\`}><Icon size={13} />{label}</span>;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `AssignmentBadge` — lines 118–126

Parameters: `{tour}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 119:** `const status = getAssignmentStatus(tour);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 120:** `const config = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 125:** `return <span className={\`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${config[1]}\`}>{config[0]}</span>;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `KpiCard` — lines 128–137

Parameters: `{label, value, icon, description, tone}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 129:** `const tones = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 136:** `return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `TourCard` — lines 139–152

Parameters: `{tour, onView, onEdit, onDelete}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 140:** `const status = getStatus(tour);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 141:** `const bookings = getBookings(tour);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 142:** `const capacity = getCapacity(tour);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 143:** `const occupancy = Number.isFinite(bookings) && Number.isFinite(capacity) && capacity > 0 ? Math.min(100, Math.round((bookings / capacity) * 100)) : null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 144:** `const start = getDate(tour, "startDate") || getDate(tour, "date");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 145:** `const end = getDate(tour, "endDate");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 146:** `const guide = tour?.assignedGuide || tour?.guide;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 147:** `const driver = tour?.assignedDriver || tour?.driver;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 148:** `const vehicle = tour?.assignedVehicle || tour?.vehicle;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 149:** `const price = tour?.discountPrice ?? tour?.finalPrice ?? tour?.price;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 151:** `return <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"><div className="border-b border-slate-100 bg-gradient-to-r from-slate-5` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `EmptyState` — lines 154–156

Parameters: `{filtered, onClear, onCreate}`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 155:** `return <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `TourManagerTours` — lines 158–233

Parameters: none.
React hooks used: useState, useCallback, useEffect, useMemo. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true. 12 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 159:** `const navigate = useNavigate();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 160:** `const [tours, setTours] = useState([]);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 161:** `const [loading, setLoading] = useState(true);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 162:** `const [refreshing, setRefreshing] = useState(false);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 163:** `const [error, setError] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 164:** `const [search, setSearch] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 165:** `const [statusFilter, setStatusFilter] = useState("all");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 166:** `const [assignmentFilter, setAssignmentFilter] = useState("all");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 167:** `const [page, setPage] = useState(1);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 168:** `const [deletingId, setDeletingId] = useState(null);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 170:** `const loadTours = useCallback(async (refresh = false) => {` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 171:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 174:** `const response = await getManagerTours({ page: 1, limit: 50 });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 175:** `const items = normalizeResponse(response);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 176:** `if (!Array.isArray(items)) throw new Error("The tours service returned an invalid response.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 187:** `useEffect(() => { loadTours(); }, [loadTours]);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 189:** `const stats = useMemo(() => {` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 190:** `const result = { total: tours.length, upcoming: 0, active: 0, completed: 0, needingAssignment: 0 };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `clearFilters` — lines 211–211

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `viewTour` — lines 212–212

Parameters: `tour`.
3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:

### `editTour` — lines 213–213

Parameters: `tour`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:

### `deleteTour` — lines 215–221

Parameters: `tour`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 216:** `const id = tour?._id || tour?.id;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 217:** `if (!id || !window.confirm(\`Delete "${getTourName(tour)}"? This action cannot be undone.\`)) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 218:** `try { setDeletingId(id); await deleteManagerTour(id); setTours((current) => current.filter((item) => String(item?._id || item?.id) !== String(id))); }` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 219:** `catch (err) { window.alert(err?.response?.data?.message || err?.message || "Unable to delete this tour."); }` — Handles an exception from the preceding try block; check whether it returns, rethrows, logs safely, or continues.
- **Line 220:** `finally { setDeletingId(null); }` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.

## Module-level declarations

- Line 26: `const PAGE_SIZE = 10;`.
- Line 27: `const DASH = "—";`.
- Line 29: `function normalizeResponse(response) {`.
- Line 30: `const data = response?.data ?? response;`.
- Line 35: `function getTourName(tour) {`.
- Line 39: `function getDestination(tour) {`.
- Line 40: `const value = tour?.destination;`.
- Line 46: `function getStatus(tour) {`.
- Line 47: `const status = String(tour?.status || "draft").toLowerCase();`.
- Line 55: `function getAssignmentStatus(tour) {`.
- Line 56: `const explicit = String(tour?.assignmentStatus || "").toLowerCase();`.
- Line 59: `const resources = [tour?.assignedGuide || tour?.guide, tour?.assignedDriver || tour?.driver, tour?.assignedVehicle || tour?.vehicle];`.
- Line 60: `const count = resources.filter(Boolean).length;`.
- Line 64: `function getPersonName(value) {`.
- Line 70: `function getVehicleName(value) {`.
- Line 76: `function getDate(tour, field) {`.
- Line 77: `const value = tour?.[field];`.
- Line 79: `const date = new Date(value);`.
- Line 83: `function formatDate(value) {`.
- Line 88: `function formatCurrency(value) {`.
- Line 90: `const amount = Number(value);`.
- Line 95: `function getBookings(tour) {`.
- Line 96: `const value = tour?.bookedGuests ?? tour?.bookedSlots ?? tour?.totalGuests ?? tour?.guestsBooked ?? tour?.totalBookings;`.
- Line 100: `function getCapacity(tour) {`.
- Line 101: `const value = tour?.capacity ?? tour?.maxGuests ?? tour?.availabilitySettings?.totalSlots;`.
- Line 105: `const statusConfig = {`.
- Line 113: `function StatusBadge({ status }) {`.
- Line 114: `const [label, classes, Icon] = statusConfig[status] || statusConfig.draft;`.
- Line 118: `function AssignmentBadge({ tour }) {`.
- Line 119: `const status = getAssignmentStatus(tour);`.
- Line 120: `const config = {`.
- Line 128: `function KpiCard({ label, value, icon: Icon, description, tone = "slate" }) {`.
- Line 129: `const tones = {`.
- Line 139: `function TourCard({ tour, onView, onEdit, onDelete }) {`.
- Line 140: `const status = getStatus(tour);`.
- Line 141: `const bookings = getBookings(tour);`.
- Line 142: `const capacity = getCapacity(tour);`.
- Line 143: `const occupancy = Number.isFinite(bookings) && Number.isFinite(capacity) && capacity > 0 ? Math.min(100, Math.round((bookings / capacity) * 100)) : null;`.
- Line 144: `const start = getDate(tour, "startDate") || getDate(tour, "date");`.
- Line 145: `const end = getDate(tour, "endDate");`.
- Line 146: `const guide = tour?.assignedGuide || tour?.guide;`.
- Line 147: `const driver = tour?.assignedDriver || tour?.driver;`.
- Line 148: `const vehicle = tour?.assignedVehicle || tour?.vehicle;`.
- Line 149: `const price = tour?.discountPrice ?? tour?.finalPrice ?? tour?.price;`.
- Line 154: `function EmptyState({ filtered, onClear, onCreate }) {`.
- Line 159: `const navigate = useNavigate();`.
- Line 160: `const [tours, setTours] = useState([]);`.
- Line 161: `const [loading, setLoading] = useState(true);`.
- Line 162: `const [refreshing, setRefreshing] = useState(false);`.
- Line 163: `const [error, setError] = useState("");`.
- Line 164: `const [search, setSearch] = useState("");`.
- Line 165: `const [statusFilter, setStatusFilter] = useState("all");`.
- Line 166: `const [assignmentFilter, setAssignmentFilter] = useState("all");`.
- Line 167: `const [page, setPage] = useState(1);`.
- Line 168: `const [deletingId, setDeletingId] = useState(null);`.
- Line 170: `const loadTours = useCallback(async (refresh = false) => {`.
- Line 174: `const response = await getManagerTours({ page: 1, limit: 50 });`.
- Line 175: `const items = normalizeResponse(response);`.
- Line 189: `const stats = useMemo(() => {`.
- Line 190: `const result = { total: tours.length, upcoming: 0, active: 0, completed: 0, needingAssignment: 0 };`.
- Line 195: `const filteredTours = useMemo(() => {`.
- Line 196: `const query = search.trim().toLowerCase();`.
- Line 198: `const status = getStatus(tour);`.
- Line 199: `const assignment = getAssignmentStatus(tour);`.
- Line 200: `const matchesSearch = !query || [getTourName(tour), getDestination(tour), getPersonName(tour?.assignedGuide || tour?.guide), getPersonName(tour?.assignedDriver || tour?.driver)].so`.
- Line 205: `const totalPages = Math.max(1, Math.ceil(filteredTours.length / PAGE_SIZE));`.
- Line 206: `const visibleTours = useMemo(() => filteredTours.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filteredTours, page]);`.
- Line 207: `const filtered = Boolean(search || statusFilter !== "all" || assignmentFilter !== "all");`.
- Line 211: `const clearFilters = () => { setSearch(""); setStatusFilter("all"); setAssignmentFilter("all"); setPage(1); };`.
- Line 212: `const viewTour = (tour) => { const id = tour?._id || tour?.id; const slug = tour?.slug || tour?.tourSlug; if (slug) navigate(\`/tours/${slug}\`); else if (id) navigate(\`/tour-mana`.
- Line 213: `const editTour = (tour) => { const id = tour?._id || tour?.id; if (id) navigate(\`/tour-manager/edit-tour/${id}\`); };`.
- Line 215: `const deleteTour = async (tour) => {`.
- Line 216: `const id = tour?._id || tour?.id;`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
