# Source explanation: client/src/pages/admin/BookingManagement.jsx

**Source:** [client/src/pages/admin/BookingManagement.jsx](../../../client/src/pages/admin/BookingManagement.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useMemo`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useMutation`, `useQuery`, `useQueryClient` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useDebouncedValue` from `../../hooks/useDebouncedValue`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/hooks/useDebouncedValue](../../../client/src/hooks/useDebouncedValue.js)
- `exportBookingsCSV` from `../../utils/exportBookings`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/utils/exportBookings](../../../client/src/utils/exportBookings.js)
- `getStaff` from `../../api/staffApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/staffApi](../../../client/src/api/staffApi.js)
- `getVehicles` from `../../api/vehicleApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/vehicleApi](../../../client/src/api/vehicleApi.js)
- `getBookings`, `getBookingDetails`, `getBookingTimeline`, `downloadInvoice`, `updateBookingStatus`, `assignBookingResources`, `sendBookingNotification` from `../../api/adminBookingApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/adminBookingApi](../../../client/src/api/adminBookingApi.js)
- `Pagination` from `../../components/admin/Pagination`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/components/admin/Pagination](../../../client/src/components/admin/Pagination.jsx)

## Runtime declarations and data flow

### `cleanText` — lines 32–36

Parameters: `value`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 33:** `if (value === null || value === undefined) return "";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 34:** `const text = String(value).trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 35:** `return !text || /^(undefined|null)(\s+undefined|\s+null)*$/i.test(text) ? "" : text;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `nameOf` — lines 38–46

Parameters: `value`.
3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 39:** `if (!value) return "";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 40:** `if (typeof value === "string") return cleanText(value);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 41:** `const direct = cleanText(value.name || value.fullName || value.displayName);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 42:** `if (direct) return direct;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 43:** `return \`${cleanText(value.firstName || value.givenName)} ${cleanText(` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `paymentStatusOf` — lines 48–55

Parameters: `booking`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `customerOf` — lines 57–70

Parameters: `booking`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 58:** `for (const candidate of [` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 66:** `const name = nameOf(candidate);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 67:** `if (name) return name;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 69:** `return "Customer";` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `emailOf` — lines 72–79

Parameters: `booking`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `phoneOf` — lines 81–88

Parameters: `booking`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `tourOf` — lines 90–97

Parameters: `booking`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `resourceId` — lines 99–102

Parameters: `value`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 100:** `if (!value) return "";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 101:** `return String(value?._id || value?.id || value);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `formatMoney` — lines 104–105

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `bookingAmount` — lines 107–112

Parameters: `booking`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `BookingManagement` — lines 114–943

Parameters: none.
React hooks used: useState, useQuery, useMutation, useMemo. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 8 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 115:** `const queryClient = useQueryClient();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 116:** `const [search, setSearch] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 117:** `const [statusFilter, setStatusFilter] = useState("all");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 118:** `const [paymentFilter, setPaymentFilter] = useState("all");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 119:** `const [selectedBooking, setSelectedBooking] = useState(null);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 120:** `const [page, setPage] = useState(1);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 121:** `const [actionMessage, setActionMessage] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 122:** `const [actionError, setActionError] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 123:** `const [guideId, setGuideId] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 124:** `const [driverId, setDriverId] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 125:** `const [vehicleId, setVehicleId] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 126:** `const debouncedSearch = useDebouncedValue(search, 350);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 128:** `const { data: staffResponse } = useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 134:** `const { data: vehicleResponse } = useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 140:** `const staff = Array.isArray(staffResponse)` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 148:** `const guides = staff.filter(` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 155:** `const drivers = staff.filter(` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 160:** `const vehicles = Array.isArray(vehicleResponse)` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `invalidateBookings` — lines 210–211

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `invalidateFinancialDashboards` — lines 215–221

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 218:** `const key = query.queryKey?.map((part) => String(part).toLowerCase()).join("/");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 219:** `return /(dashboard|analytics|revenue|finance|report|payment)/.test(key);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `invalidateSelectedBooking` — lines 223–231

Parameters: none.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 224:** `if (!selectedBooking?._id) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.

### `openBooking` — lines 331–338

Parameters: `booking`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `closeBooking` — lines 340–347

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `saveAssignment` — lines 349–362

Parameters: none.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 350:** `if (!detail?._id) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.

### `downloadBookingInvoice` — lines 364–390

Parameters: none.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 365:** `if (!detail?._id) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 367:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 369:** `const response = await downloadInvoice(detail._id);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 370:** `const blob =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 375:** `const url = URL.createObjectURL(blob);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 376:** `const anchor = document.createElement("a");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.

### `notifyCustomer` — lines 392–408

Parameters: none.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 393:** `if (!detail?._id) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 395:** `const message = window.prompt(` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 400:** `if (!message?.trim()) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.

## Module-level declarations

- Line 18: `const PAGE_SIZE = 10;`.
- Line 20: `const BOOKING_STATUS_TRANSITIONS = {`.
- Line 32: `const cleanText = (value) => {`.
- Line 34: `const text = String(value).trim();`.
- Line 38: `const nameOf = (value) => {`.
- Line 41: `const direct = cleanText(value.name || value.fullName || value.displayName);`.
- Line 48: `const paymentStatusOf = (booking) =>`.
- Line 57: `const customerOf = (booking) => {`.
- Line 66: `const name = nameOf(candidate);`.
- Line 72: `const emailOf = (booking) =>`.
- Line 81: `const phoneOf = (booking) =>`.
- Line 90: `const tourOf = (booking) =>`.
- Line 99: `const resourceId = (value) => {`.
- Line 104: `const formatMoney = (value) =>`.
- Line 107: `const bookingAmount = (booking) =>`.
- Line 115: `const queryClient = useQueryClient();`.
- Line 116: `const [search, setSearch] = useState("");`.
- Line 117: `const [statusFilter, setStatusFilter] = useState("all");`.
- Line 118: `const [paymentFilter, setPaymentFilter] = useState("all");`.
- Line 119: `const [selectedBooking, setSelectedBooking] = useState(null);`.
- Line 120: `const [page, setPage] = useState(1);`.
- Line 121: `const [actionMessage, setActionMessage] = useState("");`.
- Line 122: `const [actionError, setActionError] = useState("");`.
- Line 123: `const [guideId, setGuideId] = useState("");`.
- Line 124: `const [driverId, setDriverId] = useState("");`.
- Line 125: `const [vehicleId, setVehicleId] = useState("");`.
- Line 126: `const debouncedSearch = useDebouncedValue(search, 350);`.
- Line 128: `const { data: staffResponse } = useQuery({`.
- Line 134: `const { data: vehicleResponse } = useQuery({`.
- Line 140: `const staff = Array.isArray(staffResponse)`.
- Line 148: `const guides = staff.filter(`.
- Line 155: `const drivers = staff.filter(`.
- Line 160: `const vehicles = Array.isArray(vehicleResponse)`.
- Line 170: `const bookingsQuery = useQuery({`.
- Line 191: `const { data, isLoading, isFetching, error } = bookingsQuery;`.
- Line 193: `const bookings = Array.isArray(data)`.
- Line 203: `const pagination = data?.pagination || data?.data?.pagination || {};`.
- Line 204: `const total = Number(pagination.total || bookings.length);`.
- Line 205: `const pages = Math.max(`.
- Line 210: `const invalidateBookings = () =>`.
- Line 215: `const invalidateFinancialDashboards = () =>`.
- Line 218: `const key = query.queryKey?.map((part) => String(part).toLowerCase()).join("/");`.
- Line 223: `const invalidateSelectedBooking = () => {`.
- Line 233: `const statusMutation = useMutation({`.
- Line 250: `const assignMutation = useMutation({`.
- Line 266: `const notificationMutation = useMutation({`.
- Line 280: `const bookingDetailsQuery = useQuery({`.
- Line 287: `const timelineQuery = useQuery({`.
- Line 294: `const detail = useMemo(() => {`.
- Line 295: `const response = bookingDetailsQuery.data;`.
- Line 296: `const candidate =`.
- Line 305: `const filteredBookings = useMemo(() => {`.
- Line 306: `const term = search.trim().toLowerCase();`.
- Line 309: `const customer = customerOf(booking).toLowerCase();`.
- Line 310: `const email = emailOf(booking).toLowerCase();`.
- Line 311: `const phone = phoneOf(booking).toLowerCase();`.
- Line 312: `const id = String(booking?._id || "").toLowerCase();`.
- Line 313: `const number = String(booking?.bookingNumber || "").toLowerCase();`.
- Line 314: `const tour = tourOf(booking).toLowerCase();`.
- Line 315: `const payment = paymentStatusOf(booking);`.
- Line 331: `const openBooking = (booking) => {`.
- Line 340: `const closeBooking = () => {`.
- Line 349: `const saveAssignment = () => {`.
- Line 364: `const downloadBookingInvoice = async () => {`.
- Line 369: `const response = await downloadInvoice(detail._id);`.
- Line 370: `const blob =`.
- Line 375: `const url = URL.createObjectURL(blob);`.
- Line 376: `const anchor = document.createElement("a");`.
- Line 392: `const notifyCustomer = () => {`.
- Line 395: `const message = window.prompt(`.
- Line 440: `const metrics = data?.metrics || data?.data?.metrics || {};`.
- Line 441: `const cancelled = Number(metrics.cancelled ?? bookings.filter((booking) => booking.status === "cancelled").length);`.
- Line 442: `const paid = Number(metrics.paid ?? bookings.filter((booking) => paymentStatusOf(booking) === "paid").length);`.
- Line 443: `const pendingPayments = Number(metrics.pendingPayments ?? bookings.filter((booking) => paymentStatusOf(booking) === "pending").length);`.
- Line 445: `const primaryCards = [`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
