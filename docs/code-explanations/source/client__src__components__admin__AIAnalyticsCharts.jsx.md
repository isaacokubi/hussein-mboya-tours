# Source explanation: client/src/components/admin/AIAnalyticsCharts.jsx

**Source:** [client/src/components/admin/AIAnalyticsCharts.jsx](../../../client/src/components/admin/AIAnalyticsCharts.jsx)

## Purpose

A reusable UI component used by one or more pages/layouts. Props and callbacks form its input/output boundary.

## Imports and dependencies

- `LineChart`, `Line`, `XAxis`, `YAxis`, `Tooltip`, `CartesianGrid`, `ResponsiveContainer`, `BarChart`, `Bar` from `recharts`. This dependency supplies the imported behavior; inspect the linked local module for its contract.

## Runtime declarations and data flow

### `monthName` — lines 13–13

Parameters: `month`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `amountOf` — lines 14–14

Parameters: `item`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `titleCase` — lines 15–15

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `AIAnalyticsCharts` — lines 17–77

Parameters: `{analytics, fallback}`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 18:** `const aiRevenue = analytics.monthlyRevenue || [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 19:** `const canonicalRevenue = fallback.monthlyRevenue || [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 20:** `const canonicalRevenueTotal = canonicalRevenue.reduce((sum, item) => sum + amountOf(item), 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 21:** `const aiRevenueTotal = aiRevenue.reduce((sum, item) => sum + amountOf(item), 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 22:** `const fallbackRevenueTotal = Number(fallback.totalRevenue || fallback.revenue || analytics.totalRevenue || analytics.revenue || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 24:** `let revenueSource = aiRevenue;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 25:** `if (!aiRevenue.length || (aiRevenueTotal === 0 && canonicalRevenueTotal > 0)) revenueSource = canonicalRevenue;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 27:** `let revenue = revenueSource.map((item) => ({` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 33:** `if ((!revenue.length || revenue.every((item) => item.revenue === 0)) && fallbackRevenueTotal > 0) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 37:** `const aiBookings = analytics.bookingActivity || [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 38:** `const canonicalBookings = fallback.statusData || [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 39:** `const aiBookingTotal = aiBookings.reduce((sum, item) => sum + Number(item?.bookings || 0), 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 40:** `const canonicalBookingTotal = canonicalBookings.reduce((sum, item) => sum + Number(item?.count || 0), 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 41:** `const useCanonicalBookings = canonicalBookings.length > 0 && aiBookingTotal === 0 && canonicalBookingTotal > 0;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 42:** `const bookingsSource = useCanonicalBookings || !aiBookings.length ? canonicalBookings : aiBookings;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 43:** `const bookings = bookingsSource.map((item) => ({` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 48:** `const hasDailyActivity = aiBookings.length > 0 && !useCanonicalBookings;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 50:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `ChartCard` — lines 79–89

Parameters: `{title, subtitle, empty, children}`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 80:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 13: `const monthName = (month) => new Date(2000, Number(month) - 1, 1).toLocaleString(undefined, { month: "short" });`.
- Line 14: `const amountOf = (item) => Number(item?.revenue ?? item?.amount ?? item?.totalRevenue ?? 0);`.
- Line 15: `const titleCase = (value) => String(value || "Unknown").replace(/[_-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());`.
- Line 18: `const aiRevenue = analytics.monthlyRevenue || [];`.
- Line 19: `const canonicalRevenue = fallback.monthlyRevenue || [];`.
- Line 20: `const canonicalRevenueTotal = canonicalRevenue.reduce((sum, item) => sum + amountOf(item), 0);`.
- Line 21: `const aiRevenueTotal = aiRevenue.reduce((sum, item) => sum + amountOf(item), 0);`.
- Line 22: `const fallbackRevenueTotal = Number(fallback.totalRevenue || fallback.revenue || analytics.totalRevenue || analytics.revenue || 0);`.
- Line 24: `let revenueSource = aiRevenue;`.
- Line 27: `let revenue = revenueSource.map((item) => ({`.
- Line 37: `const aiBookings = analytics.bookingActivity || [];`.
- Line 38: `const canonicalBookings = fallback.statusData || [];`.
- Line 39: `const aiBookingTotal = aiBookings.reduce((sum, item) => sum + Number(item?.bookings || 0), 0);`.
- Line 40: `const canonicalBookingTotal = canonicalBookings.reduce((sum, item) => sum + Number(item?.count || 0), 0);`.
- Line 41: `const useCanonicalBookings = canonicalBookings.length > 0 && aiBookingTotal === 0 && canonicalBookingTotal > 0;`.
- Line 42: `const bookingsSource = useCanonicalBookings || !aiBookings.length ? canonicalBookings : aiBookings;`.
- Line 43: `const bookings = bookingsSource.map((item) => ({`.
- Line 48: `const hasDailyActivity = aiBookings.length > 0 && !useCanonicalBookings;`.
- Line 79: `function ChartCard({ title, subtitle, empty, children }) {`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
