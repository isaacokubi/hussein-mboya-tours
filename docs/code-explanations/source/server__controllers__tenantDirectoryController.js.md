# Source explanation: server/controllers/tenantDirectoryController.js

**Source:** [server/controllers/tenantDirectoryController.js](../../../server/controllers/tenantDirectoryController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)
- `Staff` from `../models/Staff.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Staff.js](../../../server/models/Staff.js)
- `Vehicle` from `../models/Vehicle.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Vehicle.js](../../../server/models/Vehicle.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `Customer` from `../models/Customer.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Customer.js](../../../server/models/Customer.js)

## Runtime declarations and data flow

### `getStaffByPosition` — lines 8–17

Parameters: `req`, `res`, `next`, `positions`.
Persistent operations detected: Staff.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 10:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 11:** `const staff = await Staff.find(mergeTenantFilter(req, { position: { $in: positions }, isActive: true, isDeleted: { $ne: true } }))` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 15:** `return res.status(200).json({ success: true, count: staff.length, data: staff, staff });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getTenantGuides` — lines 19–19

Parameters: `req`, `res`, `next`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `getTenantDrivers` — lines 20–20

Parameters: `req`, `res`, `next`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `getTenantVehicles` — lines 22–30

Parameters: `req`, `res`, `next`.
Persistent operations detected: Vehicle.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 24:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 25:** `const vehicles = await Vehicle.find(mergeTenantFilter(req, { isDeleted: { $ne: true } }))` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 28:** `return res.status(200).json({ success: true, count: vehicles.length, data: vehicles, vehicles });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getTenantCustomers` — lines 32–64

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. Persistent operations detected: User.find, User.countDocuments, Customer.find, Booking.find; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 34:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 35:** `const { search = "", page = 1, limit = 10 } = req.query;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 36:** `const currentPage = Math.max(Number(page) || 1, 1);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 37:** `const pageSize = Math.min(Math.max(Number(limit) || 10, 1), 50);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 38:** `const filter = mergeTenantFilter(req, { isDeleted: { $ne: true }, $or: [{ role: "customer" }, { legacyRole: "customer" }] });` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 39:** `const term = String(search).trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 40:** `if (term) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 41:** `const regex = { $regex: term, $options: "i" };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 45:** `const [customers, total] = await Promise.all([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 46:** `User.find(filter).select("name email phone role roleId status createdAt").sort({ createdAt: -1 }).skip((currentPage - 1) * pageSize).limit(pageSize).lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 47:** `User.countDocuments(filter),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 49:** `const ids = customers.map((customer) => customer._id);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 50:** `const legacy = await Customer.find(mergeTenantFilter(req, { user: { $in: ids } })).select("_id user customerType").lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 51:** `const legacyMap = new Map(legacy.map((record) => [record.user?.toString(), record]));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 52:** `const bookingStats = await Booking.find(mergeTenantFilter(req, { isDeleted: { $ne: true }, user: { $in: ids } })).select("user status totalAmount depositAmount refundAmount paymentStatus").lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 53:** `const stats = new Map();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 54:** `for (const booking of bookingStats) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 55:** `const key = booking.user?.toString(); if (!key) continue;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 8: `const getStaffByPosition = async (req, res, next, positions) => {`.
- Line 11: `const staff = await Staff.find(mergeTenantFilter(req, { position: { $in: positions }, isActive: true, isDeleted: { $ne: true } }))`.
- Line 19: `export const getTenantGuides = async (req, res, next) => getStaffByPosition(req, res, next, ["guide", "tour_guide", "tourguide"]);`.
- Line 20: `export const getTenantDrivers = async (req, res, next) => getStaffByPosition(req, res, next, ["driver"]);`.
- Line 22: `export const getTenantVehicles = async (req, res, next) => {`.
- Line 25: `const vehicles = await Vehicle.find(mergeTenantFilter(req, { isDeleted: { $ne: true } }))`.
- Line 32: `export const getTenantCustomers = async (req, res, next) => {`.
- Line 35: `const { search = "", page = 1, limit = 10 } = req.query;`.
- Line 36: `const currentPage = Math.max(Number(page) || 1, 1);`.
- Line 37: `const pageSize = Math.min(Math.max(Number(limit) || 10, 1), 50);`.
- Line 38: `const filter = mergeTenantFilter(req, { isDeleted: { $ne: true }, $or: [{ role: "customer" }, { legacyRole: "customer" }] });`.
- Line 39: `const term = String(search).trim();`.
- Line 41: `const regex = { $regex: term, $options: "i" };`.
- Line 45: `const [customers, total] = await Promise.all([`.
- Line 49: `const ids = customers.map((customer) => customer._id);`.
- Line 50: `const legacy = await Customer.find(mergeTenantFilter(req, { user: { $in: ids } })).select("_id user customerType").lean();`.
- Line 51: `const legacyMap = new Map(legacy.map((record) => [record.user?.toString(), record]));`.
- Line 52: `const bookingStats = await Booking.find(mergeTenantFilter(req, { isDeleted: { $ne: true }, user: { $in: ids } })).select("user status totalAmount depositAmount refundAmount payment`.
- Line 53: `const stats = new Map();`.
- Line 55: `const key = booking.user?.toString(); if (!key) continue;`.
- Line 56: `const current = stats.get(key) || { totalBookings: 0, totalSpent: 0 };`.
- Line 61: `const data = customers.map((customer) => ({ ...customer, customerType: legacyMap.get(customer._id.toString())?.customerType || "individual", isActive: customer.status === "active",`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
