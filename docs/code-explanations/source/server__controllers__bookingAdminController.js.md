# Source explanation: server/controllers/bookingAdminController.js

**Source:** [server/controllers/bookingAdminController.js](../../../server/controllers/bookingAdminController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `sendBookingStatusEmail`, `sendEmailBestEffort` from `../services/emailService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/emailService.js](../../../server/services/emailService.js)
- `Notification` from `../models/Notification.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Notification.js](../../../server/models/Notification.js)
- `Payment` from `../models/Payment.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Payment.js](../../../server/models/Payment.js)
- `BOOKING_STATUSES`, `BOOKING_PAYMENT_STATUSES`, `isValidBookingStatus`, `isValidBookingPaymentStatus`, `canTransitionBookingStatus`, `canTransitionBookingPaymentStatus` from `../constants/bookingConstants.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/constants/bookingConstants.js](../../../server/constants/bookingConstants.js)

## Runtime declarations and data flow

### `isValidId` — lines 23–24

Parameters: `id`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `getAllBookings` — lines 39–230

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. Persistent operations detected: Booking.find, Booking.countDocuments; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 41:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 42:** `const {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 50:** `const currentPage = Math.max(Number(page), 1);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 52:** `const pageSize = Math.min(` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 57:** `const skip =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 63:** `const filter = mergeTenantFilter(req, {});` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 71:** `if (search) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 72:** `const regex = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 94:** `if (` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 104:** `if (` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 120:** `const [bookings, total, metricBookings] =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 121:** `await Promise.all([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 123:** `Booking.find(filter)` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 165:** `Booking.countDocuments(filter),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 170:** `Booking.find(filter).select("paymentStatus totalAmount depositAmount refundAmount").lean(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 180:** `const pendingPayments = metricBookings.filter((booking) =>` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 185:** `const paidBookingCount = metricBookings.filter(` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 188:** `const cancelled = metricBookings.filter(` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `getBookingById` — lines 247–317

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. Persistent operations detected: Booking.findOne; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 252:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 254:** `if (` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 257:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 263:** `const booking =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 264:** `await Booking.findOne(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 293:** `if (!booking) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 294:** `return res.status(404).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 304:** `res.status(200).json({` — Builds an HTTP response with an explicit status and JSON payload.

### `updateBookingStatus` — lines 332–511

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.params. Persistent operations detected: Booking.findOne; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 7 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 337:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 338:** `const { status } = req.body;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 346:** `if (!isValidId(req.params.id)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 347:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 359:** `if (!isValidBookingStatus(status)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 360:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 373:** `const existingBooking =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 374:** `await Booking.findOne(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 380:** `if (!existingBooking) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 381:** `return res.status(404).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 393:** `if (existingBooking.status === status) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 394:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 406:** `if (` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 412:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 431:** `if (` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 435:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 450:** `const booking =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 451:** `await` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `deleteBooking` — lines 519–590

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 524:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 532:** `if (!isValidId(req.params.id)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 533:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 548:** `const booking =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 549:** `await` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 557:** `if (!booking) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 559:** `return res.status(404).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 576:** `res.status(200).json({` — Builds an HTTP response with an explicit status and JSON payload.

### `assignResources` — lines 596–797

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.params. Persistent operations detected: Booking.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 9 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 601:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 602:** `const {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 615:** `if (!isValidId(req.params.id)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 616:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 628:** `if (guide && !isValidId(guide)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 629:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 635:** `if (driver && !isValidId(driver)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 636:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 642:** `if (vehicle && !isValidId(vehicle)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 643:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 649:** `if (agent && !isValidId(agent)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 650:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 662:** `const existingBooking =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 663:** `await Booking.findOne(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 669:** `if (!existingBooking) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 670:** `return res.status(404).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 685:** `if (existingBooking.paymentStatus !== "paid") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 686:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `updatePaymentStatus` — lines 805–814

Parameters: `req`, `res`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 809:** `return res.status(410).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getBookingTimeline` — lines 822–920

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. Persistent operations detected: Booking.findOne, Payment.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 828:** `try{` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 830:** `const booking =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 831:** `await Booking.findOne(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 847:** `if(!booking){` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 849:** `return res.status(404).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 860:** `const paymentRecord = await Payment.findOne(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 870:** `const paymentDate =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 876:** `const timeline=[` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 905:** `res.json({` — Sends a JSON response; inspect its caller for status and error semantics.

### `downloadBookingInvoice` — lines 931–1007

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. Persistent operations detected: Booking.findOne; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 933:** `try{` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 935:** `const booking =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 936:** `await Booking.findOne(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 951:** `if(!booking){` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 953:** `return res.status(404).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `sendBookingNotification` — lines 1011–1044

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.body, req.user. Persistent operations detected: Booking.findOne, Notification.create; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 1012:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 1014:** `if (!isValidId(req.params.id)) return res.status(400).json({ success:false, message:"Invalid booking ID." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 1015:** `const message = String(req.body?.message || "").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 1016:** `if (!message) return res.status(400).json({ success:false, message:"Notification message is required." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 1018:** `const booking = await Booking.findOne(mergeTenantFilter(req, { _id: req.params.id }))` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 1022:** `if (!booking) return res.status(404).json({ success:false, message:"Booking not found." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 1024:** `const recipient = booking.user?._id || booking.user || booking.customer?.user;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 1025:** `if (!recipient) return res.status(400).json({ success:false, message:"This booking does not have a customer user account for in-app notifications." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 1027:** `const notification = await Notification.create({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 1042:** `return res.status(200).json({ success:true, message:"Booking notification sent successfully.", notification, channel:"in_app" });` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 23: `const isValidId = (id) =>`.
- Line 39: `export const getAllBookings = async (req, res, next) => {`.
- Line 42: `const {`.
- Line 50: `const currentPage = Math.max(Number(page), 1);`.
- Line 52: `const pageSize = Math.min(`.
- Line 57: `const skip =`.
- Line 63: `const filter = mergeTenantFilter(req, {});`.
- Line 72: `const regex = {`.
- Line 120: `const [bookings, total, metricBookings] =`.
- Line 180: `const pendingPayments = metricBookings.filter((booking) =>`.
- Line 185: `const paidBookingCount = metricBookings.filter(`.
- Line 188: `const cancelled = metricBookings.filter(`.
- Line 238: `export const getBookings =`.
- Line 247: `export const getBookingById = async (`.
- Line 263: `const booking =`.
- Line 325: `export const getBooking =`.
- Line 332: `export const updateBookingStatus = async (`.
- Line 338: `const { status } = req.body;`.
- Line 373: `const existingBooking =`.
- Line 450: `const booking =`.
- Line 519: `export const deleteBooking = async (`.
- Line 548: `const booking =`.
- Line 596: `export const assignResources = async (`.
- Line 602: `const {`.
- Line 662: `const existingBooking =`.
- Line 734: `const booking =`.
- Line 805: `export const updatePaymentStatus = async (`.
- Line 822: `export const getBookingTimeline = async(`.
- Line 830: `const booking =`.
- Line 860: `const paymentRecord = await Payment.findOne(`.
- Line 870: `const paymentDate =`.
- Line 876: `const timeline=[`.
- Line 930: `export const downloadBookingInvoice =`.
- Line 935: `const booking =`.
- Line 1011: `export const sendBookingNotification = async (req, res, next) => {`.
- Line 1015: `const message = String(req.body?.message || "").trim();`.
- Line 1018: `const booking = await Booking.findOne(mergeTenantFilter(req, { _id: req.params.id }))`.
- Line 1024: `const recipient = booking.user?._id || booking.user || booking.customer?.user;`.
- Line 1027: `const notification = await Notification.create({`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
