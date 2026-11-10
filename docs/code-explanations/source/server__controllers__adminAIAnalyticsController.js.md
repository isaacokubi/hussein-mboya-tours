# Source explanation: server/controllers/adminAIAnalyticsController.js

**Source:** [server/controllers/adminAIAnalyticsController.js](../../../server/controllers/adminAIAnalyticsController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `tenantFilter` from `../tenancy/tenantQuery.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/tenantQuery.js](../../../server/tenancy/tenantQuery.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `Payment` from `../models/Payment.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Payment.js](../../../server/models/Payment.js)
- `Tour` from `../models/Tour.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Tour.js](../../../server/models/Tour.js)

## Runtime declarations and data flow

### `getAIAnalytics` — lines 7–51

Parameters: `req`, `res`, `next`.
Persistent operations detected: Payment.aggregate, Booking.aggregate, Tour.countDocuments, Booking.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 8:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 10:** `const filter = tenantFilter(req);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 11:** `const bookingFilter = { ...filter, isDeleted: { $ne: true } };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 12:** `const paymentFilter = { ...filter, status: "completed" };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 13:** `const tourFilter = { ...filter, isDeleted: { $ne: true } };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 15:** `const [monthlyRevenue, bookingActivity, topTours, bookingStatus, totalTours, recentBookings] = await Promise.all([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 16:** `Payment.aggregate([` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 21:** `Booking.aggregate([` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 27:** `Booking.aggregate([` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 35:** `Booking.aggregate([` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 40:** `Tour.countDocuments(tourFilter),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 41:** `Booking.find(bookingFilter).sort({ createdAt: -1 }).limit(10).populate("tour")` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 44:** `return res.json({` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 7: `export const getAIAnalytics = async (req, res, next) => {`.
- Line 10: `const filter = tenantFilter(req);`.
- Line 11: `const bookingFilter = { ...filter, isDeleted: { $ne: true } };`.
- Line 12: `const paymentFilter = { ...filter, status: "completed" };`.
- Line 13: `const tourFilter = { ...filter, isDeleted: { $ne: true } };`.
- Line 15: `const [monthlyRevenue, bookingActivity, topTours, bookingStatus, totalTours, recentBookings] = await Promise.all([`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
