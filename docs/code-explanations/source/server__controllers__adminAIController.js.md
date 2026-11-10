# Source explanation: server/controllers/adminAIController.js

**Source:** [server/controllers/adminAIController.js](../../../server/controllers/adminAIController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `tenantFilter` from `../tenancy/tenantQuery.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/tenantQuery.js](../../../server/tenancy/tenantQuery.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `Payment` from `../models/Payment.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Payment.js](../../../server/models/Payment.js)
- `Tour` from `../models/Tour.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Tour.js](../../../server/models/Tour.js)
- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)
- `Vehicle` from `../models/Vehicle.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Vehicle.js](../../../server/models/Vehicle.js)
- `Review` from `../models/Review.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Review.js](../../../server/models/Review.js)
- `generateTravelAdvice` from `../services/aiService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/aiService.js](../../../server/services/aiService.js)
- `getBookingRevenueMetrics` from `../services/bookingRevenueService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/bookingRevenueService.js](../../../server/services/bookingRevenueService.js)

## Runtime declarations and data flow

### `getAIDashboard` — lines 12–27

Parameters: `req`, `res`, `next`.
Persistent operations detected: Booking.countDocuments, Tour.countDocuments, User.countDocuments, Vehicle.countDocuments, Review.countDocuments; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 13:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 15:** `const filter = tenantFilter(req);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 16:** `const [bookings, revenue, pendingPayments, tours, customers, vehicles, reviews] = await Promise.all([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 17:** `Booking.countDocuments({ ...filter, isDeleted: { $ne: true } }),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 19:** `Booking.countDocuments({ ...filter, paymentStatus: "pending", isDeleted: { $ne: true } }),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 20:** `Tour.countDocuments({ ...filter, isDeleted: { $ne: true } }),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 21:** `User.countDocuments({ ...filter, $or: [{ role: "customer" }, { legacyRole: "customer" }] }),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 22:** `Vehicle.countDocuments({ ...filter, isDeleted: { $ne: true } }),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 23:** `Review.countDocuments(filter),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 25:** `return res.json({ success: true, data: { bookings, revenue: revenue?.revenue || 0, pendingPayments, tours, customers, vehicles, reviews } });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `adminAIQuery` — lines 29–45

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.user. Persistent operations detected: Booking.countDocuments, Payment.countDocuments, Tour.countDocuments, Vehicle.countDocuments, Review.countDocuments; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 30:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 32:** `const filter = tenantFilter(req);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 33:** `const { message } = req.body;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 34:** `const [bookings, payments, tours, vehicles, reviews] = await Promise.all([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 35:** `Booking.countDocuments({ ...filter, isDeleted: { $ne: true } }),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 36:** `Payment.countDocuments(filter),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 37:** `Tour.countDocuments({ ...filter, isDeleted: { $ne: true } }),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 38:** `Vehicle.countDocuments({ ...filter, isDeleted: { $ne: true } }),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 39:** `Review.countDocuments(filter),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 41:** `const context = \`You are an AI operations assistant for a tour company.\n\nBusiness data:\nBookings: ${bookings}\nPayments: ${payments}\nTours: ${tours}\nVehicles: ${vehicles}\nReviews: ${reviews}\n\nAdmin question:\n${` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 42:** `const reply = await generateTravelAdvice(context, req.user);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 43:** `return res.json({ success: true, data: { reply } });` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 12: `export const getAIDashboard = async (req, res, next) => {`.
- Line 15: `const filter = tenantFilter(req);`.
- Line 16: `const [bookings, revenue, pendingPayments, tours, customers, vehicles, reviews] = await Promise.all([`.
- Line 29: `export const adminAIQuery = async (req, res, next) => {`.
- Line 32: `const filter = tenantFilter(req);`.
- Line 33: `const { message } = req.body;`.
- Line 34: `const [bookings, payments, tours, vehicles, reviews] = await Promise.all([`.
- Line 41: `const context = \`You are an AI operations assistant for a tour company.\n\nBusiness data:\nBookings: ${bookings}\nPayments: ${payments}\nTours: ${tours}\nVehicles: ${vehicles}\nRe`.
- Line 42: `const reply = await generateTravelAdvice(context, req.user);`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
