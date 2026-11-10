# Source explanation: client/src/pages/Dashboard.jsx

**Source:** [client/src/pages/Dashboard.jsx](../../../client/src/pages/Dashboard.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `useSettings` from `../context/SettingsContext`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/context/SettingsContext](../../../client/src/context/SettingsContext.jsx)
- `useQuery` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Link`, `Navigate` from `react-router-dom`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getMyBookings` from `../api/bookingApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/bookingApi](../../../client/src/api/bookingApi.js)
- `useAuth` from `../context/AuthContext`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/context/AuthContext](../../../client/src/context/AuthContext.jsx)
- `dashboardPath`, `getUserRole` from `../utils/roleUtils`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/utils/roleUtils](../../../client/src/utils/roleUtils.js)
- `MobileDashboardNav` from `../components/common/MobileDashboardNav`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/components/common/MobileDashboardNav](../../../client/src/components/common/MobileDashboardNav.jsx)
- `AssignmentNotifications` from `../components/notifications/AssignmentNotifications`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/components/notifications/AssignmentNotifications](../../../client/src/components/notifications/AssignmentNotifications.jsx)
- `firstNumeric`, `unwrapData` from `../utils/dashboardData`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/utils/dashboardData](../../../client/src/utils/dashboardData.js)
- `formatCurrency`, `getCurrency`, `getCurrencySymbol` from `../utils/currency`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/utils/currency](../../../client/src/utils/currency.js)

## Runtime declarations and data flow

### `normalizeBookings` — lines 12–19

Parameters: `data`.
5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 13:** `if (Array.isArray(data)) return data;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 14:** `if (Array.isArray(data?.bookings)) return data.bookings;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 15:** `if (Array.isArray(data?.data?.bookings)) return data.data.bookings;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 16:** `if (Array.isArray(data?.data)) return data.data;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 17:** `if (Array.isArray(data?.results)) return data.results;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 18:** `return [];` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `statusOf` — lines 21–22

Parameters: `booking`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `paymentStatusOf` — lines 24–31

Parameters: `booking`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `Dashboard` — lines 33–229

Parameters: none.
React hooks used: useQuery. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 34:** `const { user } = useAuth();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 35:** `const { settings } = useSettings();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 36:** `const role = getUserRole(user);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 37:** `const currency = getCurrency(settings);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 38:** `const currencySymbol = getCurrencySymbol(settings);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 40:** `const { data, isLoading, error, refetch, isFetching } = useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 50:** `if (role !== "customer") return <Navigate to={dashboardPath(user)} replace />;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 51:** `if (isLoading)` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 52:** `return <div className="dashboard-responsive customer-ops p-4 text-sm">Loading dashboard...</div>;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 53:** `if (error)` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 54:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 78:** `const payload = unwrapData(data);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 79:** `const bookings = normalizeBookings(data);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 80:** `const serverStats = payload?.stats || data?.stats || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 81:** `const startOfToday = new Date();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 84:** `const upcomingTrips = bookings` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 93:** `const completedTrips = bookings.filter((booking) => statusOf(booking) === "completed");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 94:** `const cancelledTrips = bookings.filter((booking) => statusOf(booking) === "cancelled");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `Card` — lines 231–238

Parameters: `{title, value}`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 232:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 12: `const normalizeBookings = (data) => {`.
- Line 21: `const statusOf = (booking) =>`.
- Line 24: `const paymentStatusOf = (booking) =>`.
- Line 34: `const { user } = useAuth();`.
- Line 35: `const { settings } = useSettings();`.
- Line 36: `const role = getUserRole(user);`.
- Line 37: `const currency = getCurrency(settings);`.
- Line 38: `const currencySymbol = getCurrencySymbol(settings);`.
- Line 40: `const { data, isLoading, error, refetch, isFetching } = useQuery({`.
- Line 78: `const payload = unwrapData(data);`.
- Line 79: `const bookings = normalizeBookings(data);`.
- Line 80: `const serverStats = payload?.stats || data?.stats || {};`.
- Line 81: `const startOfToday = new Date();`.
- Line 84: `const upcomingTrips = bookings`.
- Line 93: `const completedTrips = bookings.filter((booking) => statusOf(booking) === "completed");`.
- Line 94: `const cancelledTrips = bookings.filter((booking) => statusOf(booking) === "cancelled");`.
- Line 96: `const localTotalSpent = bookings.reduce((total, booking) => {`.
- Line 97: `const status = statusOf(booking);`.
- Line 98: `const paymentStatus = paymentStatusOf(booking);`.
- Line 106: `const paid = Number(`.
- Line 117: `const displayedTotal = firstNumeric(serverStats.totalTrips, data?.total, bookings.length);`.
- Line 118: `const displayedUpcoming = firstNumeric(serverStats.upcomingTrips, upcomingTrips.length);`.
- Line 119: `const displayedCompleted = firstNumeric(serverStats.completedTrips, completedTrips.length);`.
- Line 120: `const displayedCancelled = firstNumeric(serverStats.cancelledTrips, cancelledTrips.length);`.
- Line 121: `const displayedSpent = firstNumeric(serverStats.totalSpent, localTotalSpent);`.
- Line 122: `const nextTrip = upcomingTrips[0];`.
- Line 231: `function Card({ title, value }) {`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
