# Source explanation: client/src/pages/agent/AgentDashboard.jsx

**Source:** [client/src/pages/agent/AgentDashboard.jsx](../../../client/src/pages/agent/AgentDashboard.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useMemo` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useQuery` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `AlertTriangle`, `CheckCircle2`, `Clock3`, `DollarSign`, `RefreshCw`, `ShieldCheck`, `Users`, `UserRound`, `Wallet`, `CalendarDays` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useAuth` from `../../context/AuthContext`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/context/AuthContext](../../../client/src/context/AuthContext.jsx)
- `fetchAgentDashboard` from `../../api/agentApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/agentApi](../../../client/src/api/agentApi.js)

## Runtime declarations and data flow

### `hasValue` — lines 7–7

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `cleanText` — lines 8–12

Parameters: `value`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 9:** `if (!hasValue(value)) return "";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 10:** `const text = String(value).trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 11:** `return /^(?:undefined(?:\s+undefined)?|null(?:\s+null)?)$/i.test(text) ? "" : text;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `numberOrNull` — lines 13–16

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 14:** `const number = Number(value);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 15:** `return Number.isFinite(number) ? number : null;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `money` — lines 17–20

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 18:** `const number = numberOrNull(value);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 19:** `return number === null ? "—" : \`KES ${number.toLocaleString("en-KE", { minimumFractionDigits: 0 })}\`;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `displayNumber` — lines 21–21

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `customerName` — lines 22–29

Parameters: `booking`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 23:** `const customer = booking?.customer;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 24:** `const name = cleanText(customer?.name)` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 28:** `return name || cleanText(customer?.email) || cleanText(booking?.customerSnapshot?.email) || cleanText(booking?.contact?.email) || cleanText(customer?.phone) || cleanText(booking?.customerSnapshot?.phone) || cleanText(boo` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `tourName` — lines 30–36

Parameters: `booking`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 31:** `const tour = booking?.tour;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 32:** `const direct = cleanText(tour?.title) || cleanText(tour?.name);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 33:** `if (direct) return direct;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 34:** `const customDestination = cleanText(booking?.customTourRequest?.destination);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 35:** `return customDestination ? \`Custom trip — ${customDestination}\` : "Tour unavailable";` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `normalizeStatus` — lines 37–37

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `bookingStatus` — lines 38–38

Parameters: `booking`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `paymentStatus` — lines 39–39

Parameters: `booking`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `formatDate` — lines 40–44

Parameters: `value`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 41:** `if (!value) return "—";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 42:** `const date = new Date(value);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 43:** `return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-KE", { day: "2-digit", month: "2-digit", year: "numeric" });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `StatCard` — lines 54–58

Parameters: `{label, value, hint, icon, color}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 55:** `return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `AgentDashboard` — lines 60–94

Parameters: none.
React hooks used: useQuery, useMemo. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 61:** `const { user } = useAuth();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 62:** `const agentKey = user?._id || user?.id || user?.email || "current";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 63:** `const query = useQuery({ queryKey: ["agent-dashboard", agentKey], queryFn: fetchAgentDashboard, enabled: Boolean(user), retry: 1, staleTime: 30000, refetchOnMount: "always", refetchOnWindowFocus: true });` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 64:** `const payload = query.data?.data || query.data || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 65:** `const stats = payload?.statistics || payload?.stats || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 66:** `const recentBookings = Array.isArray(payload?.recentBookings) ? payload.recentBookings : Array.isArray(payload?.bookings) ? payload.bookings : [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 67:** `const agent = payload?.agent || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 68:** `const agentStatus = String(agent.status || "unknown").toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 69:** `const isApproved = agent.isApproved === true || agent.approved === true;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 70:** `const statusLabel = agentStatus === "active" ? "Active" : agentStatus === "suspended" ? "Suspended" : agentStatus === "inactive" ? "Inactive" : "Unknown";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 71:** `const statusClass = agentStatus === "active" ? "bg-emerald-100 text-emerald-700" : agentStatus === "suspended" ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-700";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 72:** `const commissionRate = numberOrNull(agent.commissionRate);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 73:** `const statsMap = useMemo(() => ({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 84:** `if (query.isLoading) return <div className="min-h-full bg-slate-50 p-6"><div className="mx-auto max-w-7xl animate-pulse space-y-5"><div className="h-40 rounded-3xl bg-slate-200"/><div className="grid gap-4 sm:grid-cols-2` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 85:** `if (query.isError) return <div className="min-h-full bg-slate-50 p-6"><div className="mx-auto max-w-4xl rounded-3xl border border-rose-200 bg-white p-8 shadow-sm"><div className="flex h-12 w-12 items-center justify-cente` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 87:** `return <section className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8"><div className="mx-auto max-w-7xl space-y-6">` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 7: `const hasValue = (value) => value !== undefined && value !== null && value !== "";`.
- Line 8: `const cleanText = (value) => {`.
- Line 10: `const text = String(value).trim();`.
- Line 13: `const numberOrNull = (value) => {`.
- Line 14: `const number = Number(value);`.
- Line 17: `const money = (value) => {`.
- Line 18: `const number = numberOrNull(value);`.
- Line 21: `const displayNumber = (value) => numberOrNull(value) === null ? "—" : numberOrNull(value).toLocaleString("en-KE");`.
- Line 22: `const customerName = (booking) => {`.
- Line 23: `const customer = booking?.customer;`.
- Line 24: `const name = cleanText(customer?.name)`.
- Line 30: `const tourName = (booking) => {`.
- Line 31: `const tour = booking?.tour;`.
- Line 32: `const direct = cleanText(tour?.title) || cleanText(tour?.name);`.
- Line 34: `const customDestination = cleanText(booking?.customTourRequest?.destination);`.
- Line 37: `const normalizeStatus = (value) => cleanText(value).replace(/[_-]+/g, " ") || "Unknown";`.
- Line 38: `const bookingStatus = (booking) => normalizeStatus(booking?.status || booking?.bookingStatus);`.
- Line 39: `const paymentStatus = (booking) => normalizeStatus(booking?.paymentStatus || booking?.payment?.status);`.
- Line 40: `const formatDate = (value) => {`.
- Line 42: `const date = new Date(value);`.
- Line 45: `const tone = {`.
- Line 54: `function StatCard({ label, value, hint, icon: Icon, color = "indigo" }) {`.
- Line 61: `const { user } = useAuth();`.
- Line 62: `const agentKey = user?._id || user?.id || user?.email || "current";`.
- Line 63: `const query = useQuery({ queryKey: ["agent-dashboard", agentKey], queryFn: fetchAgentDashboard, enabled: Boolean(user), retry: 1, staleTime: 30000, refetchOnMount: "always", refetc`.
- Line 64: `const payload = query.data?.data || query.data || {};`.
- Line 65: `const stats = payload?.statistics || payload?.stats || {};`.
- Line 66: `const recentBookings = Array.isArray(payload?.recentBookings) ? payload.recentBookings : Array.isArray(payload?.bookings) ? payload.bookings : [];`.
- Line 67: `const agent = payload?.agent || {};`.
- Line 68: `const agentStatus = String(agent.status || "unknown").toLowerCase();`.
- Line 69: `const isApproved = agent.isApproved === true || agent.approved === true;`.
- Line 70: `const statusLabel = agentStatus === "active" ? "Active" : agentStatus === "suspended" ? "Suspended" : agentStatus === "inactive" ? "Inactive" : "Unknown";`.
- Line 71: `const statusClass = agentStatus === "active" ? "bg-emerald-100 text-emerald-700" : agentStatus === "suspended" ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-700";`.
- Line 72: `const commissionRate = numberOrNull(agent.commissionRate);`.
- Line 73: `const statsMap = useMemo(() => ({`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
