# Source explanation: client/src/pages/MyBookings.jsx

**Source:** [client/src/pages/MyBookings.jsx](../../../client/src/pages/MyBookings.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useMutation`, `useQuery`, `useQueryClient` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Link` from `react-router-dom`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useEffect`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `toast` from `react-toastify`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useAuth` from `../context/AuthContext`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/context/AuthContext](../../../client/src/context/AuthContext.jsx)
- `cancelBooking`, `getMyBookings`, `rescheduleBooking` from `../api/bookingApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/bookingApi](../../../client/src/api/bookingApi.js)

## Runtime declarations and data flow

### `bookingsFrom` — lines 8–14

Parameters: `response`.
4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 9:** `if (Array.isArray(response)) return response;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 10:** `if (Array.isArray(response?.bookings)) return response.bookings;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 11:** `if (Array.isArray(response?.data?.bookings)) return response.data.bookings;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 12:** `if (Array.isArray(response?.data)) return response.data;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 13:** `return [];` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `statusOf` — lines 15–15

Parameters: `b`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `paymentOf` — lines 16–16

Parameters: `b`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `nameOf` — lines 17–17

Parameters: `b`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `refOf` — lines 18–18

Parameters: `b`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `money` — lines 19–19

Parameters: `b`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `paid` — lines 20–20

Parameters: `b`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `balance` — lines 21–21

Parameters: `b`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `dateOf` — lines 22–22

Parameters: `v`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `MyBookings` — lines 24–84

Parameters: none.
React hooks used: useState, useEffect, useQuery, useMutation. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 25:** `const { user, loading: authLoading } = useAuth();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 26:** `const queryClient = useQueryClient();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 27:** `const [editing, setEditing] = useState(null);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 28:** `const [newDate, setNewDate] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 29:** `const [reason, setReason] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 30:** `const [minimumRescheduleDate, setMinimumRescheduleDate] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 32:** `useEffect(() => {` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 33:** `const tomorrow = new Date();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 41:** `const query = useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 51:** `const cancel = useMutation({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 57:** `const reschedule = useMutation({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 63:** `if (authLoading) return <div className="flex min-h-screen items-center justify-center"><p className="font-semibold">Loading your account...</p></div>;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 64:** `if (!user) return <main className="flex min-h-screen items-center justify-center"><div className="rounded-2xl bg-white p-8 text-center shadow"><p className="font-semibold">Your session has expired.</p><Link to="/login" c` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 66:** `const bookings = bookingsFrom(query.data);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 67:** `const upcoming = bookings.filter((b) => b.travelDate && new Date(b.travelDate) >= new Date() && statusOf(b) !== "cancelled");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 68:** `const paidTrips = bookings.filter((b) => ["paid", "completed", "success"].includes(paymentOf(b)));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 70:** `return <main className="min-h-screen bg-gray-100 px-3 py-5 sm:px-6 sm:py-8"><div className="mx-auto max-w-7xl">` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `Panel` — lines 85–85

Parameters: `{children}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Stat` — lines 86–86

Parameters: `{title, value}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Detail` — lines 87–87

Parameters: `{label, value}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Badge` — lines 88–88

Parameters: `{label, value}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 8: `const bookingsFrom = (response) => {`.
- Line 15: `const statusOf = (b) => String(b?.status || b?.bookingStatus || "pending").toLowerCase();`.
- Line 16: `const paymentOf = (b) => String(typeof b?.paymentStatus === "object" ? b.paymentStatus?.paymentStatus || b.paymentStatus?.status || "pending" : b?.paymentStatus || "pending").toLow`.
- Line 17: `const nameOf = (b) => typeof b?.tour === "object" ? b.tour?.title || b.tour?.name || "Tour Package" : b?.tourTitle || b?.tourName || b?.tour || "Tour Package";`.
- Line 18: `const refOf = (b) => b?.bookingReference || b?.bookingRef || b?.reference || b?.bookingNumber || b?._id?.slice(-8)?.toUpperCase() || "N/A";`.
- Line 19: `const money = (b) => Number(b?.totalAmount ?? b?.amount ?? b?.total ?? b?.pricing?.total ?? 0);`.
- Line 20: `const paid = (b) => Number(b?.amountPaid ?? b?.paidAmount ?? b?.depositAmount ?? b?.paymentSummary?.paid ?? 0);`.
- Line 21: `const balance = (b) => Math.max(Number(b?.balanceAmount ?? b?.balance ?? b?.paymentSummary?.balance ?? money(b) - paid(b)), 0);`.
- Line 22: `const dateOf = (v) => v ? new Date(v).toLocaleDateString(undefined, { weekday: "short", year: "numeric", month: "short", day: "numeric" }) : "Not specified";`.
- Line 25: `const { user, loading: authLoading } = useAuth();`.
- Line 26: `const queryClient = useQueryClient();`.
- Line 27: `const [editing, setEditing] = useState(null);`.
- Line 28: `const [newDate, setNewDate] = useState("");`.
- Line 29: `const [reason, setReason] = useState("");`.
- Line 30: `const [minimumRescheduleDate, setMinimumRescheduleDate] = useState("");`.
- Line 33: `const tomorrow = new Date();`.
- Line 41: `const query = useQuery({`.
- Line 51: `const cancel = useMutation({`.
- Line 57: `const reschedule = useMutation({`.
- Line 66: `const bookings = bookingsFrom(query.data);`.
- Line 67: `const upcoming = bookings.filter((b) => b.travelDate && new Date(b.travelDate) >= new Date() && statusOf(b) !== "cancelled");`.
- Line 68: `const paidTrips = bookings.filter((b) => ["paid", "completed", "success"].includes(paymentOf(b)));`.
- Line 85: `function Panel({children}){return <div className="rounded-2xl bg-white p-8 text-center shadow">{children}</div>}`.
- Line 86: `function Stat({title,value}){return <div className="rounded-2xl bg-white p-5 shadow"><p className="text-sm text-gray-500">{title}</p><p className="mt-1 text-3xl font-bold">{value}<`.
- Line 87: `function Detail({label,value}){return <div className="rounded-xl bg-gray-50 p-3"><p className="text-xs font-semibold uppercase text-gray-500">{label}</p><p className="mt-1 break-wo`.
- Line 88: `function Badge({label,value}){const tone=["completed","paid","success"].includes(value)?"bg-green-100 text-green-700":["cancelled","failed"].includes(value)?"bg-red-100 text-red-70`.

## Security, errors and performance checkpoints

- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
