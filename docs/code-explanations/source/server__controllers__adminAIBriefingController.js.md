# Source explanation: server/controllers/adminAIBriefingController.js

**Source:** [server/controllers/adminAIBriefingController.js](../../../server/controllers/adminAIBriefingController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `tenantFilter` from `../tenancy/tenantQuery.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/tenantQuery.js](../../../server/tenancy/tenantQuery.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `Payment` from `../models/Payment.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Payment.js](../../../server/models/Payment.js)
- `Review` from `../models/Review.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Review.js](../../../server/models/Review.js)
- `Tour` from `../models/Tour.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Tour.js](../../../server/models/Tour.js)
- `getBookingRevenueMetrics` from `../services/bookingRevenueService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/bookingRevenueService.js](../../../server/services/bookingRevenueService.js)

## Runtime declarations and data flow

### `getAIBriefing` — lines 9–46

Parameters: `req`, `res`, `next`.
Persistent operations detected: Booking.countDocuments, Review.aggregate, Tour.countDocuments; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 10:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 12:** `const filter = tenantFilter(req);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 13:** `const bookingFilter = { ...filter, isDeleted: { $ne: true } };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 14:** `const [pendingBookings, confirmedBookings, paidBookings, completedPayments, reviews, totalTours] = await Promise.all([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 15:** `Booking.countDocuments({ ...bookingFilter, status: "pending" }),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 16:** `Booking.countDocuments({ ...bookingFilter, status: "confirmed" }),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 17:** `Booking.countDocuments({ ...bookingFilter, paymentStatus: "paid" }),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 19:** `Review.aggregate([` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 23:** `Tour.countDocuments({ ...filter, isDeleted: { $ne: true } })` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 26:** `const revenue = Number(completedPayments?.revenue || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 27:** `const rating = reviews[0]?.average != null ? Number(reviews[0].average.toFixed(1)) : 0;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 28:** `const recommendations = [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 30:** `if (pendingBookings > 0) recommendations.push(\`Follow up ${pendingBookings} pending booking(s).\`);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 31:** `if (rating > 0 && rating < 4) recommendations.push("Review customer feedback and improve service quality.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 32:** `if (paidBookings > 10) recommendations.push("Prepare additional transport resources for high demand.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 33:** `if (totalTours === 0) recommendations.push("Add active tours so customers have inventory to browse and book.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 35:** `return res.json({` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 9: `export const getAIBriefing = async (req, res, next) => {`.
- Line 12: `const filter = tenantFilter(req);`.
- Line 13: `const bookingFilter = { ...filter, isDeleted: { $ne: true } };`.
- Line 14: `const [pendingBookings, confirmedBookings, paidBookings, completedPayments, reviews, totalTours] = await Promise.all([`.
- Line 26: `const revenue = Number(completedPayments?.revenue || 0);`.
- Line 27: `const rating = reviews[0]?.average != null ? Number(reviews[0].average.toFixed(1)) : 0;`.
- Line 28: `const recommendations = [];`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
