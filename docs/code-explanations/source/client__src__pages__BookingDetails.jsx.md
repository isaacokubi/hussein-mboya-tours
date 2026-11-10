# Source explanation: client/src/pages/BookingDetails.jsx

**Source:** [client/src/pages/BookingDetails.jsx](../../../client/src/pages/BookingDetails.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useTenant` from `../context/TenantContext`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/context/TenantContext](../../../client/src/context/TenantContext.jsx)
- `useSettings` from `../context/SettingsContext`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/context/SettingsContext](../../../client/src/context/SettingsContext.jsx)
- `useQuery` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useNavigate`, `useParams` from `react-router-dom`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `ReviewForm` from `../components/reviews/ReviewForm`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/components/reviews/ReviewForm](../../../client/src/components/reviews/ReviewForm.jsx)
- `getBooking`, `getMyBookings` from `../api/bookingApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/bookingApi](../../../client/src/api/bookingApi.js)

## Runtime declarations and data flow

### `toNumber` — lines 8–11

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 9:** `const parsed = Number(value);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 10:** `return Number.isFinite(parsed) ? parsed : 0;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `cleanText` — lines 13–17

Parameters: `value`, `fallback (defaulted)`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 14:** `const text = String(value ?? "").replace(/\s+/g, " ").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 15:** `if (!text || /^(undefined|null)(\s+(undefined|null))*$/i.test(text)) return fallback;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 16:** `return text;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `displayName` — lines 19–25

Parameters: `source`.
3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 20:** `if (!source) return "";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 21:** `if (typeof source === "string") return cleanText(source, "");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 22:** `const direct = cleanText(source.name, "");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 23:** `if (direct) return direct;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 24:** `return cleanText([source.firstName, source.lastName].filter(Boolean).join(" "), "");` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getPaymentStatus` — lines 27–31

Parameters: `booking`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 28:** `const value = booking?.paymentStatus;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 29:** `if (value && typeof value === "object") return value.paymentStatus || value.status || "pending";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 30:** `return value || "pending";` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getPaidAmount` — lines 33–46

Parameters: `booking`.
3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 34:** `const direct = [booking?.amountPaid, booking?.paidAmount, booking?.depositAmount, booking?.paymentSummary?.paid, booking?.payment?.amountPaid];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 35:** `for (const value of direct) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 36:** `if (value !== undefined && value !== null && value !== "") return toNumber(value);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 38:** `if (Array.isArray(booking?.payments)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 39:** `return booking.payments.reduce((sum, payment) => {` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 40:** `const status = String(payment?.status || payment?.paymentStatus || "").toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 41:** `const confirmed = ["paid", "confirmed", "success", "successful", "completed"].includes(status);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 42:** `return confirmed ? sum + toNumber(payment?.amount || payment?.amountPaid || payment?.paidAmount) : sum;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 45:** `return 0;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `isCustomBooking` — lines 48–48

Parameters: `booking`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `statusLabel` — lines 50–50

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `dateLabel` — lines 51–51

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `BookingDetails` — lines 53–169

Parameters: none.
React hooks used: useQuery. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 54:** `const { tenant } = useTenant();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 55:** `const { settings } = useSettings();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 56:** `const { id } = useParams();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 57:** `const navigate = useNavigate();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 58:** `const query = useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 61:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 62:** `return await getBooking(id);` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 64:** `const fallback = await getMyBookings();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 65:** `const list = fallback?.bookings || fallback?.data?.bookings || fallback?.data || fallback || [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 66:** `const found = Array.isArray(list) ? list.find((item) => String(item?._id || item?.id) === String(id)) : null;` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 67:** `if (found) return { success: true, booking: found };` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 68:** `throw requestError;` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 74:** `const { data, isLoading, isError, error, refetch, isFetching } = query;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 75:** `const booking = data?.booking || data?.data?.booking || data?.data || data;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 77:** `if (isLoading) return <div className="p-10">Loading booking details...</div>;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 78:** `if (isError || !booking) return (` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 85:** `const custom = booking.customTourSnapshot || booking.customTourRequest || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 86:** `const customBooking = isCustomBooking(booking);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `Info` — lines 171–173

Parameters: `{label, value}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 172:** `return <div><p className="text-xs font-semibold tracking-wide text-slate-500">{label}</p><p className="mt-1 font-semibold text-slate-900">{value || "N/A"}</p></div>;` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 8: `const toNumber = (value) => {`.
- Line 9: `const parsed = Number(value);`.
- Line 13: `const cleanText = (value, fallback = "N/A") => {`.
- Line 14: `const text = String(value ?? "").replace(/\s+/g, " ").trim();`.
- Line 19: `const displayName = (source) => {`.
- Line 22: `const direct = cleanText(source.name, "");`.
- Line 27: `const getPaymentStatus = (booking) => {`.
- Line 28: `const value = booking?.paymentStatus;`.
- Line 33: `const getPaidAmount = (booking) => {`.
- Line 34: `const direct = [booking?.amountPaid, booking?.paidAmount, booking?.depositAmount, booking?.paymentSummary?.paid, booking?.payment?.amountPaid];`.
- Line 40: `const status = String(payment?.status || payment?.paymentStatus || "").toLowerCase();`.
- Line 41: `const confirmed = ["paid", "confirmed", "success", "successful", "completed"].includes(status);`.
- Line 48: `const isCustomBooking = (booking) => Boolean(booking?.customTourSnapshot || booking?.customTourRequest || booking?.customTour || booking?.isCustomTour);`.
- Line 50: `const statusLabel = (value) => cleanText(value, "Pending").replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());`.
- Line 51: `const dateLabel = (value) => value ? new Date(value).toLocaleDateString("en-KE", { year: "numeric", month: "short", day: "numeric" }) : "N/A";`.
- Line 54: `const { tenant } = useTenant();`.
- Line 55: `const { settings } = useSettings();`.
- Line 56: `const { id } = useParams();`.
- Line 57: `const navigate = useNavigate();`.
- Line 58: `const query = useQuery({`.
- Line 64: `const fallback = await getMyBookings();`.
- Line 65: `const list = fallback?.bookings || fallback?.data?.bookings || fallback?.data || fallback || [];`.
- Line 66: `const found = Array.isArray(list) ? list.find((item) => String(item?._id || item?.id) === String(id)) : null;`.
- Line 74: `const { data, isLoading, isError, error, refetch, isFetching } = query;`.
- Line 75: `const booking = data?.booking || data?.data?.booking || data?.data || data;`.
- Line 85: `const custom = booking.customTourSnapshot || booking.customTourRequest || {};`.
- Line 86: `const customBooking = isCustomBooking(booking);`.
- Line 87: `const title = cleanText(booking.tour?.title || booking.title || custom.destination || custom.title, "Custom tour package");`.
- Line 88: `const totalAmount = toNumber(booking.totalAmount ?? booking.quotedAmount ?? booking.quotedTotal);`.
- Line 89: `const amountPaid = getPaidAmount(booking);`.
- Line 90: `const storedBalance = booking.balanceAmount ?? booking.balance ?? booking.paymentSummary?.balance;`.
- Line 91: `const balanceAmount = Math.max(storedBalance !== undefined && storedBalance !== null ? toNumber(storedBalance) : totalAmount - amountPaid, 0);`.
- Line 92: `const paymentStatus = String(getPaymentStatus(booking)).toLowerCase();`.
- Line 93: `const failedPayment = ["failed", "cancelled"].includes(paymentStatus);`.
- Line 94: `const customerSources = [booking.customerSnapshot, booking.customer, booking.user, booking.contact];`.
- Line 95: `const customerName = customerSources.map(displayName).find(Boolean) || "Customer";`.
- Line 96: `const customerPhone = customerSources.map((source) => cleanText(source?.phone, "")).find(Boolean) || "N/A";`.
- Line 97: `const customerEmail = customerSources.map((source) => cleanText(source?.email, "")).find(Boolean) || "N/A";`.
- Line 98: `const status = String(booking.status || booking.bookingStatus || "pending").toLowerCase();`.
- Line 99: `const checkoutPath = \`/checkout/booking/${booking._id || id}\`;`.
- Line 171: `function Info({ label, value }) {`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
