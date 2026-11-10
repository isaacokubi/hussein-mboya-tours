# Source explanation: server/controllers/adminBookingController.js

**Source:** [server/controllers/adminBookingController.js](../../../server/controllers/adminBookingController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `BOOKING_STATUSES`, `BOOKING_PAYMENT_STATUSES`, `canTransitionBookingStatus` from `../constants/bookingConstants.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/constants/bookingConstants.js](../../../server/constants/bookingConstants.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `Payment` from `../models/Payment.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Payment.js](../../../server/models/Payment.js)

## Runtime declarations and data flow

### `normalizePaymentStatus` — lines 12–15

Parameters: `value`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 13:** `if (typeof value === "string") return value.toLowerCase();` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 14:** `return String(value?.status || "pending").toLowerCase();` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getAllBookings` — lines 27–145

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. Persistent operations detected: Booking.find, Booking.countDocuments, Payment.find; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 8 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 29:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 30:** `const page = Math.max(Number(req.query.page) || 1, 1);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 31:** `const limit = Math.min(Number(req.query.limit) || 20, 100);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 32:** `const skip = (page - 1) * limit;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 34:** `const filter = {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 36:** `if (` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 45:** `const requestedPaymentStatus =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 51:** `if (requestedPaymentStatus && requestedPaymentStatus !== "paid") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 55:** `const [bookings, total] = await Promise.all([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 56:** `Booking.find(filter)` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 67:** `Booking.countDocuments(filter),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 70:** `const bookingIds = bookings.map((booking) => booking._id);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 72:** `const completedPayments = bookingIds.length` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 73:** `? await Payment.find({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 81:** `const paymentByBooking = new Map();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 83:** `for (const payment of completedPayments) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 84:** `const key = String(payment.booking);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 85:** `if (!paymentByBooking.has(key)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `getBookingById` — lines 152–211

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. Persistent operations detected: Booking.findOne, Payment.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 153:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 154:** `if (!mongoose.Types.ObjectId.isValid(req.params.id)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 155:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 161:** `const booking = await Booking.findOne(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 174:** `if (!booking) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 175:** `return res.status(404).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 181:** `const payment = await Payment.findOne({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 188:** `const reconciledBooking = payment` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 204:** `return res.status(200).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `updateBookingStatus` — lines 218–262

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.params. Persistent operations detected: Booking.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 219:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 220:** `const requestedStatus = String(req.body?.status || "").trim().toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 221:** `if (!BOOKING_STATUSES.includes(requestedStatus)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 222:** `return res.status(400).json({ success: false, message: "Invalid booking status", allowedStatuses: BOOKING_STATUSES });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 225:** `const booking = await Booking.findOne(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 228:** `if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 230:** `if (requestedStatus === booking.status) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 231:** `return res.status(400).json({ success: false, message: \`Booking is already ${requestedStatus}.\` });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 234:** `if (!canTransitionBookingStatus(booking.status, requestedStatus)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 235:** `return res.status(409).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 243:** `if (["ongoing", "completed"].includes(requestedStatus) && String(booking.paymentStatus || "").toLowerCase() !== "paid") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 244:** `return res.status(409).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 252:** `await booking.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 254:** `return res.status(200).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `assignResources` — lines 269–309

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.params. Persistent operations detected: Booking.findOne; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 270:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 271:** `const { guide, driver, vehicle } = req.body;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 272:** `const booking = await Booking.findOne(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 278:** `if (!booking) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 279:** `return res.status(404).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 289:** `if (guide || driver || vehicle) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 293:** `await booking.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 295:** `await booking.populate([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 301:** `return res.status(200).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `updatePaymentStatus` — lines 316–322

Parameters: `req`, `res`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 317:** `return res.status(410).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `downloadBookingInvoice` — lines 329–369

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. Persistent operations detected: Booking.findOne, Payment.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 330:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 331:** `const booking = await Booking.findOne(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 340:** `if (!booking) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 341:** `return res.status(404).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 347:** `const payment = await Payment.findOne({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 354:** `return res.status(200).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getBookingTimeline` — lines 376–418

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. Persistent operations detected: Booking.findOne; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 377:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 378:** `const booking = await Booking.findOne(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 386:** `if (!booking) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 387:** `return res.status(404).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 393:** `const timeline = [` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 411:** `return res.status(200).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 12: `const normalizePaymentStatus = (value) => {`.
- Line 27: `export const getAllBookings = async (req, res, next) => {`.
- Line 30: `const page = Math.max(Number(req.query.page) || 1, 1);`.
- Line 31: `const limit = Math.min(Number(req.query.limit) || 20, 100);`.
- Line 32: `const skip = (page - 1) * limit;`.
- Line 34: `const filter = {};`.
- Line 45: `const requestedPaymentStatus =`.
- Line 55: `const [bookings, total] = await Promise.all([`.
- Line 70: `const bookingIds = bookings.map((booking) => booking._id);`.
- Line 72: `const completedPayments = bookingIds.length`.
- Line 81: `const paymentByBooking = new Map();`.
- Line 84: `const key = String(payment.booking);`.
- Line 90: `const reconciledBookings = bookings`.
- Line 92: `const payment = paymentByBooking.get(String(booking._id));`.
- Line 93: `const bookingPaymentStatus = normalizePaymentStatus(`.
- Line 104: `const effectivePaymentStatus = "paid";`.
- Line 152: `export const getBookingById = async (req, res, next) => {`.
- Line 161: `const booking = await Booking.findOne(`.
- Line 181: `const payment = await Payment.findOne({`.
- Line 188: `const reconciledBooking = payment`.
- Line 218: `export const updateBookingStatus = async (req, res, next) => {`.
- Line 220: `const requestedStatus = String(req.body?.status || "").trim().toLowerCase();`.
- Line 225: `const booking = await Booking.findOne(`.
- Line 269: `export const assignResources = async (req, res, next) => {`.
- Line 271: `const { guide, driver, vehicle } = req.body;`.
- Line 272: `const booking = await Booking.findOne(`.
- Line 316: `export const updatePaymentStatus = async (req, res) => {`.
- Line 329: `export const downloadBookingInvoice = async (req, res, next) => {`.
- Line 331: `const booking = await Booking.findOne(`.
- Line 347: `const payment = await Payment.findOne({`.
- Line 376: `export const getBookingTimeline = async (req, res, next) => {`.
- Line 378: `const booking = await Booking.findOne(`.
- Line 393: `const timeline = [`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
