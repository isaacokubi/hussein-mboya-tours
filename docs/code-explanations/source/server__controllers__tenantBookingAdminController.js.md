# Source explanation: server/controllers/tenantBookingAdminController.js

**Source:** [server/controllers/tenantBookingAdminController.js](../../../server/controllers/tenantBookingAdminController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `Customer` from `../models/Customer.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Customer.js](../../../server/models/Customer.js)
- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)
- `Tour` from `../models/Tour.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Tour.js](../../../server/models/Tour.js)
- `Staff` from `../models/Staff.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Staff.js](../../../server/models/Staff.js)
- `Vehicle` from `../models/Vehicle.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Vehicle.js](../../../server/models/Vehicle.js)
- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `BOOKING_STATUSES`, `BOOKING_PAYMENT_STATUSES` from `../constants/bookingConstants.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/constants/bookingConstants.js](../../../server/constants/bookingConstants.js)

## Runtime declarations and data flow

### `populateBookings` — lines 11–17

Parameters: `query`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `refId` — lines 19–23

Parameters: `value`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 20:** `if (!value) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 21:** `if (typeof value === "object" && value._id) return value._id;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 22:** `return value;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `loadOwnership` — lines 25–34

Parameters: `model`, `ids`, `tenantId`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 26:** `const validIds = [...new Set(ids.filter((id) => id && mongoose.Types.ObjectId.isValid(id)).map(String))]` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 28:** `if (!validIds.length) return new Map();` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 29:** `const rows = await model.collection.find(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 33:** `return new Map(rows.map((row) => [String(row._id), row.tenantId ? String(row.tenantId) : null]));` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `normalizeEmail` — lines 36–36

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `loadEmailTenantOwnership` — lines 38–61

Parameters: `emails`, `tenantId`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 39:** `const normalized = [...new Set(emails.map(normalizeEmail).filter(Boolean))];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 40:** `if (!normalized.length) return new Map();` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 42:** `const [customerRows, userRows] = await Promise.all([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 43:** `Customer.collection.find(` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 47:** `User.collection.find(` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 53:** `const ownership = new Map();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 54:** `for (const row of [...customerRows, ...userRows]) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 55:** `const email = normalizeEmail(row.email);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 56:** `if (!email || !row.tenantId) continue;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 57:** `if (!ownership.has(email)) ownership.set(email, new Set());` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 60:** `return ownership;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getReferenceOwnership` — lines 63–86

Parameters: `bookings`, `tenantId`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller.

Key statements:
- **Line 64:** `const customerIds = bookings.map((b) => refId(b.customer)).filter(Boolean);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 65:** `const userIds = bookings.map((b) => refId(b.user)).filter(Boolean);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 66:** `const tourIds = bookings.map((b) => refId(b.tour)).filter(Boolean);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 67:** `const guideIds = bookings.map((b) => refId(b.assignedGuide)).filter(Boolean);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 68:** `const driverIds = bookings.map((b) => refId(b.assignedDriver)).filter(Boolean);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 69:** `const vehicleIds = bookings.map((b) => refId(b.assignedVehicle)).filter(Boolean);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 70:** `const emails = bookings.flatMap((b) => [` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 76:** `const [customers, users, tours, guides, drivers, vehicles, emailOwners] = await Promise.all([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 85:** `return { customers, users, tours, guides, drivers, vehicles, emailOwners };` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `snapshotIdentityBelongsToTenant` — lines 88–103

Parameters: `booking`, `tenantId`, `emailOwners`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 89:** `const expected = String(tenantId);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 90:** `const emails = [` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 96:** `return emails.every((email) => {` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 97:** `const owners = emailOwners.get(email);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 100:** `if (!owners) return true;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 101:** `return owners.has(expected);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `belongsToTenant` — lines 105–127

Parameters: `booking`, `tenantId`, `ownership`.
3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 106:** `const expected = String(tenantId);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 107:** `const checks = [` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 116:** `if (!snapshotIdentityBelongsToTenant(booking, tenantId, ownership.emailOwners)) return false;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 118:** `return checks.every(([reference, owners]) => {` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 119:** `const id = refId(reference);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 120:** `if (!id) return true;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 121:** `const ownerTenantId = owners.get(String(id));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 124:** `if (ownerTenantId === undefined || ownerTenantId === null) return false;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 125:** `return ownerTenantId === expected;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `filterTenantConsistentBookings` — lines 129–132

Parameters: `bookings`, `tenantId`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller.

Key statements:
- **Line 130:** `const ownership = await getReferenceOwnership(bookings, tenantId);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 131:** `return bookings.filter((booking) => belongsToTenant(booking, tenantId, ownership));` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getAllBookings` — lines 134–171

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. Persistent operations detected: Booking.find; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 135:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 136:** `const tenantId = requireTenantId();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 137:** `const { page = 1, limit = 20, search, status, paymentStatus } = req.query;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 138:** `const currentPage = Math.max(Number(page) || 1, 1);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 139:** `const pageSize = Math.min(Math.max(Number(limit) || 20, 1), 100);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 140:** `const filter = { tenantId, isDeleted: { $ne: true } };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 141:** `if (search) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 142:** `const regex = { $regex: String(search).trim(), $options: "i" };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 153:** `if (status && BOOKING_STATUSES.includes(status)) filter.status = status;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 154:** `if (paymentStatus && BOOKING_PAYMENT_STATUSES.includes(paymentStatus)) filter.paymentStatus = paymentStatus;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 155:** `const tenantFilter = mergeTenantFilter(filter);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 156:** `const candidates = await populateBookings(Booking.find(tenantFilter).sort({ createdAt: -1 }).lean());` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 157:** `const safeBookings = await filterTenantConsistentBookings(candidates, tenantId);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 158:** `const total = safeBookings.length;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 159:** `const skip = (currentPage - 1) * pageSize;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 160:** `const bookings = safeBookings.slice(skip, skip + pageSize);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 161:** `return res.status(200).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 169:** `return next(error);` — Exits this function and supplies its result (or response short-circuit) to the caller.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `getBooking` — lines 175–190

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. Persistent operations detected: Booking.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 176:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 177:** `const { id } = req.params;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 178:** `if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid booking ID." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 179:** `const tenantId = requireTenantId();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 180:** `const booking = await populateBookings(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 181:** `Booking.findOne(mergeTenantFilter({ _id: id, isDeleted: { $ne: true } }))` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 183:** `if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 184:** `const safeBookings = await filterTenantConsistentBookings([booking], tenantId);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 185:** `if (!safeBookings.length) return res.status(404).json({ success: false, message: "Booking not found." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 186:** `return res.status(200).json({ success: true, data: safeBookings[0], booking: safeBookings[0] });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 188:** `return next(error);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getConfirmedBookings` — lines 192–219

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. Persistent operations detected: Booking.find; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 193:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 194:** `const tenantId = requireTenantId();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 195:** `const currentPage = Math.max(Number(req.query.page) || 1, 1);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 196:** `const pageSize = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 197:** `const filter = mergeTenantFilter({` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 202:** `const candidates = await populateBookings(Booking.find(filter).sort({ travelDate: 1 }).lean());` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 203:** `const safeBookings = await filterTenantConsistentBookings(candidates, tenantId);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 204:** `const total = safeBookings.length;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 205:** `const skip = (currentPage - 1) * pageSize;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 206:** `const bookings = safeBookings.slice(skip, skip + pageSize);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 207:** `return res.status(200).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 217:** `return next(error);` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 11: `const populateBookings = (query) => query`.
- Line 19: `const refId = (value) => {`.
- Line 25: `const loadOwnership = async (model, ids, tenantId) => {`.
- Line 26: `const validIds = [...new Set(ids.filter((id) => id && mongoose.Types.ObjectId.isValid(id)).map(String))]`.
- Line 29: `const rows = await model.collection.find(`.
- Line 36: `const normalizeEmail = (value) => String(value || "").trim().toLowerCase();`.
- Line 38: `const loadEmailTenantOwnership = async (emails, tenantId) => {`.
- Line 39: `const normalized = [...new Set(emails.map(normalizeEmail).filter(Boolean))];`.
- Line 42: `const [customerRows, userRows] = await Promise.all([`.
- Line 53: `const ownership = new Map();`.
- Line 55: `const email = normalizeEmail(row.email);`.
- Line 63: `const getReferenceOwnership = async (bookings, tenantId) => {`.
- Line 64: `const customerIds = bookings.map((b) => refId(b.customer)).filter(Boolean);`.
- Line 65: `const userIds = bookings.map((b) => refId(b.user)).filter(Boolean);`.
- Line 66: `const tourIds = bookings.map((b) => refId(b.tour)).filter(Boolean);`.
- Line 67: `const guideIds = bookings.map((b) => refId(b.assignedGuide)).filter(Boolean);`.
- Line 68: `const driverIds = bookings.map((b) => refId(b.assignedDriver)).filter(Boolean);`.
- Line 69: `const vehicleIds = bookings.map((b) => refId(b.assignedVehicle)).filter(Boolean);`.
- Line 70: `const emails = bookings.flatMap((b) => [`.
- Line 76: `const [customers, users, tours, guides, drivers, vehicles, emailOwners] = await Promise.all([`.
- Line 88: `const snapshotIdentityBelongsToTenant = (booking, tenantId, emailOwners) => {`.
- Line 89: `const expected = String(tenantId);`.
- Line 90: `const emails = [`.
- Line 97: `const owners = emailOwners.get(email);`.
- Line 105: `const belongsToTenant = (booking, tenantId, ownership) => {`.
- Line 106: `const expected = String(tenantId);`.
- Line 107: `const checks = [`.
- Line 119: `const id = refId(reference);`.
- Line 121: `const ownerTenantId = owners.get(String(id));`.
- Line 129: `const filterTenantConsistentBookings = async (bookings, tenantId) => {`.
- Line 130: `const ownership = await getReferenceOwnership(bookings, tenantId);`.
- Line 134: `export const getAllBookings = async (req, res, next) => {`.
- Line 136: `const tenantId = requireTenantId();`.
- Line 137: `const { page = 1, limit = 20, search, status, paymentStatus } = req.query;`.
- Line 138: `const currentPage = Math.max(Number(page) || 1, 1);`.
- Line 139: `const pageSize = Math.min(Math.max(Number(limit) || 20, 1), 100);`.
- Line 140: `const filter = { tenantId, isDeleted: { $ne: true } };`.
- Line 142: `const regex = { $regex: String(search).trim(), $options: "i" };`.
- Line 155: `const tenantFilter = mergeTenantFilter(filter);`.
- Line 156: `const candidates = await populateBookings(Booking.find(tenantFilter).sort({ createdAt: -1 }).lean());`.
- Line 157: `const safeBookings = await filterTenantConsistentBookings(candidates, tenantId);`.
- Line 158: `const total = safeBookings.length;`.
- Line 159: `const skip = (currentPage - 1) * pageSize;`.
- Line 160: `const bookings = safeBookings.slice(skip, skip + pageSize);`.
- Line 173: `export const getBookings = getAllBookings;`.
- Line 175: `export const getBooking = async (req, res, next) => {`.
- Line 177: `const { id } = req.params;`.
- Line 179: `const tenantId = requireTenantId();`.
- Line 180: `const booking = await populateBookings(`.
- Line 184: `const safeBookings = await filterTenantConsistentBookings([booking], tenantId);`.
- Line 192: `export const getConfirmedBookings = async (req, res, next) => {`.
- Line 194: `const tenantId = requireTenantId();`.
- Line 195: `const currentPage = Math.max(Number(req.query.page) || 1, 1);`.
- Line 196: `const pageSize = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);`.
- Line 197: `const filter = mergeTenantFilter({`.
- Line 202: `const candidates = await populateBookings(Booking.find(filter).sort({ travelDate: 1 }).lean());`.
- Line 203: `const safeBookings = await filterTenantConsistentBookings(candidates, tenantId);`.
- Line 204: `const total = safeBookings.length;`.
- Line 205: `const skip = (currentPage - 1) * pageSize;`.
- Line 206: `const bookings = safeBookings.slice(skip, skip + pageSize);`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
