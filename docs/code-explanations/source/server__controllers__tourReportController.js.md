# Source explanation: server/controllers/tourReportController.js

**Source:** [server/controllers/tourReportController.js](../../../server/controllers/tourReportController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `Tour` from `../models/Tour.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Tour.js](../../../server/models/Tour.js)
- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)
- `Payment` from `../models/Payment.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Payment.js](../../../server/models/Payment.js)
- `getBookingRevenueMetrics` from `../services/bookingRevenueService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/bookingRevenueService.js](../../../server/services/bookingRevenueService.js)
- `getPostedRevenueReport` from `../services/financeReportingService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/financeReportingService.js](../../../server/services/financeReportingService.js)

## Runtime declarations and data flow

### `getTourReports` — lines 9–45

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.tenantId. Persistent operations detected: Booking.countDocuments, Booking.aggregate, Payment.aggregate, User.countDocuments, Tour.countDocuments; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 11:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 12:** `const bookingFilter = mergeTenantFilter(req, { isDeleted: { $ne: true } });` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 13:** `const paymentFilter = mergeTenantFilter(req, { status: "completed", isDeleted: { $ne: true } });` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 14:** `const tourFilter = mergeTenantFilter(req, { isDeleted: { $ne: true } });` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 15:** `const tenantId = req.tenantId;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 17:** `const [totalBookings, revenueResult, bookingStatus, popularTours, monthlyRevenue, totalCustomers, totalTours, completedTours] = await Promise.all([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 18:** `Booking.countDocuments(bookingFilter),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 20:** `Booking.aggregate([{ $match: bookingFilter }, { $group: { _id: "$status", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 21:** `Payment.aggregate([` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 38:** `User.countDocuments(mergeTenantFilter(req, { $or: [{ role: "customer" }, { legacyRole: "customer" }] })),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 39:** `Tour.countDocuments(tourFilter),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 40:** `Tour.countDocuments(mergeTenantFilter(req, { status: "completed", isDeleted: { $ne: true } })),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 43:** `return res.status(200).json({ success: true, data: { totalBookings, totalRevenue: Number(revenueResult?.revenue || 0), totalCustomers, totalTours, completedTours, bookingStatus, popularTours, monthlyRevenue: monthlyReven` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 9: `export const getTourReports = async (req, res, next) => {`.
- Line 12: `const bookingFilter = mergeTenantFilter(req, { isDeleted: { $ne: true } });`.
- Line 13: `const paymentFilter = mergeTenantFilter(req, { status: "completed", isDeleted: { $ne: true } });`.
- Line 14: `const tourFilter = mergeTenantFilter(req, { isDeleted: { $ne: true } });`.
- Line 15: `const tenantId = req.tenantId;`.
- Line 17: `const [totalBookings, revenueResult, bookingStatus, popularTours, monthlyRevenue, totalCustomers, totalTours, completedTours] = await Promise.all([`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
