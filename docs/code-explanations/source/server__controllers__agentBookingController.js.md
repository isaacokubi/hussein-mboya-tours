# Source explanation: server/controllers/agentBookingController.js

**Source:** [server/controllers/agentBookingController.js](../../../server/controllers/agentBookingController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `BOOKING_STATUSES`, `canTransitionBookingStatus` from `../constants/bookingConstants.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/constants/bookingConstants.js](../../../server/constants/bookingConstants.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `Tour` from `../models/Tour.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Tour.js](../../../server/models/Tour.js)
- `Customer` from `../models/Customer.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Customer.js](../../../server/models/Customer.js)
- `Agent` from `../models/Agent.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Agent.js](../../../server/models/Agent.js)
- `createCommission` from `../services/commissionService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/commissionService.js](../../../server/services/commissionService.js)

## Runtime declarations and data flow

### `isValidId` — lines 18–19

Parameters: `id`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `createBooking` — lines 29–395

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.user, req.body. Persistent operations detected: Agent.findOne, Tour.findOne, Customer.findOne, Booking.create; verify tenant/ownership filters in the exact query. 18 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true. 10 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 31:** `const session = await mongoose.startSession();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 33:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 42:** `const agentProfile = await Agent.findOne({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 46:** `if (!agentProfile) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 47:** `await session.abortTransaction();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 49:** `return res.status(404).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 55:** `if (` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 59:** `await session.abortTransaction();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 61:** `return res.status(403).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 74:** `const {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 95:** `if (` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 99:** `await session.abortTransaction();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 101:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 113:** `if (!travelDate || Number.isNaN(Date.parse(travelDate))) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 114:** `await session.abortTransaction();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 116:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 128:** `if (` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 132:** `await session.abortTransaction();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `getAgentBookings` — lines 403–528

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.user, req.query. Persistent operations detected: Agent.findOne, Booking.find, Booking.countDocuments; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 408:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 409:** `const agentProfile =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 410:** `await Agent.findOne({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 414:** `if (!agentProfile) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 415:** `return res.status(404).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 421:** `const page = Math.max(` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 426:** `const limit = Math.min(` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 434:** `const skip =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 437:** `const filter = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 442:** `if (` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 452:** `if (req.query.paymentStatus) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 457:** `if (req.query.search) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 458:** `const search =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 490:** `const [` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 494:** `Booking.find(filter)` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 510:** `Booking.countDocuments(filter),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 513:** `return res.status(200).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getAgentBooking` — lines 536–595

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.user. Persistent operations detected: Agent.findOne, Booking.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 541:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 542:** `if (` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 545:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 551:** `const agentProfile =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 552:** `await Agent.findOne({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 556:** `if (!agentProfile) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 557:** `return res.status(404).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 563:** `const booking =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 564:** `await Booking.findOne({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 580:** `if (!booking) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 581:** `return res.status(404).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 587:** `return res.status(200).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `updateBookingStatus` — lines 603–700

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.body, req.user. Persistent operations detected: Agent.findOne, Booking.findOne; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 7 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 608:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 609:** `if (` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 612:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 618:** `const { status } =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 621:** `if (` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 626:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 633:** `const agentProfile =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 634:** `await Agent.findOne({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 638:** `if (!agentProfile) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 639:** `return res.status(404).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 645:** `const booking =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 646:** `await Booking.findOne({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 652:** `if (!booking) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 653:** `return res.status(404).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 659:** `if (booking.status === status) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 660:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 666:** `if (!canTransitionBookingStatus(booking.status, status)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 667:** `return res.status(409).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `cancelAgentBooking` — lines 708–786

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.user, req.body. Persistent operations detected: Agent.findOne, Booking.findOne; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 713:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 714:** `if (` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 717:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 723:** `const agentProfile =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 724:** `await Agent.findOne({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 728:** `if (!agentProfile) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 729:** `return res.status(404).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 735:** `const booking =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 736:** `await Booking.findOne({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 742:** `if (!booking) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 743:** `return res.status(404).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 749:** `if (` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 752:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 774:** `await booking.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 776:** `return res.status(200).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 18: `const isValidId = (id) =>`.
- Line 29: `export const createBooking = async (req, res, next) => {`.
- Line 31: `const session = await mongoose.startSession();`.
- Line 42: `const agentProfile = await Agent.findOne({`.
- Line 74: `const {`.
- Line 146: `const [tourData, customerData] =`.
- Line 215: `const price = Number(`.
- Line 233: `const travelerCount =`.
- Line 236: `const totalAmount =`.
- Line 245: `const customerName =`.
- Line 256: `const bookingData = {`.
- Line 337: `const booking =`.
- Line 403: `export const getAgentBookings = async (`.
- Line 409: `const agentProfile =`.
- Line 421: `const page = Math.max(`.
- Line 426: `const limit = Math.min(`.
- Line 434: `const skip =`.
- Line 437: `const filter = {`.
- Line 458: `const search =`.
- Line 490: `const [`.
- Line 536: `export const getAgentBooking = async (`.
- Line 551: `const agentProfile =`.
- Line 563: `const booking =`.
- Line 603: `export const updateBookingStatus = async (`.
- Line 618: `const { status } =`.
- Line 633: `const agentProfile =`.
- Line 645: `const booking =`.
- Line 708: `export const cancelAgentBooking = async (`.
- Line 723: `const agentProfile =`.
- Line 735: `const booking =`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
