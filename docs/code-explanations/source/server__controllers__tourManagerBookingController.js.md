# Source explanation: server/controllers/tourManagerBookingController.js

**Source:** [server/controllers/tourManagerBookingController.js](../../../server/controllers/tourManagerBookingController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)

## Runtime declarations and data flow

### `getTourManagerBookings` — lines 8–89

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. Persistent operations detected: Booking.find, Booking.countDocuments; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 10:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 11:** `const page = Math.max(Number(req.query.page) || 1, 1);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 12:** `const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 13:** `const { status, paymentStatus, search, tour } = req.query;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 14:** `const filter = mergeTenantFilter(req, { isDeleted: { $ne: true } });` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 16:** `if (status) filter.status = status;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 17:** `if (paymentStatus) filter.paymentStatus = paymentStatus;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 18:** `if (tour && mongoose.Types.ObjectId.isValid(tour)) filter.tour = tour;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 20:** `if (search?.trim()) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 21:** `const regex = { $regex: search.trim(), $options: "i" };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 31:** `const [bookings, total] = await Promise.all([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 32:** `Booking.find(filter)` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 43:** `Booking.countDocuments(filter),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 46:** `const normalizedBookings = bookings.map((booking) => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 47:** `const customer = booking.customer || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 48:** `const user = booking.user || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 49:** `const snapshot = booking.customerSnapshot || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 50:** `const contact = booking.contact || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 5: `const customerProjection = "firstName lastName fullName name email phone user";`.
- Line 6: `const userProjection = "name firstName lastName email phone";`.
- Line 8: `export const getTourManagerBookings = async (req, res, next) => {`.
- Line 11: `const page = Math.max(Number(req.query.page) || 1, 1);`.
- Line 12: `const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);`.
- Line 13: `const { status, paymentStatus, search, tour } = req.query;`.
- Line 14: `const filter = mergeTenantFilter(req, { isDeleted: { $ne: true } });`.
- Line 21: `const regex = { $regex: search.trim(), $options: "i" };`.
- Line 31: `const [bookings, total] = await Promise.all([`.
- Line 46: `const normalizedBookings = bookings.map((booking) => {`.
- Line 47: `const customer = booking.customer || {};`.
- Line 48: `const user = booking.user || {};`.
- Line 49: `const snapshot = booking.customerSnapshot || {};`.
- Line 50: `const contact = booking.contact || {};`.
- Line 52: `const customerName = [`.
- Line 60: `const customerEmail = customer.email || user.email || snapshot.email || contact.email || "";`.
- Line 61: `const customerPhone = customer.phone || user.phone || snapshot.phone || contact.phone || "";`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
