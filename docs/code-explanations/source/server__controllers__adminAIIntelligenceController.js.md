# Source explanation: server/controllers/adminAIIntelligenceController.js

**Source:** [server/controllers/adminAIIntelligenceController.js](../../../server/controllers/adminAIIntelligenceController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `tenantFilter` from `../tenancy/tenantQuery.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/tenantQuery.js](../../../server/tenancy/tenantQuery.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `Payment` from `../models/Payment.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Payment.js](../../../server/models/Payment.js)
- `Review` from `../models/Review.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Review.js](../../../server/models/Review.js)
- `Tour` from `../models/Tour.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Tour.js](../../../server/models/Tour.js)
- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)
- `Vehicle` from `../models/Vehicle.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Vehicle.js](../../../server/models/Vehicle.js)
- `getBookingRevenueMetrics` from `../services/bookingRevenueService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/bookingRevenueService.js](../../../server/services/bookingRevenueService.js)

## Runtime declarations and data flow

### `getAIIntelligence` — lines 11–87

Parameters: `req`, `res`, `next`.
Persistent operations detected: Booking.countDocuments, Payment.countDocuments, Booking.aggregate, Review.aggregate, Tour.countDocuments, User.countDocuments, Vehicle.countDocuments; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 12:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 14:** `const filter = tenantFilter(req);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 15:** `const bookingFilter = { ...filter, isDeleted: { $ne: true } };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 16:** `const paymentFilter = { ...filter };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 17:** `const tourFilter = { ...filter, isDeleted: { $ne: true } };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 18:** `const reviewFilter = { ...filter };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 19:** `const customerFilter = { ...filter, $or: [{ role: "customer" }, { legacyRole: "customer" }] };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 20:** `const vehicleFilter = { ...filter, isDeleted: { $ne: true } };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 22:** `const [` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 34:** `Booking.countDocuments(bookingFilter),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 35:** `Booking.countDocuments({ ...bookingFilter, status: { $in: ["confirmed", "completed"] } }),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 36:** `Payment.countDocuments({ ...paymentFilter, status: "failed" }),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 38:** `Booking.aggregate([` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 42:** `Booking.aggregate([` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 49:** `Review.aggregate([` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 53:** `Tour.countDocuments(tourFilter),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 54:** `User.countDocuments(customerFilter),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 55:** `Vehicle.countDocuments(vehicleFilter)` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 11: `export const getAIIntelligence = async (req, res, next) => {`.
- Line 14: `const filter = tenantFilter(req);`.
- Line 15: `const bookingFilter = { ...filter, isDeleted: { $ne: true } };`.
- Line 16: `const paymentFilter = { ...filter };`.
- Line 17: `const tourFilter = { ...filter, isDeleted: { $ne: true } };`.
- Line 18: `const reviewFilter = { ...filter };`.
- Line 19: `const customerFilter = { ...filter, $or: [{ role: "customer" }, { legacyRole: "customer" }] };`.
- Line 20: `const vehicleFilter = { ...filter, isDeleted: { $ne: true } };`.
- Line 22: `const [`.
- Line 58: `const conversionRate = totalBookings`.
- Line 61: `const recommendations = [];`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
