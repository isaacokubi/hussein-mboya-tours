# Source explanation: client/src/components/admin/dashboard/AdminDashboard.jsx

**Source:** [client/src/components/admin/dashboard/AdminDashboard.jsx](../../../client/src/components/admin/dashboard/AdminDashboard.jsx)

## Purpose

A reusable UI component used by one or more pages/layouts. Props and callbacks form its input/output boundary.

## Imports and dependencies

- `useMemo` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useMutation`, `useQuery`, `useQueryClient` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `CheckCircle2`, `Clock3`, `Users` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `toast` from `react-toastify`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getDashboard` from `../../../api/adminApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/adminApi](../../../client/src/api/adminApi.js)
- `approveAgent`, `getAgents` from `../../../api/adminAgentApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/adminAgentApi](../../../client/src/api/adminAgentApi.js)
- `useTenant` from `../../../context/TenantContext`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/context/TenantContext](../../../client/src/context/TenantContext.jsx)
- `useAuth` from `../../../context/AuthContext`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/context/AuthContext](../../../client/src/context/AuthContext.jsx)
- `useSettings` from `../../../context/SettingsContext`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/context/SettingsContext](../../../client/src/context/SettingsContext.jsx)
- `DashboardHeader` from `./DashboardHeader`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/components/admin/dashboard/DashboardHeader](../../../client/src/components/admin/dashboard/DashboardHeader.jsx)
- `StatsGrid` from `./StatsGrid`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/components/admin/dashboard/StatsGrid](../../../client/src/components/admin/dashboard/StatsGrid.jsx)
- `PopularTours` from `./PopularTours`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/components/admin/dashboard/PopularTours](../../../client/src/components/admin/dashboard/PopularTours.jsx)
- `RecentBookings` from `./RecentBookings`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/components/admin/dashboard/RecentBookings](../../../client/src/components/admin/dashboard/RecentBookings.jsx)
- `PaymentAnalytics` from `./PaymentAnalytics`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/components/admin/dashboard/PaymentAnalytics](../../../client/src/components/admin/dashboard/PaymentAnalytics.jsx)
- `QuickActions` from `./QuickActions`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/components/admin/dashboard/QuickActions](../../../client/src/components/admin/dashboard/QuickActions.jsx)
- `SystemHealth` from `./SystemHealth`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/components/admin/dashboard/SystemHealth](../../../client/src/components/admin/dashboard/SystemHealth.jsx)

## Runtime declarations and data flow

### `unwrap` — lines 18–18

Parameters: `payload`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `asArray` — lines 19–19

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `AdminDashboard` — lines 23–63

Parameters: none.
React hooks used: useQuery, useMutation, useMemo. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 24:** `const queryClient = useQueryClient();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 25:** `const { tenant } = useTenant() || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 26:** `const { user } = useAuth() || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 27:** `const { settings = {} } = useSettings() || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 31:** `const authenticatedTenantId = user?.tenantId?._id || user?.tenantId;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 32:** `const tenantKey = authenticatedTenantId || tenant?._id || tenant?.id || user?.tenantSlug || tenant?.slug || "current";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 33:** `const currency = String(settings.currencySymbol || settings.currency || "KSh").trim() || "KSh";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 34:** `const brandStyle = { "--admin-primary": settings.primaryColor || "#047857", "--admin-secondary": settings.secondaryColor || "#064e3b", "--admin-accent": settings.accentColor || "#10b981" };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 35:** `const { data, isLoading, isError, error, refetch, isFetching } = useQuery({ queryKey: ["admin-dashboard", tenantKey], queryFn: getDashboard, staleTime: 30_000, refetchInterval: 60_000, refetchIntervalInBackground: false,` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 36:** `const { data: agents = [], isLoading: agentsLoading, isError: agentsError, error: agentsLoadError, refetch: refetchAgents } = useQuery({ queryKey: ["agents", tenantKey], queryFn: getAgents, staleTime: 30_000, refetchInte` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 37:** `const approve = useMutation({ mutationFn: approveAgent, onSuccess: () => { toast.success("Agent approved successfully."); void queryClient.invalidateQueries({ queryKey: ["agents", tenantKey] }); void queryClient.invalida` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 38:** `const dashboard = useMemo(() => unwrap(data), [data]);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 39:** `const summary = dashboard.summary || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 40:** `const paymentStats = dashboard.paymentStats || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 41:** `const recentBookings = asArray(dashboard.recentBookings);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 42:** `const popularTours = asArray(dashboard.popularTours);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 43:** `const monthlyRevenue = asArray(dashboard.monthlyRevenue);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 44:** `const bookingStatus = asArray(dashboard.status || dashboard.statusData);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 18: `const unwrap = (payload) => payload?.data ?? payload ?? {};`.
- Line 19: `const asArray = (value) => Array.isArray(value) ? value : [];`.
- Line 20: `const BOOKING_STATUSES = ["pending", "confirmed", "assigned", "ongoing", "completed", "cancelled", "refunded"];`.
- Line 21: `const statusStyles = { pending: "border-amber-200 bg-amber-50 text-amber-800", confirmed: "border-emerald-200 bg-emerald-50 text-emerald-800", assigned: "border-cyan-200 bg-cyan-50`.
- Line 24: `const queryClient = useQueryClient();`.
- Line 25: `const { tenant } = useTenant() || {};`.
- Line 26: `const { user } = useAuth() || {};`.
- Line 27: `const { settings = {} } = useSettings() || {};`.
- Line 31: `const authenticatedTenantId = user?.tenantId?._id || user?.tenantId;`.
- Line 32: `const tenantKey = authenticatedTenantId || tenant?._id || tenant?.id || user?.tenantSlug || tenant?.slug || "current";`.
- Line 33: `const currency = String(settings.currencySymbol || settings.currency || "KSh").trim() || "KSh";`.
- Line 34: `const brandStyle = { "--admin-primary": settings.primaryColor || "#047857", "--admin-secondary": settings.secondaryColor || "#064e3b", "--admin-accent": settings.accentColor || "#1`.
- Line 35: `const { data, isLoading, isError, error, refetch, isFetching } = useQuery({ queryKey: ["admin-dashboard", tenantKey], queryFn: getDashboard, staleTime: 30_000, refetchInterval: 60_`.
- Line 36: `const { data: agents = [], isLoading: agentsLoading, isError: agentsError, error: agentsLoadError, refetch: refetchAgents } = useQuery({ queryKey: ["agents", tenantKey], queryFn: g`.
- Line 37: `const approve = useMutation({ mutationFn: approveAgent, onSuccess: () => { toast.success("Agent approved successfully."); void queryClient.invalidateQueries({ queryKey: ["agents", `.
- Line 38: `const dashboard = useMemo(() => unwrap(data), [data]);`.
- Line 39: `const summary = dashboard.summary || {};`.
- Line 40: `const paymentStats = dashboard.paymentStats || {};`.
- Line 41: `const recentBookings = asArray(dashboard.recentBookings);`.
- Line 42: `const popularTours = asArray(dashboard.popularTours);`.
- Line 43: `const monthlyRevenue = asArray(dashboard.monthlyRevenue);`.
- Line 44: `const bookingStatus = asArray(dashboard.status || dashboard.statusData);`.
- Line 45: `const bookingStatusCounts = useMemo(() => { const counts = Object.fromEntries(BOOKING_STATUSES.map((s) => [s, 0])); bookingStatus.forEach((x) => { const s = String(x?.status ?? x?.`.
- Line 46: `const pendingAgents = useMemo(() => agents.filter((a) => !a.isApproved && String(a.status || "").toLowerCase() !== "approved"), [agents]);`.
- Line 47: `const statusTotal = Object.values(bookingStatusCounts).reduce((a, b) => a + b, 0);`.
- Line 48: `const bookingTotal = Number(dashboard.bookings ?? summary.bookings ?? 0);`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
