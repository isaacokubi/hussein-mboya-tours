# Source explanation: server/controllers/adminTourController.js

**Source:** [server/controllers/adminTourController.js](../../../server/controllers/adminTourController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getSystemSettings` from `../services/settingsService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/settingsService.js](../../../server/services/settingsService.js)
- `Tour` from `../models/Tour.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Tour.js](../../../server/models/Tour.js)
- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)
- `Vehicle` from `../models/Vehicle.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Vehicle.js](../../../server/models/Vehicle.js)
- `Staff` from `../models/Staff.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Staff.js](../../../server/models/Staff.js)
- `Notification` from `../models/Notification.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Notification.js](../../../server/models/Notification.js)
- `sendSMS` from `../services/smsService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/smsService.js](../../../server/services/smsService.js)
- `sendWhatsApp` from `../services/whatsappService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/whatsappService.js](../../../server/services/whatsappService.js)
- `cancelTourAndBookings` from `../services/tourCancellationService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/tourCancellationService.js](../../../server/services/tourCancellationService.js)

## Runtime declarations and data flow

### `isValidId` — lines 40–40

Parameters: `id`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `cleanString` — lines 42–43

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `buildImages` — lines 45–49

Parameters: `files (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `validateTourData` — lines 49–81

Parameters: `body`.
7 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 50:** `const errors = [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 52:** `if (!body.title?.trim()) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 56:** `if (!body.description?.trim()) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 60:** `if (!body.destination) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 64:** `if (!body.country?.trim()) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 68:** `if (!body.location?.trim()) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 72:** `if (!body.date) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 76:** `if (body.price === undefined || Number(body.price) < 0) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 80:** `return errors;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `checkDuplicateSlug` — lines 81–97

Parameters: `slug`, `id (defaulted)`.
Persistent operations detected: Tour.findOne; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 82:** `if (!slug) return false;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 84:** `const existing = await Tour.findOne({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 88:** `if (!existing) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 89:** `return false;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 92:** `if (id && existing._id.toString() === id.toString()) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 93:** `return false;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 96:** `return true;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getAllTours` — lines 103–223

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. Persistent operations detected: Tour.find, Tour.countDocuments; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 104:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 111:** `const page = Math.max(Number(req.query.page) || 1, 1);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 113:** `const limit = Math.min(Number(req.query.limit) || 10, 10);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 115:** `const skip = (page - 1) * limit;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 123:** `const filter = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 127:** `if (req.query.status) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 131:** `if (req.query.category) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 135:** `if (req.query.featured === "true") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 139:** `if (req.query.destination) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 143:** `if (req.query.available === "true") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 153:** `if (req.query.search) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 182:** `const [tours, total] = await Promise.all([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 183:** `Tour.find(filter)` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 196:** `Tour.countDocuments(filter),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 205:** `res.status(200).json({` — Builds an HTTP response with an explicit status and JSON payload.

### `getTour` — lines 229–291

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. Persistent operations detected: Tour.findOne; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 230:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 237:** `if (!isValidId(req.params.id)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 238:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 250:** `const tour = await Tour.findOne({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 270:** `if (!tour) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 271:** `return res.status(404).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 283:** `res.status(200).json({` — Builds an HTTP response with an explicit status and JSON payload.

### `restoreTour` — lines 297–402

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. Persistent operations detected: Tour.findOne, Vehicle.findById; verify tenant/ownership filters in the exact query. 5 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 298:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 305:** `if (!isValidId(req.params.id)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 306:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 318:** `const tour = await Tour.findOne({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 323:** `if (!tour) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 324:** `return res.status(404).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 338:** `if ("deletedAt" in tour) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 342:** `if ("deletedBy" in tour) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 346:** `await tour.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 354:** `if (tour.assignedVehicle) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 355:** `const vehicle = await Vehicle.findById(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 359:** `if (vehicle) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 362:** `await vehicle.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 372:** `await tour.populate([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 393:** `res.status(200).json({` — Builds an HTTP response with an explicit status and JSON payload.

## Module-level declarations

- Line 20: `const TOUR_STATUSES = [`.
- Line 29: `const ASSIGNMENT_STATUSES = [`.
- Line 40: `const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);`.
- Line 42: `const cleanString = (value) =>`.
- Line 45: `const buildImages = (files = []) =>`.
- Line 50: `const errors = [];`.
- Line 84: `const existing = await Tour.findOne({`.
- Line 103: `export const getAllTours = async (req, res, next) => {`.
- Line 111: `const page = Math.max(Number(req.query.page) || 1, 1);`.
- Line 113: `const limit = Math.min(Number(req.query.limit) || 10, 10);`.
- Line 115: `const skip = (page - 1) * limit;`.
- Line 123: `const filter = {`.
- Line 182: `const [tours, total] = await Promise.all([`.
- Line 229: `export const getTour = async (req, res, next) => {`.
- Line 250: `const tour = await Tour.findOne({`.
- Line 297: `export const restoreTour = async (req, res, next) => {`.
- Line 318: `const tour = await Tour.findOne({`.
- Line 355: `const vehicle = await Vehicle.findById(`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
