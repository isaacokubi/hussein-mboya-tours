# Source explanation: client/src/pages/tourManager/TourManagerCalendar.jsx

**Source:** [client/src/pages/tourManager/TourManagerCalendar.jsx](../../../client/src/pages/tourManager/TourManagerCalendar.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useMemo`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useQuery` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `AlertTriangle`, `Bell`, `CalendarDays`, `CheckCircle2`, `ChevronLeft`, `ChevronRight`, `Clock3`, `Loader2`, `Plus`, `RefreshCw`, `Route`, `XCircle` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `toast` from `react-toastify`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `createCalendarReminder`, `deleteCalendarReminder`, `getCalendarReminders`, `getManagerTours` from `../../api/tourManagerApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/tourManagerApi](../../../client/src/api/tourManagerApi.js)

## Runtime declarations and data flow

### `normalizeResponse` — lines 22–30

Parameters: `response`.
6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 23:** `if (Array.isArray(response)) return response;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 24:** `if (Array.isArray(response?.tours)) return response.tours;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 25:** `if (Array.isArray(response?.data)) return response.data;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 26:** `if (Array.isArray(response?.data?.tours)) return response.data.tours;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 27:** `if (Array.isArray(response?.items)) return response.items;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 28:** `if (Array.isArray(response?.results)) return response.results;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 29:** `return [];` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `loadAllTenantTours` — lines 32–52

Parameters: none.
2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller.

Key statements:
- **Line 33:** `const firstPage = await getManagerTours({ page: 1, limit: 50 });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 34:** `const firstTours = normalizeResponse(firstPage);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 35:** `const pageCount = Math.max(` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 40:** `const remainingPages = await Promise.all(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 45:** `const allTours = [firstPage, ...remainingPages].flatMap(normalizeResponse);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 46:** `return Array.from(` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `tourId` — lines 54–54

Parameters: `tour`, `index`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `tourTitle` — lines 56–57

Parameters: `tour`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `parseDate` — lines 59–68

Parameters: `value`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 60:** `if (!value) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 63:** `const dateOnlyMatch = typeof value === "string" && value.match(/^(\d{4})-(\d{2})-(\d{2})$/);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 64:** `const date = dateOnlyMatch` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 67:** `return Number.isNaN(date.getTime()) ? null : date;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `startDateOf` — lines 70–71

Parameters: `tour`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `durationDaysOf` — lines 73–78

Parameters: `tour`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 74:** `const raw = tour?.durationDetails?.days ?? tour?.durationDays ?? tour?.duration ?? 1;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 75:** `const match = String(raw).match(/\d+/);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 76:** `const days = Number(match?.[0] || 1);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 77:** `return Number.isFinite(days) && days >= 1 ? Math.min(days, 365) : 1;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `endDateOf` — lines 80–89

Parameters: `tour`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 81:** `const start = startDateOf(tour);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 82:** `if (!start) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 83:** `const explicitEnd = parseDate(tour?.endDate || tour?.returnDate);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 84:** `if (explicitEnd && explicitEnd >= start) return explicitEnd;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 86:** `const end = new Date(start.getFullYear(), start.getMonth(), start.getDate());` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 88:** `return end;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `dateOnly` — lines 91–97

Parameters: `date`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 92:** `if (!date) return "";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 93:** `const year = date.getFullYear();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 94:** `const month = String(date.getMonth() + 1).padStart(2, "0");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 95:** `const day = String(date.getDate()).padStart(2, "0");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 96:** `return \`${year}-${month}-${day}\`;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `scheduledDateKeys` — lines 99–126

Parameters: `tour`.
4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 100:** `const keys = new Set();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 101:** `const start = startDateOf(tour);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 102:** `const end = endDateOf(tour);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 105:** `if (start && end) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 106:** `const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 107:** `const finalDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 108:** `for (; cursor <= finalDay; cursor.setDate(cursor.getDate() + 1)) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 115:** `const availability = [` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 120:** `for (const item of availability) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 121:** `const date = parseDate(typeof item === "object" ? item?.date || item?.startDate || item?.departureDate : item);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 122:** `if (date) keys.add(dateOnly(date));` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 125:** `return keys;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `statusOf` — lines 128–128

Parameters: `tour`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `statusClasses` — lines 130–135

Parameters: `status`.
3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 131:** `if (status.includes("completed")) return "bg-emerald-50 text-emerald-700 ring-emerald-200";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 132:** `if (status.includes("cancel")) return "bg-rose-50 text-rose-700 ring-rose-200";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 133:** `if (status.includes("ongoing") || status.includes("active")) return "bg-blue-50 text-blue-700 ring-blue-200";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 134:** `return "bg-indigo-50 text-indigo-700 ring-indigo-200";` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `TourManagerCalendar` — lines 137–491

Parameters: none.
React hooks used: useState, useQuery, useMemo. 4 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 138:** `const [currentDate, setCurrentDate] = useState(new Date());` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 139:** `const [savingReminder, setSavingReminder] = useState(false);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 140:** `const [deletingReminderId, setDeletingReminderId] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 141:** `const [selectedDay, setSelectedDay] = useState(null);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 142:** `const [title, setTitle] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 144:** `const toursQuery = useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 151:** `const tours = useMemo(() => normalizeResponse(toursQuery.data), [toursQuery.data]);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 152:** `const remindersQuery = useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 158:** `const reminders = useMemo(() => normalizeResponse(remindersQuery.data), [remindersQuery.data]);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 160:** `const year = currentDate.getFullYear();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 161:** `const month = currentDate.getMonth();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 162:** `const daysInMonth = new Date(year, month + 1, 0).getDate();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 163:** `const firstDay = new Date(year, month, 1).getDay();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 164:** `const todayKey = dateOnly(new Date());` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 166:** `const days = useMemo(` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 174:** `const dateKey = (day) => (day ? dateOnly(new Date(year, month, day)) : "");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 176:** `const eventsFor = (day) => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 177:** `const keyDate = dateKey(day);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `dateKey` — lines 174–174

Parameters: `day`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `eventsFor` — lines 176–195

Parameters: `day`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 177:** `const keyDate = dateKey(day);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 178:** `if (!keyDate) return [];` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 180:** `const tourEvents = tours` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 190:** `const reminderEvents = reminders` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 194:** `return [...tourEvents, ...reminderEvents];` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `changeMonth` — lines 209–212

Parameters: `offset`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `addReminder` — lines 214–237

Parameters: none.
2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 215:** `if (!selectedDay || !title.trim() || savingReminder) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 216:** `const item = { date: dateKey(selectedDay), title: title.trim() };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 217:** `const duplicate = reminders.some(` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 220:** `if (duplicate) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 222:** `return;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 226:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 227:** `await createCalendarReminder(item);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 228:** `await remindersQuery.refetch();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 232:** `const message = error?.response?.data?.message || "Could not save the reminder. Please try again.";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.

### `removeReminder` — lines 239–251

Parameters: `id`.
2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 240:** `if (!id || deletingReminderId) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 242:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 243:** `await deleteCalendarReminder(id);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 244:** `await remindersQuery.refetch();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

## Module-level declarations

- Line 20: `const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];`.
- Line 22: `const normalizeResponse = (response) => {`.
- Line 32: `const loadAllTenantTours = async () => {`.
- Line 33: `const firstPage = await getManagerTours({ page: 1, limit: 50 });`.
- Line 34: `const firstTours = normalizeResponse(firstPage);`.
- Line 35: `const pageCount = Math.max(`.
- Line 40: `const remainingPages = await Promise.all(`.
- Line 45: `const allTours = [firstPage, ...remainingPages].flatMap(normalizeResponse);`.
- Line 54: `const tourId = (tour, index) => String(tour?._id || tour?.id || tour?.slug || \`tour-${index}\`);`.
- Line 56: `const tourTitle = (tour) =>`.
- Line 59: `const parseDate = (value) => {`.
- Line 63: `const dateOnlyMatch = typeof value === "string" && value.match(/^(\d{4})-(\d{2})-(\d{2})$/);`.
- Line 64: `const date = dateOnlyMatch`.
- Line 70: `const startDateOf = (tour) =>`.
- Line 73: `const durationDaysOf = (tour) => {`.
- Line 74: `const raw = tour?.durationDetails?.days ?? tour?.durationDays ?? tour?.duration ?? 1;`.
- Line 75: `const match = String(raw).match(/\d+/);`.
- Line 76: `const days = Number(match?.[0] || 1);`.
- Line 80: `const endDateOf = (tour) => {`.
- Line 81: `const start = startDateOf(tour);`.
- Line 83: `const explicitEnd = parseDate(tour?.endDate || tour?.returnDate);`.
- Line 86: `const end = new Date(start.getFullYear(), start.getMonth(), start.getDate());`.
- Line 91: `const dateOnly = (date) => {`.
- Line 93: `const year = date.getFullYear();`.
- Line 94: `const month = String(date.getMonth() + 1).padStart(2, "0");`.
- Line 95: `const day = String(date.getDate()).padStart(2, "0");`.
- Line 99: `const scheduledDateKeys = (tour) => {`.
- Line 100: `const keys = new Set();`.
- Line 101: `const start = startDateOf(tour);`.
- Line 102: `const end = endDateOf(tour);`.
- Line 106: `const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());`.
- Line 107: `const finalDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());`.
- Line 115: `const availability = [`.
- Line 121: `const date = parseDate(typeof item === "object" ? item?.date || item?.startDate || item?.departureDate : item);`.
- Line 128: `const statusOf = (tour) => String(tour?.status || "scheduled").toLowerCase().replace(/[_-]/g, " ");`.
- Line 130: `const statusClasses = (status) => {`.
- Line 138: `const [currentDate, setCurrentDate] = useState(new Date());`.
- Line 139: `const [savingReminder, setSavingReminder] = useState(false);`.
- Line 140: `const [deletingReminderId, setDeletingReminderId] = useState("");`.
- Line 141: `const [selectedDay, setSelectedDay] = useState(null);`.
- Line 142: `const [title, setTitle] = useState("");`.
- Line 144: `const toursQuery = useQuery({`.
- Line 151: `const tours = useMemo(() => normalizeResponse(toursQuery.data), [toursQuery.data]);`.
- Line 152: `const remindersQuery = useQuery({`.
- Line 158: `const reminders = useMemo(() => normalizeResponse(remindersQuery.data), [remindersQuery.data]);`.
- Line 160: `const year = currentDate.getFullYear();`.
- Line 161: `const month = currentDate.getMonth();`.
- Line 162: `const daysInMonth = new Date(year, month + 1, 0).getDate();`.
- Line 163: `const firstDay = new Date(year, month, 1).getDay();`.
- Line 164: `const todayKey = dateOnly(new Date());`.
- Line 166: `const days = useMemo(`.
- Line 174: `const dateKey = (day) => (day ? dateOnly(new Date(year, month, day)) : "");`.
- Line 176: `const eventsFor = (day) => {`.
- Line 177: `const keyDate = dateKey(day);`.
- Line 180: `const tourEvents = tours`.
- Line 190: `const reminderEvents = reminders`.
- Line 197: `const selectedDate = selectedDay ? new Date(year, month, selectedDay) : null;`.
- Line 198: `const selectedEvents = selectedDay ? eventsFor(selectedDay) : [];`.
- Line 199: `const scheduledTourCount = selectedEvents.filter((event) => event.kind === "tour").length;`.
- Line 200: `const reminderCount = selectedEvents.filter((event) => event.kind === "reminder").length;`.
- Line 202: `const monthTourCount = useMemo(`.
- Line 209: `const changeMonth = (offset) => {`.
- Line 214: `const addReminder = async () => {`.
- Line 216: `const item = { date: dateKey(selectedDay), title: title.trim() };`.
- Line 217: `const duplicate = reminders.some(`.
- Line 232: `const message = error?.response?.data?.message || "Could not save the reminder. Please try again.";`.
- Line 239: `const removeReminder = async (id) => {`.
- Line 342: `const events = eventsFor(day);`.
- Line 343: `const currentKey = dateKey(day);`.
- Line 344: `const isToday = currentKey === todayKey;`.
- Line 345: `const selected = day === selectedDay;`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
