# Source explanation: server/controllers/vehicleController.js

**Source:** [server/controllers/vehicleController.js](../../../server/controllers/vehicleController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Vehicle` from `../models/Vehicle.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Vehicle.js](../../../server/models/Vehicle.js)
- `Tour` from `../models/Tour.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Tour.js](../../../server/models/Tour.js)
- `Staff` from `../models/Staff.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Staff.js](../../../server/models/Staff.js)

## Runtime declarations and data flow

### `createVehicle` — lines 14–60

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body. Persistent operations detected: Vehicle.create; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 16:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 17:** `const rawCapacity = req.body.capacity;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 18:** `const capacity = Number(rawCapacity);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 19:** `const year = req.body.year === undefined || req.body.year === "" ? undefined : Number(req.body.year);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 21:** `if (!Number.isFinite(capacity) || capacity < 1 || !Number.isInteger(capacity)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 22:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 29:** `if (year !== undefined && (!Number.isFinite(year) || year < 1990 || year > new Date().getFullYear() + 1)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 30:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 37:** `const payload = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 43:** `if (req.file) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 50:** `const vehicle = await Vehicle.create(payload);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 52:** `return res.status(201).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getVehicles` — lines 68–85

Parameters: `req`, `res`, `next`.
Persistent operations detected: Vehicle.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 69:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 70:** `const vehicles = await Vehicle.find({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 77:** `return res.status(200).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getVehicle` — lines 93–124

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. Persistent operations detected: Vehicle.findOne; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 94:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 95:** `if (!mongoose.Types.ObjectId.isValid(req.params.id)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 96:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 102:** `const vehicle = await Vehicle.findOne(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 110:** `if (!vehicle) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 111:** `return res.status(404).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 117:** `return res.status(200).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `updateVehicle` — lines 132–204

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.body. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 7 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 133:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 134:** `if (!mongoose.Types.ObjectId.isValid(req.params.id)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 135:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 141:** `const updateData = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 145:** `if (updateData.capacity !== undefined) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 146:** `const capacity = Number(updateData.capacity);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 147:** `if (!Number.isFinite(capacity) || capacity < 1 || !Number.isInteger(capacity)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 148:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 157:** `if (updateData.year !== undefined && updateData.year !== "") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 158:** `const year = Number(updateData.year);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 159:** `if (!Number.isFinite(year)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 160:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 169:** `if (req.file) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 176:** `const vehicle = await` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 189:** `if (!vehicle) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 190:** `return res.status(404).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 196:** `return res.status(200).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `deleteVehicle` — lines 212–242

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 213:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 214:** `const vehicle = await` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 228:** `if (!vehicle) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 229:** `return res.status(404).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 235:** `return res.status(200).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `restoreVehicle` — lines 250–280

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 251:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 252:** `const vehicle = await` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 265:** `if (!vehicle) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 266:** `return res.status(404).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 272:** `return res.status(200).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `assignVehicleDriver` — lines 288–340

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.params. Persistent operations detected: Staff.findOne; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 289:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 290:** `const driver = req.body.driverId || req.body.driver || null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 292:** `if (driver) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 293:** `const driverExists = await Staff.findOne({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 299:** `if (!driverExists) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 300:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 306:** `await Staff.findByIdAndUpdate(driver, {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 311:** `const vehicle = await` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 325:** `if (!vehicle) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 326:** `return res.status(404).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 332:** `return res.status(200).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `removeVehicleDriver` — lines 348–381

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. Persistent operations detected: Vehicle.findOne; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 349:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 350:** `const vehicle = await Vehicle.findOne(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 356:** `if (!vehicle) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 357:** `return res.status(404).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 363:** `if (vehicle.driver) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 364:** `await Staff.findByIdAndUpdate(vehicle.driver, {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 371:** `await vehicle.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 373:** `return res.status(200).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `assignTourResources` — lines 389–468

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.params. Persistent operations detected: Tour.findOne, Staff.updateMany, Tour.findById; verify tenant/ownership filters in the exact query. 7 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 390:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 391:** `const {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 400:** `const tour = await Tour.findOne(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 406:** `if (!tour) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 407:** `return res.status(404).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 413:** `if (guideId) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 414:** `await Staff.findByIdAndUpdate(guideId, {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 419:** `if (driverId) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 420:** `await Staff.findByIdAndUpdate(driverId, {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 425:** `if (staffIds?.length) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 426:** `await Staff.updateMany(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 438:** `if (vehicleId) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 439:** `await Vehicle.findByIdAndUpdate(vehicleId, {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 452:** `await tour.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 454:** `const updatedTour = await Tour.findById(tour._id)` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 460:** `return res.status(200).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `updateVehicleStatus` — lines 476–519

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.params. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 477:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 478:** `const allowedStatuses = [` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 485:** `const { status } = req.body;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 487:** `if (!allowedStatuses.includes(status)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 488:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 494:** `const vehicle = await` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 504:** `if (!vehicle) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 505:** `return res.status(404).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 511:** `return res.status(200).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 14: `export const createVehicle = async (req, res, next) => {`.
- Line 17: `const rawCapacity = req.body.capacity;`.
- Line 18: `const capacity = Number(rawCapacity);`.
- Line 19: `const year = req.body.year === undefined || req.body.year === "" ? undefined : Number(req.body.year);`.
- Line 37: `const payload = {`.
- Line 50: `const vehicle = await Vehicle.create(payload);`.
- Line 68: `export const getVehicles = async (req, res, next) => {`.
- Line 70: `const vehicles = await Vehicle.find({`.
- Line 93: `export const getVehicle = async (req, res, next) => {`.
- Line 102: `const vehicle = await Vehicle.findOne(`.
- Line 132: `export const updateVehicle = async (req, res, next) => {`.
- Line 141: `const updateData = {`.
- Line 146: `const capacity = Number(updateData.capacity);`.
- Line 158: `const year = Number(updateData.year);`.
- Line 176: `const vehicle = await`.
- Line 212: `export const deleteVehicle = async (req, res, next) => {`.
- Line 214: `const vehicle = await`.
- Line 250: `export const restoreVehicle = async (req, res, next) => {`.
- Line 252: `const vehicle = await`.
- Line 288: `export const assignVehicleDriver = async (req, res, next) => {`.
- Line 290: `const driver = req.body.driverId || req.body.driver || null;`.
- Line 293: `const driverExists = await Staff.findOne({`.
- Line 311: `const vehicle = await`.
- Line 348: `export const removeVehicleDriver = async (req, res, next) => {`.
- Line 350: `const vehicle = await Vehicle.findOne(`.
- Line 389: `export const assignTourResources = async (req, res, next) => {`.
- Line 391: `const {`.
- Line 400: `const tour = await Tour.findOne(`.
- Line 454: `const updatedTour = await Tour.findById(tour._id)`.
- Line 476: `export const updateVehicleStatus = async (req, res, next) => {`.
- Line 478: `const allowedStatuses = [`.
- Line 485: `const { status } = req.body;`.
- Line 494: `const vehicle = await`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
