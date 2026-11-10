# Source explanation: server/controllers/bookingReportController.js

**Source:** [server/controllers/bookingReportController.js](../../../server/controllers/bookingReportController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)

## Runtime declarations and data flow

### `firstNonEmpty` — lines 14–25

Parameters: `...values`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `populateAgent` — lines 48–53

Parameters: `query`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `isValidObjectId` — lines 55–55

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `dailyBookingReport` — lines 57–77

Parameters: `req`, `res`, `next`.
Persistent operations detected: Booking.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 58:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 60:** `const start = new Date();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 62:** `const end = new Date();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 65:** `let bookingQuery = Booking.find(` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 71:** `const bookings = await bookingQuery;` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 73:** `res.json({ success: true, count: bookings.length, bookings });` — Sends a JSON response; inspect its caller for status and error semantics.

### `monthlyBookingReport` — lines 79–102

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. Persistent operations detected: Booking.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 80:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 82:** `const now = new Date();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 83:** `const yearValue = Number(req.query.year);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 84:** `const monthValue = Number(req.query.month);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 85:** `const year = Number.isInteger(yearValue) && yearValue >= 2000 ? yearValue : now.getFullYear();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 86:** `const month = Number.isInteger(monthValue) && monthValue >= 1 && monthValue <= 12 ? monthValue : now.getMonth() + 1;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 87:** `const start = new Date(year, month - 1, 1);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 88:** `const end = new Date(year, month, 0, 23, 59, 59, 999);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 90:** `let bookingQuery = Booking.find(` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 96:** `const bookings = await bookingQuery;` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 98:** `res.json({ success: true, year, month, count: bookings.length, bookings });` — Sends a JSON response; inspect its caller for status and error semantics.

### `tourBookingReport` — lines 104–227

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.tenantId. Persistent operations detected: Booking.aggregate; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 105:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 107:** `const data = await Booking.aggregate([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 117:** `let: { bookingId: "$_id", tenantId: "$tenantId" },` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 223:** `res.json({ success: true, count: data.length, data });` — Sends a JSON response; inspect its caller for status and error semantics.

### `agentBookingReport` — lines 229–318

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.tenantId. Persistent operations detected: Booking.aggregate; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 230:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 232:** `const data = await Booking.aggregate([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 314:** `res.json({ success: true, count: data.length, data });` — Sends a JSON response; inspect its caller for status and error semantics.

## Module-level declarations

- Line 5: `const agentLookupStages = [`.
- Line 14: `const firstNonEmpty = (...values) => ({`.
- Line 27: `const agentNameExpression = firstNonEmpty(`.
- Line 36: `const agentEmailExpression = firstNonEmpty(`.
- Line 42: `const agentPhoneExpression = firstNonEmpty(`.
- Line 48: `const populateAgent = (query) =>`.
- Line 55: `const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);`.
- Line 57: `export const dailyBookingReport = async (req, res, next) => {`.
- Line 60: `const start = new Date();`.
- Line 62: `const end = new Date();`.
- Line 65: `let bookingQuery = Booking.find(`.
- Line 71: `const bookings = await bookingQuery;`.
- Line 79: `export const monthlyBookingReport = async (req, res, next) => {`.
- Line 82: `const now = new Date();`.
- Line 83: `const yearValue = Number(req.query.year);`.
- Line 84: `const monthValue = Number(req.query.month);`.
- Line 85: `const year = Number.isInteger(yearValue) && yearValue >= 2000 ? yearValue : now.getFullYear();`.
- Line 86: `const month = Number.isInteger(monthValue) && monthValue >= 1 && monthValue <= 12 ? monthValue : now.getMonth() + 1;`.
- Line 87: `const start = new Date(year, month - 1, 1);`.
- Line 88: `const end = new Date(year, month, 0, 23, 59, 59, 999);`.
- Line 90: `let bookingQuery = Booking.find(`.
- Line 96: `const bookings = await bookingQuery;`.
- Line 104: `export const tourBookingReport = async (req, res, next) => {`.
- Line 107: `const data = await Booking.aggregate([`.
- Line 229: `export const agentBookingReport = async (req, res, next) => {`.
- Line 232: `const data = await Booking.aggregate([`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
