# Source explanation: server/controllers/customerDashboardController.js

**Source:** [server/controllers/customerDashboardController.js](../../../server/controllers/customerDashboardController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mergeTenantFilter` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `Customer` from `../models/Customer.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Customer.js](../../../server/models/Customer.js)

## Runtime declarations and data flow

### `normalizeStatus` — lines 5–6

Parameters: `booking`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `normalizePaymentStatus` — lines 8–15

Parameters: `booking`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `ownershipFilter` — lines 17–28

Parameters: `req`.
Reads request/component inputs: req.user. Persistent operations detected: Customer.findOne; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 18:** `const customerProfile = await Customer.findOne(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 24:** `const ownership = [{ user: req.user._id }];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 25:** `if (customerProfile?._id) ownership.push({ customer: customerProfile._id });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 27:** `return mergeTenantFilter({ $or: ownership, isDeleted: { $ne: true } });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getCustomerBookings` — lines 35–111

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. Persistent operations detected: Booking.countDocuments, Booking.find; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 36:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 37:** `const page = Math.max(Number(req.query.page) || 1, 1);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 38:** `const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 39:** `const skip = (page - 1) * limit;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 40:** `const filter = await ownershipFilter(req);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 42:** `const [total, bookings, allBookings] = await Promise.all([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 43:** `Booking.countDocuments(filter),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 44:** `Booking.find(filter)` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 52:** `Booking.find(filter)` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 57:** `const now = new Date();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 58:** `const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 60:** `const upcoming = allBookings.filter((booking) => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 61:** `if (!booking.travelDate) return false;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 62:** `const travelDate = new Date(booking.travelDate);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 63:** `return travelDate >= startOfToday && !["cancelled", "refunded"].includes(normalizeStatus(booking));` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 66:** `const completed = allBookings.filter(` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 70:** `const cancelled = allBookings.filter(` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 74:** `const totalSpent = allBookings.reduce((sum, booking) => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 5: `const normalizeStatus = (booking) =>`.
- Line 8: `const normalizePaymentStatus = (booking) =>`.
- Line 17: `const ownershipFilter = async (req) => {`.
- Line 18: `const customerProfile = await Customer.findOne(`.
- Line 24: `const ownership = [{ user: req.user._id }];`.
- Line 35: `export const getCustomerBookings = async (req, res, next) => {`.
- Line 37: `const page = Math.max(Number(req.query.page) || 1, 1);`.
- Line 38: `const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);`.
- Line 39: `const skip = (page - 1) * limit;`.
- Line 40: `const filter = await ownershipFilter(req);`.
- Line 42: `const [total, bookings, allBookings] = await Promise.all([`.
- Line 57: `const now = new Date();`.
- Line 58: `const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());`.
- Line 60: `const upcoming = allBookings.filter((booking) => {`.
- Line 62: `const travelDate = new Date(booking.travelDate);`.
- Line 66: `const completed = allBookings.filter(`.
- Line 70: `const cancelled = allBookings.filter(`.
- Line 74: `const totalSpent = allBookings.reduce((sum, booking) => {`.
- Line 75: `const status = normalizeStatus(booking);`.
- Line 76: `const paymentStatus = normalizePaymentStatus(booking);`.
- Line 80: `const paid = Number(`.
- Line 88: `const refund = Number(booking.refundAmount || 0);`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
