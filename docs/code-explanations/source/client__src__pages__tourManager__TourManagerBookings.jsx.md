# Source explanation: client/src/pages/tourManager/TourManagerBookings.jsx

**Source:** [client/src/pages/tourManager/TourManagerBookings.jsx](../../../client/src/pages/tourManager/TourManagerBookings.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useMemo`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useMutation`, `useQuery`, `useQueryClient` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `toast` from `react-toastify`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `AlertTriangle`, `CalendarDays`, `Car`, `CheckCircle2`, `ChevronLeft`, `ChevronRight`, `CircleDollarSign`, `CreditCard`, `Eye`, `Mail`, `MapPin`, `ReceiptText`, `RefreshCw`, `Search`, `ShieldCheck`, `SlidersHorizontal`, `UserCheck`, `UserRound`, `Users`, `Wallet`, `X`, `XCircle` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getBookings`, `completeBooking`, `cancelBooking` from `../../api/tourManagerApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/tourManagerApi](../../../client/src/api/tourManagerApi.js)

## Runtime declarations and data flow

### `safeStatus` — lines 30–30

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `paymentStatus` — lines 31–31

Parameters: `booking`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `personName` — lines 32–35

Parameters: `person`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 33:** `if (!person || typeof person !== "object") return "";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 34:** `return person.name || person.fullName || [person.firstName, person.lastName].filter(Boolean).join(" ").trim();` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `customerName` — lines 36–42

Parameters: `booking`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 37:** `const customer = booking?.customer || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 38:** `const display = booking?.customerDisplay || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 39:** `const snapshot = booking?.customerSnapshot || booking?.customerDetails || booking?.customerInfo || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 40:** `const contact = booking?.contact || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 41:** `return display.name || personName(customer) || personName(booking?.user) || snapshot.name || personName(snapshot) || contact.name || "Customer record unavailable";` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `customerEmail` — lines 43–49

Parameters: `booking`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 44:** `const customer = booking?.customer || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 45:** `const display = booking?.customerDisplay || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 46:** `const snapshot = booking?.customerSnapshot || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 47:** `const contact = booking?.contact || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 48:** `return display.email || customer.email || booking?.user?.email || snapshot.email || contact.email || "";` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `customerPhone` — lines 50–56

Parameters: `booking`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 51:** `const customer = booking?.customer || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 52:** `const display = booking?.customerDisplay || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 53:** `const snapshot = booking?.customerSnapshot || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 54:** `const contact = booking?.contact || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 55:** `return display.phone || customer.phone || booking?.user?.phone || snapshot.phone || contact.phone || "";` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `tourName` — lines 57–60

Parameters: `booking`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 58:** `const tour = booking?.tour || booking?.tourSnapshot || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 59:** `return tour.title || tour.name || booking?.tourName || booking?.packageName || booking?.customTourName || "Custom Tour Package";` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `destinationName` — lines 61–65

Parameters: `booking`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 62:** `const destination = booking?.tour?.destination || booking?.destination;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 63:** `if (!destination) return "";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 64:** `return typeof destination === "string" ? destination : destination.name || destination.title || "";` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `guestCount` — lines 66–72

Parameters: `booking`.
3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 67:** `const direct = Number(booking?.numberOfGuests ?? booking?.guestCount ?? booking?.pax);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 68:** `if (Number.isFinite(direct)) return direct;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 69:** `if (Array.isArray(booking?.travelers)) return booking.travelers.length;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 70:** `if (Array.isArray(booking?.guests)) return booking.guests.length;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 71:** `return null;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `amountValue` — lines 73–76

Parameters: `booking`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 74:** `const numeric = Number(booking?.totalAmount ?? booking?.amount ?? booking?.total ?? booking?.price);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 75:** `return Number.isFinite(numeric) ? numeric : null;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `formatKES` — lines 77–77

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `formatDate` — lines 78–83

Parameters: `value`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 79:** `if (!value) return "Not scheduled";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 80:** `const date = new Date(value);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 81:** `if (Number.isNaN(date.getTime())) return "Invalid date";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 82:** `return new Intl.DateTimeFormat("en-KE", { day: "2-digit", month: "short", year: "numeric", timeZone: "Africa/Nairobi" }).format(date);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `formatDateTime` — lines 84–89

Parameters: `value`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 85:** `if (!value) return "Not available";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 86:** `const date = new Date(value);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 87:** `if (Number.isNaN(date.getTime())) return "Invalid date";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 88:** `return new Intl.DateTimeFormat("en-KE", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Nairobi" }).format(date);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `initials` — lines 90–95

Parameters: `name`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 91:** `const parts = String(name || "CU").trim().split(/\s+/).filter(Boolean);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 92:** `if (!parts.length) return "CU";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 93:** `if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 94:** `return \`${parts[0][0]}${parts[parts.length - 1][0]}\`.toUpperCase();` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `bookingNumber` — lines 96–96

Parameters: `booking`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `StatusBadge` — lines 98–101

Parameters: `{status}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 99:** `const meta = statusMeta[safeStatus(status)] || statusMeta.pending;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 100:** `return <span className={\`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${meta.classes}\`}><span className={\`h-1.5 w-1.5 rounded-full ${meta.dot}\`} />{meta.label}</span>;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `PaymentBadge` — lines 102–105

Parameters: `{status}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 103:** `const meta = paymentMeta[safeStatus(status)] || paymentMeta.pending;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 104:** `return <span className={\`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${meta.classes}\`}>{meta.label}</span>;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `MetricCard` — lines 106–109

Parameters: `{icon, label, value, detail, tone}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 107:** `const tones = { emerald: "border-emerald-100 bg-emerald-50/70 text-emerald-700", amber: "border-amber-100 bg-amber-50/70 text-amber-700", blue: "border-blue-100 bg-blue-50/70 text-blue-700", violet: "border-violet-100 bg` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 108:** `return <div className={\`rounded-2xl border p-5 shadow-sm ${tones[tone] || tones.blue}\`}><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] opacity-7` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `TourManagerBookings` — lines 111–138

Parameters: none.
React hooks used: useState, useQuery, useMemo, useMutation. 8 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 112:** `const queryClient = useQueryClient();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 113:** `const [search, setSearch] = useState("");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 114:** `const [statusFilter, setStatusFilter] = useState("all");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 115:** `const [paymentFilter, setPaymentFilter] = useState("all");` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 116:** `const [selectedBooking, setSelectedBooking] = useState(null);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 117:** `const [page, setPage] = useState(1);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 118:** `const { data, isLoading, isError, error, isFetching, refetch } = useQuery({ queryKey: ["manager-bookings", page], queryFn: () => getBookings({ page, limit: 20 }), placeholderData: (previousData) => previousData });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 119:** `const bookings = useMemo(() => { const result = data?.bookings || data?.data?.bookings || data?.data || data || []; return Array.isArray(result) ? result : []; }, [data]);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 120:** `const filteredBookings = useMemo(() => { const query = search.trim().toLowerCase(); return bookings.filter((booking) => { const haystack = [bookingNumber(booking), customerName(booking), customerEmail(booking), customerP` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 121:** `const metrics = useMemo(() => { const total = Number.isFinite(Number(data?.total)) ? Number(data.total) : bookings.length; const pending = bookings.filter((booking) => safeStatus(booking.status) === "pending").length; co` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 122:** `const completeMutation = useMutation({ mutationFn: completeBooking, onSuccess: () => { toast.success("Booking marked as completed."); queryClient.invalidateQueries({ queryKey: ["manager-bookings"] }); queryClient.invalid` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 123:** `const cancelMutation = useMutation({ mutationFn: ({ id, reason }) => cancelBooking(id, reason), onSuccess: () => { toast.success("Booking cancelled successfully."); queryClient.invalidateQueries({ queryKey: ["manager-boo` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 124:** `const handleComplete = (booking) => { if (!booking?._id || completeMutation.isPending) return; if (!window.confirm(\`Mark ${bookingNumber(booking)} as completed?\`)) return; completeMutation.mutate(booking._id); };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 125:** `const handleCancel = (booking) => { if (!booking?._id || cancelMutation.isPending) return; const reason = window.prompt("Cancellation reason:", "Cancelled by tour manager"); if (reason === null) return; cancelMutation.mu` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 126:** `const totalPages = Math.max(Number(data?.pages) || Number(data?.totalPages) || 1, 1);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 127:** `if (isLoading) return <div className="min-h-screen bg-slate-50 p-6"><div className="mx-auto max-w-[1600px] animate-pulse space-y-6"><div className="h-40 rounded-3xl bg-slate-200" /><div className="grid gap-4 md:grid-cols` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 128:** `if (isError) return <section className="min-h-screen bg-slate-50 p-6"><div className="mx-auto max-w-3xl rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-sm"><div className="mx-auto flex h-14 w-14 items-` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 129:** `return <section className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8"><div className="mx-auto max-w-[1600px] space-y-6">` — Exits this function and supplies its result (or response short-circuit) to the caller.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `handleComplete` — lines 124–124

Parameters: `booking`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:

### `handleCancel` — lines 125–125

Parameters: `booking`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:

## Module-level declarations

- Line 11: `const STATUS_OPTIONS = ["all", "pending", "confirmed", "assigned", "ongoing", "completed", "cancelled", "refunded"];`.
- Line 12: `const PAYMENT_OPTIONS = ["all", "pending", "partial", "paid", "failed", "cancelled", "refunded"];`.
- Line 13: `const statusMeta = {`.
- Line 22: `const paymentMeta = {`.
- Line 30: `const safeStatus = (value) => String(value || "pending").trim().toLowerCase();`.
- Line 31: `const paymentStatus = (booking) => safeStatus(booking?.paymentStatus || booking?.payment?.status);`.
- Line 32: `const personName = (person) => {`.
- Line 36: `const customerName = (booking) => {`.
- Line 37: `const customer = booking?.customer || {};`.
- Line 38: `const display = booking?.customerDisplay || {};`.
- Line 39: `const snapshot = booking?.customerSnapshot || booking?.customerDetails || booking?.customerInfo || {};`.
- Line 40: `const contact = booking?.contact || {};`.
- Line 43: `const customerEmail = (booking) => {`.
- Line 44: `const customer = booking?.customer || {};`.
- Line 45: `const display = booking?.customerDisplay || {};`.
- Line 46: `const snapshot = booking?.customerSnapshot || {};`.
- Line 47: `const contact = booking?.contact || {};`.
- Line 50: `const customerPhone = (booking) => {`.
- Line 51: `const customer = booking?.customer || {};`.
- Line 52: `const display = booking?.customerDisplay || {};`.
- Line 53: `const snapshot = booking?.customerSnapshot || {};`.
- Line 54: `const contact = booking?.contact || {};`.
- Line 57: `const tourName = (booking) => {`.
- Line 58: `const tour = booking?.tour || booking?.tourSnapshot || {};`.
- Line 61: `const destinationName = (booking) => {`.
- Line 62: `const destination = booking?.tour?.destination || booking?.destination;`.
- Line 66: `const guestCount = (booking) => {`.
- Line 67: `const direct = Number(booking?.numberOfGuests ?? booking?.guestCount ?? booking?.pax);`.
- Line 73: `const amountValue = (booking) => {`.
- Line 74: `const numeric = Number(booking?.totalAmount ?? booking?.amount ?? booking?.total ?? booking?.price);`.
- Line 77: `const formatKES = (value) => value === null || value === undefined || !Number.isFinite(Number(value)) ? "—" : \`KES ${Number(value).toLocaleString("en-KE", { minimumFractionDigits:`.
- Line 78: `const formatDate = (value) => {`.
- Line 80: `const date = new Date(value);`.
- Line 84: `const formatDateTime = (value) => {`.
- Line 86: `const date = new Date(value);`.
- Line 90: `const initials = (name) => {`.
- Line 91: `const parts = String(name || "CU").trim().split(/\s+/).filter(Boolean);`.
- Line 96: `const bookingNumber = (booking) => booking?.bookingNumber || booking?.reference || booking?.bookingReference || booking?.bookingCode || booking?._id || "Booking reference unavailab`.
- Line 98: `function StatusBadge({ status }) {`.
- Line 99: `const meta = statusMeta[safeStatus(status)] || statusMeta.pending;`.
- Line 102: `function PaymentBadge({ status }) {`.
- Line 103: `const meta = paymentMeta[safeStatus(status)] || paymentMeta.pending;`.
- Line 106: `function MetricCard({ icon: Icon, label, value, detail, tone }) {`.
- Line 107: `const tones = { emerald: "border-emerald-100 bg-emerald-50/70 text-emerald-700", amber: "border-amber-100 bg-amber-50/70 text-amber-700", blue: "border-blue-100 bg-blue-50/70 text-`.
- Line 112: `const queryClient = useQueryClient();`.
- Line 113: `const [search, setSearch] = useState("");`.
- Line 114: `const [statusFilter, setStatusFilter] = useState("all");`.
- Line 115: `const [paymentFilter, setPaymentFilter] = useState("all");`.
- Line 116: `const [selectedBooking, setSelectedBooking] = useState(null);`.
- Line 117: `const [page, setPage] = useState(1);`.
- Line 118: `const { data, isLoading, isError, error, isFetching, refetch } = useQuery({ queryKey: ["manager-bookings", page], queryFn: () => getBookings({ page, limit: 20 }), placeholderData: `.
- Line 119: `const bookings = useMemo(() => { const result = data?.bookings || data?.data?.bookings || data?.data || data || []; return Array.isArray(result) ? result : []; }, [data]);`.
- Line 120: `const filteredBookings = useMemo(() => { const query = search.trim().toLowerCase(); return bookings.filter((booking) => { const haystack = [bookingNumber(booking), customerName(boo`.
- Line 121: `const metrics = useMemo(() => { const total = Number.isFinite(Number(data?.total)) ? Number(data.total) : bookings.length; const pending = bookings.filter((booking) => safeStatus(b`.
- Line 122: `const completeMutation = useMutation({ mutationFn: completeBooking, onSuccess: () => { toast.success("Booking marked as completed."); queryClient.invalidateQueries({ queryKey: ["ma`.
- Line 123: `const cancelMutation = useMutation({ mutationFn: ({ id, reason }) => cancelBooking(id, reason), onSuccess: () => { toast.success("Booking cancelled successfully."); queryClient.inv`.
- Line 124: `const handleComplete = (booking) => { if (!booking?._id || completeMutation.isPending) return; if (!window.confirm(\`Mark ${bookingNumber(booking)} as completed?\`)) return; comple`.
- Line 125: `const handleCancel = (booking) => { if (!booking?._id || cancelMutation.isPending) return; const reason = window.prompt("Cancellation reason:", "Cancelled by tour manager"); if (re`.
- Line 126: `const totalPages = Math.max(Number(data?.pages) || Number(data?.totalPages) || 1, 1);`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
