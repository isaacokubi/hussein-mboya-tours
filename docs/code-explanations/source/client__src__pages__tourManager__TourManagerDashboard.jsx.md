# Source explanation: client/src/pages/tourManager/TourManagerDashboard.jsx

**Source:** [client/src/pages/tourManager/TourManagerDashboard.jsx](../../../client/src/pages/tourManager/TourManagerDashboard.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useQuery` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `AlertTriangle`, `CalendarDays`, `CheckCircle2`, `Map`, `RefreshCw`, `Users`, `Wallet` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getDashboardStats` from `../../api/tourManagerApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/tourManagerApi](../../../client/src/api/tourManagerApi.js)
- `StatCard` from `../../components/tours/tourManager/StatCard`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/components/tours/tourManager/StatCard](../../../client/src/components/tours/tourManager/StatCard.jsx)
- `UpcomingTours` from `../../components/tours/tourManager/UpcomingTours`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/components/tours/tourManager/UpcomingTours](../../../client/src/components/tours/tourManager/UpcomingTours.jsx)
- `BookingTable` from `../../components/tours/tourManager/BookingTable`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/components/tours/tourManager/BookingTable](../../../client/src/components/tours/tourManager/BookingTable.jsx)
- `asArray`, `firstNumeric`, `unwrapData` from `../../utils/dashboardData`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/utils/dashboardData](../../../client/src/utils/dashboardData.js)
- `useSettings` from `../../context/SettingsContext`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/context/SettingsContext](../../../client/src/context/SettingsContext.jsx)

## Runtime declarations and data flow

### `formatCurrency` — lines 10–10

Parameters: `value`, `symbol`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `TourManagerDashboard` — lines 12–106

Parameters: none.
React hooks used: useQuery. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 13:** `const { settings } = useSettings();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 14:** `const currencySymbol = settings?.currencySymbol || settings?.currency || "KSh";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 15:** `const companyName = String(settings?.companyName || settings?.displayName || "Global Tours").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 17:** `const dashboardQuery = useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 27:** `const dashboard = unwrapData(dashboardQuery.data);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 28:** `const stats = dashboard.stats || dashboard.summary || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 29:** `const upcomingTours = asArray(dashboard.upcomingTours ?? dashboard.tours);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 30:** `const recentBookings = asArray(dashboard.recentBookings ?? dashboard.bookings);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 31:** `const isLoading = dashboardQuery.isLoading;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 32:** `const isFetching = dashboardQuery.isFetching;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 33:** `const isError = dashboardQuery.isError;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 34:** `const error = dashboardQuery.error;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 36:** `const totalTours = firstNumeric(stats.totalTours, dashboard.totalTours, upcomingTours.length);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 37:** `const upcomingCount = firstNumeric(stats.upcomingTours, dashboard.upcomingToursCount, upcomingTours.length);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 38:** `const totalCustomers = firstNumeric(stats.totalCustomers, dashboard.totalCustomers, dashboard.customerCount);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 39:** `const revenue = firstNumeric(stats.revenue, dashboard.revenue);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 40:** `const refreshAll = () => void dashboardQuery.refetch();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 42:** `if (isLoading) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `refreshAll` — lines 40–40

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 10: `const formatCurrency = (value, symbol) => \`${symbol} ${Number(value || 0).toLocaleString("en-KE", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}\`;`.
- Line 13: `const { settings } = useSettings();`.
- Line 14: `const currencySymbol = settings?.currencySymbol || settings?.currency || "KSh";`.
- Line 15: `const companyName = String(settings?.companyName || settings?.displayName || "Global Tours").trim();`.
- Line 17: `const dashboardQuery = useQuery({`.
- Line 27: `const dashboard = unwrapData(dashboardQuery.data);`.
- Line 28: `const stats = dashboard.stats || dashboard.summary || {};`.
- Line 29: `const upcomingTours = asArray(dashboard.upcomingTours ?? dashboard.tours);`.
- Line 30: `const recentBookings = asArray(dashboard.recentBookings ?? dashboard.bookings);`.
- Line 31: `const isLoading = dashboardQuery.isLoading;`.
- Line 32: `const isFetching = dashboardQuery.isFetching;`.
- Line 33: `const isError = dashboardQuery.isError;`.
- Line 34: `const error = dashboardQuery.error;`.
- Line 36: `const totalTours = firstNumeric(stats.totalTours, dashboard.totalTours, upcomingTours.length);`.
- Line 37: `const upcomingCount = firstNumeric(stats.upcomingTours, dashboard.upcomingToursCount, upcomingTours.length);`.
- Line 38: `const totalCustomers = firstNumeric(stats.totalCustomers, dashboard.totalCustomers, dashboard.customerCount);`.
- Line 39: `const revenue = firstNumeric(stats.revenue, dashboard.revenue);`.
- Line 40: `const refreshAll = () => void dashboardQuery.refetch();`.
- Line 55: `const status = error?.response?.status;`.
- Line 56: `const message = error?.response?.data?.message;`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
