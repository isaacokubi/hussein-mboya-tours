# Source explanation: server/controllers/analyticsController.js

**Source:** [server/controllers/analyticsController.js](../../../server/controllers/analyticsController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `tenantFilter` from `../tenancy/tenantQuery.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/tenantQuery.js](../../../server/tenancy/tenantQuery.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)
- `Vehicle` from `../models/Vehicle.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Vehicle.js](../../../server/models/Vehicle.js)
- `Commission` from `../models/Commission.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Commission.js](../../../server/models/Commission.js)
- `getRevenueAnalytics`, `getBookingAnalytics`, `getPopularTours` from `../services/analyticsService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/analyticsService.js](../../../server/services/analyticsService.js)
- `getPostedRevenueReport` from `../services/financeReportingService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/financeReportingService.js](../../../server/services/financeReportingService.js)

## Runtime declarations and data flow

### `getAnalytics` — lines 10–42

Parameters: `req`, `res`, `next`.
Persistent operations detected: User.countDocuments, Booking.aggregate, Vehicle.aggregate, Commission.aggregate; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 11:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 13:** `const filter = tenantFilter(req);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 14:** `const [revenue, bookings, popularTours, customers, bookingStatus, monthlyRevenue, vehicleStats, commissions] = await Promise.all([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 18:** `User.countDocuments({ ...filter, $or: [{ role: "customer" }, { legacyRole: "customer" }] }),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 19:** `Booking.aggregate([` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 25:** `Vehicle.aggregate([` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 30:** `Commission.aggregate([` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 35:** `const reportedRevenue = Number(revenue?.totalRevenue || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 36:** `const commissionCost = Number(commissions?.[0]?.totalCommission || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 37:** `const profitability = { reportedRevenue, commissionCost, contributionMargin: Math.max(0, reportedRevenue - commissionCost), marginPercent: reportedRevenue ? Math.round(((reportedRevenue - commissionCost) / reportedRevenu` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 38:** `return res.status(200).json({ success: true, data: { revenue, customers, bookings, bookingStatus, monthlyRevenue: monthlyRevenue.monthly, popularTours, vehicleStats, profitability } });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `dashboardAnalytics` — lines 44–52

Parameters: `req`, `res`, `next`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 45:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 47:** `const [revenue, bookings, popularTours] = await Promise.all([getRevenueAnalytics(req), getBookingAnalytics(req), getPopularTours(req)]);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 48:** `return res.status(200).json({ success: true, data: { revenue, bookings, popularTours } });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `revenueAnalytics` — lines 54–62

Parameters: `req`, `res`, `next`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 55:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 57:** `const revenue = await getRevenueAnalytics(req);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 58:** `return res.status(200).json({ success: true, data: { revenue } });` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 10: `export const getAnalytics = async (req, res, next) => {`.
- Line 13: `const filter = tenantFilter(req);`.
- Line 14: `const [revenue, bookings, popularTours, customers, bookingStatus, monthlyRevenue, vehicleStats, commissions] = await Promise.all([`.
- Line 35: `const reportedRevenue = Number(revenue?.totalRevenue || 0);`.
- Line 36: `const commissionCost = Number(commissions?.[0]?.totalCommission || 0);`.
- Line 37: `const profitability = { reportedRevenue, commissionCost, contributionMargin: Math.max(0, reportedRevenue - commissionCost), marginPercent: reportedRevenue ? Math.round(((reportedRe`.
- Line 44: `export const dashboardAnalytics = async (req, res, next) => {`.
- Line 47: `const [revenue, bookings, popularTours] = await Promise.all([getRevenueAnalytics(req), getBookingAnalytics(req), getPopularTours(req)]);`.
- Line 54: `export const revenueAnalytics = async (req, res, next) => {`.
- Line 57: `const revenue = await getRevenueAnalytics(req);`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
