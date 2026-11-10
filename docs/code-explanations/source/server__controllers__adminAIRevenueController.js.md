# Source explanation: server/controllers/adminAIRevenueController.js

**Source:** [server/controllers/adminAIRevenueController.js](../../../server/controllers/adminAIRevenueController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `tenantFilter` from `../tenancy/tenantQuery.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/tenantQuery.js](../../../server/tenancy/tenantQuery.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `Payment` from `../models/Payment.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Payment.js](../../../server/models/Payment.js)
- `Tour` from `../models/Tour.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Tour.js](../../../server/models/Tour.js)
- `getBookingRevenueMetrics` from `../services/bookingRevenueService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/bookingRevenueService.js](../../../server/services/bookingRevenueService.js)

## Runtime declarations and data flow

### `getAIRevenueAdvice` — lines 8–46

Parameters: `req`, `res`, `next`.
Persistent operations detected: Booking.countDocuments, Tour.countDocuments, Booking.aggregate; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 9:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 11:** `const filter = tenantFilter(req);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 12:** `const bookingFilter = { ...filter, isDeleted: { $ne: true } };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 13:** `const [totalBookings, revenue, tours, topTours] = await Promise.all([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 14:** `Booking.countDocuments(bookingFilter),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 16:** `Tour.countDocuments({ ...filter, isDeleted: { $ne: true } }),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 17:** `Booking.aggregate([` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 27:** `const totalRevenue = Number(revenue?.revenue || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 28:** `const recommendations = [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 29:** `if (totalBookings < 20) recommendations.push("Increase marketing campaigns because booking volume is currently low.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 30:** `if (totalRevenue > 0) recommendations.push("Create premium packages to increase average booking value.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 31:** `if (topTours.length) recommendations.push("Focus advertising budget on your highest performing tours.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 32:** `if (tours > 0) recommendations.push("Create seasonal promotions for destinations with lower demand.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 33:** `if (!recommendations.length) recommendations.push("Collect more booking performance data to generate stronger revenue recommendations.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 35:** `return res.json({` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 8: `export const getAIRevenueAdvice = async (req, res, next) => {`.
- Line 11: `const filter = tenantFilter(req);`.
- Line 12: `const bookingFilter = { ...filter, isDeleted: { $ne: true } };`.
- Line 13: `const [totalBookings, revenue, tours, topTours] = await Promise.all([`.
- Line 27: `const totalRevenue = Number(revenue?.revenue || 0);`.
- Line 28: `const recommendations = [];`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
